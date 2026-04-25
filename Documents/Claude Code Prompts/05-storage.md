# Task: localStorage Wrapper

You are Engineer A building the storage utility in `src/core/storage.js`.

## Context
Read CLAUDE.md. This module wraps localStorage with try-catch safety. localStorage may be unavailable or full in some WebView environments, so every operation must fail gracefully.

## Storage Keys
```javascript
const STORAGE_KEYS = {
  USER_NAME: 'pp_user_name',
  STAMPS: 'pp_stamps',
  FIRST_LAUNCH: 'pp_first_launch',
  VERSION: 'pp_version',
};
```

## What to build

```javascript
const Storage = {
  _available: null,

  // Check if localStorage is usable (cache the result)
  isAvailable() {
    if (this._available !== null) return this._available;
    try {
      const test = '__pp_test__';
      localStorage.setItem(test, '1');
      localStorage.removeItem(test);
      this._available = true;
    } catch (e) {
      this._available = false;
      console.warn('localStorage is not available. Progress will not be saved.');
    }
    return this._available;
  },

  // Get a value. Returns defaultValue if key doesn't exist or on error.
  get(key, defaultValue = null) {
    if (!this.isAvailable()) return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage.get failed for key:', key, e);
      return defaultValue;
    }
  },

  // Set a value. Returns true on success, false on failure.
  set(key, value) {
    if (!this.isAvailable()) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage.set failed for key:', key, e);
      // Likely quota exceeded
      return false;
    }
  },

  // Remove a key
  remove(key) {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Silent fail
    }
  },

  // Clear all app data (with confirmation already handled by caller)
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => this.remove(key));
  },

  // === Convenience methods for common operations ===

  // Save current stamps from APP state
  saveStamps(stamps) {
    return this.set(STORAGE_KEYS.STAMPS, stamps);
  },

  // Load stamps, returns array
  loadStamps() {
    return this.get(STORAGE_KEYS.STAMPS, []);
  },

  // Save user name
  saveUserName(name) {
    return this.set(STORAGE_KEYS.USER_NAME, name);
  },

  // Load user name
  loadUserName() {
    return this.get(STORAGE_KEYS.USER_NAME, '');
  },

  // Check if stamp already earned
  hasStamp(recipeId) {
    const stamps = this.loadStamps();
    return stamps.some(s => s.recipe_id === recipeId);
  },

  // Add a new stamp (idempotent — won't add duplicates)
  addStamp(recipeId, destination) {
    if (this.hasStamp(recipeId)) return false;
    const stamps = this.loadStamps();
    stamps.push({
      recipe_id: recipeId,
      destination: destination,
      earned_at: Date.now(),
    });
    this.saveStamps(stamps);
    return true;
  },
};
```

## Verification
- In console: `Storage.set('test', {a: 1})` returns `true`
- `Storage.get('test')` returns `{a: 1}`
- `Storage.get('nonexistent', 'default')` returns `'default'`
- `Storage.addStamp('test_recipe', 'china')` adds a stamp
- `Storage.hasStamp('test_recipe')` returns `true`
- `Storage.addStamp('test_recipe', 'china')` second call returns `false` (no duplicate)
- `Storage.clearAll()` removes all pp_ keys
- Refresh page — saved data persists (before clearAll)
