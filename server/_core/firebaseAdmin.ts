import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Bucket type is not exported in this firebase-admin version; derive it.
type Bucket = ReturnType<ReturnType<typeof getStorage>["bucket"]>;
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const currentDir = typeof __dirname !== "undefined"
  ? __dirname
  : (typeof import.meta !== "undefined" && (import.meta as any).url ? path.dirname(fileURLToPath((import.meta as any).url)) : process.cwd());

// K_SERVICE is set by Cloud Run (Firebase App Hosting). On Cloud Run,
// ADC is automatically provisioned — no service account JSON needed.
const isCloudRun = Boolean(
  process.env.K_SERVICE ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.FIREBASE_CONFIG
);

// Server reads FIREBASE_STORAGE_BUCKET; fall back to VITE_ variant if only that is set.
const storageBucketName =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.VITE_FIREBASE_STORAGE_BUCKET ||
  `${process.env.VITE_FIREBASE_PROJECT_ID ?? "gen-lang-client-0364375301"}.firebasestorage.app`;

if (!getApps().length) {
  if (isCloudRun) {
    // Firebase App Hosting / Cloud Run: use Application Default Credentials.
    // The service account is auto-provisioned with the required Firebase permissions.
    initializeApp({ storageBucket: storageBucketName });
    console.log("[Firebase] Initialized with ADC (Cloud Run / Firebase App Hosting)");
  } else {
    // Local development: explicit credentials from env or local key file.
    let credentialApp: ReturnType<typeof cert> | undefined;

    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (envJson) {
      try {
        const rawJson = envJson.trim().startsWith("{")
          ? envJson
          : Buffer.from(envJson, "base64").toString("utf8");
        credentialApp = cert(JSON.parse(rawJson) as Parameters<typeof cert>[0]);
      } catch (e) {
        console.error("[Firebase] Failed to parse credentials from env:", e);
      }
    }

    if (!credentialApp) {
      const searchDirs = [process.cwd(), currentDir, path.resolve(currentDir, ".."), path.resolve(currentDir, "server/_core")];
      const candidatePaths: string[] = [];

      for (const dir of searchDirs) {
        if (fs.existsSync(dir)) {
          try {
            const files = fs.readdirSync(dir);
            for (const f of files) {
              if (
                (f.includes("firebase-adminsdk") || f.startsWith("gen-lang-client") || f === "firebase-key.json") &&
                f.endsWith(".json")
              ) {
                candidatePaths.push(path.resolve(dir, f));
              }
            }
          } catch {}
        }
      }

      // Explicit fallbacks
      candidatePaths.push(
        path.resolve(process.cwd(), "gen-lang-client-0364375301-firebase-adminsdk-fbsvc-1ed7e2955b.json"),
        path.resolve(process.cwd(), "firebase-key.json"),
        path.resolve(process.cwd(), "server/_core/firebase-key.json"),
        path.resolve(currentDir, "firebase-key.json")
      );

      const uniqueCandidates = Array.from(new Set(candidatePaths));
      const serviceAccountPath = uniqueCandidates.find((p) => fs.existsSync(p));

      if (serviceAccountPath) {
        try {
          const parsed = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
          if (parsed && parsed.private_key && parsed.client_email) {
            credentialApp = cert(parsed);
            console.log(`[Firebase] Loaded active credentials from: ${serviceAccountPath} (keyId: ${parsed.private_key_id})`);
          }
        } catch (e) {
          console.error("[Firebase] Failed to read local service account:", e);
        }
      }
    }

    if (credentialApp) {
      try {
        initializeApp({ credential: credentialApp, storageBucket: storageBucketName });
        console.log("[Firebase] Initialized with service account credentials");
      } catch (certErr) {
        console.warn("[Firebase] initializeApp with cert failed, falling back to default:", certErr);
        try {
          initializeApp({ storageBucket: storageBucketName });
        } catch {}
      }
    } else {
      console.warn(
        "[Firebase Warning] Credentials not found. Initializing with default config for safety."
      );
      try {
        initializeApp({ storageBucket: storageBucketName });
      } catch (err) {
        console.error("[Firebase] Fallback initialization error:", err);
      }
    }
  }
}

let dbInstance: ReturnType<typeof getFirestore>;
try {
  dbInstance = getFirestore();
} catch (e) {
  console.warn("[Firebase] getFirestore warning:", e);
  dbInstance = {} as any;
}
export const db = dbInstance;

let cachedBucket: Bucket | null = null;

export function getBucket() {
  if (cachedBucket) return cachedBucket;
  cachedBucket = getStorage().bucket(storageBucketName);
  return cachedBucket;
}
