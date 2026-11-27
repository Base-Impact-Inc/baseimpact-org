-- Human-reviewed research notes for directory listings.
-- Each note is plain text (newlines preserved) covering what the program
-- provides, dollar limits, frequency limits, eligibility, documents, and
-- working program links. Kept separate from short `description` so the card
-- can stay scannable and the full research is available on demand.

ALTER TABLE resources ADD COLUMN notes TEXT;
