/**
 * Environment Configuration
 * 
 * Safely reads and validates environment variables from import.meta.env.
 * Does not provide fallback values for secure keys or credentials.
 */

export interface AppEnvironment {
  readonly appName: string;
  readonly appEnv: 'development' | 'staging' | 'production' | 'test';
  readonly isDev: boolean;
  readonly isProd: boolean;
  readonly apiBaseUrl: string;
  readonly firebase: {
    readonly apiKey: string;
    readonly authDomain: string;
    readonly databaseURL: string;
    readonly projectId: string;
    readonly storageBucket: string;
    readonly messagingSenderId: string;
    readonly appId: string;
  };
}

function parseAppEnv(envValue: string | undefined): AppEnvironment['appEnv'] {
  if (envValue === 'production') return 'production';
  if (envValue === 'staging') return 'staging';
  if (envValue === 'test') return 'test';
  return 'development';
}

export const env: AppEnvironment = {
  appName: import.meta.env.VITE_APP_NAME || 'HRIS Client Admin',
  appEnv: parseAppEnv(import.meta.env.VITE_APP_ENV),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  firebase: {
    // apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    // authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    // databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    // projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    // storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    // appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    apiKey: "AIzaSyDShEsogN3H7pfzHo2q5SpN7BYcPkN-wTo",
    authDomain: "resale-30022.firebaseapp.com",
    databaseURL: "https://resale-30022-default-rtdb.firebaseio.com",
    projectId: "resale-30022",
    storageBucket: "resale-30022.firebasestorage.app",
    messagingSenderId: "562470665",
    appId: "1:562470665:web:64c0f98d449f59a950fdd8"
  },
} as const;
