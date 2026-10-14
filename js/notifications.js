// PawPal Notification & Smart Reminder Service
// Emulates Android AlarmManager, NotificationChannel, and BroadcastReceiver

import { db } from "./db.js";

class NotificationService {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.triggeredReminders = new Set();
    this.toastContainer = null;
    this.init();
  }

  init() {
    this.createToastContainer();
    this.startScheduler();
  }

  createToastContainer() {
    if (document.getElementById("pawpal-toast-container")) {
      this.toastContainer = document.getElementById("pawpal-toast-container");
      return;
    }
    const container = document.createElement("div");
    container.id = "pawpal-toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
    this.toastContainer = container;
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      this.showToast({
        title: "Notifications Not Supported",
        message: "This browser doesn't support Web Notifications, but in-app reminders are active!",
        type: "info"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.playChime();
        this.showToast({
          title: "Reminders Enabled!",
          message: "You'll now receive timely alerts for feeding, medications & vet appointments.",
          type: "success"
        });
        return true;
      } else {
        this.showToast({
          title: "Permission Denied",
          message: "Please allow notifications in your browser settings to receive alerts.",
          type: "warning"
        });
        return false;
      }
    } catch (e) {
      console.warn("Notification permission error:", e);
      return false;
    }
  }

  playChime() {
    const settings = db.getSettings();
    if (settings.sound_enabled === false) return;

    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      // Audio autoplay policy might restrict until user interaction
      console.log("Audio chime muted pending user click:", e.message);
    }
  }

  showToast({ title, message, type = "info", duration = 6000, actionLabel, onAction }) {
    if (!this.toastContainer) this.createToastContainer();

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;

    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === "warning") {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      ${actionLabel ? `<button class="toast-action-btn">${actionLabel}</button>` : ""}
      <button class="toast-close-btn" aria-label="Close">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    const closeBtn = toast.querySelector(".toast-close-btn");
    closeBtn.addEventListener("click", () => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 300);
    });

    if (actionLabel && onAction) {
      const actionBtn = toast.querySelector(".toast-action-btn");
      actionBtn.addEventListener("click", () => {
        onAction();
        toast.remove();
      });
    }

    this.toastContainer.appendChild(toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentElement) {
          toast.classList.add("fade-out");
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    }
  }

  sendReminder(title, body, options = {}) {
    const settings = db.getSettings();
    if (settings.notifications_enabled === false) return;

    this.playChime();

    // Native Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "assets/paw-icon.svg",
          badge: "assets/paw-icon.svg",
          ...options
        });
      } catch (e) {
        console.warn("Desktop notification failed:", e);
      }
    }

    // In-App Toast
    this.showToast({
      title,
      message: body,
      type: "warning",
      duration: 8000,
      actionLabel: options.actionLabel,
      onAction: options.onAction
    });
  }

  startScheduler() {
    if (this.intervalId) clearInterval(this.intervalId);

    // Check every 30 seconds
    this.intervalId = setInterval(() => {
      this.checkScheduledAlarms();
    }, 30000);

    // Also run immediately
    this.checkScheduledAlarms();
  }

  checkScheduledAlarms() {
    const settings = db.getSettings();
    if (settings.notifications_enabled === false) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, "0");
    const currentMinutes = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const todayStr = now.toISOString().split("T")[0];

    const pets = db.getAllPets();
    const feeds = db.getAllFeeding();

    feeds.forEach(feed => {
      if (!feed.enabled) return;
      const pet = pets.find(p => String(p.id) === String(feed.pet_id));
      if (!pet) return;

      const reminderKey = `feed_${feed.id}_${todayStr}_${feed.time}`;
      if (feed.time === currentTimeStr && !this.triggeredReminders.has(reminderKey)) {
        this.triggeredReminders.add(reminderKey);

        this.sendReminder(
          `🐾 Feeding Time for ${pet.name}!`,
          `It's time for "${feed.meal_name}": ${feed.instructions || "Ready for mealtime!"}`,
          {
            actionLabel: "Log as Fed",
            onAction: () => {
              db.insertCareLog({
                pet_id: pet.id,
                activity: "feeding",
                date_time: `${todayStr} ${currentTimeStr}`,
                completed: true,
                notes: `Completed via reminder: ${feed.meal_name}`
              });
              this.showToast({
                title: "Meal Logged!",
                message: `Recorded ${feed.meal_name} in ${pet.name}'s care history.`,
                type: "success"
              });
              window.dispatchEvent(new CustomEvent("pawpal-data-updated"));
            }
          }
        );
      }
    });

    // Check Upcoming Health Records due today or tomorrow
    const healthRecords = db.getAllHealthRecords();
    healthRecords.forEach(record => {
      if (!record.next_due_date) return;
      const dueDate = new Date(record.next_due_date + "T00:00:00");
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      const pet = pets.find(p => String(p.id) === String(record.pet_id));
      if (!pet) return;

      const healthKey = `health_${record.id}_${record.next_due_date}_due`;
      if ((diffDays === 0 || diffDays === 1) && !this.triggeredReminders.has(healthKey)) {
        this.triggeredReminders.add(healthKey);

        const dueLabel = diffDays === 0 ? "is due TODAY" : "is due TOMORROW";
        this.sendReminder(
          `🏥 Health Reminder: ${record.title}`,
          `${pet.name}'s ${record.type} "${record.title}" ${dueLabel}. Remember to consult your vet.`,
          {
            actionLabel: "View Details",
            onAction: () => {
              window.dispatchEvent(new CustomEvent("pawpal-navigate-tab", { detail: { tab: "health" } }));
            }
          }
        );
      }
    });
  }

  testTrigger() {
    const pets = db.getAllPets();
    const petName = pets.length > 0 ? pets[0].name : "your pet";
    this.sendReminder(
      `🔔 Test Reminder: Feeding ${petName}`,
      `This is a test reminder demonstration! PawPal triggers audio and visual alerts on schedule.`,
      {
        actionLabel: "Looks Great!",
        onAction: () => {
          this.showToast({
            title: "Success",
            message: "Notification system is working properly!",
            type: "success"
          });
        }
      }
    );
  }
}

export const notifications = new NotificationService();
