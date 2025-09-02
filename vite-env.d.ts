/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;           // Backend API URL
  readonly VITE_GOOGLE_CLIENT_ID?: string; // Google OAuth client ID
  // Add other VITE_ env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
