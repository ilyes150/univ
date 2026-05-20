const student = {
  fname: "Ahmed", 
  lname: "Meziane",
  field: "Computer Science & Engineering",
  major: "Computer Science",
  specialty: "State Engineer (Ingénieur d'État)",
  cycle: "Classic / Engineer Curriculum",
  level: 2,
  group: 4,
};

const metrics = { globalRank: 7 };

const subjectRegistry = {
  ASD1: { name: "Algorithms & Data Structures 1", code: "C00F0001S1" },
  Arch1: { name: "Computer Architecture 1", code: "C00M0001S1" },
  OS1: { name: "Introduction to Operating Systems 1", code: "C00M0001S1" },
  MathAna1: { name: "Mathematical Analysis 1", code: "C00F0001S1" },
  Alg1: { name: "Algebra 1", code: "C00F0001S1" },
  Elec: { name: "Basic Electronics", code: "C00D0001S1" },
  WE: { name: "Written Expression Techniques", code: "C00T0001S1" },
  
  ASD2: { name: "Algorithms & Data Structures 2", code: "C00F0001S2" },
  Arch2: { name: "Computer Architecture 2", code: "C00F0001S2" },
  Logic: { name: "Mathematical Logic", code: "C00F0001S2" },
  MathAna2: { name: "Mathematical Analysis 2", code: "C00F0001S2" },
  Alg2: { name: "Algebra 2", code: "C00F0001S2" },
  Stat1: { name: "Probability & Statistics 1", code: "C00M0001S2" },
  
  ASD3: { name: "Algorithms & Data Structures 3", code: "C00F0001S3" },
  OOP: { name: "Object-Oriented Programming", code: "C00F0001S3" },
  IS: { name: "Introduction to Information Systems", code: "C00F0001S3" },
  Alg3: { name: "Algebra 3", code: "C00F0001S3" },
  MathAna3: { name: "Mathematical Analysis 3", code: "C00F0001S3" },
  Stat2: { name: "Probability & Statistics 2", code: "C00M0001S3" },
  Entrep: { name: "Entrepreneurship", code: "C00T0001S3" }
};

const semData = {
  1: {
    avg: 15.10, credit: 30, rank: 4,
    units: [
      { 
        title: "UEF 01 (Fundamental Module)", avg: 13.35, credit: "9/9",
        courses: [
          { key: "MathAna1", grade: 12.00, coeff: 3, cred: 6 },
          { key: "Alg1", grade: 14.70, coeff: 3, cred: 3 }
        ]
      },
      { 
        title: "UEM 01 (Methodology Module)", avg: 16.77, credit: "16/16",
        courses: [
          { key: "ASD1", grade: 18.10, coeff: 5, cred: 6 },
          { key: "Arch1", grade: 14.60, coeff: 4, cred: 6 },
          { key: "OS1", grade: 17.45, coeff: 3, cred: 4 }
        ]
      },
      { 
        title: "UED 01 (Discovery Module)", avg: 5.00, credit: "0/3",
        courses: [
          { key: "Elec", grade: 5.00, coeff: 1, cred: 3 }
        ]
      },
      { 
        title: "UET 01 (Transversal Module)", avg: 15.75, credit: "2/2",
        courses: [
          { key: "WE", grade: 15.75, coeff: 1, cred: 2 }
        ]
      }
    ]
  },
  2: {
    avg: 16.54, credit: 30, rank: 2,
    units: [
      { 
        title: "UEF 02 (Fundamental Module)", avg: 15.33, credit: "12/12",
        courses: [
          { key: "Logic", grade: 16.20, coeff: 3, cred: 3 },
          { key: "MathAna2", grade: 13.70, coeff: 3, cred: 6 },
          { key: "Alg2", grade: 16.10, coeff: 3, cred: 3 }
        ]
      },
      { 
        title: "UEM 02 (Methodology Module)", avg: 17.82, credit: "10/10",
        courses: [
          { key: "ASD2", grade: 18.55, coeff: 4, cred: 6 },
          { key: "Arch2", grade: 17.10, coeff: 4, cred: 4 }
        ]
      },
      { 
        title: "UET 02 (Transversal / Allied)", avg: 16.10, credit: "4/4",
        courses: [
          { key: "Stat1", grade: 16.10, coeff: 2, cred: 4 }
        ]
      }
    ]
  },
  3: {
    avg: 15.79, credit: 30, rank: 3,
    units: [
      { 
        title: "UEF 03 (Fundamental Module)", avg: 15.66, credit: "15/15",
        courses: [
          { key: "OOP", grade: 15.90, coeff: 4, cred: 6 },
          { key: "ASD3", grade: 15.40, coeff: 4, cred: 6 },
          { key: "IS", grade: 15.70, coeff: 3, cred: 3 }
        ]
      },
      { 
        title: "UEF 04 (Fundamental Math Unit)", avg: 16.60, credit: "9/9",
        courses: [
          { key: "Alg3", grade: 16.80, coeff: 3, cred: 3 },
          { key: "MathAna3", grade: 16.40, coeff: 3, cred: 6 }
        ]
      },
      { 
        title: "UEM 03 (Methodology Module)", avg: 13.70, credit: "4/4",
        courses: [
          { key: "Stat2", grade: 13.70, coeff: 2, cred: 4 }
        ]
      },
      { 
        title: "UET 03 (Transversal Module)", avg: 16.50, credit: "2/2",
        courses: [
          { key: "Entrep", grade: 16.50, coeff: 1, cred: 2 }
        ]
      }
    ]
  }
};

/* ── TEXT DATA HELPERS ── */
function getGradeClass(v) {
  if (v >= 10) return "pass";
  if (v >= 8)  return "warn";
  return "fail";
}

function formatValue(v) {
  return Number(v).toFixed(2);
}

/* ── LAYOUT NAVIGATION ENGINE ── */
const breadcrumbs = { home: "Dashboard", records: "Academic History Logs" };

function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  el.classList.add('active');
  document.getElementById('breadcrumb-label').textContent = breadcrumbs[page];
}

/* ── PROFILE INFORMATION GENERATOR ── */
function buildDashboard() {
  const nameString = student.fname + ' ' + student.lname;
  document.getElementById('welcome-text').innerHTML = `Welcome, <span>${nameString}</span>`;

  const structuredData = [
    ["Field", student.field, false],
    ["Major", student.major, false],
    ["Specialty", student.specialty, false],
    ["Cycle", student.cycle, false],
    ["Level", "Year " + student.level, false],
    ["Group", "Group " + String(student.group).padStart(2, '0'), false],
    ["Rank", "#" + metrics.globalRank, true]
  ];

  document.getElementById('profile-details').innerHTML = structuredData.map(([lbl, val, high]) => `
    <div class="detail-row">
      <div class="detail-label">${lbl}</div>
      <div class="detail-value ${high ? 'accent' : ''}">${val}</div>
    </div>
  `).join('');
}

/* ── TRANSCRIPT CARD RENDER ENGINE ── */
function selectSem(semIndex, tabElement) {
  if (tabElement.classList.contains('locked')) return;
  document.querySelectorAll('.sem-tab:not(.locked)').forEach(t => t.classList.remove('active'));
  tabElement.classList.add('active');
  renderTranscriptTable(semIndex);
}

function renderTranscriptTable(semNum) {
  const dataset = semData[semNum];
  let renderedHTML = '';

  dataset.units.forEach(unit => {
    renderedHTML += `
      <div class="ue-table-container">
        <div class="ue-table-header">
          <div class="ue-table-title"><span>■</span>${unit.title}</div>
          <div class="ue-table-meta">
            <div class="table-badge accent">Avg: ${formatValue(unit.avg)} / 20</div>
            <div class="table-badge">Credits: ${unit.credit}</div>
          </div>
        </div>
        <table class="grade-table">
          <thead>
            <tr>
              <th style="width: 50%;">Module Description</th>
              <th style="width: 15%;">Coeff.</th>
              <th style="width: 15%;">Credits Granted</th>
              <th style="width: 20%;">Terminal Grade</th>
            </tr>
          </thead>
          <tbody>
    `;

    unit.courses.forEach(course => {
      const metadata = subjectRegistry[course.key] || { name: course.key, code: "N/A" };
      const cssClass = getGradeClass(course.grade);
      
      renderedHTML += `
        <tr>
          <td>
            <div>${metadata.name}</div>
            <div class="subject-code">${metadata.code}</div>
          </td>
          <td>${course.coeff}</td>
          <td>${course.cred}</td>
          <td>
            <span class="grade-num ${cssClass}">${formatValue(course.grade)}</span>
          </td>
        </tr>
      `;
    });

    renderedHTML += `
          </tbody>
        </table>
      </div>
    `;
  });

  const passResultStatus = dataset.avg >= 10;
  
  renderedHTML += `
    <div class="sem-summary">
      <div class="summary-card highlight">
        <div class="s-label">Calculated Term Average</div>
        <div class="s-value">${formatValue(dataset.avg)} <span style="font-size:14px; color:var(--text-muted)">/20</span></div>
      </div>
      <div class="summary-card">
        <div class="s-label">Performance Term Rank</div>
        <div class="s-value">#${dataset.rank}</div>
      </div>
      <div class="summary-card">
        <div class="s-label">Accrued Operational Credits</div>
        <div class="s-value">${dataset.credit} / 30</div>
      </div>
      <div class="summary-card ${passResultStatus ? 'status-pass' : 'status-fail'}">
        <div class="s-label">Board Assessment Result</div>
        <div class="s-value" style="font-size: 24px; letter-spacing: 1px;">${passResultStatus ? 'ADMIS' : 'AJOURNÉ'}</div>
      </div>
    </div>
  `;

  document.getElementById('sem-content').innerHTML = renderedHTML;
}

/* ── BG VECTOR GRID LAYER INTERACTION ENGINE ── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
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

  window.addEventListener('resize', resize);
  resize();
  updateLoop();
})();

/* RUN INITIALIZERS */
buildDashboard();
renderTranscriptTable(1);