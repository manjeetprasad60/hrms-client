/**
 * Vitest Test Setup
 *
 * Global setup for test environment including DOM matchers and Firebase mocks.
 */

import { afterAll, beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Firebase modules globally to prevent initialization during tests
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => null),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
}));


vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => null),
  ref: vi.fn(() => ({})),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(() => Promise.resolve('https://mock.storage.url/file')),
  deleteObject: vi.fn(() => Promise.resolve()),
}));

// Silence console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    // Suppress Firebase/service initialization warnings in tests
    if (
      msg.includes('[StorageService]') ||
      msg.includes('[AuthService]') ||
      msg.includes('[FirebaseClient]') ||
      msg.includes('[ClientProvider]')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
