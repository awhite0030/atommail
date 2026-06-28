-- AtomMail Supabase Schema

-- Temporary inboxes table
CREATE TABLE IF NOT EXISTS inboxes (
  address TEXT PRIMARY KEY,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  creator_ip_hash TEXT
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id BIGSERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at BIGINT NOT NULL,
  CONSTRAINT fk_recipient FOREIGN KEY (recipient) REFERENCES inboxes(address) ON DELETE CASCADE
);

-- Index for faster email lookups by recipient
CREATE INDEX IF NOT EXISTS idx_emails_recipient ON emails(recipient);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_inboxes_expires_at ON inboxes(expires_at);

-- Index for per-IP rate limit checks
CREATE INDEX IF NOT EXISTS idx_inboxes_creator_ip ON inboxes(creator_ip_hash, created_at);

-- Row Level Security (allow public read for temporary email service)
ALTER TABLE inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Allow public access to inboxes (needed for email verification use cases)
CREATE POLICY "Allow public read inboxes" ON inboxes
  FOR SELECT USING (true);

-- Allow public access to emails
CREATE POLICY "Allow public read emails" ON emails
  FOR SELECT USING (true);

-- Allow inserts from service role (Cloudflare Worker)
CREATE POLICY "Allow service role insert emails" ON emails
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role insert inboxes" ON inboxes
  FOR INSERT WITH CHECK (true);

-- Allow deletes from service role
CREATE POLICY "Allow service role delete emails" ON emails
  FOR DELETE USING (true);

CREATE POLICY "Allow service role delete inboxes" ON inboxes
  FOR DELETE USING (true);

-- Function to auto-cleanup expired inboxes (run periodically)
-- Run this manually: SELECT cleanup_expired_inboxes();
CREATE OR REPLACE FUNCTION cleanup_expired_inboxes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM inboxes WHERE expires_at < EXTRACT(EPOCH FROM NOW()) * 1000;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;