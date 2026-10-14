// PawPal Main Application Controller
// Orchestrates Screens, Navigation, Modals, Forms, Calendar, and Event Bus

import { db } from "./db.js";
import { AVATAR_PRESETS } from "./sampleData.js";
import { notifications } from "./notifications.js";

// Global App State
const state = {
  activeTab: "dashboard",
  activePetId: null,
  healthFilter: "all",
  vetFilter: "all",
  vetSearchQuery: "",
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(), // 0-indexed
  selectedDate: new Date().toISOString().split("T")[0],
  isMobileFrame: true,
  editingPetId: null,
  editingFeedingId: null,
  editingHealthId: null,
  selectedAvatarId: "avatar_dog_golden",
  uploadedPhotoData: null
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initSettings();
  initClock();
  initPetState();
  initNavigation();
  initModals();
  initForms();
  initCalendar();
  initFilters();
  initTopBarControls();

  // Initial Render
  renderAll();

  // Global event listeners
  window.addEventListener("pawpal-data-updated", () => renderAll());
  window.addEventListener("pawpal-navigate-tab", (e) => {
    if (e.detail && e.detail.tab) switchTab(e.detail.tab);
  });
});

// Expose public API for inline event handlers
window.PawPalApp = {
  switchTab,
  deletePet,
  editPet,
  selectActivePet,
  deleteFeeding,
  editFeeding,
  toggleFeeding,
  deleteHealthRecord,
  editHealthRecord,
  toggleDailyTask,
  deleteCareLog
};
window.PawPalNotifications = notifications;

function initSettings() {
  const settings = db.getSettings();

  // Apply Theme
  if (settings.theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.getElementById("theme-icon-moon").style.display = "none";
    document.getElementById("theme-icon-sun").style.display = "block";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("theme-icon-moon").style.display = "block";
    document.getElementById("theme-icon-sun").style.display = "none";
  }

  // Populate settings form inputs
  const notifToggle = document.getElementById("setting-notifications-toggle");
  if (notifToggle) notifToggle.checked = settings.notifications_enabled !== false;

  const soundToggle = document.getElementById("setting-sound-toggle");
  if (soundToggle) soundToggle.checked = settings.sound_enabled !== false;

  const leadSelect = document.getElementById("setting-lead-time");
  if (leadSelect) leadSelect.value = settings.lead_time_mins || 15;

  const vetNameInput = document.getElementById("setting-vet-name");
  if (vetNameInput) vetNameInput.value = settings.emergency_vet_name || "";

  const vetPhoneInput = document.getElementById("setting-vet-phone");
  if (vetPhoneInput) vetPhoneInput.value = settings.emergency_vet_phone || "";
}

function initClock() {
  const updateClock = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    const clockEl = document.getElementById("status-clock");
    if (clockEl) clockEl.textContent = `${hours}:${mins}`;
  };
  updateClock();
  setInterval(updateClock, 10000);
}

function initPetState() {
  const settings = db.getSettings();
  const pets = db.getAllPets();
  if (pets.length > 0) {
    if (settings.active_pet_id && pets.some(p => String(p.id) === String(settings.active_pet_id))) {
      state.activePetId = settings.active_pet_id;
    } else {
      state.activePetId = pets[0].id;
      db.updateSettings({ active_pet_id: pets[0].id });
    }
  }
}

// --- NAVIGATION & TABS ---
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;

  // Update Bottom Nav Active State
  document.querySelectorAll(".nav-item").forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Switch Screen Sections
  document.querySelectorAll(".tab-content").forEach(section => {
    section.classList.remove("active");
  });
  const targetSection = document.getElementById(`tab-${tabId}`);
  if (targetSection) {
    targetSection.classList.add("active");
    // Scroll content to top
    const viewport = document.querySelector(".app-content");
    if (viewport) viewport.scrollTop = 0;
  }

  // Re-render target tab contents
  renderTabContent(tabId);
}

function renderAll() {
  renderHeaderAndHero();
  renderTabContent(state.activeTab);
}

function renderTabContent(tabId) {
  switch (tabId) {
    case "dashboard":
      renderDashboard();
      break;
    case "pets":
      renderPetsList();
      break;
    case "feeding":
      renderFeedingList();
      break;
    case "health":
      renderHealthRecords();
      break;
    case "daily":
      renderDailyChecklist();
      break;
    case "history":
      renderCalendarAndTimeline();
      break;
    case "vets":
      renderNearbyVets();
      break;
    case "settings":
      initSettings();
      break;
  }
}

// --- AVATAR HELPERS ---
function getAvatarHtml(photoUri) {
  if (!photoUri) {
    const defaultSvg = AVATAR_PRESETS[0].svg;
    return defaultSvg;
  }
  if (photoUri.startsWith("data:image")) {
    return `<img src="${photoUri}" alt="Pet Photo" style="width:100%; height:100%; object-fit:cover;">`;
  }
  const preset = AVATAR_PRESETS.find(p => p.id === photoUri);
  return preset ? preset.svg : AVATAR_PRESETS[0].svg;
}

// --- TOP BAR & VIEWPORT CONTROLS ---
function initTopBarControls() {
  // Toggle Phone Frame vs Full Web View
  const toggleViewBtn = document.getElementById("btn-toggle-view");
  const viewLabel = document.getElementById("view-mode-label");
  toggleViewBtn.addEventListener("click", () => {
    state.isMobileFrame = !state.isMobileFrame;
    if (state.isMobileFrame) {
      document.body.classList.remove("mode-fullscreen");
      viewLabel.textContent = "Desktop View";
    } else {
      document.body.classList.add("mode-fullscreen");
      viewLabel.textContent = "Mobile Frame";
    }
  });

  // Theme Toggle
  const themeBtn = document.getElementById("btn-theme-toggle");
  themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    db.updateSettings({ theme: newTheme });
    initSettings();
  });

  // Test Chime & Alert
  const testAlertBtn = document.getElementById("btn-test-chime");
  testAlertBtn.addEventListener("click", () => {
    notifications.requestPermission();
    notifications.testTrigger();
  });

  // Emergency Call Action
  const emergencyTopBtn = document.getElementById("btn-emergency-call");
  const emergencyDashBtn = document.getElementById("btn-call-emergency-vet");
  const triggerEmergency = () => {
    const settings = db.getSettings();
    const phone = settings.emergency_vet_phone || "+1 (555) 911-7387";
    const name = settings.emergency_vet_name || "Emergency Hospital";
    
    if (confirm(`Emergency Hotline:\nDial ${name} at ${phone} now?`)) {
      window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
    }
  };
  emergencyTopBtn.addEventListener("click", triggerEmergency);
  if (emergencyDashBtn) emergencyDashBtn.addEventListener("click", triggerEmergency);

  // Quick Add Header Plus Button
  const quickAddBtn = document.getElementById("btn-quick-add");
  quickAddBtn.addEventListener("click", () => {
    if (state.activeTab === "pets") {
      openPetModal();
    } else if (state.activeTab === "feeding") {
      openFeedingModal();
    } else if (state.activeTab === "health") {
      openHealthModal();
    } else {
      openPetModal();
    }
  });

  // Active Pet Chip Click -> Switch to Pets Tab
  const activePetChip = document.getElementById("active-pet-chip");
  activePetChip.addEventListener("click", () => {
    switchTab("pets");
  });
}

// --- HEADER & PET HERO RENDERING ---
function renderHeaderAndHero() {
  const pet = db.getPetById(state.activePetId);
  if (!pet) return;

  // Header mini chip
  const headerAvatar = document.getElementById("header-pet-avatar");
  const headerName = document.getElementById("header-pet-name");
  const headerSpecies = document.getElementById("header-pet-species");
  if (headerAvatar) headerAvatar.innerHTML = getAvatarHtml(pet.photo_uri);
  if (headerName) headerName.textContent = pet.name;
  if (headerSpecies) headerSpecies.textContent = `${pet.species} • ${pet.breed || "Companion"}`;

  // Dashboard Hero Banner
  const heroAvatar = document.getElementById("hero-avatar");
  const heroName = document.getElementById("hero-pet-name");
  const heroBreed = document.getElementById("hero-breed");
  const heroAge = document.getElementById("hero-age");
  const heroWeight = document.getElementById("hero-weight");

  if (heroAvatar) heroAvatar.innerHTML = getAvatarHtml(pet.photo_uri);
  if (heroName) heroName.textContent = pet.name;
  if (heroBreed) heroBreed.textContent = pet.breed || pet.species;
  if (heroAge) heroAge.textContent = pet.age || "Unknown age";
  if (heroWeight) heroWeight.textContent = pet.weight ? `${pet.weight} kg` : "-- kg";
}

// --- DASHBOARD SCREEN ---
function renderDashboard() {
  renderHeaderAndHero();
  const pet = db.getPetById(state.activePetId);
  if (!pet) return;

  const feeds = db.getFeedingByPetId(pet.id);
  const healthRecords = db.getHealthRecordsByPetId(pet.id);
  const careLogs = db.getCareLogsByPetId(pet.id);

  // Quick Metrics
  const metricMeals = document.getElementById("metric-meals-count");
  if (metricMeals) metricMeals.textContent = `${feeds.filter(f => f.enabled).length} Scheduled`;

  const metricVaccine = document.getElementById("metric-vaccine-due");
  const nextVaccine = healthRecords
    .filter(r => r.type === "vaccination" && r.next_due_date)
    .sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date))[0];
  if (metricVaccine) {
    if (nextVaccine) {
      const d = new Date(nextVaccine.next_due_date + "T00:00:00");
      metricVaccine.textContent = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else {
      metricVaccine.textContent = "All Current";
    }
  }

  // Today's Routine Progress
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = careLogs.filter(l => l.date_time.startsWith(todayStr));
  const dailyTasks = ["feeding", "walk", "water", "grooming"];
  const completedTaskTypes = new Set(todayLogs.map(l => l.activity));
  let doneCount = 0;
  dailyTasks.forEach(task => {
    if (completedTaskTypes.has(task)) doneCount++;
  });
  const pct = Math.round((doneCount / dailyTasks.length) * 100);

  const scoreEl = document.getElementById("metric-care-score");
  if (scoreEl) scoreEl.textContent = `${pct}%`;

  const progText = document.getElementById("routine-progress-text");
  if (progText) progText.textContent = `${doneCount} of ${dailyTasks.length} Completed`;

  const progFill = document.getElementById("routine-progress-fill");
  if (progFill) progFill.style.width = `${pct}%`;

  // Next Upcoming Reminder Card
  const nextReminderContainer = document.getElementById("dashboard-next-reminder-card");
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const upcomingFeed = feeds.find(f => f.enabled && f.time >= currentTime) || feeds.find(f => f.enabled);

  if (upcomingFeed) {
    nextReminderContainer.innerHTML = `
      <div class="item-card">
        <div class="item-left">
          <div class="item-icon-box orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="item-info">
            <div class="item-primary-text">${upcomingFeed.meal_name}</div>
            <div class="item-secondary-text">Scheduled at ${formatTime(upcomingFeed.time)} • ${upcomingFeed.instructions || "Ready for meal"}</div>
          </div>
        </div>
        <div class="item-right">
          <button class="btn btn-sm btn-primary" onclick="window.PawPalApp.toggleDailyTask('feeding', '${upcomingFeed.meal_name}')">Log Fed</button>
        </div>
      </div>
    `;
  } else {
    nextReminderContainer.innerHTML = `
      <div class="card" style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 0.85rem;">
        No active feeding reminders set for ${pet.name}.
        <div style="margin-top: 8px;">
          <button class="btn btn-sm btn-primary" onclick="window.PawPalApp.switchTab('feeding')">+ Add Meal Time</button>
        </div>
      </div>
    `;
  }

  // Recent Activity Log
  const recentContainer = document.getElementById("dashboard-recent-activity");
  const recentLogs = careLogs.slice(0, 3);
  if (recentLogs.length === 0) {
    recentContainer.innerHTML = `
      <div class="card" style="text-align:center; padding: 16px; color: var(--text-muted); font-size: 0.85rem;">
        No recent activities logged today. Tap "Daily Routine" to start checking off tasks!
      </div>
    `;
  } else {
    recentContainer.innerHTML = recentLogs.map(log => `
      <div class="item-card">
        <div class="item-left">
          <div class="item-icon-box ${getActivityColor(log.activity)}">
            ${getActivityIcon(log.activity)}
          </div>
          <div class="item-info">
            <div class="item-primary-text" style="text-transform: capitalize;">${log.activity} Activity</div>
            <div class="item-secondary-text">${log.notes || "Completed as scheduled"} • ${formatDateTime(log.date_time)}</div>
          </div>
        </div>
        <div class="item-right">
          <span style="color: var(--secondary); font-size: 0.8rem; font-weight:700;">✓ Done</span>
        </div>
      </div>
    `).join("");
  }

  // Emergency Card Text
  const settings = db.getSettings();
  const emergencyNameEl = document.getElementById("dash-emergency-name");
  const emergencyPhoneEl = document.getElementById("dash-emergency-phone");
  if (emergencyNameEl) emergencyNameEl.textContent = settings.emergency_vet_name || "Emergency Pet Hospital";
  if (emergencyPhoneEl) emergencyPhoneEl.textContent = settings.emergency_vet_phone || "+1 (555) 911-7387";
}

// --- PETS SCREEN ---
function renderPetsList() {
  const container = document.getElementById("pets-list-container");
  const pets = db.getAllPets();

  if (pets.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding: 30px;">
        <p style="color: var(--text-muted); margin-bottom: 12px;">No pets added yet.</p>
        <button class="btn btn-primary" onclick="window.PawPalApp.openPetModal()">Add Your First Pet</button>
      </div>
    `;
    return;
  }

  container.innerHTML = pets.map(pet => {
    const isActive = String(pet.id) === String(state.activePetId);
    return `
      <div class="card" style="${isActive ? 'border: 2px solid var(--primary);' : ''}">
        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 12px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; overflow:hidden; background: var(--primary-light); flex-shrink: 0; border: 2px solid var(--primary);">
            ${getAvatarHtml(pet.photo_uri)}
          </div>
          <div style="flex:1;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <h3 style="font-size: 1.15rem; font-weight: 800;">${pet.name}</h3>
              ${isActive ? '<span class="tag-badge primary">Active Pet</span>' : `
                <button class="btn btn-sm btn-secondary" onclick="window.PawPalApp.selectActivePet('${pet.id}')">Select</button>
              `}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              ${pet.species} • ${pet.breed || "Mixed Breed"}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-main); margin-top: 4px; display:flex; gap:10px;">
              <span><strong>Age:</strong> ${pet.age || "--"}</span>
              <span><strong>Weight:</strong> ${pet.weight ? pet.weight + " kg" : "--"}</span>
            </div>
          </div>
        </div>

        ${pet.notes ? `
          <div style="background: var(--bg-subtle); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px;">
            📝 ${pet.notes}
          </div>
        ` : ""}

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--border); padding-top: 10px;">
          <button class="btn btn-sm btn-secondary" onclick="window.PawPalApp.editPet('${pet.id}')">Edit Details</button>
          <button class="btn btn-sm btn-danger" onclick="window.PawPalApp.deletePet('${pet.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

function selectActivePet(petId) {
  state.activePetId = petId;
  db.updateSettings({ active_pet_id: petId });
  renderAll();
  notifications.showToast({
    title: "Pet Switched",
    message: `Now managing care for ${db.getPetById(petId)?.name}.`,
    type: "info"
  });
}

function deletePet(petId) {
  const pet = db.getPetById(petId);
  if (!pet) return;

  if (confirm(`Are you sure you want to delete ${pet.name}?\nAll associated feeding schedules, health records, and care logs will also be permanently deleted (ON DELETE CASCADE).`)) {
    db.deletePet(petId);
    initPetState();
    renderAll();
    notifications.showToast({
      title: "Pet Deleted",
      message: `${pet.name} and related records were removed.`,
      type: "warning"
    });
  }
}

// --- FEEDING SCHEDULE SCREEN ---
function renderFeedingList() {
  const container = document.getElementById("feeding-list-container");
  const pet = db.getPetById(state.activePetId);
  if (!pet) return;

  const feeds = db.getFeedingByPetId(pet.id);

  if (feeds.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding: 30px;">
        <p style="color: var(--text-muted); margin-bottom: 12px;">No meal schedules created for ${pet.name}.</p>
        <button class="btn btn-primary" id="btn-add-meal-empty">+ Add Meal Time</button>
      </div>
    `;
    const btn = document.getElementById("btn-add-meal-empty");
    if (btn) btn.addEventListener("click", () => openFeedingModal());
    return;
  }

  container.innerHTML = feeds.map(feed => `
    <div class="item-card">
      <div class="item-left">
        <div class="item-icon-box orange">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="item-info">
          <div class="item-primary-text">${feed.meal_name} — ${formatTime(feed.time)}</div>
          <div class="item-secondary-text">${feed.instructions || "Standard meal portion"}</div>
        </div>
      </div>
      <div class="item-right">
        <label class="switch" title="Toggle Reminder On/Off">
          <input type="checkbox" ${feed.enabled ? "checked" : ""} onchange="window.PawPalApp.toggleFeeding('${feed.id}')">
          <span class="slider"></span>
        </label>
        <button class="icon-btn" style="width:30px; height:30px;" onclick="window.PawPalApp.editFeeding('${feed.id}')" title="Edit Meal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn" style="width:30px; height:30px; color: var(--danger);" onclick="window.PawPalApp.deleteFeeding('${feed.id}')" title="Delete Meal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `).join("");
}

function toggleFeeding(feedId) {
  const updated = db.toggleFeeding(feedId);
  if (updated) {
    notifications.showToast({
      title: updated.enabled ? "Meal Reminder Active" : "Meal Reminder Paused",
      message: `${updated.meal_name} is ${updated.enabled ? "enabled" : "disabled"}.`,
      type: "info"
    });
  }
}

function deleteFeeding(feedId) {
  if (confirm("Remove this meal schedule?")) {
    db.deleteFeeding(feedId);
    renderFeedingList();
    renderDashboard();
  }
}

// --- HEALTH & VACCINATIONS SCREEN ---
function renderHealthRecords() {
  const container = document.getElementById("health-records-container");
  const pet = db.getPetById(state.activePetId);
  if (!pet) return;

  let records = db.getHealthRecordsByPetId(pet.id);
  if (state.healthFilter !== "all") {
    records = records.filter(r => r.type === state.healthFilter);
  }

  if (records.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding: 24px;">
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;">
          No ${state.healthFilter === 'all' ? '' : state.healthFilter} records found for ${pet.name}.
        </p>
        <button class="btn btn-sm btn-primary" onclick="window.PawPalApp.openHealthModal()">+ Add New Health Record</button>
      </div>
    `;
    return;
  }

  container.innerHTML = records.map(rec => {
    const dueStatus = getDueStatus(rec.next_due_date);
    return `
      <div class="item-card" style="flex-direction: column; align-items: stretch; gap: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="display:flex; gap:10px; align-items:center;">
            <div class="item-icon-box ${getHealthTypeColor(rec.type)}">
              ${getHealthTypeIcon(rec.type)}
            </div>
            <div>
              <div class="item-primary-text">${rec.title}</div>
              <div class="item-secondary-text" style="text-transform: capitalize;">${rec.type.replace('_', ' ')} • Administered: ${formatDate(rec.date)}</div>
            </div>
          </div>
          <div>
            ${dueStatus}
          </div>
        </div>

        <div style="font-size: 0.78rem; color: var(--text-muted); background: var(--bg-subtle); padding: 8px 10px; border-radius: var(--radius-sm);">
          ${rec.doctor_clinic ? `<div>🏥 <strong>Clinic/Vet:</strong> ${rec.doctor_clinic}</div>` : ""}
          ${rec.next_due_date ? `<div>📅 <strong>Next Due:</strong> ${formatDate(rec.next_due_date)}</div>` : ""}
          ${rec.notes ? `<div style="margin-top: 4px;">📝 ${rec.notes}</div>` : ""}
        </div>

        <div style="display:flex; justify-content:flex-end; gap:6px; margin-top: 4px;">
          <button class="btn btn-sm btn-secondary" onclick="window.PawPalApp.editHealthRecord('${rec.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="window.PawPalApp.deleteHealthRecord('${rec.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

function getDueStatus(nextDueDate) {
  if (!nextDueDate) return `<span class="tag-badge">No Due Date</span>`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDueDate + "T00:00:00");
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `<span class="tag-badge" style="background: var(--danger-light); color: var(--danger); border-color: var(--danger);">Overdue (${Math.abs(diffDays)}d)</span>`;
  } else if (diffDays <= 14) {
    return `<span class="tag-badge" style="background: var(--accent-amber-light); color: #B45309; border-color: var(--accent-amber);">Due Soon (${diffDays}d)</span>`;
  } else {
    return `<span class="tag-badge" style="background: var(--secondary-light); color: var(--secondary); border-color: var(--secondary);">Up to Date</span>`;
  }
}

function deleteHealthRecord(id) {
  if (confirm("Delete this health record?")) {
    db.deleteHealthRecord(id);
    renderHealthRecords();
    renderDashboard();
  }
}

// --- DAILY CARE CHECKLIST SCREEN ---
function renderDailyChecklist() {
  const container = document.getElementById("daily-checklist-container");
  const pet = db.getPetById(state.activePetId);
  if (!pet) return;

  const todayStr = new Date().toISOString().split("T")[0];
  const logs = db.getCareLogsByPetId(pet.id).filter(l => l.date_time.startsWith(todayStr));

  const standardTasks = [
    { type: "feeding", label: "Morning / Daily Meals", sub: "Breakfast, kibble, or wet food" },
    { type: "water", label: "Clean Water Refill", sub: "Rinse bowl and add fresh chilled water" },
    { type: "walk", label: "Walk & Physical Exercise", sub: "Park stroll, run, or indoor playtime" },
    { type: "grooming", label: "Grooming & Brushing", sub: "Coat detangling, teeth check, paw balm" },
    { type: "medication", label: "Daily Meds / Supplements", sub: "Vitamins, heartworm chewable, or ointments" }
  ];

  container.innerHTML = standardTasks.map(task => {
    const isCompleted = logs.some(l => l.activity === task.type && l.completed);
    return `
      <div class="item-card" style="margin-bottom: 8px;">
        <div class="item-left">
          <label class="custom-check">
            <input type="checkbox" ${isCompleted ? "checked" : ""} onchange="window.PawPalApp.toggleDailyTask('${task.type}', '${task.label}')">
            <div class="check-mark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </label>
          <div class="item-info">
            <div class="item-primary-text" style="${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.label}</div>
            <div class="item-secondary-text">${task.sub}</div>
          </div>
        </div>
        <div class="item-right">
          ${isCompleted ? '<span style="color: var(--secondary); font-size: 0.8rem; font-weight:700;">✓ Done</span>' : '<span style="color: var(--text-subtle); font-size: 0.75rem;">Pending</span>'}
        </div>
      </div>
    `;
  }).join("");
}

function toggleDailyTask(activityType, taskLabel) {
  const pet = db.getPetById(state.activePetId);
  if (!pet) return;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const logs = db.getCareLogsByPetId(pet.id);
  const existingLog = logs.find(l => l.activity === activityType && l.date_time.startsWith(todayStr));

  if (existingLog) {
    // Remove completed status
    db.deleteCareLog(existingLog.id);
    notifications.showToast({
      title: "Task Marked Incomplete",
      message: `${taskLabel} was un-checked for today.`,
      type: "info"
    });
  } else {
    // Add completed log
    db.insertCareLog({
      pet_id: pet.id,
      activity: activityType,
      date_time: `${todayStr} ${timeStr}`,
      completed: true,
      notes: `Logged via daily checklist (${taskLabel})`
    });
    notifications.playChime();
    notifications.showToast({
      title: "Great Job!",
      message: `Completed "${taskLabel}" for ${pet.name}.`,
      type: "success"
    });
  }

  renderDailyChecklist();
  renderDashboard();
}

function deleteCareLog(id) {
  db.deleteCareLog(id);
  renderCalendarAndTimeline();
  renderDashboard();
}

// --- CALENDAR & HISTORY SCREEN ---
function initCalendar() {
  document.getElementById("cal-prev-btn")?.addEventListener("click", () => {
    state.calMonth--;
    if (state.calMonth < 0) {
      state.calMonth = 11;
      state.calYear--;
    }
    renderCalendarAndTimeline();
  });

  document.getElementById("cal-next-btn")?.addEventListener("click", () => {
    state.calMonth++;
    if (state.calMonth > 11) {
      state.calMonth = 0;
      state.calYear++;
    }
    renderCalendarAndTimeline();
  });
}

function renderCalendarAndTimeline() {
  const pet = db.getPetById(state.activePetId);
  if (!pet) return;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const displayLabel = `${monthNames[state.calMonth]} ${state.calYear}`;

  const titleEl = document.getElementById("cal-month-title");
  if (titleEl) titleEl.textContent = displayLabel;
  const labelEl = document.getElementById("cal-display-label");
  if (labelEl) labelEl.textContent = displayLabel;

  const grid = document.getElementById("calendar-days-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const firstDay = new Date(state.calYear, state.calMonth, 1).getDay();
  const daysInMonth = new Date(state.calYear, state.calMonth + 1, 0).getDate();

  const logs = db.getCareLogsByPetId(pet.id);
  const healthRecords = db.getHealthRecordsByPetId(pet.id);

  // Pad empty days
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "cal-day";
    emptyCell.style.opacity = "0.2";
    grid.appendChild(emptyCell);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${state.calYear}-${String(state.calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayCell = document.createElement("div");
    dayCell.className = "cal-day";
    dayCell.textContent = day;

    if (dateStr === todayStr) {
      dayCell.classList.add("today");
    }
    if (dateStr === state.selectedDate) {
      dayCell.classList.add("selected");
    }

    // Check if day has event
    const hasLog = logs.some(l => l.date_time.startsWith(dateStr));
    const hasVet = healthRecords.some(r => r.date === dateStr || r.next_due_date === dateStr);
    if (hasLog || hasVet) {
      dayCell.classList.add("has-event");
    }

    dayCell.addEventListener("click", () => {
      state.selectedDate = dateStr;
      renderCalendarAndTimeline();
    });

    grid.appendChild(dayCell);
  }

  // Render Timeline for Selected Date
  renderTimelineForDate(state.selectedDate);
}

function renderTimelineForDate(dateStr) {
  const container = document.getElementById("timeline-container");
  const title = document.getElementById("timeline-date-title");
  const pet = db.getPetById(state.activePetId);
  if (!pet || !container) return;

  const d = new Date(dateStr + "T00:00:00");
  const dateFormatted = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  if (title) title.textContent = `Activities for ${dateFormatted}`;

  const logs = db.getCareLogsByPetId(pet.id).filter(l => l.date_time.startsWith(dateStr));
  const health = db.getHealthRecordsByPetId(pet.id).filter(r => r.date === dateStr || r.next_due_date === dateStr);

  if (logs.length === 0 && health.length === 0) {
    container.innerHTML = `
      <div style="padding: 16px; color: var(--text-muted); font-size: 0.85rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border);">
        No logged activities or vet events on this date.
      </div>
    `;
    return;
  }

  let html = "";
  health.forEach(h => {
    const isDue = h.next_due_date === dateStr;
    html += `
      <div class="timeline-node">
        <div class="timeline-dot" style="border-color: var(--accent-amber);"></div>
        <div class="timeline-box" style="border-left: 3px solid var(--accent-amber);">
          <div style="font-weight: 700; font-size: 0.85rem;">🏥 ${isDue ? 'Next Due:' : 'Administered:'} ${h.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${h.doctor_clinic || 'Veterinary care'} • ${h.notes || 'Routine record'}</div>
        </div>
      </div>
    `;
  });

  logs.forEach(l => {
    const timeOnly = l.date_time.split(" ")[1] || "";
    html += `
      <div class="timeline-node">
        <div class="timeline-dot"></div>
        <div class="timeline-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight: 700; font-size: 0.85rem; text-transform: capitalize;">
              ${l.activity} Logged
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${timeOnly}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            ${l.notes || "Completed on time"}
          </div>
          <div style="text-align:right; margin-top:4px;">
            <button class="btn btn-sm btn-danger" style="padding: 2px 8px; font-size:0.68rem;" onclick="window.PawPalApp.deleteCareLog('${l.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// --- NEARBY VETS SCREEN ---
function renderNearbyVets() {
  const container = document.getElementById("vets-list-container");
  const vets = db.getAllVets();

  let filtered = vets.filter(v => {
    const matchesSearch = state.vetSearchQuery === "" ||
      v.name.toLowerCase().includes(state.vetSearchQuery.toLowerCase()) ||
      v.services.some(s => s.toLowerCase().includes(state.vetSearchQuery.toLowerCase())) ||
      v.address.toLowerCase().includes(state.vetSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (state.vetFilter === "emergency") return v.isEmergency;
    if (state.vetFilter === "nearby") return parseFloat(v.distance) <= 2.0;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding: 24px; color: var(--text-muted);">
        No veterinary clinics matched your search query.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(v => `
    <div class="vet-card ${v.isEmergency ? 'emergency-clinic' : ''}">
      <div class="vet-header">
        <div>
          <div class="vet-name">${v.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${v.distance} • ${v.hours}</div>
        </div>
        <div class="vet-rating">★ ${v.rating} (${v.reviewsCount})</div>
      </div>

      <div class="vet-details">
        <div>📍 ${v.address}</div>
        <div style="margin-top: 4px; display:flex; flex-wrap:wrap; gap:4px;">
          ${v.services.map(s => `<span class="tag-badge" style="font-size:0.68rem;">${s}</span>`).join("")}
        </div>
      </div>

      <div class="vet-actions">
        <a href="tel:${v.phone.replace(/[^0-9+]/g, '')}" class="btn btn-sm ${v.isEmergency ? 'btn-danger' : 'btn-primary'}" style="text-decoration:none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Call ${v.phone}
        </a>
        <a href="https://maps.google.com/?q=${encodeURIComponent(v.name + ' ' + v.address)}" target="_blank" class="btn btn-sm btn-secondary" style="text-decoration:none;">
          Directions
        </a>
      </div>
    </div>
  `).join("");
}

// --- FILTERS & SEARCH ---
function initFilters() {
  // Health filters
  document.querySelectorAll("#health-filter-chips .filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#health-filter-chips .filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.healthFilter = chip.getAttribute("data-filter");
      renderHealthRecords();
    });
  });

  // Vet filters
  document.querySelectorAll("#vet-filter-chips .filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#vet-filter-chips .filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.vetFilter = chip.getAttribute("data-vet-filter");
      renderNearbyVets();
    });
  });

  const vetSearch = document.getElementById("vet-search-input");
  if (vetSearch) {
    vetSearch.addEventListener("input", (e) => {
      state.vetSearchQuery = e.target.value.trim();
      renderNearbyVets();
    });
  }
}

// --- MODALS & FORMS ---
function initModals() {
  document.querySelectorAll(".modal-close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
    });
  });

  // Open modals via buttons
  document.getElementById("btn-open-add-pet")?.addEventListener("click", () => openPetModal());
  document.getElementById("btn-open-add-feeding")?.addEventListener("click", () => openFeedingModal());
  document.getElementById("btn-open-add-health")?.addEventListener("click", () => openHealthModal());
  document.getElementById("btn-quick-log-custom")?.addEventListener("click", () => {
    document.getElementById("modal-custom-log").classList.add("active");
  });

  // Android Blueprint Modal
  document.getElementById("btn-view-android-blueprint")?.addEventListener("click", () => {
    document.getElementById("modal-blueprint").classList.add("active");
  });

  // Export Health PDF / Print
  document.getElementById("btn-export-health-pdf")?.addEventListener("click", () => {
    exportHealthSummaryReport();
  });

  // Export JSON Backup
  document.getElementById("btn-export-backup")?.addEventListener("click", () => {
    const backup = db.exportFullBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PawPal_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.showToast({
      title: "Backup Exported",
      message: "PawPal SQLite database JSON backup has been downloaded.",
      type: "success"
    });
  });

  // Reset to Demo Data
  document.getElementById("btn-reset-demo-data")?.addEventListener("click", () => {
    if (confirm("Reset all data to default demo pets and records? Any new pets added will be replaced.")) {
      db.resetToDefaults();
      initPetState();
      initSettings();
      renderAll();
      notifications.showToast({
        title: "Demo Data Loaded",
        message: "Restored sample pets (Luna, Milo, Kiwi) and complete schedules.",
        type: "success"
      });
    }
  });

  // Save emergency contact settings
  document.getElementById("btn-save-emergency-settings")?.addEventListener("click", () => {
    const name = document.getElementById("setting-vet-name").value.trim();
    const phone = document.getElementById("setting-vet-phone").value.trim();
    db.updateSettings({
      emergency_vet_name: name,
      emergency_vet_phone: phone
    });
    notifications.showToast({
      title: "Settings Saved",
      message: "Emergency veterinary hospital contacts updated.",
      type: "success"
    });
    renderDashboard();
  });
}

function initForms() {
  // Pet Form
  const petForm = document.getElementById("form-pet");
  petForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("pet-form-id").value;
    const name = document.getElementById("pet-name").value.trim();
    const species = document.getElementById("pet-species").value;
    const breed = document.getElementById("pet-breed").value.trim();
    const age = document.getElementById("pet-age").value.trim();
    const weightVal = parseFloat(document.getElementById("pet-weight").value);
    const notes = document.getElementById("pet-notes").value.trim();

    const photo_uri = state.uploadedPhotoData || state.selectedAvatarId;

    if (id) {
      db.updatePet({
        id,
        name,
        species,
        breed,
        age,
        weight: isNaN(weightVal) ? null : weightVal,
        notes,
        photo_uri
      });
      notifications.showToast({ title: "Pet Updated", message: `${name}'s profile was updated.`, type: "success" });
    } else {
      const newPet = db.insertPet({
        name,
        species,
        breed,
        age,
        weight: isNaN(weightVal) ? null : weightVal,
        notes,
        photo_uri
      });
      state.activePetId = newPet.id;
      notifications.showToast({ title: "Pet Added", message: `Welcome ${name} to PawPal!`, type: "success" });
    }

    document.getElementById("modal-pet").classList.remove("active");
    renderAll();
  });

  // Pet photo file reader
  const fileInput = document.getElementById("pet-photo-file");
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        state.uploadedPhotoData = loadEvent.target.result;
        notifications.showToast({ title: "Photo Loaded", message: "Custom pet photo ready to save.", type: "info" });
      };
      reader.readAsDataURL(file);
    }
  });

  // Feeding Form
  const feedingForm = document.getElementById("form-feeding");
  feedingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("feeding-form-id").value;
    const pet_id = document.getElementById("feeding-pet-select").value;
    const meal_name = document.getElementById("feeding-meal-name").value.trim();
    const time = document.getElementById("feeding-time").value;
    const instructions = document.getElementById("feeding-instructions").value.trim();

    if (id) {
      db.updateFeeding({ id, pet_id, meal_name, time, instructions });
      notifications.showToast({ title: "Meal Updated", message: `${meal_name} schedule updated.`, type: "success" });
    } else {
      db.insertFeeding({ pet_id, meal_name, time, instructions, enabled: true });
      notifications.showToast({ title: "Meal Added", message: `${meal_name} set for ${time}.`, type: "success" });
    }

    document.getElementById("modal-feeding").classList.remove("active");
    renderFeedingList();
    renderDashboard();
  });

  // Health Form
  const healthForm = document.getElementById("form-health");
  healthForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("health-form-id").value;
    const pet_id = document.getElementById("health-pet-select").value;
    const type = document.getElementById("health-type").value;
    const title = document.getElementById("health-title").value.trim();
    const date = document.getElementById("health-date").value;
    const next_due_date = document.getElementById("health-next-due").value || null;
    const doctor_clinic = document.getElementById("health-clinic").value.trim();
    const notes = document.getElementById("health-notes").value.trim();

    if (id) {
      db.updateHealthRecord({ id, pet_id, type, title, date, next_due_date, doctor_clinic, notes });
      notifications.showToast({ title: "Record Saved", message: `${title} updated.`, type: "success" });
    } else {
      db.insertHealthRecord({ pet_id, type, title, date, next_due_date, doctor_clinic, notes });
      notifications.showToast({ title: "Record Added", message: `${title} recorded.`, type: "success" });
    }

    document.getElementById("modal-health").classList.remove("active");
    renderHealthRecords();
    renderDashboard();
  });

  // Custom Log Form
  const customLogForm = document.getElementById("form-custom-log");
  customLogForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pet = db.getPetById(state.activePetId);
    if (!pet) return;

    const activity = document.getElementById("log-activity-type").value;
    const notes = document.getElementById("log-notes").value.trim();
    const now = new Date();
    const date_time = `${now.toISOString().split("T")[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    db.insertCareLog({
      pet_id: pet.id,
      activity,
      date_time,
      completed: true,
      notes: notes || "Logged custom activity"
    });

    notifications.showToast({
      title: "Activity Recorded",
      message: `Logged ${activity} in ${pet.name}'s care history.`,
      type: "success"
    });

    document.getElementById("modal-custom-log").classList.remove("active");
    renderDailyChecklist();
    renderDashboard();
  });
}

function openPetModal(pet = null) {
  state.editingPetId = pet ? pet.id : null;
  state.uploadedPhotoData = pet ? pet.photo_uri : null;
  state.selectedAvatarId = pet ? (pet.photo_uri?.startsWith("avatar_") ? pet.photo_uri : "avatar_dog_golden") : "avatar_dog_golden";

  document.getElementById("modal-pet-title").textContent = pet ? "Edit Pet Profile" : "Add Pet Profile";
  document.getElementById("pet-form-id").value = pet ? pet.id : "";
  document.getElementById("pet-name").value = pet ? pet.name : "";
  document.getElementById("pet-species").value = pet ? pet.species : "Dog";
  document.getElementById("pet-breed").value = pet ? (pet.breed || "") : "";
  document.getElementById("pet-age").value = pet ? (pet.age || "") : "";
  document.getElementById("pet-weight").value = pet && pet.weight ? pet.weight : "";
  document.getElementById("pet-notes").value = pet ? (pet.notes || "") : "";

  // Render Avatar selector
  const picker = document.getElementById("pet-avatar-picker");
  picker.innerHTML = AVATAR_PRESETS.map(preset => `
    <div class="avatar-option ${preset.id === state.selectedAvatarId ? 'selected' : ''}" data-avatar-id="${preset.id}" title="${preset.label}">
      ${preset.svg}
    </div>
  `).join("");

  picker.querySelectorAll(".avatar-option").forEach(opt => {
    opt.addEventListener("click", () => {
      picker.querySelectorAll(".avatar-option").forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
      state.selectedAvatarId = opt.getAttribute("data-avatar-id");
      state.uploadedPhotoData = null; // Prefer selected avatar
    });
  });

  document.getElementById("modal-pet").classList.add("active");
}

function editPet(petId) {
  const pet = db.getPetById(petId);
  if (pet) openPetModal(pet);
}

function openFeedingModal(feed = null) {
  state.editingFeedingId = feed ? feed.id : null;
  document.getElementById("modal-feeding-title").textContent = feed ? "Edit Meal Schedule" : "Add Meal Time";
  document.getElementById("feeding-form-id").value = feed ? feed.id : "";

  // Populate pet select
  const select = document.getElementById("feeding-pet-select");
  const pets = db.getAllPets();
  select.innerHTML = pets.map(p => `
    <option value="${p.id}" ${p.id === (feed ? feed.pet_id : state.activePetId) ? "selected" : ""}>${p.name} (${p.species})</option>
  `).join("");

  document.getElementById("feeding-meal-name").value = feed ? feed.meal_name : "";
  document.getElementById("feeding-time").value = feed ? feed.time : "08:00";
  document.getElementById("feeding-instructions").value = feed ? (feed.instructions || "") : "";

  document.getElementById("modal-feeding").classList.add("active");
}

function editFeeding(feedId) {
  const feed = db.getAllFeeding().find(f => String(f.id) === String(feedId));
  if (feed) openFeedingModal(feed);
}

function openHealthModal(record = null) {
  state.editingHealthId = record ? record.id : null;
  document.getElementById("modal-health-title").textContent = record ? "Edit Health Record" : "Add Health Record";
  document.getElementById("health-form-id").value = record ? record.id : "";

  const select = document.getElementById("health-pet-select");
  const pets = db.getAllPets();
  select.innerHTML = pets.map(p => `
    <option value="${p.id}" ${p.id === (record ? record.pet_id : state.activePetId) ? "selected" : ""}>${p.name} (${p.species})</option>
  `).join("");

  document.getElementById("health-type").value = record ? record.type : "vaccination";
  document.getElementById("health-title").value = record ? record.title : "";
  document.getElementById("health-date").value = record ? record.date : new Date().toISOString().split("T")[0];
  document.getElementById("health-next-due").value = record ? (record.next_due_date || "") : "";
  document.getElementById("health-clinic").value = record ? (record.doctor_clinic || "") : "";
  document.getElementById("health-notes").value = record ? (record.notes || "") : "";

  document.getElementById("modal-health").classList.add("active");
}

function editHealthRecord(recordId) {
  const record = db.getAllHealthRecords().find(r => String(r.id) === String(recordId));
  if (record) openHealthModal(record);
}

// --- EXPORT HEALTH SUMMARY REPORT ---
function exportHealthSummaryReport() {
  const pet = db.getPetById(state.activePetId);
  if (!pet) return;

  const records = db.getHealthRecordsByPetId(pet.id);
  const printArea = document.getElementById("print-health-report");

  printArea.innerHTML = `
    <div style="font-family: sans-serif; padding: 24px; max-width: 800px; margin: 0 auto; color: #1E293B;">
      <div style="border-bottom: 2px solid #FF6B4A; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 26px; color: #FF6B4A; margin: 0;">PawPal — Pet Health Passport</h1>
          <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px;">Official Personal Wellness & Vaccination Record</p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748B;">
          Date Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div><strong>Pet Name:</strong> ${pet.name}</div>
        <div><strong>Species & Breed:</strong> ${pet.species} (${pet.breed || "Mixed"})</div>
        <div><strong>Age:</strong> ${pet.age || "N/A"}</div>
        <div><strong>Recorded Weight:</strong> ${pet.weight ? pet.weight + " kg" : "N/A"}</div>
        <div style="grid-column: span 2;"><strong>Care Notes & Allergies:</strong> ${pet.notes || "None recorded"}</div>
      </div>

      <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #92400E;">
        ⚠️ <strong>Veterinary Notice:</strong> This health summary is maintained by the pet guardian for record-keeping and appointment tracking. It does not replace professional veterinary consultation or diagnosis.
      </div>

      <h3 style="font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px;">Vaccination, Medication & Vet History</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
        <thead>
          <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1;">
            <th style="padding: 8px;">Type</th>
            <th style="padding: 8px;">Record Title</th>
            <th style="padding: 8px;">Administered Date</th>
            <th style="padding: 8px;">Next Due Date</th>
            <th style="padding: 8px;">Clinic / Vet</th>
            <th style="padding: 8px;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 8px; text-transform: capitalize; font-weight: 600;">${r.type.replace('_', ' ')}</td>
              <td style="padding: 8px; font-weight: 600;">${r.title}</td>
              <td style="padding: 8px;">${r.date}</td>
              <td style="padding: 8px; color: #D97706; font-weight: 600;">${r.next_due_date || '--'}</td>
              <td style="padding: 8px;">${r.doctor_clinic || '--'}</td>
              <td style="padding: 8px; color: #64748B;">${r.notes || '--'}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="margin-top: 30px; border-top: 1px dashed #CBD5E1; padding-top: 10px; font-size: 11px; color: #94A3B8; text-align: center;">
        Generated via PawPal Pet Care Manager • Lab Project Edition
      </div>
    </div>
  `;

  // Print via browser
  window.print();
}

// --- UTILITY FORMATTERS ---
function formatTime(time24) {
  if (!time24) return "";
  const [hours, mins] = time24.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mins} ${ampm}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return "";
  const [dPart, tPart] = dateTimeStr.split(" ");
  return `${formatDate(dPart)} at ${formatTime(tPart)}`;
}

function getActivityColor(activity) {
  switch (activity) {
    case "feeding": return "orange";
    case "walk": return "green";
    case "water": return "blue";
    case "grooming": return "purple";
    case "medication": return "amber";
    default: return "orange";
  }
}

function getActivityIcon(activity) {
  switch (activity) {
    case "feeding":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    case "walk":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4v6m0 0l3 5m-3-5l-3 4m0 0l-3 6m6-10l2 7"/></svg>`;
    case "water":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    case "grooming":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10h10M7 14h10M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg>`;
    case "medication":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    default:
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
  }
}

function getHealthTypeColor(type) {
  switch (type) {
    case "vaccination": return "green";
    case "medication": return "purple";
    case "vet_visit": return "amber";
    default: return "blue";
  }
}

function getHealthTypeIcon(type) {
  switch (type) {
    case "vaccination":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    case "medication":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    case "vet_visit":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
    default:
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}
