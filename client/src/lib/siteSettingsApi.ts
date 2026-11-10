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

// 5. رفع ملف وسائط (صورة أو فيديو) مباشرة إلى Firebase Storage
export async function uploadDirectMedia(file: File, folder = "uploads"): Promise<string> {
  const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${folder}/${Date.now()}_${sanitized}`;
  const fileRef = ref(storage, filename);
  await uploadBytes(fileRef, file, { contentType: file.type || "application/octet-stream" });
  return await getDownloadURL(fileRef);
}

// 6. رفع Base64 مباشرة إلى Firebase Storage (للتوافق الكامل مع أي أداة قديمة)
export async function uploadBase64Media(
  base64Data: string,
  filename: string,
  mimeType: string,
  folder = "uploads"
): Promise<string> {
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fullPath = `${folder}/${Date.now()}_${sanitized}`;
  const fileRef = ref(storage, fullPath);

  const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const byteChars = atob(cleanBase64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNums);

  await uploadBytes(fileRef, byteArray, { contentType: mimeType || "image/jpeg" });
  return await getDownloadURL(fileRef);
}
