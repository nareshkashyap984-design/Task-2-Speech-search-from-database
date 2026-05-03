const { neon } = require("@neondatabase/serverless");

const sampleComplaints = [
  {
    complaint_id: "CMP-001",
    date: "2026-02-01",
    complainant: "Ramesh Kumar",
    police_station: "PS Quilla",
    category: "Fraud",
    status: "Pending",
    assigned_officer: "ASI Sandeep",
    priority: "High"
  },
  {
    complaint_id: "CMP-002",
    date: "2026-02-03",
    complainant: "Sunita Devi",
    police_station: "PS Samalkha",
    category: "Domestic Dispute",
    status: "In Progress",
    assigned_officer: "SI Pooja",
    priority: "Normal"
  },
  {
    complaint_id: "CMP-003",
    date: "2026-02-05",
    complainant: "Amit Malik",
    police_station: "PS Tehsil Camp",
    category: "Theft",
    status: "Resolved",
    assigned_officer: "HC Ravinder",
    priority: "Normal"
  },
  {
    complaint_id: "CMP-004",
    date: "2026-02-07",
    complainant: "Naveen Sharma",
    police_station: "PS Sector 13/17",
    category: "Cyber Complaint",
    status: "Pending",
    assigned_officer: "SI Manish",
    priority: "High"
  },
  {
    complaint_id: "CMP-005",
    date: "2026-02-09",
    complainant: "Kavita Rani",
    police_station: "PS Quilla",
    category: "Property Dispute",
    status: "In Progress",
    assigned_officer: "ASI Sandeep",
    priority: "Normal"
  },
  {
    complaint_id: "CMP-006",
    date: "2026-02-11",
    complainant: "Imran Khan",
    police_station: "PS Samalkha",
    category: "Missing Article",
    status: "Resolved",
    assigned_officer: "HC Ravinder",
    priority: "Low"
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
      complaint_id,
      to_char(date, 'YYYY-MM-DD') AS date,
      complainant,
      police_station,
      category,
      status,
      assigned_officer,
      priority
    FROM complaints
    ORDER BY date DESC, complaint_id ASC
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
