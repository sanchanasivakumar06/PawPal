# PawPal — Android Architecture Blueprint & Master Conversion Prompt

> **Lab Syllabus Project:** PawPal — Pet Care Manager  
> **Target OS:** Android (Java / Android Studio)  
> **Min SDK:** 24 (Android 7.0) | **Target SDK:** 34 (Android 14)  
> **Database:** SQLite (via `SQLiteOpenHelper` & DAOs)  
> **Notifications:** `NotificationChannel` + `AlarmManager` + `BroadcastReceiver`  

---

## 1. Complete Android Project File Structure

```text
PawPal/
├── app/
│   ├── build.gradle
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml
│       │   ├── java/com/pawpal/app/
│       │   │   ├── activities/
│       │   │   │   ├── SplashActivity.java          // Brand splash screen with auto-redirect
│       │   │   │   ├── LoginActivity.java           // User welcome and optional profile setup
│       │   │   │   ├── MainActivity.java            // Home Dashboard (Pet overview, metrics, reminders)
│       │   │   │   ├── AddEditPetActivity.java      // Form to add/edit pet + Camera/Gallery Intent
│       │   │   │   ├── PetDetailsActivity.java      // Detailed pet profile, weight, notes & actions
│       │   │   │   ├── HealthActivity.java          // Vaccinations, medications & vet appointments
│       │   │   │   ├── AddHealthRecordActivity.java // Form for new vaccine/med record + DatePicker
│       │   │   │   ├── DailyCareActivity.java       // Daily routine checklist (feeding, walk, grooming)
│       │   │   │   ├── CareHistoryActivity.java     // Monthly calendar + activity timeline
│       │   │   │   ├── NearbyVetsActivity.java      // Retrofit API integration to find clinics
│       │   │   │   └── SettingsActivity.java        // Theme toggle, reminder lead time, data export
│       │   │   ├── adapters/
│       │   │   │   ├── PetAdapter.java              // RecyclerView adapter for horizontal/vertical pets
│       │   │   │   ├── TaskAdapter.java             // RecyclerView adapter for daily checklist items
│       │   │   │   ├── HealthRecordAdapter.java     // RecyclerView adapter with status color badges
│       │   │   │   └── HistoryAdapter.java          // RecyclerView adapter for timeline care logs
│       │   │   ├── database/
│       │   │   │   ├── DatabaseHelper.java          // SQLiteOpenHelper, table creation, foreign keys
│       │   │   │   ├── PetDao.java                  // CRUD queries for pets table
│       │   │   │   ├── FeedingDao.java              // CRUD queries for feeding_schedule table
│       │   │   │   ├── HealthRecordDao.java         // CRUD queries for health_records table
│       │   │   │   └── CareLogDao.java              // CRUD queries for care_logs table
│       │   │   ├── models/
│       │   │   │   ├── Pet.java                     // Model (id, name, species, breed, age, weight...)
│       │   │   │   ├── FeedingSchedule.java         // Model (id, pet_id, meal_name, time, instructions...)
│       │   │   │   ├── HealthRecord.java            // Model (id, pet_id, type, title, date, next_due...)
│       │   │   │   └── CareLog.java                 // Model (id, pet_id, activity, date_time, completed)
│       │   │   ├── notifications/
│       │   │   │   ├── NotificationHelper.java      // NotificationChannel builder & notification dispatch
│       │   │   │   ├── ReminderReceiver.java        // BroadcastReceiver triggered by AlarmManager
│       │   │   │   ├── ReminderScheduler.java       // AlarmManager scheduling (setExactAndAllowWhileIdle)
│       │   │   │   └── BootReceiver.java            // BroadcastReceiver for ACTION_BOOT_COMPLETED
│       │   │   ├── services/
│       │   │   │   └── CareTaskService.java         // Background Service / JobIntentService for maintenance
│       │   │   ├── network/
│       │   │   │   ├── ApiClient.java               // Retrofit singleton client instance
│       │   │   │   ├── VetApiService.java           // Retrofit REST interface definition
│       │   │   │   └── VetClinic.java               // DTO model for clinic JSON responses
│       │   │   └── utils/
│       │   │       ├── PrefsManager.java            // SharedPreferences wrapper (theme, lead time)
│       │   │       ├── DateUtils.java               // Date/Time formatting and difference calculators
│       │   │       ├── ImageUtils.java              // Bitmap compression and FileProvider URI conversion
│       │   │       └── Constants.java               // Notification IDs, Intent action keys, DB names
│       │   └── res/
│       │       ├── layout/
│       │       │   ├── activity_splash.xml
│       │       │   ├── activity_login.xml
│       │       │   ├── activity_main.xml
│       │       │   ├── activity_add_edit_pet.xml
│       │       │   ├── activity_pet_details.xml
│       │       │   ├── activity_health.xml
│       │       │   ├── activity_add_health_record.xml
│       │       │   ├── activity_daily_care.xml
│       │       │   ├── activity_care_history.xml
│       │       │   ├── activity_nearby_vets.xml
│       │       │   ├── activity_settings.xml
│       │       │   ├── item_pet.xml
│       │       │   ├── item_task.xml
│       │       │   ├── item_health_record.xml
│       │       │   └── item_history.xml
│       │       ├── drawable/                        // Rounded backgrounds, vector paw icons
│       │       ├── menu/
│       │       │   ├── bottom_nav_menu.xml          // Bottom navigation tabs
│       │       │   └── toolbar_menu.xml             // Top actions (Add, Emergency, Search)
│       │       ├── values/
│       │       │   ├── colors.xml                   // Warm coral, sage green, amber, dark palette
│       │       │   ├── strings.xml                  // All UI text strings, medical disclaimers
│       │       │   ├── styles.xml                   // Rounded card styles, button themes
│       │       │   └── themes.xml                   // MaterialComponents.DayNight
│       │       ├── values-night/
│       │       │   └── themes.xml                   // Dark mode theme overrides
│       │       └── xml/
│       │           └── file_paths.xml               // FileProvider paths for camera images
│       ├── androidTest/java/com/pawpal/app/
│       │   ├── AddPetUiTest.java                    // Espresso automated UI test
│       │   └── DatabaseInstrumentedTest.java       // AndroidJUnit4 SQLite CRUD test
│       └── test/java/com/pawpal/app/
│           ├── DateUtilsTest.java                   // JUnit unit test for date math
│           └── PetModelTest.java                    // JUnit unit test for model getters/setters
├── build.gradle                                     // Root project Gradle build configuration
├── settings.gradle                                  // Project settings
└── README.md
```

---

## 2. Relational SQLite Database Schema (DDL)

```sql
PRAGMA foreign_keys = ON;

-- Table: pets
CREATE TABLE pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    age TEXT,
    weight REAL,
    photo_uri TEXT,
    notes TEXT
);

-- Table: feeding_schedule
CREATE TABLE feeding_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL,
    meal_name TEXT NOT NULL,
    time TEXT NOT NULL,
    instructions TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Table: health_records
CREATE TABLE health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('vaccination', 'medication', 'vet_visit')),
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    next_due_date TEXT,
    notes TEXT,
    FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Table: care_logs
CREATE TABLE care_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL,
    activity TEXT NOT NULL CHECK(activity IN ('feeding', 'grooming', 'walk', 'medication', 'water')),
    date_time TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
```

---

## 3. How PawPal Covers the Android Lab Syllabus

| Lab Syllabus Requirement | Implementation in PawPal |
| :--- | :--- |
| **Android Layouts** | `ConstraintLayout` for dashboards, `LinearLayout` & `ScrollView` for forms, `CardView` for list cards. |
| **Multiple Activities** | 10 distinct activities (`MainActivity`, `HealthActivity`, `DailyCareActivity`, etc.) coordinated cleanly. |
| **Explicit Intents** | Navigating between activities with `putExtra("PET_ID", petId)`. |
| **Implicit Intents** | Opening Camera (`MediaStore.ACTION_IMAGE_CAPTURE`), Dialing Vet (`Intent.ACTION_DIAL`), Sharing health summary (`Intent.ACTION_SEND`). |
| **GUI Widgets** | `RecyclerView`, `CardView`, `TextInputEditText`, `Spinner`, `DatePickerDialog`, `TimePickerDialog`, `SwitchMaterial`, `ProgressBar`. |
| **Notifications** | `NotificationChannel` (High importance), `NotificationCompat.Builder` with action buttons ("Mark Fed"). |
| **Background Scheduling** | `AlarmManager.setExactAndAllowWhileIdle()` to trigger `ReminderReceiver` even in Doze mode. |
| **Boot Persistence** | `BootReceiver` listening for `ACTION_BOOT_COMPLETED` to reschedule alarms after device reboot. |
| **SharedPreferences** | `PrefsManager` storing dark mode state (`AppCompatDelegate`), reminder toggles, and emergency clinic contact. |
| **SQLite Database** | `DatabaseHelper` extending `SQLiteOpenHelper` with foreign keys & `ON DELETE CASCADE`. DAO pattern for separation of concerns. |
| **Retrofit Integration** | `ApiClient` fetching nearby clinics via REST API with `GsonConverterFactory`. |
| **Automated Testing** | JUnit testing `DateUtils`, Espresso UI tests testing pet creation and validation. |

---

## 4. Master Prompt for Android Studio Generation

When you are ready to generate or implement the native Android Studio project, copy and paste the prompt below into your AI coding assistant:

```text
You are a senior Android developer. Build a complete, working native Android
app called "PawPal – Pet Care Manager" for a college Android lab project.

TECH STACK
- Language: Java
- IDE: Android Studio, minSdk 24, targetSdk 34
- UI: XML layouts with Material Components (Material 3), ConstraintLayout, RecyclerView, CardView
- Storage: SQLite using SQLiteOpenHelper (no server, fully offline, ON DELETE CASCADE enabled)
- Preferences: SharedPreferences for theme (light/dark) and reminder settings
- Reminders: NotificationChannel + AlarmManager (setExactAndAllowWhileIdle) + BroadcastReceiver
- Boot: BootReceiver to reschedule alarms on ACTION_BOOT_COMPLETED
- Optional online feature: Retrofit 2 + Gson to fetch nearby vet clinics
- Testing: JUnit 4 for utilities, Espresso for UI tests

DATABASE SCHEMA
pets(id INTEGER PK AUTOINCREMENT, name TEXT NOT NULL, species TEXT NOT NULL, breed TEXT, age TEXT, weight REAL, photo_uri TEXT, notes TEXT)
feeding_schedule(id INTEGER PK AUTOINCREMENT, pet_id INTEGER NOT NULL FK pets(id) ON DELETE CASCADE, meal_name TEXT, time TEXT, instructions TEXT, enabled INTEGER)
health_records(id INTEGER PK AUTOINCREMENT, pet_id INTEGER NOT NULL FK pets(id) ON DELETE CASCADE, type TEXT, title TEXT, date TEXT, next_due_date TEXT, notes TEXT)
care_logs(id INTEGER PK AUTOINCREMENT, pet_id INTEGER NOT NULL FK pets(id) ON DELETE CASCADE, activity TEXT, date_time TEXT, completed INTEGER)

SCREENS & ACTIVITIES (under com.pawpal.app.activities)
1. SplashActivity: Animated paw logo, auto-redirect to MainActivity.
2. MainActivity: Home dashboard, active pet card, today's routine progress bar, upcoming meal reminder, emergency vet hotline button.
3. AddEditPetActivity: Form to add/edit pet. Intent to pick photo from gallery or capture from camera using FileProvider.
4. PetDetailsActivity: Full pet stats, care notes, action buttons to edit, delete, or switch active pet.
5. HealthActivity: Vaccinations, medications, vet visits list. Disclaimer: "Consult your veterinarian for medical advice." Filter tabs.
6. AddHealthRecordActivity: Form with DatePickerDialog for administered date and next due date.
7. DailyCareActivity: Checklist of feeding, walk, water, grooming with instant care_logs SQLite insertion.
8. CareHistoryActivity: Monthly calendar view and chronological timeline of care events.
9. NearbyVetsActivity: Retrofit API list of veterinary clinics with ACTION_DIAL button.
10. SettingsActivity: Dark theme switch (AppCompatDelegate), notification lead time, emergency contact editor, export SQLite data.

RULES & CONSTRAINTS
- Handle runtime permissions: POST_NOTIFICATIONS (Android 13+), CAMERA, SCHEDULE_EXACT_ALARM.
- In strings.xml, include medical disclaimer: "Consult your veterinarian for medical advice. Reminders are for record-keeping purposes only."
- Validate all user input (empty names, dates).
- Comment the code clearly for college lab viva explanations.
- Output complete code for each file with no placeholders.
```
