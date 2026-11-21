-- 0004_contact_reliability.sql
-- Contact-form durability + notification failover.
-- Every submission is written to D1 BEFORE any notification attempt.
-- Notification outcome is stored on the same row so failed notifications are
-- never silent. Apply once (ALTER TABLE ADD COLUMN is not idempotent):
--   npx wrangler d1 execute baseimpact-verify --remote --file migrations/0004_contact_reliability.sql

ALTER TABLE contact_messages ADD COLUMN source_page TEXT;
ALTER TABLE contact_messages ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE contact_messages ADD COLUMN notification_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contact_messages ADD COLUMN notification_error TEXT;
ALTER TABLE contact_messages ADD COLUMN notified_at TEXT;

CREATE INDEX IF NOT EXISTS idx_contact_messages_notification_status
  ON contact_messages(notification_status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_source_page
  ON contact_messages(source_page);
