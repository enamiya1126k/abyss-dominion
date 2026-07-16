import { SAVE_KEY } from "./config.js";

const DEFAULT_SAVE = {
  schemaVersion: 1,
  floor: 1,
  maxFloor: 1,
  checkpoint: 1,
  gold: 0,
  magicCrystals: 0,
  updatedAt: null
};

export class SaveManager {
  constructor(storage = window.localStorage) {
    this.storage = storage;
    this.data = this.load();
    this.timer = window.setInterval(() => this.flush(), 2000);
  }

  load() {
    try {
      return { ...DEFAULT_SAVE, ...(JSON.parse(this.storage.getItem(SAVE_KEY)) || {}) };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  update(patch) {
    this.data = { ...this.data, ...patch, updatedAt: new Date().toISOString() };
    this.flush();
  }

  flush() {
    this.data.updatedAt = new Date().toISOString();
    this.storage.setItem(SAVE_KEY, JSON.stringify(this.data));
  }
}
