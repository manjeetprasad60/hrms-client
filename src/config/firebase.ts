/**
 * Centralized Firebase Web Configuration & Validation Layer
 *
 * Implements the environment-variable-driven configuration for:
 * 1. Firebase Authentication
 * 2. Firebase Realtime Database
 * 3. Firebase Storage
 *
 * NOTE: Firebase web configuration parameters are public client identifiers, not secrets.
 * Actual data protection is enforced server-side via Firebase Security Rules and Auth tokens.
 */

import { env } from './env';

export interface FirebaseWebConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly databaseURL: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
}

export interface FirebaseConfigStatus {
  readonly isConfigured: boolean;
  readonly missingKeys: readonly string[];
  readonly configuredKeys: readonly string[];
}

export class FirebaseConfigurationError extends Error {
  readonly missingKeys: readonly string[];

  constructor(missingKeys: readonly string[]) {
    const formatted = missingKeys.join(', ');
    super(
      `[Firebase Configuration Error]: Missing required parameter(s): ${formatted}. ` +
      `Please ensure .env.local exists with valid VITE_FIREBASE_* configuration values.`
    );
    this.name = 'FirebaseConfigurationError';
    this.missingKeys = missingKeys;
  }
}

/**
 * Evaluates whether all required Firebase environment variables are populated.
 */
export function checkFirebaseConfig(): FirebaseConfigStatus {
  const missing: string[] = [];
  const configured: string[] = [];
  const { firebase } = env;

  if (firebase.apiKey) configured.push('apiKey');
  else missing.push('VITE_FIREBASE_API_KEY');

  if (firebase.authDomain) configured.push('authDomain');
  else missing.push('VITE_FIREBASE_AUTH_DOMAIN');

  if (firebase.databaseURL) configured.push('databaseURL');
  else missing.push('VITE_FIREBASE_DATABASE_URL');

  if (firebase.projectId) configured.push('projectId');
  else missing.push('VITE_FIREBASE_PROJECT_ID');

  if (firebase.storageBucket) configured.push('storageBucket');
  else missing.push('VITE_FIREBASE_STORAGE_BUCKET');

  if (firebase.messagingSenderId) configured.push('messagingSenderId');
  else missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');

  if (firebase.appId) configured.push('appId');
  else missing.push('VITE_FIREBASE_APP_ID');

  return {
    isConfigured: missing.length === 0,
    missingKeys: missing,
    configuredKeys: configured,
  };
}

/**
 * Returns current Firebase options read from environment variables.
 */
export function getFirebaseWebConfig(): FirebaseWebConfig {
  return {
    // apiKey: env.firebase.apiKey,
    // authDomain: env.firebase.authDomain,
    // databaseURL: env.firebase.databaseURL,
    // projectId: env.firebase.projectId,
    // storageBucket: env.firebase.storageBucket,
    // messagingSenderId: env.firebase.messagingSenderId,
    // appId: env.firebase.appId,
    apiKey: "AIzaSyDShEsogN3H7pfzHo2q5SpN7BYcPkN-wTo",
    authDomain: "resale-30022.firebaseapp.com",
    databaseURL: "https://resale-30022-default-rtdb.firebaseio.com",
    projectId: "resale-30022",
    storageBucket: "resale-30022.firebasestorage.app",
    messagingSenderId: "562470665",
    appId: "1:562470665:web:64c0f98d449f59a950fdd8"
  };
}

/**
 * Validates the configuration and optionally throws a descriptive error if incomplete.
 */
export function validateFirebaseConfig(strict = false): FirebaseWebConfig {
  const status = checkFirebaseConfig();

  if (strict && !status.isConfigured) {
    throw new FirebaseConfigurationError(status.missingKeys);
  }

  return getFirebaseWebConfig();
}

export const firebaseConfig: FirebaseWebConfig = getFirebaseWebConfig();
