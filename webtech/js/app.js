/* ==========================================================
   Greenfield University - Class Login System
   Shared JavaScript: fetches dummy JSON data, manages login
   state in localStorage/sessionStorage (no database/API),
   handles the dynamic nav (incl. mobile hamburger toggle),
   and a live clock.
   ========================================================== */

const DATA_URL = "data.json";
let appDataCache = null;

/* ---------- Dummy "database" (JSON + localStorage) ---------- */

async function loadAppData() {
    if (appDataCache) return appDataCache;
    const res = await fetch(DATA_URL);
    appDataCache = await res.json();
    return appDataCache;
}

function seedUsers(demoUsers) {
    if (!localStorage.getItem("cu_users")) {
        localStorage.setItem("cu_users", JSON.stringify(demoUsers));
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem("cu_users") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("cu_users", JSON.stringify(users));
}

function usernameExists(username) {
    return getUsers().some(u => u.username.toLowerCase() === username.toLowerCase());
}

/* ---------- Session (who is logged in right now) ---------- */

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("cu_current") || "null");
}

function setCurrentUser(user) {
    sessionStorage.setItem("cu_current", JSON.stringify(user));
}

function logout() {
    sessionStorage.removeItem("cu_current");
    window.location.href = "index.html";
}

function requireRole(role) {
    const user = getCurrentUser();
    if (!user || user.role !== role) {
        window.location.href = "login.html";
        return null;
    }
    return user;
}

/* ---------- Enrollments (dummy data, keyed by username) ---------- */

function getEnrollments() {
    return JSON.parse(localStorage.getItem("cu_enrollments") || "{}");
}

function saveEnrollment(username, className) {
    const all = getEnrollments();
    if (!all[username]) all[username] = [];
    if (!all[username].includes(className)) {
        all[username].push(className);
    }
    localStorage.setItem("cu_enrollments", JSON.stringify(all));
}

/* ---------- Small UI helpers ---------- */

function showMessage(elId, text, type) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = text;
    el.className = "message " + type;
    el.style.display = "block";
}

function toggleEl(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? "" : "none";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Dynamic navigation ---------- */

function updateNav() {
    const user = getCurrentUser();
    const loggedIn = !!user;

    toggleEl("nav-login", !loggedIn);
    toggleEl("nav-register-student", !loggedIn);
    toggleEl("nav-register-admin", !loggedIn);
    toggleEl("nav-dashboard", loggedIn);
    toggleEl("nav-logout", loggedIn);

    if (loggedIn) {
        const dashLink = document.querySelector("#nav-dashboard a");
        if (dashLink) {
            dashLink.href = user.role === "admin" ? "admin-dashboard.html" : "student-dashboard.html";
        }
    }

    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            logout();
        });
    }
}

/* ---------- Mobile hamburger nav toggle ---------- */

function initNavToggle() {
    const btn = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    if (!btn || !menu) return;

    btn.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the menu automatically after tapping a link (mobile UX)
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        });
    });
}

/* ---------- Live clock (client-side JS, separate from datetime.php) ---------- */

function startClock(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    function tick() {
        el.textContent = new Date().toLocaleString();
    }
    tick();
    setInterval(tick, 1000);
}

/* ---------- Page bootstrap ---------- */

async function initPage() {
    const data = await loadAppData();
    seedUsers(data.demoUsers);
    updateNav();
    initNavToggle();
    startClock("liveClock");
    return data;
}
