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

CREATE TABLE IF NOT EXISTS volunteer_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  shift TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  service_url TEXT,
  source_url TEXT,
  description TEXT NOT NULL,
  hours_text TEXT NOT NULL,
  schedule TEXT NOT NULL DEFAULT '{}',
  tags TEXT NOT NULL DEFAULT '[]',
  partner_type TEXT NOT NULL,
  capacity_status TEXT NOT NULL,
  help_group TEXT NOT NULL,
  services TEXT NOT NULL DEFAULT '[]',
  county TEXT NOT NULL,
  last_verified TEXT,
  mobile_only INTEGER NOT NULL DEFAULT 0,
  eligibility TEXT,
  documents TEXT,
  languages TEXT NOT NULL DEFAULT '[]',
  accessibility TEXT,
  cost TEXT,
  coverage_area TEXT,
  provider TEXT,
  source_type TEXT,
  contact_method TEXT DEFAULT 'visit',
  has_hours_details INTEGER NOT NULL DEFAULT 0,
  has_cost_info INTEGER NOT NULL DEFAULT 0,
  languages_spoken TEXT DEFAULT 'English',
  age_groups TEXT DEFAULT 'general',
  disability_supported TEXT DEFAULT 'no',
  income_eligibility TEXT DEFAULT 'none',
  insurance_accepted TEXT DEFAULT 'none',
  immigration_status TEXT DEFAULT 'no-restrictions',
  mental_health_support TEXT DEFAULT 'no',
  race_ethnicity TEXT DEFAULT 'no-data',
  notes TEXT,
  imported_source TEXT DEFAULT 'custom',
  import_date TEXT
);

CREATE INDEX IF NOT EXISTS idx_resources_county ON resources(county);
CREATE INDEX IF NOT EXISTS idx_resources_group ON resources(help_group);

CREATE INDEX IF NOT EXISTS idx_volunteer_signups_created ON volunteer_signups(created_at);
