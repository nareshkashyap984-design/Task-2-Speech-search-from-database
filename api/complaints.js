const { neon } = require("@neondatabase/serverless");

const sampleComplaints = [
  {
    compl_reg_num: "1.30101E+12",
    compl_reg_dt: "Mon Apr 27 2026 00:00:00 GMT+0530 (India Standard Time)",
    compl_desc: "HE SAID TO ME TOOK A TOURIST VISA OF UAE FOR HIM AND I DONE IT THROUGH MY FRIEND AFTER THAT HE DIDNT GIVE MONEY FOR THAT",
    compl_srno: "2600016",
    first_name: "ANSAR FARIS p",
    last_name: "",
    mobile: "7025430768",
    age: "24",
    address_line1: "1",
    address_line2: "CENNAKKAL",
    address_line3: "MUTTIKKAD",
    village: "ANANTHAVOOR",
    tehsil: "Tehsil Block Mandal",
    address_district: "MALAPPURAM",
    address_ps: "KALPAKANCHERRY",
    reception_mode: "Online",
    incident_type: "HE SAID TO TOOK A TOURIST VISA OF UAE FOR HIM BUT HE DIDNT GIVE MONEY",
    incident_plc: "HARYANA",
    complaint_source: "Online",
    status_raw: "Pending-EO Not Assigned",
    status_group: "pending",
    status_of_complaint: "Pending-EO Not Assigned",
    respondent_categories: "Against Private Person",
    transfer_district_cd: "13240",
    transfer_office_cd: "132400401",
    transfer_ps_cd: "0"
  }
];

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  if (!process.env.DATABASE_URL) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ source: "sample", records: sampleComplaints }));
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  sql`
    SELECT
      compl_reg_num,
      to_char(compl_reg_dt, 'YYYY-MM-DD') AS compl_reg_dt,
      district_name,
      compl_desc,
      compl_srno,
      first_name,
      last_name,
      mobile,
      gender,
      age,
      address_line1,
      address_line2,
      address_line3,
      village,
      tehsil,
      address_district,
      address_ps,
      reception_mode,
      incident_type,
      incident_plc,
      complaint_source,
      status_raw,
      status_group,
      status_of_complaint,
      class_of_incident,
      type_of_complaint,
      crime_category,
      complainant_type,
      complaint_purpose,
      io_details,
      respondent_categories
    FROM complaints
    ORDER BY compl_reg_dt DESC, compl_srno ASC
  `
    .then(function (rows) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ source: "neon", records: rows }));
    })
    .catch(function (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: error.message }));
    });
};
