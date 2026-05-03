CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  compl_reg_num TEXT UNIQUE NOT NULL,
  compl_reg_dt DATE,
  district_name TEXT,
  district_master_id TEXT,
  police_station_master_id TEXT,
  office_master_id TEXT,
  compl_desc TEXT,
  compl_srno TEXT,
  first_name TEXT,
  last_name TEXT,
  mobile TEXT,
  gender TEXT,
  age TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  address_line3 TEXT,
  village TEXT,
  tehsil TEXT,
  address_district TEXT,
  address_ps TEXT,
  reception_mode TEXT,
  incident_type TEXT,
  incident_plc TEXT,
  incident_from_dt DATE,
  incident_to_dt DATE,
  submit_ps_cd TEXT,
  submit_office_cd TEXT,
  email TEXT,
  status_raw TEXT,
  status_group TEXT,
  status_of_complaint TEXT,
  disposal_date DATE,
  class_of_incident TEXT,
  complaint_source TEXT,
  type_of_complaint TEXT,
  crime_category TEXT,
  complainant_type TEXT,
  complaint_purpose TEXT,
  io_details TEXT,
  respondent_categories TEXT,
  transfer_district_cd TEXT,
  transfer_office_cd TEXT,
  transfer_ps_cd TEXT
);

CREATE INDEX IF NOT EXISTS idx_complaints_status_group ON complaints (status_group);
CREATE INDEX IF NOT EXISTS idx_complaints_address_ps ON complaints (address_ps);
CREATE INDEX IF NOT EXISTS idx_complaints_address_district ON complaints (address_district);
CREATE INDEX IF NOT EXISTS idx_complaints_source ON complaints (complaint_source);

CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS police_stations (
  id TEXT PRIMARY KEY,
  district_id TEXT,
  district_name TEXT,
  name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_police_stations_district_id ON police_stations (district_id);
CREATE INDEX IF NOT EXISTS idx_offices_name ON offices (name);
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts (name);
