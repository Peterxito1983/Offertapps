/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
    readonly VITE_FIREBASE_MEASUREMENT_ID: string
    readonly VITE_FIREBASE_DATABASE_URL: string
    readonly VITE_INSTAGRAM_BUSINESS_ID: string
    readonly VITE_INSTAGRAM_ACCESS_TOKEN: string
    readonly VITE_FCM_VAPID_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
