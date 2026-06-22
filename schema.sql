CREATE TABLE IF NOT EXISTS inboxes (
  address TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at INTEGER NOT NULL,
  FOREIGN KEY (recipient) REFERENCES inboxes(address)
);

CREATE INDEX IF NOT EXISTS idx_emails_recipient ON emails(recipient);
