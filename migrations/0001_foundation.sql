-- Foundation metadata only. Business schemas belong to later vertical slices.
CREATE TABLE IF NOT EXISTS foundation_metadata (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

INSERT INTO foundation_metadata (key, value)
VALUES ('schema_stage', 'foundation')
ON CONFLICT(key) DO NOTHING;