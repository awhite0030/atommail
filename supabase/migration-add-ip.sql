ALTER TABLE inboxes ADD COLUMN IF NOT EXISTS creator_ip_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_inboxes_creator_ip ON inboxes(creator_ip_hash, created_at);