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
  dataStatus: document.getElementById("dataStatus"),
  speechStatus: document.getElementById("speechStatus"),
  speakAnswerButton: document.getElementById("speakAnswerButton"),
  stopSpeakButton: document.getElementById("stopSpeakButton")
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
    speakText("Type or speak a question first.");
    return;
  }

  var answer = answerFromData(question);
  state.results = answer.records;
  elements.answerText.textContent = answer.text;
  renderResults();
}

function answerFromData(question) {
  var query = normalizeQuery(question);
  var records = state.complaints.slice();
  var filters = [];

  records = filterByKnownValues(records, query, "status", filters);
  records = filterByKnownValues(records, query, "priority", filters);
  records = filterByKnownValues(records, query, "police_station", filters);
  records = filterByKnownValues(records, query, "category", filters);

  if (hasAny(query, ["pending", "pend", "बाकी", "लंबित"])) {
    records = filterExact(records, "status", "Pending");
    filters.push("status: Pending");
  }
  if (hasAny(query, ["progress", "in progress", "under process", "चल रही", "प्रगति"])) {
    records = filterExact(records, "status", "In Progress");
    filters.push("status: In Progress");
  }
  if (hasAny(query, ["resolved", "closed", "complete", "solved", "निपट", "बंद"])) {
    records = filterExact(records, "status", "Resolved");
    filters.push("status: Resolved");
  }
  if (hasAny(query, ["high", "urgent", "priority", "जरूरी"])) {
    records = filterExact(records, "priority", "High");
    filters.push("priority: High");
  }

  var wantsCount = hasAny(query, ["how many", "count", "total", "number", "kitni", "kitne", "कितनी", "कितने"]);

  var topStation = topValue(records, "police_station");
  var topCategory = topValue(records, "category");
  var filterText = filters.length ? " Filters applied: " + uniqueValues(filters).join(", ") + "." : "";
  var statusText = summarizeByKey(records, "status", "Status");

  if (wantsCount) {
    return {
      text: "Found " + records.length + " matching complaint record(s). " + statusText + filterText,
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
    text: "Found " + records.length + " matching record(s). Top police station: " + topStation.label + " (" + topStation.count + "). Top category: " + topCategory.label + " (" + topCategory.count + "). " + statusText + filterText,
    records: records
  };
}

function normalizeQuery(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/police station/g, "ps")
    .replace(/sector thirteen seventeen/g, "sector 13/17")
    .replace(/sector 13 17/g, "sector 13/17")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(query, terms) {
  return terms.some(function (term) {
    return query.indexOf(term) !== -1;
  });
}

function filterByKnownValues(records, query, key, filters) {
  var values = uniqueValues(state.complaints.map(function (item) {
    return item[key];
  }));

  values.forEach(function (value) {
    if (value && recordMatchesLooseValue(null, key, query, value)) {
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

function recordMatchesLooseValue(record, key, query, value) {
  var normalizedValue = normalizeQuery(value);
  return normalizedValue && (
    query.indexOf(normalizedValue) !== -1 ||
    query.indexOf(normalizedValue.replace("ps ", "")) !== -1
  );
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

function summarizeByKey(records, key, label) {
  var totals = countBy(records, key);
  var parts = Object.keys(totals).sort().map(function (name) {
    return name + ": " + totals[name];
  });
  return parts.length ? label + " breakdown: " + parts.join(", ") + "." : "";
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
  renderChart({
    "Status": countBy(state.results, "status"),
    "Category": countBy(state.results, "category")
  });
  renderTable();
}

function renderChart(groups) {
  var entries = [];
  Object.keys(groups).forEach(function (group) {
    Object.keys(groups[group]).forEach(function (label) {
      entries.push([group + ": " + label, groups[group][label]]);
    });
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
  state.results.forEach(function (item, index) {
    var row = document.createElement("tr");
    row.tabIndex = 0;
    row.setAttribute("data-index", index);
    row.innerHTML = [
      "<td>", escapeHtml(item.complaint_id), "</td>",
      "<td>", escapeHtml(item.date), "</td>",
      "<td>", escapeHtml(item.complainant), "</td>",
      "<td>", escapeHtml(item.police_station), "</td>",
      "<td>", escapeHtml(item.category), "</td>",
      "<td><span class=\"badge ", statusClass(item.status), "\">", escapeHtml(item.status), "</span></td>",
      "<td>", escapeHtml(item.assigned_officer), "</td>",
      "<td><span class=\"badge ", priorityClass(item.priority), "\">", escapeHtml(item.priority), "</span></td>",
      "<td><button class=\"speak-row\" type=\"button\">Speak</button></td>"
    ].join("");
    row.addEventListener("click", function () {
      speakRecord(item);
    });
    row.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        speakRecord(item);
      }
    });
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
      if (!records || !records.length) {
        throw new Error("No API records");
      }
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
    elements.speechStatus.textContent = "Speech input is not supported in this browser. Use text search.";
    return;
  }

  var recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  elements.micButton.addEventListener("click", function () {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    elements.speechStatus.textContent = "Listening... speak your question now.";
    elements.micButton.textContent = "Stop";
    elements.micButton.classList.add("listening");
    try {
      recognition.start();
    } catch (error) {
      elements.speechStatus.textContent = "Microphone is already listening.";
    }
  });

  recognition.onresult = function (event) {
    var transcript = event.results[0][0].transcript;
    elements.questionInput.value = transcript;
    elements.speechStatus.textContent = "Heard: " + transcript;
    askQuestion();
  };

  recognition.onerror = function (event) {
    elements.speechStatus.textContent = "Speech error: " + event.error + ". You can type the question manually.";
  };

  recognition.onend = function () {
    elements.micButton.classList.remove("listening");
    elements.micButton.textContent = "Mic";
  };
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    elements.speechStatus.textContent = "Text-to-speech is not supported in this browser.";
    return;
  }

  window.speechSynthesis.cancel();
  var utterance = new SpeechSynthesisUtterance(String(text || ""));
  utterance.lang = "en-IN";
  utterance.rate = 0.95;
  utterance.onstart = function () {
    elements.speechStatus.textContent = "Speaking...";
  };
  utterance.onend = function () {
    elements.speechStatus.textContent = "Speech completed.";
  };
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    elements.speechStatus.textContent = "Speech stopped.";
  }
}

function formatRecordSpeech(item) {
  return [
    "Complaint", item.complaint_id + ".",
    "Date", item.date + ".",
    "Complainant", item.complainant + ".",
    "Police station", item.police_station + ".",
    "Category", item.category + ".",
    "Status", item.status + ".",
    "Assigned officer", item.assigned_officer + ".",
    "Priority", item.priority + "."
  ].join(" ");
}

function speakRecord(item) {
  speakText(formatRecordSpeech(item));
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
elements.speakAnswerButton.addEventListener("click", function () {
  speakText(elements.answerText.textContent);
});
elements.stopSpeakButton.addEventListener("click", stopSpeaking);
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
