CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  complaint_id TEXT UNIQUE NOT NULL,
  date DATE,
  complainant TEXT,
  police_station TEXT,
  category TEXT,
  status TEXT,
  assigned_officer TEXT,
  priority TEXT
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_police_station ON complaints (police_station);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints (category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints (priority);
