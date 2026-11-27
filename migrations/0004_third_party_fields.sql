-- Add fields for third-party resource providers (findhelp.org, 211brevard.org)
-- Applied to remote database; idempotent (IF NOT EXISTS via PRAGMA)

-- First add a source_type column to distinguish origin
ALTER TABLE resources ADD COLUMN source_type TEXT;
UPDATE resources SET source_type = 'our-org' WHERE source_type IS NULL;

-- Add fields for findhelp.org compatibility
ALTER TABLE resources ADD COLUMN contact_method TEXT DEFAULT 'visit';
ALTER TABLE resources ADD COLUMN has_hours_details INTEGER NOT NULL DEFAULT 0;
ALTER TABLE resources ADD COLUMN has_cost_info INTEGER NOT NULL DEFAULT 0;
ALTER TABLE resources ADD COLUMN languages_spoken TEXT DEFAULT 'English';
ALTER TABLE resources ADD COLUMN age_groups TEXT DEFAULT 'general';
ALTER TABLE resources ADD COLUMN disability_supported TEXT DEFAULT 'no';
ALTER TABLE resources ADD COLUMN income_eligibility TEXT DEFAULT 'none';
ALTER TABLE resources ADD COLUMN insurance_accepted TEXT DEFAULT 'none';
ALTER TABLE resources ADD COLUMN immigration_status TEXT DEFAULT 'no-restrictions';
ALTER TABLE resources ADD COLUMN mental_health_support TEXT DEFAULT 'no';
ALTER TABLE resources ADD COLUMN race_ethnicity TEXT DEFAULT 'no-data';

-- Add data source tracking
ALTER TABLE resources ADD COLUMN imported_source TEXT DEFAULT 'custom';
ALTER TABLE resources ADD COLUMN import_date TEXT;

CREATE INDEX IF NOT EXISTS idx_resources_source_type ON resources(source_type);
CREATE INDEX IF NOT EXISTS idx_resources_imported_source ON resources(imported_source);
