"use strict";

const PROFILE_KEY = "internet98_profiles";
const SESSION_KEY = "internet98_session";
const SETTINGS_KEY = "internet98_settings";

function getProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
  catch { return {}; }
}

function setProfiles(profiles) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
}

function enterDesktop(name) {
  sessionStorage.setItem(SESSION_KEY, name || "Guest");
  location.href = "boot.html";
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const createArea = document.getElementById("createArea");

  document.getElementById("showCreate").addEventListener("click", () => {
    createArea.classList.toggle("hidden");
  });

  document.getElementById("guestButton").addEventListener("click", () => {
    enterDesktop("Guest");
  });

  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    const profiles = getProfiles();
    const profile = profiles[name.toLowerCase()];

    if (!profile || profile.password !== pass) {
      document.getElementById("loginError").textContent =
        "Profile not found or password incorrect.";
      return;
    }
    enterDesktop(profile.name);
  });

  document.getElementById("createForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("newUser").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const pass = document.getElementById("newPass").value;
    const error = document.getElementById("createError");
    const profiles = getProfiles();
    const key = name.toLowerCase();

    if (!name) {
      error.textContent = "Choose a screen name.";
      return;
    }
    if (profiles[key]) {
      error.textContent = "That screen name already exists.";
      return;
    }
    if (email && !email.toLowerCase().endsWith(".invalid")) {
      error.textContent = "For this demo, use a fictional email ending in .invalid.";
      return;
    }

    profiles[key] = { name, email, password: pass };
    setProfiles(profiles);
    enterDesktop(name);
  });
}

function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"); }
  catch { return {}; }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applyWallpaper() {
  const settings = getSettings();
  if (settings.backgroundColor) {
    document.documentElement.style.setProperty("--desktop", settings.backgroundColor);
  }
  if (settings.backgroundImage) {
    document.documentElement.style.setProperty(
      "--wallpaper", `url("${settings.backgroundImage}")`
    );
  }
}

applyWallpaper();

const startButton = document.getElementById("startButton");
const startMenu = document.getElementById("startMenu");

if (startButton && startMenu) {
  startButton.addEventListener("click", () => {
    startMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", event => {
    if (!startMenu.contains(event.target) && !startButton.contains(event.target)) {
      startMenu.classList.add("hidden");
    }
  });
}

function openApp(title, url) {
  const existing = document.getElementById("activeAppWindow");
  if (existing) existing.remove();

  const win = document.createElement("section");
  win.id = "activeAppWindow";
  win.className = "window app-window";
  win.innerHTML = `
    <header class="titlebar">
      <span></span>
      <span class="window-buttons">
        <button type="button" aria-label="Close window">×</button>
      </span>
    </header>
    <div class="app-content"><iframe title=""></iframe></div>
    <div class="app-status">internet.98 application</div>
  `;

  win.querySelector(".titlebar span").textContent = title;
  win.querySelector("iframe").src = url;
  win.querySelector("iframe").title = title;
  win.querySelector("button").addEventListener("click", () => win.remove());
  document.body.appendChild(win);
}

document.querySelectorAll("[data-app]").forEach(button => {
  button.addEventListener("click", () => {
    openApp(button.dataset.title || button.textContent.trim(), button.dataset.app);
    if (startMenu) startMenu.classList.add("hidden");
  });
});

const clock = document.getElementById("clock");
if (clock) {
  function updateClock() {
    clock.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit"
    });
  }
  updateClock();
  setInterval(updateClock, 1000);
}

const welcomeName = document.getElementById("welcomeName");
if (welcomeName) {
  welcomeName.textContent =
    sessionStorage.getItem(SESSION_KEY) || "Guest";
}