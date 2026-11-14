-- Forms and directory feedback support.
-- Applied to the remote database; idempotent (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action ON rate_limits(ip_hash, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created ON rate_limits(created_at);

CREATE TABLE IF NOT EXISTS resource_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  details TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_resource_reports_resource ON resource_reports(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_reports_status ON resource_reports(status);

CREATE TABLE IF NOT EXISTS search_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_logs(created_at);
