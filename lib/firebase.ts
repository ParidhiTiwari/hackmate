import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

console.log("[v0] Firebase Environment Variables Check:")
console.log("[v0] API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Present" : "✗ Missing")
console.log("[v0] PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Present" : "✗ Missing")
console.log("[v0] AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓ Present" : "✗ Missing")

const hasRealCredentials =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("demo") &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes("demo")

console.log("[v0] Has Real Credentials:", hasRealCredentials)

let app: any = null
let auth: any = null
let db: any = null
let storage: any = null

if (hasRealCredentials) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  console.log("[v0] Initializing Firebase with config:", {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey?.substring(0, 10) + "...", // Hide full API key
  })

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)

    import("firebase/firestore").then(({ enableNetwork }) => {
      if (db) {
        enableNetwork(db).catch((error) => {
          console.error("[v0] Firebase network enable error:", error)
        })
      }
    })

    console.log("[v0] Firebase initialized successfully")
  } catch (error) {
    console.error("[v0] Firebase initialization error:", error)
  }
} else {
  console.warn("🔧 Running in development mode without Firebase. Set up environment variables for full functionality.")
}

export { auth, db, storage }
export default app
export { hasRealCredentials }
