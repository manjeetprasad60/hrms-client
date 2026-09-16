/**
 * Safe Browser Storage Wrapper
 *
 * Provides typed storage access with in-memory fallback for environments where
 * localStorage might be restricted or throw SecurityErrors.
 */

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

function getSafeStorage(): Storage | MemoryStorage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch {
    // Falls back to in-memory storage if localStorage is blocked
  }
  return new MemoryStorage();
}

const storageEngine = getSafeStorage();

export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = storageEngine.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      storageEngine.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): void {
    try {
      storageEngine.removeItem(key);
    } catch {
      // Ignore errors
    }
  },

  clear(): void {
    try {
      storageEngine.clear();
    } catch {
      // Ignore errors
    }
  },
};
