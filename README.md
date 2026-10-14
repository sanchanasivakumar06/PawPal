# PawPal — Pet Care & Wellness Manager

![PawPal](assets/paw-icon.svg)

> **PawPal** is a full-featured, mobile-first pet care management application designed for pet parents to track daily routines, feeding schedules, vaccination dates, health records, and veterinary visits in one intuitive dashboard.

Currently running as a complete, zero-dependency, responsive web application at **`http://localhost:3000`** with an interactive **Mobile App Frame** simulation mode and a full **Android Lab Architecture Blueprint**.

---

## 🚀 Quick Start / How to Run

### Method 1: One-Click Windows Launcher
Double-click the included batch file:
```cmd
start_pawpal.bat
```
This will automatically launch the local server and open your default browser to `http://localhost:3000`.

### Method 2: Python (Pre-installed)
```bash
python -m http.server 3000
```
Then navigate to: **`http://localhost:3000`** in your browser.

### Method 3: Node / npm
```bash
npm start
```

---

## ✨ Features Implemented

### 1. Dual Viewport Experience
- **Mobile Device Frame Mode:** Simulates a modern mobile smartphone (with camera notch, status bar clock, and bottom navigation bar) matching native Android UX.
- **Full-Screen Desktop Mode:** Expands into a spacious desktop web application with a single click on the top header button.

### 2. Multi-Pet Profile Management
- Switch seamlessly between pets (comes preloaded with **Luna the Golden Retriever**, **Milo the Tabby Cat**, and **Kiwi the Cockatiel**).
- Add new pets with custom details: Name, Species, Breed, Age, Weight, and Care Notes.
- Choose from 5 illustrated SVG pet avatar presets or upload your own pet photos via file picker.
- Edit and Delete pets with automatic **`ON DELETE CASCADE`** simulation for all related logs and reminders.

### 3. Smart Feeding Schedules & Reminders
- Schedule multiple daily meals per pet (Breakfast, Lunch, Dinner, Snacks).
- Set exact meal times and feeding portions/instructions (e.g. kibble quantity, medication drops, broth).
- Individual toggle switches to enable or disable meal alarms.
- **Automated Alarms:** Background scheduler checks times every 30 seconds and sounds an audio chime accompanied by a notification toast with a one-click **"Log as Fed"** button!
- Top-bar **"Test Alert"** button allows instant testing of audio chimes and notification popups.

### 4. Health Records & Vaccinations
- Categorized tracking for **Vaccinations**, **Medications**, and **Vet Visits**.
- Color-coded status badges:
  - 🟢 **Up to Date**
  - 🟡 **Due Soon** (within 14 days)
  - 🔴 **Overdue**
- **Mandatory Medical Disclaimer:** Clearly visible in the UI:
  > *"Medical Disclaimer: Records and reminders are for personal organization only. Always consult your certified veterinarian for professional diagnosis and medical advice."*
- **Export Health Summary:** Generate and print a comprehensive **Pet Health Passport / Medical Card** ready to save as PDF.

### 5. Daily Care Routine Checklist
- Interactive daily checklist: **Feeding**, **Water Refill**, **Walk / Exercise**, **Grooming**, **Medications**.
- Check off items to instantly record them in `care_logs` with timestamps.
- Real-time animated **Care Score & Progress Bar** on the dashboard.
- **"Log Custom"** button to record extra activities (e.g. nail trimming, bath, agility training).

### 6. Monthly Care Calendar & Timeline
- Interactive monthly calendar with visual indicator dots on days with logged care or upcoming vet visits.
- Navigate across months and click any day to view its detailed activity timeline.

### 7. Nearby Vet Clinics Directory (Mock Retrofit API)
- Searchable directory of veterinary hospitals and specialty clinics.
- Filter by **"24/7 Emergency Only"** or **"Within 2 Miles"**.
- One-click phone dialer button (`tel:+1...`) and Google Maps directions link.

### 8. Emergency Vet Quick Dial
- Prominent pulsing red **"Emergency Vet"** button in the header and home dashboard for rapid access in critical situations.
- Configurable emergency clinic name and phone number in Settings.

### 9. Settings, Dark Mode & SQLite Database Management
- **Theme Switcher:** Seamless toggle between Warm Light Mode and Sleek Dark Mode.
- **Preferences:** Push notification toggle, audio chime toggle, and lead time selector.
- **Database Backup:** Export full SQLite database as a structured JSON file.
- **Demo Data Reset:** One-click button to restore sample pets, schedules, and care logs.
- **Lab Blueprint Modal:** Direct access to Android architecture diagrams and viva questions.

---

## 📱 Future Android Studio Conversion

PawPal was designed from the ground up to match the university **Android Lab Syllabus**. All tables, DAOs, and screens map directly to native Android Java components:

- Full file structure and master conversion prompt are detailed in:
  👉 **`ANDROID_PROMPT_AND_STRUCTURE.md`**

### Database Schema (Local SQLite)
```sql
pets(id PK, name, species, breed, age, weight, photo_uri, notes)
feeding_schedule(id PK, pet_id FK, meal_name, time, instructions, enabled)
health_records(id PK, pet_id FK, type, title, date, next_due_date, notes)
care_logs(id PK, pet_id FK, activity, date_time, completed)
```

---

## 📂 Web Project Structure

```text
d:\pawpal\
├── index.html                     # Main application shell with all tabs and modals
├── css\
│   └── styles.css                 # Responsive stylesheet, themes, animations, print layout
├── js\
│   ├── app.js                     # Main application controller, rendering, events
│   ├── db.js                      # SQLite-like database layer & DAOs (LocalStorage)
│   ├── sampleData.js              # Initial pets, feeding schedules, health records, SVG avatars
│   └── notifications.js           # Web Audio API chime, Web Notifications & scheduler
├── assets\
│   └── paw-icon.svg               # Vector brand paw icon
├── package.json                   # Project metadata and run scripts
├── start_pawpal.bat               # Windows double-click launcher
├── ANDROID_PROMPT_AND_STRUCTURE.md# Complete Android Java blueprint & master prompt
└── README.md                      # Documentation & user guide
```

---

*PawPal — Built with care for happy, healthy pets! 🐾*
