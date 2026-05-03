var state = {
  complaints: [],
  results: []
};

var sampleCsvPath = "data/sample_complaints.csv";

var elements = {
  csvInput: document.getElementById("csvInput"),
  questionInput: document.getElementById("questionInput"),
  micButton: document.getElementById("micButton"),
  askButton: document.getElementById("askButton"),
  answerText: document.getElementById("answerText"),
  resultChart: document.getElementById("resultChart"),
  resultsBody: document.getElementById("resultsBody"),
  recordCount: document.getElementById("recordCount"),
  matchCount: document.getElementById("matchCount"),
  dataStatus: document.getElementById("dataStatus")
};

function parseCsv(text) {
  var rows = [];
  var current = "";
  var row = [];
  var inQuotes = false;

  for (var index = 0; index < text.length; index += 1) {
    var char = text[index];
    var next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current.trim());
    rows.push(row);
  }

  var headers = rows.shift().map(normalizeKey);
  return rows.map(function (values) {
    var record = {};
    headers.forEach(function (header, headerIndex) {
      record[header] = values[headerIndex] || "";
    });
    return normalizeComplaint(record);
  });
}

function normalizeKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function normalizeComplaint(record) {
  return {
    complaint_id: record.complaint_id || record.id || "",
    date: record.date || record.received_date || "",
    complainant: record.complainant || record.name || "",
    police_station: record.police_station || record.station || "",
    category: record.category || record.complaint_type || "",
    status: record.status || "Pending",
    assigned_officer: record.assigned_officer || record.officer || "",
    priority: record.priority || "Normal"
  };
}

function askQuestion() {
  var question = elements.questionInput.value.trim();
  if (!question) {
    elements.answerText.textContent = "Type or speak a question first.";
    return;
  }

  var answer = answerFromData(question);
  state.results = answer.records;
  elements.answerText.textContent = answer.text;
  renderResults();
}

function answerFromData(question) {
  var query = question.toLowerCase();
  var records = state.complaints.slice();
  var filters = [];

  records = filterByKnownValues(records, query, "status", filters);
  records = filterByKnownValues(records, query, "priority", filters);
  records = filterByKnownValues(records, query, "police_station", filters);
  records = filterByKnownValues(records, query, "category", filters);

  if (query.indexOf("pending") !== -1) {
    records = filterExact(records, "status", "Pending");
    filters.push("status: Pending");
  }
  if (query.indexOf("progress") !== -1 || query.indexOf("in progress") !== -1) {
    records = filterExact(records, "status", "In Progress");
    filters.push("status: In Progress");
  }
  if (query.indexOf("resolved") !== -1 || query.indexOf("closed") !== -1) {
    records = filterExact(records, "status", "Resolved");
    filters.push("status: Resolved");
  }
  if (query.indexOf("high") !== -1) {
    records = filterExact(records, "priority", "High");
    filters.push("priority: High");
  }

  var wantsCount = query.indexOf("how many") !== -1 ||
    query.indexOf("count") !== -1 ||
    query.indexOf("total") !== -1 ||
    query.indexOf("number") !== -1;

  var topStation = topValue(records, "police_station");
  var topCategory = topValue(records, "category");
  var filterText = filters.length ? " Filters applied: " + uniqueValues(filters).join(", ") + "." : "";

  if (wantsCount) {
    return {
      text: "Found " + records.length + " matching complaint record(s)." + filterText,
      records: records
    };
  }

  if (!records.length) {
    return {
      text: "No matching complaint records were found for this question. Try a police station, status, category, or priority keyword.",
      records: []
    };
  }

  return {
    text: "Found " + records.length + " matching record(s). Top police station: " + topStation.label + " (" + topStation.count + "). Top category: " + topCategory.label + " (" + topCategory.count + ")." + filterText,
    records: records
  };
}

function filterByKnownValues(records, query, key, filters) {
  var values = uniqueValues(state.complaints.map(function (item) {
    return item[key];
  }));

  values.forEach(function (value) {
    if (value && query.indexOf(value.toLowerCase()) !== -1) {
      records = filterExact(records, key, value);
      filters.push(key.replace("_", " ") + ": " + value);
    }
  });

  return records;
}

function filterExact(records, key, value) {
  return records.filter(function (item) {
    return item[key].toLowerCase() === value.toLowerCase();
  });
}

function topValue(records, key) {
  var totals = countBy(records, key);
  var entries = Object.keys(totals).map(function (label) {
    return { label: label, count: totals[label] };
  }).sort(function (a, b) {
    return b.count - a.count;
  });

  return entries[0] || { label: "None", count: 0 };
}

function countBy(records, key) {
  return records.reduce(function (totals, item) {
    var value = item[key] || "Not Specified";
    totals[value] = (totals[value] || 0) + 1;
    return totals;
  }, {});
}

function uniqueValues(values) {
  return values.filter(Boolean).filter(function (value, index, list) {
    return list.indexOf(value) === index;
  }).sort(function (a, b) {
    return a.localeCompare(b);
  });
}

function renderResults() {
  elements.recordCount.textContent = state.results.length + " records";
  elements.matchCount.textContent = state.results.length + " matches";
  renderChart(countBy(state.results, "status"));
  renderTable();
}

function renderChart(totals) {
  var entries = Object.keys(totals).map(function (label) {
    return [label, totals[label]];
  }).sort(function (a, b) {
    return b[1] - a[1];
  });
  var max = Math.max.apply(null, entries.map(function (entry) {
    return entry[1];
  }).concat([1]));

  elements.resultChart.innerHTML = entries.length ? "" : "<p>No chart data.</p>";
  entries.forEach(function (entry) {
    var row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = [
      "<span>", escapeHtml(entry[0]), "</span>",
      "<div class=\"bar-track\"><div class=\"bar-fill\" style=\"width: ", (entry[1] / max) * 100, "%\"></div></div>",
      "<strong>", entry[1], "</strong>"
    ].join("");
    elements.resultChart.appendChild(row);
  });
}

function renderTable() {
  elements.resultsBody.innerHTML = "";
  state.results.forEach(function (item) {
    var row = document.createElement("tr");
    row.innerHTML = [
      "<td>", escapeHtml(item.complaint_id), "</td>",
      "<td>", escapeHtml(item.date), "</td>",
      "<td>", escapeHtml(item.complainant), "</td>",
      "<td>", escapeHtml(item.police_station), "</td>",
      "<td>", escapeHtml(item.category), "</td>",
      "<td><span class=\"badge ", statusClass(item.status), "\">", escapeHtml(item.status), "</span></td>",
      "<td>", escapeHtml(item.assigned_officer), "</td>",
      "<td><span class=\"badge ", priorityClass(item.priority), "\">", escapeHtml(item.priority), "</span></td>"
    ].join("");
    elements.resultsBody.appendChild(row);
  });
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function priorityClass(priority) {
  return priority.toLowerCase() === "high" ? "high" : "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function loadSampleData() {
  fetch(sampleCsvPath)
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      state.complaints = parseCsv(text);
      state.results = state.complaints;
      elements.dataStatus.textContent = "Sample data loaded";
      elements.answerText.textContent = "Sample complaint data loaded. Ask a question or upload the official CSV file.";
      renderResults();
    })
    .catch(function () {
      state.complaints = [];
      state.results = [];
      elements.dataStatus.textContent = "No data loaded";
      renderResults();
    });
}

function loadComplaints() {
  fetch("/api/complaints")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("API unavailable");
      }
      return response.json();
    })
    .then(function (payload) {
      var records = Array.isArray(payload) ? payload : payload.records;
      state.complaints = records.map(normalizeComplaint);
      state.results = state.complaints;
      elements.dataStatus.textContent = payload.source === "sample"
        ? "Sample API data loaded. Add Neon DATABASE_URL in Vercel for live database data."
        : "Loaded from Neon database API.";
      elements.answerText.textContent = "Complaint data loaded. Ask using text or microphone.";
      renderResults();
    })
    .catch(loadSampleData);
}

function setupSpeechInput() {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.micButton.disabled = true;
    elements.micButton.title = "Speech input is not supported in this browser";
    return;
  }

  var recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;

  elements.micButton.addEventListener("click", function () {
    elements.micButton.classList.add("listening");
    recognition.start();
  });

  recognition.onresult = function (event) {
    elements.questionInput.value = event.results[0][0].transcript;
    askQuestion();
  };

  recognition.onend = function () {
    elements.micButton.classList.remove("listening");
  };
}

elements.csvInput.addEventListener("change", function (event) {
  var file = event.target.files[0];
  if (!file) {
    return;
  }

  var reader = new FileReader();
  reader.onload = function () {
    state.complaints = parseCsv(reader.result);
    state.results = state.complaints;
    elements.dataStatus.textContent = file.name + " loaded";
    elements.answerText.textContent = "CSV loaded. Ask a question about the uploaded complaint data.";
    renderResults();
  };
  reader.readAsText(file);
});

elements.askButton.addEventListener("click", askQuestion);
elements.questionInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    askQuestion();
  }
});

Array.prototype.forEach.call(document.querySelectorAll("[data-question]"), function (button) {
  button.addEventListener("click", function () {
    elements.questionInput.value = button.getAttribute("data-question");
    askQuestion();
  });
});

setupSpeechInput();
loadComplaints();
