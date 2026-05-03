INSERT INTO complaints (
  compl_reg_num, compl_reg_dt, district_name, district_master_id, police_station_master_id,
  office_master_id, compl_desc, compl_srno, first_name, last_name, mobile, gender, age,
  address_line1, address_line2, address_line3, village, tehsil, address_district, address_ps,
  reception_mode, incident_type, incident_plc, incident_from_dt, incident_to_dt, submit_ps_cd,
  submit_office_cd, email, status_raw, status_group, status_of_complaint, disposal_date,
  class_of_incident, complaint_source, type_of_complaint, crime_category, complainant_type,
  complaint_purpose, io_details, respondent_categories, transfer_district_cd, transfer_office_cd,
  transfer_ps_cd
) VALUES (
  '1.30101E+12', '2026-04-27', NULL, NULL, NULL,
  NULL, 'HE SAID TO ME TOOK A TOURIST VISA OF UAE FOR HIM AND I DONE IT THROUGH MY FRIEND AFTER THAT HE DIDNT GIVE MONEY FOR THAT',
  '2600016', 'ANSAR FARIS p', '', '7025430768', '', '24',
  '1', 'CENNAKKAL', 'MUTTIKKAD', 'ANANTHAVOOR', 'Tehsil Block Mandal', 'MALAPPURAM', 'KALPAKANCHERRY',
  'Online', 'HE SAID TO TOOK A TOURIST VISA OF UAE FOR HIM BUT HE DIDNT GIVE MONEY', 'HARYANA', '2025-01-07', '2025-01-07', '0',
  '130101', 'Online', 'Pending-EO Not Assigned', 'pending', 'Pending-EO Not Assigned', NULL,
  NULL, NULL, NULL, 'HE SAID TO TOOK A TOURIST VISA OF UAE FOR HIM BUT HE DIDNT GIVE MONEY', NULL,
  NULL, NULL, 'Against Private Person', '13240', '132400401',
  '0'
)
ON CONFLICT (compl_reg_num) DO UPDATE SET
  compl_reg_dt = EXCLUDED.compl_reg_dt,
  compl_desc = EXCLUDED.compl_desc,
  compl_srno = EXCLUDED.compl_srno,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  mobile = EXCLUDED.mobile,
  address_district = EXCLUDED.address_district,
  address_ps = EXCLUDED.address_ps,
  reception_mode = EXCLUDED.reception_mode,
  incident_type = EXCLUDED.incident_type,
  incident_plc = EXCLUDED.incident_plc,
  status_raw = EXCLUDED.status_raw,
  status_group = EXCLUDED.status_group,
  status_of_complaint = EXCLUDED.status_of_complaint,
  complaint_source = EXCLUDED.complaint_source,
  respondent_categories = EXCLUDED.respondent_categories;
