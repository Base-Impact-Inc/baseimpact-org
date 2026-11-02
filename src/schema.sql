CREATE TABLE IF NOT EXISTS verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK(vote IN ('yes', 'no')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_resource_id ON verifications(resource_id);

CREATE TABLE IF NOT EXISTS device_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT,
  need TEXT NOT NULL,
  situation TEXT,
  no_id INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_device_requests_created ON device_requests(created_at);
