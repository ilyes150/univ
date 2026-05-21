const API_BASE = "";

if (localStorage.getItem("unidz_student")) {
    window.location.replace("home.html");
}

const loginForm  = document.getElementById("login-form");
const errorBox   = document.getElementById("login-error");
const submitBtn  = document.getElementById("submit-btn");
const btnSpinner = document.getElementById("btn-spinner");
const btnLabel   = document.getElementById("btn-label");

function setLoading(loading) {
    submitBtn.disabled       = loading;
    btnSpinner.style.display = loading ? "block" : "none";
    btnLabel.textContent     = loading ? "Authenticating..." : "Establish Connection";
}

function showError(msg) {
    errorBox.textContent   = msg;
    errorBox.style.display = "block";
}

function hideError() {
    errorBox.style.display = "none";
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (submitBtn.disabled) return;

    const user = document.getElementById("auth-username").value.trim();
    const pass = document.getElementById("auth-password").value;

    if (user.length < 5) {
        showError("Matricule must be at least 5 characters.");
        return;
    }

    hideError();
    setLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/portal/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ username: user, password: pass })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Authentication rejected. Invalid credentials.");
        }

        const data = await response.json();
        localStorage.setItem("unidz_student", JSON.stringify(data.student));
        localStorage.setItem("unidz_metrics",  JSON.stringify(data.metrics));
        window.location.href = "home.html";
    } catch (err) {
        showError(err.message);
        setLoading(false);
    }
});

// ANIMATED BACKGROUND GRID
(function () {
    const canvas = document.getElementById("bg-canvas");
    const ctx    = canvas.getContext("2d");
    let W, H, points;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        generateGrid();
    }

    function generateGrid() {
        const spacing = 65;
        points = [];
        for (let r = 0; r <= Math.ceil(H / spacing); r++) {
            for (let c = 0; c <= Math.ceil(W / spacing); c++) {
                points.push({
                    x: c * spacing, y: r * spacing,
                    ox: c * spacing, oy: r * spacing,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.25 + Math.random() * 0.35,
                    range: 5 + Math.random() * 5
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
            const dist     = Math.hypot(p.x - W / 2, p.y - H / 2);
            const alphaVal = Math.max(0, 0.15 - dist / (W * 0.95));
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