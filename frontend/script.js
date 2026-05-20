// ─── CENTRAL REALTIME SESSION STATE ──────────────────────────────────
let currentStudent = null;
let academicMetrics = null;
let semesterGradesCache = {};

// Clean translation dictionary mapping DB columns to display names
const subjectRegistry = {
  // Semester 1 Columns
  asd1: "Algorithms & Data Structures 1",
  ios1: "Introduction to Operating Systems 1",
  sm: "Structure Machine (SM)",
  algebra1: "Algebra 1",
  calculus1: "Calculus / Analysis 1",
  electronic: "Basic Electronics",
  te: "Techniques d'Expression (TE)",
  
  // Semester 2 Columns
  asd2: "Algorithms & Data Structures 2",
  ado: "Architecture des Ordinateurs",
  algebra2: "Algebra 2",
  calculus2: "Calculus / Analysis 2",
  lm: "Mathematical Logic (LM)",
  pst1: "Probability & Statistics 1",
  oet: "Oral Expression Techniques",
  
  // Semester 3 Columns
  asd3: "Algorithms & Data Structures 3",
  isi: "Introduction to Information Systems",
  oop1: "Object-Oriented Programming 1",
  algebre3: "Algebra 3",
  calculus3: "Calculus / Analysis 3",
  pst2: "Probability & Statistics 2",
  entreprenariat: "Entrepreneurship"
};

// Exclude these structural or summary columns when rendering raw module grades
const excludedColumns = ["id", "avgUef1", "creditUef1", "avgUef2", "creditUef2", "avgUed", "creditUed", "avgUem", "creditUem", "avgUet", "creditUet", "creditSem", "avgSem", "rank"];

// ─── INITIALIZATION CYCLES ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const savedStudent = localStorage.getItem("unidz_student");
  const savedMetrics = localStorage.getItem("unidz_metrics");

  if (savedStudent && savedMetrics) {
    currentStudent = JSON.parse(savedStudent);
    academicMetrics = JSON.parse(savedMetrics);
    showDashboardView();
  } else {
    showLoginView();
  }
});

function showLoginView() {
  document.getElementById("app").style.display = "none";
  if (!document.getElementById("login-container")) {
    const loginHTML = `
      <div id="login-container" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--bg); font-family: var(--font-mono);">
        <div style="background: var(--surface); border: 1px solid var(--border); padding: 40px; border-radius: var(--radius-lg); width: 100%; max-width: 400px; backdrop-filter: blur(20px);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text);">Uni<span style="color:var(--accent)">DZ</span></h2>
            <small style="color: var(--text-muted); letter-spacing: 2px; text-transform: uppercase; font-size: 10px;">Secure Access Terminal</small>
          </div>
          <div id="login-error" style="color: var(--error); font-size: 12px; margin-bottom: 15px; display: none; border-left: 2px solid var(--error); padding-left: 10px;"></div>
          <form id="portal-login-form" onsubmit="handleAuthSubmit(event)">
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 8px;">Matricule / Username</label>
              <input type="text" id="auth-username" required style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 12px; border-radius: var(--radius-sm); color: var(--text); font-family: var(--font-mono); outline: none;">
            </div>
            <div style="margin-bottom: 30px;">
              <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 8px;">Access Password</label>
              <input type="password" id="auth-password" required style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 12px; border-radius: var(--radius-sm); color: var(--text); font-family: var(--font-mono); outline: none;">
            </div>
            <button type="submit" style="width: 100%; background: rgba(0, 240, 255, 0.1); border: 1px solid var(--accent); padding: 14px; border-radius: var(--radius-sm); color: var(--accent); font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; letter-spacing: 2px; cursor: pointer;">
              Establish Connection
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", loginHTML);
  } else {
    document.getElementById("login-container").style.display = "flex";
  }
}

function showDashboardView() {
  if (document.getElementById("login-container")) {
    document.getElementById("login-container").style.display = "none";
  }
  document.getElementById("app").style.display = "flex";
  buildDashboard();
  renderTranscriptTable(1);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const user = document.getElementById("auth-username").value.trim();
  const pass = document.getElementById("auth-password").value;
  const errorDiv = document.getElementById("login-error");
  errorDiv.style.display = "none";

  try {
    const response = await fetch("http://localhost:8080/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Authentication rejected.");
    }

    const payload = await response.json();
    currentStudent = payload.student;
    academicMetrics = payload.metrics;
    semesterGradesCache = {};

    localStorage.setItem("unidz_student", JSON.stringify(currentStudent));
    localStorage.setItem("unidz_metrics", JSON.stringify(academicMetrics));

    showDashboardView();
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.style.display = "block";
  }
}

function handlePortalLogout() {
  localStorage.clear();
  location.reload();
}

// ─── NAVIGATION VIEW ENGINE ──────────────────────────────────────────
const breadcrumbs = { home: "Dashboard Overview", records: "Academic Grades Transcript" };

function navigate(page, el) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  
  document.getElementById("page-" + page).classList.add("active");
  el.classList.add("active");
  document.getElementById("breadcrumb-label").textContent = breadcrumbs[page];
}

// ─── PROFILE RENDERING PIPELINE ───────────────────────────────────────
function buildDashboard() {
  if (!currentStudent) return;

  const fullName = `${currentStudent.fname} ${currentStudent.lname}`;
  document.getElementById("welcome-text").innerHTML = `Welcome, <span>${fullName}</span>`;

  const layoutMap = [
    ["Student Matricule", currentStudent.studentCode, false],
    ["Field of Study", currentStudent.field, false],
    ["Major Specialization", currentStudent.major, false],
    ["Curriculum Track", currentStudent.cycle, false],
    ["Academic Level", `Year ${currentStudent.level}`, false],
    ["Class Group", `Group ${String(currentStudent.groupNum || currentStudent.group).padStart(2, '0')}`, false],
    ["Global System Rank", academicMetrics ? `#${academicMetrics.rank}` : "N/A", true]
  ];

  document.getElementById("profile-details").innerHTML = layoutMap.map(([lbl, val, high]) => `
    <div class="detail-row">
      <div class="detail-label">${lbl}</div>
      <div class="detail-value ${high ? 'accent' : ''}">${val}</div>
    </div>
  `).join('');
}

// ─── RECOVERY FROM LIVE SPRING DATABASE ──────────────────────────────
async function fetchSemesterData(semNum) {
  if (semesterGradesCache[semNum]) return semesterGradesCache[semNum];

  const response = await fetch(`http://localhost:8080/api/portal/semester/${semNum}?studentId=${currentStudent.id}`);
  if (!response.ok) throw new Error(`Could not load grades for Semester ${semNum}.`);

  const rawData = await response.json();
  semesterGradesCache[semNum] = rawData;
  return rawData;
}

// ─── DYNAMIC TRANSCRIPT COMPILER DISPLAY ─────────────────────────────
function selectSem(semIndex, tabElement) {
  if (tabElement.classList.contains("locked")) return;
  document.querySelectorAll(".sem-tab:not(.locked)").forEach(t => t.classList.remove("active"));
  tabElement.classList.add("active");
  renderTranscriptTable(semIndex);
}

async function renderTranscriptTable(semNum) {
  const container = document.getElementById("sem-content");
  container.innerHTML = `<div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 13px;">Syncing with PostgreSQL database...</div>`;

  try {
    const rawData = await fetchSemesterData(semNum);
    
    let html = `
      <div class="ue-table-container">
        <div class="ue-table-header">
          <div class="ue-table-title"><span>■</span>Semester 0${semNum} Performance Log</div>
        </div>
        <table class="grade-table">
          <thead>
            <tr>
              <th style="width: 70%;">Module Description</th>
              <th style="width: 30%; text-align: right;">Obtained Grade</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Loops directly through keys returned by the backend database model dynamically
    Object.keys(rawData).forEach(key => {
      if (!excludedColumns.includes(key) && rawData[key] !== null) {
        const readableName = subjectRegistry[key] || key.toUpperCase();
        const gradeValue = rawData[key];
        
        html += `
          <tr>
            <td><div>${readableName}</div></td>
            <td style="text-align: right;">
              <span class="grade-num ${getGradeClass(gradeValue)}">${formatValue(gradeValue)}</span>
            </td>
          </tr>
        `;
      }
    });

    html += `</tbody></table></div>`;

    const semesterAvg = rawData.avgSem;
    const isPass = semesterAvg >= 10;
    
    html += `
      <div class="sem-summary">
        <div class="summary-card highlight">
          <div class="s-label">Semester Average</div>
          <div class="s-value">${formatValue(semesterAvg)} <span style="font-size:14px; color:var(--text-muted)">/20</span></div>
        </div>
        <div class="summary-card">
          <div class="s-label">Semester Rank</div>
          <div class="s-value">#${rawData.rank || "N/A"}</div>
        </div>
        <div class="summary-card">
          <div class="s-label">Validated Credits</div>
          <div class="s-value">${rawData.creditSem || 0} / 30</div>
        </div>
        <div class="summary-card ${isPass ? 'status-pass' : 'status-fail'}">
          <div class="s-label">Jury Final Verdict</div>
          <div class="s-value" style="font-size: 24px; letter-spacing: 1px;">${isPass ? 'ADMIS' : 'AJOURNÉ'}</div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="color: var(--error); padding: 20px; border-left: 2px solid var(--error);">Database Connection Error: ${err.message}</div>`;
  }
}

function getGradeClass(v) {
  if (v === null || v === undefined) return "text-muted";
  return v >= 10 ? "pass" : (v >= 8 ? "warn" : "fail");
}

function formatValue(v) {
  if (v === null || v === undefined) return "N/A";
  return Number(v).toFixed(2);
}

// ─── CANVAS GRID BACKGROUND ─────────────────────────────────────────
(function () {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, points;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    generateGrid();
  }

  function generateGrid() {
    const spacing = 65;
    const cols = Math.ceil(W / spacing);
    const rows = Math.ceil(H / spacing);
    points = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        points.push({
          x: c * spacing, y: r * spacing,
          ox: c * spacing, oy: r * spacing,
          phase: Math.random() * Math.PI * 2,
          speed: 0.25 + Math.random() * 0.35,
          range: 5 + Math.random() * 5,
        });
      }
    }
  }

  let ticker = 0;
  function updateLoop() {
    ctx.clearRect(0, 0, W, H);
    ticker += 0.0035;
    points.forEach(p => {
      p.x = p.ox + Math.sin(ticker * p.speed + p.phase) * p.range;
      p.y = p.oy + Math.cos(ticker * p.speed + p.phase * 1.2) * p.range * 0.7;
      const originDist = Math.hypot(p.x - W / 2, p.y - H / 2);
      const alphaVal = Math.max(0, 0.15 - originDist / (W * 0.95));
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${alphaVal.toFixed(3)})`;
      ctx.fill();
    });
    requestAnimationFrame(updateLoop);
  }

  window.addEventListener("resize", resize);
  resize();
  updateLoop();
})();