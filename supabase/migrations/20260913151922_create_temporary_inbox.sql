-- Make address creation a single database round-trip. This avoids serial
-- PostgREST calls after a completed Turnstile challenge and keeps limits
-- consistent under concurrent requests.
CREATE TABLE IF NOT EXISTS public.inbox_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started_at BIGINT NOT NULL,
  request_count INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inbox_rate_limits_window
  ON public.inbox_rate_limits(window_started_at);

ALTER TABLE public.inbox_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.create_temporary_inbox(
  p_ip_hash TEXT,
  p_now BIGINT,
  p_domain TEXT DEFAULT 'atommail.cyou'
)
RETURNS TABLE (
  status_code INTEGER,
  error_message TEXT,
  address TEXT,
  expires_at BIGINT,
  rate_limit INTEGER,
  rate_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_limits_enabled BOOLEAN;
  v_global_limit INTEGER;
  v_daily_ip_limit INTEGER;
  v_rate_limit INTEGER;
  v_ttl_ms BIGINT;
  v_window_started BIGINT;
  v_request_count INTEGER;
  v_rate_remaining INTEGER;
  v_active_count INTEGER;
  v_ip_count INTEGER;
  v_address TEXT;
  v_attempt INTEGER;
BEGIN
  -- Serialise the small capacity check and insert so the configured global
  -- limit cannot be exceeded by concurrent requests.
  PERFORM pg_advisory_xact_lock(476354932);

  SELECT
    COALESCE(MAX(value) FILTER (WHERE key = 'limits_enabled'), 'true') <> 'false',
    COALESCE(NULLIF(MAX(value) FILTER (WHERE key = 'global_inbox_limit'), '')::INTEGER, 100),
    COALESCE(NULLIF(MAX(value) FILTER (WHERE key = 'daily_ip_limit'), '')::INTEGER, 20),
    COALESCE(NULLIF(MAX(value) FILTER (WHERE key = 'rate_limit_per_min'), '')::INTEGER, 5),
    COALESCE(NULLIF(MAX(value) FILTER (WHERE key = 'inbox_ttl_seconds'), '')::BIGINT, 600) * 1000
  INTO v_limits_enabled, v_global_limit, v_daily_ip_limit, v_rate_limit, v_ttl_ms
  FROM admin_settings;

  IF EXISTS (SELECT 1 FROM banned_ips WHERE ip_hash = p_ip_hash) THEN
    RETURN QUERY SELECT 403, 'Access denied', NULL::TEXT, NULL::BIGINT, v_rate_limit, 0;
    RETURN;
  END IF;

  SELECT window_started_at, request_count
  INTO v_window_started, v_request_count
  FROM inbox_rate_limits
  WHERE ip_hash = p_ip_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    v_window_started := p_now;
    v_request_count := 1;
    INSERT INTO inbox_rate_limits (ip_hash, window_started_at, request_count)
    VALUES (p_ip_hash, v_window_started, v_request_count);
  ELSIF p_now - v_window_started >= 60000 THEN
    v_window_started := p_now;
    v_request_count := 1;
    UPDATE inbox_rate_limits
    SET window_started_at = v_window_started, request_count = v_request_count
    WHERE ip_hash = p_ip_hash;
  ELSE
    v_request_count := v_request_count + 1;
    UPDATE inbox_rate_limits
    SET request_count = v_request_count
    WHERE ip_hash = p_ip_hash;
  END IF;

  v_rate_remaining := GREATEST(v_rate_limit - v_request_count, 0);
  IF v_limits_enabled AND v_request_count > v_rate_limit THEN
    RETURN QUERY SELECT 429, 'Too many requests. Please try again later.', NULL::TEXT, NULL::BIGINT, v_rate_limit, 0;
    RETURN;
  END IF;

  IF v_limits_enabled THEN
    SELECT COUNT(*)::INTEGER INTO v_active_count
    FROM inboxes AS i WHERE i.expires_at > p_now;
    IF v_active_count >= v_global_limit THEN
      RETURN QUERY SELECT 503, 'Service is at capacity. Please try again later.', NULL::TEXT, NULL::BIGINT, v_rate_limit, v_rate_remaining;
      RETURN;
    END IF;

    SELECT COUNT(*)::INTEGER INTO v_ip_count
    FROM inboxes AS i
    WHERE i.creator_ip_hash = p_ip_hash
      AND i.created_at > p_now - 86400000;
    IF v_ip_count >= v_daily_ip_limit THEN
      RETURN QUERY SELECT 429, 'Daily inbox limit reached. Try again tomorrow.', NULL::TEXT, NULL::BIGINT, v_rate_limit, v_rate_remaining;
      RETURN;
    END IF;
  END IF;

  FOR v_attempt IN 1..3 LOOP
    v_address := SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT || v_attempt::TEXT) FROM 1 FOR 8) || '@' || p_domain;
    BEGIN
      INSERT INTO inboxes (address, created_at, expires_at, creator_ip_hash)
      VALUES (v_address, p_now, p_now + v_ttl_ms, p_ip_hash);
      RETURN QUERY SELECT 201, NULL::TEXT, v_address, p_now + v_ttl_ms, v_rate_limit, v_rate_remaining;
      RETURN;
    EXCEPTION WHEN unique_violation THEN
      -- Generate another local part; a collision is extremely unlikely.
    END;
  END LOOP;

  RETURN QUERY SELECT 500, 'Could not allocate a unique inbox address', NULL::TEXT, NULL::BIGINT, v_rate_limit, v_rate_remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.create_temporary_inbox(TEXT, BIGINT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_temporary_inbox(TEXT, BIGINT, TEXT) TO service_role;
