CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL COLLATE NOCASE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'unsubscribed')),
  confirm_token TEXT,
  confirm_expires_at TEXT,
  unsubscribe_token TEXT,
  confirmation_sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT,
  unsubscribed_at TEXT
);
CREATE UNIQUE INDEX subscribers_email_idx ON subscribers (email);
CREATE UNIQUE INDEX subscribers_confirm_token_idx
  ON subscribers (confirm_token) WHERE confirm_token IS NOT NULL;
CREATE UNIQUE INDEX subscribers_unsubscribe_token_idx
  ON subscribers (unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;
