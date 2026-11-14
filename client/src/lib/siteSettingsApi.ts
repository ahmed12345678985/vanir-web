import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./firebase-api";

const app = getFirebaseApp();
export const db = getFirestore(app!);
export const storage = getStorage(app!);

// 1. قراءة إعداد معين من Firestore مباشرة
export async function getFirestoreSetting(category: string, key: string): Promise<string | null> {
  try {
    const docId = `${category}__${key}`;
    const snap = await getDoc(doc(db, "siteSettings", docId));
    if (snap.exists()) {
      return (snap.data()?.settingValue as string) ?? null;
    }
  } catch (err) {
    console.warn(`[siteSettingsApi] getFirestoreSetting error (${category}, ${key}):`, err);
  }
  return null;
}

// 2. حفظ إعداد معين في Firestore مباشرة
export async function setFirestoreSetting(category: string, key: string, value: string): Promise<void> {
  const docId = `${category}__${key}`;
  await setDoc(
    doc(db, "siteSettings", docId),
    {
      category,
      settingKey: key,
      settingValue: value,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// مزامنة بانر الواجهة مع بطاقات التطبيق (app_config/home_feed)
export async function syncHeroToHomeFeed(title: string, subtitle: string, tag: string, imageUrl: string): Promise<void> {
  try {
    const feedRef = doc(db, "app_config", "home_feed");
    const feedSnap = await getDoc(feedRef);
    let cards: any[] = [];
    if (feedSnap.exists() && Array.isArray(feedSnap.data()?.cards)) {
      cards = [...feedSnap.data()?.cards];
    }
    if (cards.length > 0) {
      cards[0] = {
        ...cards[0],
        title: title || cards[0].title || "VANIR GROUP",
        subtitle: subtitle || cards[0].subtitle || "Luxury Private Aviation & Travel",
        tag: tag || cards[0].tag || "Global First Class & Private Jet ✈️",
        image: imageUrl || cards[0].image,
        images: [imageUrl || cards[0].image],
      };
    } else {
      cards.push({
        id: "f1",
        category: "flights",
        tag: tag || "Global First Class & Private Jet ✈️",
        title: title || "VANIR GROUP",
        subtitle: subtitle || "Luxury Private Aviation & Travel",
        image: imageUrl,
        images: [imageUrl],
        routeTarget: "FlightBooking",
      });
    }
    await setDoc(feedRef, { cards, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn("[siteSettingsApi] syncHeroToHomeFeed non-blocking error:", err);
  }
}

// 3. جلب جميع إعدادات فئة معينة (مثل hero أو branding)
export async function getFirestoreSettingsByCategory(category: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  try {
    const q = query(collection(db, "siteSettings"), where("category", "==", category));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const data = d.data();
      if (data.settingKey && typeof data.settingValue === "string") {
        result[data.settingKey] = data.settingValue;
      }
    });
  } catch (err) {
    console.warn(`[siteSettingsApi] getFirestoreSettingsByCategory error (${category}):`, err);
  }
  return result;
}

// 4. حفظ عدة إعدادات دفعة واحدة في Firestore
export async function setManyFirestoreSettings(
  items: Array<{ category: string; key: string; value: string }>
): Promise<void> {
  for (const item of items) {
    await setFirestoreSetting(item.category, item.key, item.value);
  }
}

// Robust multi-pass client-side compression (strictly guarantees size < 60KB)
// Eliminates Firestore 1MB property limit ("longer than 1048487 bytes") and handles Storage quota-exceeded flawlessly.
export async function compressImageToDataUri(file: File, targetMaxDim = 800, startQuality = 0.65, maxBytes = 55000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result as string);
      img.onload = () => {
        let maxDim = targetMaxDim;
        let quality = startQuality;
        let finalDataUri = reader.result as string;

        // Multi-pass loop downscaling resolution and quality until output is strictly under maxBytes (55KB)
        for (let pass = 0; pass < 6; pass++) {
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext("2d");
          if (!ctx) break;
          ctx.drawImage(img, 0, 0, w, h);

          // Always output JPEG for guaranteed high compression efficiency (never uncompressed PNG!)
          finalDataUri = canvas.toDataURL("image/jpeg", quality);
          if (finalDataUri.length <= maxBytes) {
            break;
          }
          maxDim = Math.round(maxDim * 0.82);
          quality = Math.max(0.35, quality - 0.12);
        }
        resolve(finalDataUri);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function withTimeout<T>(promise: Promise<T>, ms = 4500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Storage upload timeout")), ms)
    ),
  ]);
}

async function compressDataUri(
  dataUri: string,
  targetMaxDim = 800,
  startQuality = 0.65,
  maxBytes = 55000
): Promise<string> {
  if (dataUri.length <= maxBytes) return dataUri;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      let maxDim = targetMaxDim;
      let quality = startQuality;
      let attempt = 0;

      const tryCompress = (): string => {
        const scale = Math.min(1, maxDim / Math.max(w, h));
        const cw = Math.max(1, Math.round(w * scale));
        const ch = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) return dataUri;
        ctx.drawImage(img, 0, 0, cw, ch);
        return canvas.toDataURL("image/jpeg", quality);
      };

      let result = tryCompress();
      while (result.length > maxBytes && attempt < 6) {
        attempt++;
        quality = Math.max(0.2, quality - 0.12);
        maxDim = Math.max(320, Math.round(maxDim * 0.78));
        result = tryCompress();
      }
      resolve(result);
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
  });
}

const CLOUDINARY_CLOUD_NAME = "gq1svib6";
const CLOUDINARY_UPLOAD_PRESET = "vanir232";

export async function uploadToCloudinary(
  fileOrDataUri: File | Blob | string,
  folder = "vanir"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", fileOrDataUri);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  if (folder) {
    formData.append("folder", folder);
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Cloudinary upload failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data?.secure_url) {
    throw new Error("Cloudinary response missing secure_url");
  }
  return data.secure_url as string;
}

// 5. رفع ملف وسائط (صورة أو فيديو) مباشرة إلى Cloudinary CDN مع Fallback تلقائي عند عدم توفر الشبكة
export async function uploadDirectMedia(file: File, folder = "vanir"): Promise<string> {
  try {
    return await uploadToCloudinary(file, folder);
  } catch (err: any) {
    console.warn(`[siteSettingsApi] Cloudinary upload failed (${err?.message}), applying Data-URI fallback:`, err);
    const isImg = !file.type || file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name);
    if (isImg) {
      try {
        return await compressImageToDataUri(file);
      } catch (compErr) {
        console.error("Compression error during fallback:", compErr);
      }
    }
    throw err;
  }
}

// 6. رفع Base64 مباشرة إلى Cloudinary CDN (مع Fallback تلقائي وضغط ذكي)
export async function uploadBase64Media(
  base64Data: string,
  _filename: string,
  mimeType: string,
  folder = "vanir"
): Promise<string> {
  const fullDataUri = base64Data.startsWith("data:")
    ? base64Data
    : `data:${mimeType || "image/jpeg"};base64,${base64Data}`;

  try {
    return await uploadToCloudinary(fullDataUri, folder);
  } catch (err: any) {
    console.warn(`[siteSettingsApi] Cloudinary Base64 upload failed (${err?.message}), compressing data URI:`, err);
    if (!mimeType || mimeType.startsWith("image/") || fullDataUri.startsWith("data:image/")) {
      return await compressDataUri(fullDataUri);
    }
    return fullDataUri;
  }
}
