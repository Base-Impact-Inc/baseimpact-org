-- Detail fields captured from third-party listings (findhelp.org, 211brevard.org).
-- 0004 already added contact_method, age_groups, disability_supported,
-- income_eligibility, insurance_accepted, immigration_status,
-- mental_health_support, source_type, imported_source and import_date.
-- These three were present in the source data but had no destination column.

ALTER TABLE resources ADD COLUMN cost TEXT;
ALTER TABLE resources ADD COLUMN coverage_area TEXT;
ALTER TABLE resources ADD COLUMN provider TEXT;

CREATE INDEX IF NOT EXISTS idx_resources_cost ON resources(cost);
CREATE INDEX IF NOT EXISTS idx_resources_import_date ON resources(import_date);
