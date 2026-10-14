// PawPal Database Service & DAO Layer
// Mirrors Android SQLiteOpenHelper & DAOs (PetDao, FeedingDao, HealthRecordDao, CareLogDao)
// Provides complete offline CRUD operations with foreign key cascade simulation

import {
  INITIAL_PETS,
  INITIAL_FEEDING_SCHEDULE,
  INITIAL_HEALTH_RECORDS,
  INITIAL_CARE_LOGS,
  INITIAL_SETTINGS,
  INITIAL_NEARBY_VETS
} from "./sampleData.js";

const STORAGE_KEYS = {
  PETS: "pawpal_db_pets",
  FEEDING: "pawpal_db_feeding_schedule",
  HEALTH: "pawpal_db_health_records",
  CARE_LOGS: "pawpal_db_care_logs",
  SETTINGS: "pawpal_db_settings",
  VETS: "pawpal_db_vets"
};

class PawPalDatabase {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.PETS)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(INITIAL_PETS));
    localStorage.setItem(STORAGE_KEYS.FEEDING, JSON.stringify(INITIAL_FEEDING_SCHEDULE));
    localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(INITIAL_HEALTH_RECORDS));
    localStorage.setItem(STORAGE_KEYS.CARE_LOGS, JSON.stringify(INITIAL_CARE_LOGS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.VETS, JSON.stringify(INITIAL_NEARBY_VETS));
  }

  // Generic Helpers
  _read(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${key}`, e);
      return [];
    }
  }

  _write(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Error writing ${key}`, e);
      return false;
    }
  }

  // --- PET DAO ---
  getAllPets() {
    return this._read(STORAGE_KEYS.PETS);
  }

  getPetById(id) {
    const pets = this.getAllPets();
    return pets.find(p => String(p.id) === String(id)) || null;
  }

  insertPet(pet) {
    const pets = this.getAllPets();
    const newPet = {
      ...pet,
      id: pet.id || `pet_${Date.now()}`
    };
    pets.push(newPet);
    this._write(STORAGE_KEYS.PETS, pets);

    // If no active pet was set, set this as active
    const settings = this.getSettings();
    if (!settings.active_pet_id || !this.getPetById(settings.active_pet_id)) {
      this.updateSettings({ active_pet_id: newPet.id });
    }
    return newPet;
  }

  updatePet(updatedPet) {
    const pets = this.getAllPets();
    const index = pets.findIndex(p => String(p.id) === String(updatedPet.id));
    if (index !== -1) {
      pets[index] = { ...pets[index], ...updatedPet };
      this._write(STORAGE_KEYS.PETS, pets);
      return pets[index];
    }
    return null;
  }

  deletePet(id) {
    // ON DELETE CASCADE: Remove associated feeding, health records, care logs
    let pets = this.getAllPets();
    pets = pets.filter(p => String(p.id) !== String(id));
    this._write(STORAGE_KEYS.PETS, pets);

    let feeds = this.getAllFeeding();
    feeds = feeds.filter(f => String(f.pet_id) !== String(id));
    this._write(STORAGE_KEYS.FEEDING, feeds);

    let health = this.getAllHealthRecords();
    health = health.filter(h => String(h.pet_id) !== String(id));
    this._write(STORAGE_KEYS.HEALTH, health);

    let logs = this.getAllCareLogs();
    logs = logs.filter(l => String(l.pet_id) !== String(id));
    this._write(STORAGE_KEYS.CARE_LOGS, logs);

    // If active pet was deleted, switch to first available pet
    const settings = this.getSettings();
    if (String(settings.active_pet_id) === String(id)) {
      const nextPet = pets[0];
      this.updateSettings({ active_pet_id: nextPet ? nextPet.id : null });
    }
    return true;
  }

  // --- FEEDING DAO ---
  getAllFeeding() {
    return this._read(STORAGE_KEYS.FEEDING);
  }

  getFeedingByPetId(petId) {
    const feeds = this.getAllFeeding();
    return feeds
      .filter(f => String(f.pet_id) === String(petId))
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  insertFeeding(feed) {
    const feeds = this.getAllFeeding();
    const newFeed = {
      ...feed,
      id: feed.id || `feed_${Date.now()}`,
      enabled: feed.enabled !== undefined ? feed.enabled : true
    };
    feeds.push(newFeed);
    this._write(STORAGE_KEYS.FEEDING, feeds);
    return newFeed;
  }

  updateFeeding(updatedFeed) {
    const feeds = this.getAllFeeding();
    const index = feeds.findIndex(f => String(f.id) === String(updatedFeed.id));
    if (index !== -1) {
      feeds[index] = { ...feeds[index], ...updatedFeed };
      this._write(STORAGE_KEYS.FEEDING, feeds);
      return feeds[index];
    }
    return null;
  }

  toggleFeeding(id) {
    const feeds = this.getAllFeeding();
    const feed = feeds.find(f => String(f.id) === String(id));
    if (feed) {
      feed.enabled = !feed.enabled;
      this._write(STORAGE_KEYS.FEEDING, feeds);
      return feed;
    }
    return null;
  }

  deleteFeeding(id) {
    let feeds = this.getAllFeeding();
    feeds = feeds.filter(f => String(f.id) !== String(id));
    return this._write(STORAGE_KEYS.FEEDING, feeds);
  }

  // --- HEALTH RECORD DAO ---
  getAllHealthRecords() {
    return this._read(STORAGE_KEYS.HEALTH);
  }

  getHealthRecordsByPetId(petId) {
    const records = this.getAllHealthRecords();
    return records
      .filter(r => String(r.pet_id) === String(petId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  insertHealthRecord(record) {
    const records = this.getAllHealthRecords();
    const newRecord = {
      ...record,
      id: record.id || `health_${Date.now()}`
    };
    records.push(newRecord);
    this._write(STORAGE_KEYS.HEALTH, records);
    return newRecord;
  }

  updateHealthRecord(updatedRecord) {
    const records = this.getAllHealthRecords();
    const index = records.findIndex(r => String(r.id) === String(updatedRecord.id));
    if (index !== -1) {
      records[index] = { ...records[index], ...updatedRecord };
      this._write(STORAGE_KEYS.HEALTH, records);
      return records[index];
    }
    return null;
  }

  deleteHealthRecord(id) {
    let records = this.getAllHealthRecords();
    records = records.filter(r => String(r.id) !== String(id));
    return this._write(STORAGE_KEYS.HEALTH, records);
  }

  // --- CARE LOG DAO ---
  getAllCareLogs() {
    return this._read(STORAGE_KEYS.CARE_LOGS);
  }

  getCareLogsByPetId(petId) {
    const logs = this.getAllCareLogs();
    return logs
      .filter(l => String(l.pet_id) === String(petId))
      .sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
  }

  insertCareLog(log) {
    const logs = this.getAllCareLogs();
    const newLog = {
      ...log,
      id: log.id || `log_${Date.now()}`,
      completed: log.completed !== undefined ? log.completed : true
    };
    logs.push(newLog);
    this._write(STORAGE_KEYS.CARE_LOGS, logs);
    return newLog;
  }

  deleteCareLog(id) {
    let logs = this.getAllCareLogs();
    logs = logs.filter(l => String(l.id) !== String(id));
    return this._write(STORAGE_KEYS.CARE_LOGS, logs);
  }

  // --- NEARBY VETS (MOCK RETROFIT REPOSITORY) ---
  getAllVets() {
    return this._read(STORAGE_KEYS.VETS);
  }

  // --- SETTINGS (SharedPreferences simulation) ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  }

  updateSettings(partial) {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // Export / Import (Full SQLite data dump simulation)
  exportFullBackup() {
    return {
      version: 1,
      exported_at: new Date().toISOString(),
      pets: this.getAllPets(),
      feeding_schedule: this.getAllFeeding(),
      health_records: this.getAllHealthRecords(),
      care_logs: this.getAllCareLogs(),
      settings: this.getSettings()
    };
  }

  importBackup(backupData) {
    if (!backupData || !Array.isArray(backupData.pets)) {
      throw new Error("Invalid backup format");
    }
    if (backupData.pets) this._write(STORAGE_KEYS.PETS, backupData.pets);
    if (backupData.feeding_schedule) this._write(STORAGE_KEYS.FEEDING, backupData.feeding_schedule);
    if (backupData.health_records) this._write(STORAGE_KEYS.HEALTH, backupData.health_records);
    if (backupData.care_logs) this._write(STORAGE_KEYS.CARE_LOGS, backupData.care_logs);
    if (backupData.settings) this._write(STORAGE_KEYS.SETTINGS, backupData.settings);
    return true;
  }
}

export const db = new PawPalDatabase();
