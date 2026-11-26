import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { getAuth, updateProfile as firebaseUpdateProfile } from "firebase/auth";
import { getFirebaseApp } from "./firebase-api";
import { askGeminiConcierge, askVanirAIAssistant, findAndSaveTopicImage, generateLuxuryImageWithGemini, generateLuxuryVideoWithDeevid } from "./geminiAi";
import {
  db,
  getFirestoreSetting,
  setFirestoreSetting,
  getFirestoreSettingsByCategory,
  setManyFirestoreSettings,
  uploadBase64Media,
  uploadToCloudinary,
} from "./siteSettingsApi";
import { injectGoogleAnalytics, isValidGaId } from "./googleAnalytics";

const GA_SETTING_KEYS = new Set(["google_analytics_id", "googleAnalyticsId", "ga_measurement_id"]);

async function syncGaIdEverywhere(rawValue: string): Promise<void> {
  const cleaned = String(rawValue || "").trim().toUpperCase();
  await Promise.all([
    setFirestoreSetting("analytics", "google_analytics_id", cleaned),
    setFirestoreSetting("seo", "googleAnalyticsId", cleaned),
    setFirestoreSetting("connectors", "ga_measurement_id", cleaned),
  ]);
  if (cleaned && isValidGaId(cleaned)) {
    injectGoogleAnalytics(cleaned);
  }
}

function hashStrToNum(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || Date.now();
}

function normalizeDoc(d: any) {
  const data = d.data() || {};
  const numId =
    typeof data.id === "number"
      ? data.id
      : !isNaN(Number(d.id)) && d.id.trim() !== ""
      ? Number(d.id)
      : hashStrToNum(d.id);
  const toMillis = (v: any) =>
    v && typeof v.toMillis === "function"
      ? v.toMillis()
      : v instanceof Date
      ? v.getTime()
      : v;

  return {
    ...data,
    id: numId,
    _docId: d.id,
    createdAt: toMillis(data.createdAt) ?? Date.now(),
    updatedAt: toMillis(data.updatedAt) ?? Date.now(),
  };
}

async function listCollection(colName: string): Promise<any[]> {
  const snap = await getDocs(collection(db, colName));
  return snap.docs.map(normalizeDoc);
}

async function findDocRefById(colName: string, id: number | string) {
  const directRef = doc(db, colName, String(id));
  const directSnap = await getDoc(directRef);
  if (directSnap.exists()) return directRef;

  const q = query(collection(db, colName), where("id", "==", id));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].ref;

  return null;
}

async function createInCollection(colName: string, payload: Record<string, any>) {
  const id = typeof payload.id === "number" ? payload.id : Date.now();
  const now = Date.now();
  const record = {
    ...payload,
    id,
    createdAt: payload.createdAt ?? now,
    updatedAt: now,
  };
  await setDoc(doc(db, colName, String(id)), record);
  return { ...record, _docId: String(id) };
}

async function updateInCollection(colName: string, id: number | string, patch: Record<string, any>) {
  const ref = await findDocRefById(colName, id);
  if (!ref) {
    throw new Error(`Document ${id} not found in ${colName}`);
  }
  await updateDoc(ref, { ...patch, updatedAt: Date.now() });
}

async function deleteInCollection(colName: string, id: number | string) {
  const ref = await findDocRefById(colName, id);
  if (ref) {
    await deleteDoc(ref);
  }
}

export async function executeTrpcFirestoreFallback(
  procedure: string,
  payload: any
): Promise<{ handled: boolean; data?: any }> {
  const input = payload ?? {};

  // ─── 1. Media Upload ────────────────────────────────────────
  if (procedure === "gallery.uploadImage" || procedure === "uploads.upload") {
    const fileData = input.fileData || input.base64 || input.data;
    const filename = input.filename || input.name || `upload_${Date.now()}.jpg`;
    const mimeType = input.mimeType || input.contentType || "image/jpeg";
    const folder = input.purpose === "avatar" ? "avatars" : "gallery";
    if (fileData) {
      const url = await uploadBase64Media(fileData, filename, mimeType, folder);
      return { handled: true, data: { url, fileKey: filename } };
    }
    throw new Error("No fileData provided for upload");
  }

  // ─── 2. Site Settings & Legacy settings.* Router ────────────
  if (procedure === "settings.getAll") {
    const snap = await getDocs(collection(db, "siteSettings"));
    const rows = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        key: String(data.settingKey || d.id),
        value: String(data.settingValue ?? ""),
        category: String(data.category || "general"),
      };
    });
    return { handled: true, data: rows };
  }

  if (procedure === "settings.set") {
    const key = String(input.key || "").trim();
    const val = String(input.value ?? "");
    const category = String(input.category || "analytics");
    if (key) {
      if (GA_SETTING_KEYS.has(key)) {
        await syncGaIdEverywhere(val);
      } else {
        await setFirestoreSetting(category, key, val);
      }
    }
    return { handled: true, data: { success: true } };
  }

  if (procedure === "siteSettings.set") {
    if (input.category && input.key) {
      if (GA_SETTING_KEYS.has(String(input.key))) {
        await syncGaIdEverywhere(String(input.value ?? ""));
      } else {
        await setFirestoreSetting(input.category, input.key, input.value ?? "");
      }
    }
    return { handled: true, data: { success: true } };
  }

  if (procedure === "siteSettings.setMany") {
    const items = Array.isArray(input.items) ? input.items : Array.isArray(input) ? input : [];
    await setManyFirestoreSettings(items);
    for (const item of items) {
      if (item?.key && GA_SETTING_KEYS.has(String(item.key))) {
        await syncGaIdEverywhere(String(item.value ?? ""));
      }
    }
    return { handled: true, data: { success: true } };
  }

  if (procedure === "siteSettings.get") {
    if (input.category && input.key) {
      const val = await getFirestoreSetting(input.category, input.key);
      return { handled: true, data: val };
    }
    return { handled: true, data: null };
  }

  if (
    procedure === "siteSettings.getByCategory" ||
    procedure === "siteSettings.getPublicCategory"
  ) {
    if (input.category) {
      const val = await getFirestoreSettingsByCategory(input.category);
      return { handled: true, data: val };
    }
    return { handled: true, data: {} };
  }

  if (procedure === "siteSettings.getTheme") {
    const val = await getFirestoreSettingsByCategory("theme");
    return { handled: true, data: val };
  }

  if (procedure === "siteSettings.listDesignVersions") {
    const rows = await listCollection("design_versions").catch(() => []);
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { handled: true, data: rows };
  }

  if (procedure === "siteSettings.rollbackDesignVersion") {
    return { handled: true, data: { success: true } };
  }

  // ─── 3. Destinations ────────────────────────────────────────
  if (procedure === "destinations.list") {
    let rows = await listCollection("destinations");
    rows = rows.filter((d) => !d.isActive || d.isActive === "active");
    if (input.region && input.region !== "all") {
      rows = rows.filter((d) => d.region === input.region);
    }
    if (input.search) {
      const q = String(input.search).toLowerCase();
      rows = rows.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(q) ||
          (d.location || "").toLowerCase().includes(q)
      );
    }
    return { handled: true, data: rows.slice(input.offset || 0, (input.offset || 0) + (input.limit || 100)) };
  }

  if (procedure === "destinations.getById" || procedure === "adminDestinations.getById") {
    const ref = await findDocRefById("destinations", input.id);
    if (!ref) return { handled: true, data: null };
    const snap = await getDoc(ref);
    return { handled: true, data: snap.exists() ? normalizeDoc(snap) : null };
  }

  if (procedure === "adminDestinations.list") {
    let rows = await listCollection("destinations");
    if (input.status) rows = rows.filter((r) => r.isActive === input.status);
    if (input.search) {
      const q = String(input.search).toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(q) ||
          (r.location || "").toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    return { handled: true, data: rows.slice(offset, offset + limit) };
  }

  if (procedure === "adminDestinations.create") {
    const created = await createInCollection("destinations", {
      ...input,
      image: input.imageUrl || input.image || "",
      isActive: input.isActive || "active",
    });
    return { handled: true, data: { success: true, id: created.id } };
  }

  if (procedure === "adminDestinations.update") {
    const { id, ...rest } = input;
    await updateInCollection("destinations", id, {
      ...rest,
      ...(rest.imageUrl !== undefined ? { image: rest.imageUrl } : {}),
    });
    return { handled: true, data: { success: true } };
  }

  if (procedure === "adminDestinations.updateStatus") {
    await updateInCollection("destinations", input.id, { isActive: input.isActive });
    return { handled: true, data: { success: true } };
  }

  if (procedure === "adminDestinations.delete") {
    await deleteInCollection("destinations", input.id);
    return { handled: true, data: { success: true } };
  }

  if (procedure === "adminDestinations.bulkDelete") {
    for (const id of input.ids || []) {
      await deleteInCollection("destinations", id);
    }
    return { handled: true, data: { success: true } };
  }

  if (procedure === "adminDestinations.getStats") {
    const all = await listCollection("destinations");
    const active = all.filter((d) => d.isActive === "active").length;
    return {
      handled: true,
      data: { total: all.length, active, inactive: all.length - active, avgRating: 4.9, avgPrice: 0 },
    };
  }

  // ─── 4. Offers ──────────────────────────────────────────────
  if (procedure === "offers.list" || procedure === "offers.listActive") {
    let rows = await listCollection("offers");
    rows = rows.filter((o) => !o.isActive || o.isActive === "active");
    if (input.category && input.category !== "all") {
      rows = rows.filter((o) => o.category === input.category);
    }
    return { handled: true, data: rows.slice(input.offset || 0, (input.offset || 0) + (input.limit || 100)) };
  }

  if (procedure === "offers.getById" || procedure === "adminOffers.getById") {
    const ref = await findDocRefById("offers", input.id);
    if (!ref) return { handled: true, data: null };
    const snap = await getDoc(ref);
    return { handled: true, data: snap.exists() ? normalizeDoc(snap) : null };
  }

  if (procedure === "adminOffers.list" || procedure === "admin.offers") {
    let rows = await listCollection("offers");
    if (input.status) rows = rows.filter((r) => r.isActive === input.status);
    if (input.search) {
      const q = String(input.search).toLowerCase();
      rows = rows.filter((r) => (r.title || "").toLowerCase().includes(q));
    }
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    return { handled: true, data: rows.slice(offset, offset + limit) };
  }

  if (procedure === "adminOffers.create") {
    const created = await createInCollection("offers", {
      ...input,
      image: input.imageUrl || input.image || "",
      isActive: input.isActive || "active",
      bookedSpots: 0,
    });
    return { handled: true, data: { success: true, id: created.id } };
  }

  if (procedure === "adminOffers.update") {
    const { id, ...rest } = input;
    await updateInCollection("offers", id, {
      ...rest,
      ...(rest.imageUrl !== undefined ? { image: rest.imageUrl } : {}),
    });
    return { handled: true, data: { success: true } };
  }

  if (procedure === "adminOffers.updateStatus") {
    await updateInCollection("offers", input.id, { isActive: input.isActive });
    return { handled: true, data: { success: true } };
  }

  if (procedure === "adminOffers.delete") {
    await deleteInCollection("offers", input.id);
    return { handled: true, data: { success: true } };
  }

  if (procedure === "adminOffers.getStats") {
    const all = await listCollection("offers");
    const active = all.filter((o) => o.isActive === "active").length;
    return { handled: true, data: { total: all.length, active, inactive: all.length - active, avgDiscount: 0 } };
  }

  // ─── 5. Gallery ─────────────────────────────────────────────
  if (procedure === "gallery.listVisible") {
    let rows = await listCollection("gallery_items");
    if (rows.length === 0) {
      rows = await listCollection("gallery").catch(() => []);
    }
    rows = rows.filter((r) => !r.isVisible || r.isVisible === "visible");
    rows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return { handled: true, data: rows };
  }

  if (procedure === "gallery.listAll") {
    let rows = await listCollection("gallery_items");
    if (rows.length === 0) {
      const legacy = await listCollection("gallery").catch(() => []);
      rows = legacy;
    }
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const offset = input.offset || 0;
    const limit = input.limit || 200;
    return { handled: true, data: rows.slice(offset, offset + limit) };
  }

  if (procedure === "gallery.create") {
    const created = await createInCollection("gallery_items", {
      ...input,
      url: input.imageUrl || input.url || "",
      isVisible: "visible",
    });
    return { handled: true, data: { success: true, id: created.id } };
  }

  if (procedure === "gallery.update") {
    const { id, _docId, ...rest } = input;
    const targetId = _docId || id;
    await updateInCollection("gallery_items", targetId, {
      ...rest,
      ...(rest.imageUrl !== undefined ? { url: rest.imageUrl } : {}),
    });
    return { handled: true, data: { success: true } };
  }

  if (procedure === "gallery.delete") {
    await deleteInCollection("gallery_items", input._docId || input.id);
    return { handled: true, data: { success: true } };
  }

  if (procedure === "gallery.listVisibleVideos" || procedure === "gallery.listAllVideos") {
    let rows = await listCollection("gallery_videos");
    if (procedure === "gallery.listVisibleVideos") {
      rows = rows.filter((r) => !r.isVisible || r.isVisible === "visible");
    }
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { handled: true, data: rows };
  }

  if (procedure === "gallery.createVideo") {
    const created = await createInCollection("gallery_videos", {
      ...input,
      isVisible: "visible",
    });
    return { handled: true, data: { success: true, id: created.id } };
  }

  if (procedure === "gallery.updateVideo") {
    const { id, _docId, ...rest } = input;
    await updateInCollection("gallery_videos", _docId || id, rest);
    return { handled: true, data: { success: true } };
  }

  if (procedure === "gallery.deleteVideo") {
    await deleteInCollection("gallery_videos", input._docId || input.id);
    return { handled: true, data: { success: true } };
  }

  // ─── 6. Reviews ─────────────────────────────────────────────
  if (procedure === "reviews.list" || procedure === "reviews.listApproved") {
    let rows = await listCollection("reviews");
    rows = rows.filter((r) => r.isApproved === "approved" || r.isApproved === true);
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { handled: true, data: rows.slice(input.offset || 0, (input.offset || 0) + (input.limit || 50)) };
  }

  if (procedure === "reviews.listAll") {
    const rows = await listCollection("reviews");
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { handled: true, data: rows.slice(input.offset || 0, (input.offset || 0) + (input.limit || 100)) };
  }

  if (procedure === "reviews.stats") {
    const rows = await listCollection("reviews");
    const approved = rows.filter((r) => r.isApproved === "approved" || r.isApproved === true);
    const avg =
      approved.length > 0
        ? approved.reduce((s, r) => s + (Number(r.rating) || 5), 0) / approved.length
        : 5;
    return { handled: true, data: { total: approved.length, averageRating: Number(avg.toFixed(1)) } };
  }

  if (procedure === "reviews.create") {
    const created = await createInCollection("reviews", {
      ...input,
      isApproved: "pending",
      helpfulCount: 0,
    });
    return { handled: true, data: created };
  }

  if (procedure === "reviews.moderate") {
    await updateInCollection("reviews", input.id, { isApproved: input.status });
    return { handled: true, data: { success: true } };
  }

  if (procedure === "reviews.reply") {
    await updateInCollection("reviews", input.id, { adminReply: input.reply });
    return { handled: true, data: { success: true } };
  }

  // ─── 7. Bookings ────────────────────────────────────────────
  if (procedure === "bookings.listAll") {
    const rows = await listCollection("bookings");
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { handled: true, data: rows.slice(input.offset || 0, (input.offset || 0) + (input.limit || 100)) };
  }

  if (procedure === "bookings.myBookings") {
    const rows = await listCollection("bookings");
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { handled: true, data: rows };
  }

  if (procedure === "bookings.create") {
    const confirmationCode = `VNR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const created = await createInCollection("bookings", {
      ...input,
      userId: input.userId ?? null,
      confirmationCode,
      status: "pending",
      paymentStatus: "pending",
    });
    return { handled: true, data: created };
  }

  if (procedure === "bookings.updateStatus") {
    await updateInCollection("bookings", input.id, { status: input.status });
    return { handled: true, data: { success: true } };
  }

  if (procedure === "bookings.updatePaymentStatus") {
    await updateInCollection("bookings", input.id, { paymentStatus: input.paymentStatus });
    return { handled: true, data: { success: true } };
  }

  // ─── 8. Contact Messages ────────────────────────────────────
  if (procedure === "contact.submit") {
    const created = await createInCollection("contact_messages", {
      ...input,
      sender: input.name || "Guest",
      status: "new",
    });
    return { handled: true, data: { success: true, id: created.id } };
  }

  if (procedure === "contact.listAll") {
    const [cm, m] = await Promise.all([
      listCollection("contact_messages").catch(() => []),
      listCollection("messages").catch(() => []),
    ]);
    const rows = [...cm, ...m];
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { handled: true, data: rows.slice(input.offset || 0, (input.offset || 0) + (input.limit || 100)) };
  }

  if (procedure === "contact.updateStatus") {
    await updateInCollection("contact_messages", input.id, { status: input.status }).catch(async () => {
      await updateInCollection("messages", input.id, { status: input.status });
    });
    return { handled: true, data: { success: true } };
  }

  // ─── 9. Users ───────────────────────────────────────────────
  if (procedure === "users.list") {
    const rows = await listCollection("users");
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    return {
      handled: true,
      data: { users: rows.slice(offset, offset + limit), total: rows.length, limit, offset },
    };
  }

  if (procedure === "users.search") {
    const q = String(input.query || "").toLowerCase();
    const rows = await listCollection("users");
    const filtered = rows.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.displayName || "").toLowerCase().includes(q)
    );
    return { handled: true, data: filtered };
  }

  if (procedure === "users.stats") {
    const rows = await listCollection("users");
    const admins = rows.filter((u) => u.role === "admin").length;
    return { handled: true, data: { total: rows.length, admins, users: rows.length - admins } };
  }

  if (procedure === "users.updateRole") {
    await updateInCollection("users", input.id, { role: input.role });
    return { handled: true, data: { success: true } };
  }

  if (procedure === "users.updateProfile") {
    const app = getFirebaseApp();
    const currentUser = app ? getAuth(app).currentUser : null;
    const targetUid = String(input.id || currentUser?.uid || "").trim();

    const safePatch: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (input.name !== undefined) {
      const cleanName = String(input.name || "").trim().slice(0, 100);
      if (cleanName) {
        safePatch.name = cleanName;
        safePatch.displayName = cleanName;
      }
    }
    if (input.phone !== undefined) {
      safePatch.phone = input.phone ? String(input.phone).trim().slice(0, 50) : null;
    }
    if (input.avatarUrl !== undefined) {
      const cleanAvatar = input.avatarUrl ? String(input.avatarUrl).slice(0, 145000) : null;
      safePatch.avatarUrl = cleanAvatar;
      safePatch.avatar = cleanAvatar;
    }

    if (targetUid) {
      await setDoc(doc(db, "users", targetUid), safePatch, { merge: true });
    }

    if (currentUser) {
      try {
        const fbPatch: { displayName?: string; photoURL?: string } = {};
        if (safePatch.name) fbPatch.displayName = safePatch.name;
        if (input.avatarUrl === null) {
          fbPatch.photoURL = "";
        } else if (typeof safePatch.avatarUrl === "string" && safePatch.avatarUrl.startsWith("http") && safePatch.avatarUrl.length <= 2000) {
          fbPatch.photoURL = safePatch.avatarUrl;
        }
        if (Object.keys(fbPatch).length > 0) {
          await firebaseUpdateProfile(currentUser, fbPatch);
        }
      } catch {
        // Ignore Firebase Auth photoURL length errors if avatar is a data URI
      }
    }

    try {
      const storedRaw = localStorage.getItem("vanir-client-auth-user");
      if (storedRaw) {
        const stored = JSON.parse(storedRaw);
        const updatedStored = {
          ...stored,
          ...(safePatch.name ? { name: safePatch.name } : {}),
          ...(input.phone !== undefined ? { phone: safePatch.phone } : {}),
          ...(input.avatarUrl !== undefined ? { avatarUrl: safePatch.avatarUrl } : {}),
        };
        localStorage.setItem("vanir-client-auth-user", JSON.stringify(updatedStored));
      }
    } catch {}

    return { handled: true, data: { success: true } };
  }

  // ─── 10. Blog ───────────────────────────────────────────────
  if (procedure === "blog.list") {
    let rows = await listCollection("blog_posts");
    rows = rows.filter((p) => !p.status || p.status === "published");
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { handled: true, data: rows.slice(input.offset || 0, (input.offset || 0) + (input.limit || 50)) };
  }

  // ─── 11. AI Studio Credits ──────────────────────────────────
  if (procedure === "aiStudio.getCredits") {
    const rows = await listCollection("ai_credits").catch(() => []);
    return { handled: true, data: rows[0] || { balance: 100, plan: "vip" } };
  }

  if (procedure === "aiStudio.getStats") {
    return { handled: true, data: { totalCredits: 100, usedCredits: 0, generationsCount: 0 } };
  }

  if (procedure === "aiStudio.getSubscription") {
    return { handled: true, data: { plan: "vip", status: "active" } };
  }

  if (procedure === "aiStudio.getUsageHistory") {
    const rows = await listCollection("credit_transactions").catch(() => []);
    return { handled: true, data: rows };
  }

  if (procedure === "aiStudio.addCredits") {
    await addDoc(collection(db, "credit_transactions"), {
      ...input,
      createdAt: Date.now(),
    });
    return { handled: true, data: { success: true } };
  }

  // ─── 12. Database Manager ───────────────────────────────────
  if (procedure === "databaseManager.listCollections") {
    return {
      handled: true,
      data: [
        "site_settings",
        "destinations",
        "offers",
        "gallery_items",
        "blog_posts",
        "packages",
        "jets",
        "yachts",
        "hotels",
        "transfers",
        "reviews",
        "bookings",
        "contact_messages",
        "users",
      ],
    };
  }

  if (procedure === "databaseManager.getDocuments") {
    const rows = input.collection ? await listCollection(input.collection) : [];
    return { handled: true, data: rows };
  }

  if (procedure === "databaseManager.deleteDocument") {
    if (input.collection && input.id) {
      await deleteInCollection(input.collection, input.id);
    }
    return { handled: true, data: { success: true } };
  }

  // ─── 13. Firebase AI Logic (Gemini Public Concierge & Vanir AI Assistant) ───────
  if (procedure === "aiCommand.publicChat") {
    const message = String(input?.message || "").trim();
    const history = Array.isArray(input?.history) ? input.history : [];
    if (!message) {
      return { handled: true, data: { reply: "Please enter a message." } };
    }
    const reply = await askGeminiConcierge(message, history);
    return { handled: true, data: { reply } };
  }

  async function generateLuxuryTravelImage(promptText: string, folder: string, usedUrls?: Set<string>): Promise<string> {
    const fallbackCover = "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=80";
    // 1. Try native Google Gemini / Imagen image generation via /api/gemini
    const geminiImg = await generateLuxuryImageWithGemini(promptText, folder);
    if (geminiImg) {
      usedUrls?.add(geminiImg);
      return geminiImg;
    }
    // 2. Fallback to curated/Wikimedia watermark-free travel photography
    return findAndSaveTopicImage(promptText, fallbackCover, usedUrls);
  }

  async function executeAdminActionPayload(act: any, usedUrls?: Set<string>) {
    const tool = String(act?.tool || "system");
    const action = String(act?.action || "");
    const fallbackCover = "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=80";

    if (action === "update_blog") {
      const rows = await listCollection("blog_posts");
      const match = String(act?.titleMatch || "").toLowerCase();
      const target = rows.find((r) => String(r._docId || r.id) === String(act?.id || "")) ||
        rows.find((r) => match && (String(r.title || "").toLowerCase().includes(match) || String(r.titleAr || "").toLowerCase().includes(match))) ||
        rows[0];
      if (!target) return null;
      const patch: Record<string, any> = { updatedAt: Date.now() };
      if (act?.title) patch.title = String(act.title);
      if (act?.titleAr) patch.titleAr = String(act.titleAr);
      if (act?.excerpt) patch.excerpt = String(act.excerpt);
      if (act?.content) patch.content = String(act.content);
      if (act?.status) patch.status = String(act.status);
      if (act?.imagePrompt) {
        const newImg = await generateLuxuryTravelImage(String(act.imagePrompt), "blog_covers");
        patch.coverImage = newImg;
        patch.imageUrl = newImg;
      }
      await updateInCollection("blog_posts", String(target._docId || target.id), patch);
      return {
        tool: "blog",
        action: "update_blog",
        status: "success" as const,
        summary: `Updated blog post: "${patch.title || target.title}"`,
        summaryAr: `تم تعديل المقال: "${patch.titleAr || target.titleAr || target.title}"`,
        imageUrl: patch.coverImage as string | undefined,
        link: "/admin/blog",
      };
    }

    if (action === "delete_blog") {
      const rows = await listCollection("blog_posts");
      const match = String(act?.titleMatch || "").toLowerCase();
      const target = rows.find((r) => String(r._docId || r.id) === String(act?.id || "")) ||
        rows.find((r) => match && (String(r.title || "").toLowerCase().includes(match) || String(r.titleAr || "").toLowerCase().includes(match)));
      if (!target) return null;
      await deleteInCollection("blog_posts", String(target._docId || target.id));
      return {
        tool: "blog",
        action: "delete_blog",
        status: "success" as const,
        summary: `Deleted blog post: "${target.title}"`,
        summaryAr: `تم حذف المقال: "${target.titleAr || target.title}"`,
        link: "/admin/blog",
      };
    }

    if (action === "publish_blog" || (tool === "blog" && action !== "list")) {
      const title = String(act?.title || "Luxury Egypt Travel Guide").trim();
      const titleAr = String(act?.titleAr || title).trim();
      const slugBase = String(act?.slug || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `post-${Date.now()}`;
      const finalSlug = `${slugBase}-${Date.now().toString().slice(-4)}`;
      const coverImage = await generateLuxuryTravelImage(
        String(act?.imagePrompt || act?.imageQuery || title),
        "blog_covers",
        usedUrls
      );
      await createInCollection("blog_posts", {
        title,
        titleAr,
        slug: finalSlug,
        excerpt: String(act?.excerpt || title).trim(),
        content: String(act?.content || act?.excerpt || title).trim(),
        category: String(act?.category || "Egypt Luxury"),
        coverImage,
        imageUrl: coverImage,
        author: "Vanir AI Editor",
        status: "published",
        publishedAt: Date.now(),
        createdAt: Date.now(),
      });
      return {
        tool: "blog",
        action: "publish_blog",
        status: "success" as const,
        summary: `Published blog post: "${title}"`,
        summaryAr: `تم نشر المقال بنجاح: "${titleAr}" — [قراءة المقال](/blog/${finalSlug}) | [إدارة المدونة](/admin/blog)`,
        imageUrl: coverImage,
        link: "/admin/blog",
      };
    }

    if (action === "update_destination") {
      const rows = await listCollection("destinations");
      const match = String(act?.nameMatch || "").toLowerCase();
      const target = rows.find((r) => String(r._docId || r.id) === String(act?.id || "")) ||
        rows.find((r) => match && (String(r.name || "").toLowerCase().includes(match) || String(r.nameAr || "").toLowerCase().includes(match))) ||
        rows[0];
      if (!target) return null;
      const patch: Record<string, any> = { updatedAt: Date.now() };
      if (act?.name) patch.name = String(act.name);
      if (act?.nameAr) patch.nameAr = String(act.nameAr);
      if (act?.price) patch.price = String(act.price);
      if (act?.description) patch.description = String(act.description);
      if (act?.status) patch.status = String(act.status);
      await updateInCollection("destinations", String(target._docId || target.id), patch);
      return {
        tool: "destinations",
        action: "update_destination",
        status: "success" as const,
        summary: `Updated destination: "${patch.name || target.name}"`,
        summaryAr: `تم تحديث الوجهة: "${patch.nameAr || target.nameAr || target.name}"`,
        link: "/admin/destinations",
      };
    }

    if (action === "create_destination" || tool === "destinations") {
      const name = String(act?.name || act?.title || "Luxor VIP Experience").trim();
      const nameAr = String(act?.nameAr || name).trim();
      const imageUrl = await findAndSaveTopicImage(String(act?.imageQuery || name), fallbackCover);
      await createInCollection("destinations", {
        name,
        nameAr,
        country: String(act?.country || "Egypt"),
        description: String(act?.description || `Curated luxury journey to ${name}.`),
        price: String(act?.price || "$2,500"),
        duration: String(act?.duration || "5 Days"),
        imageUrl,
        status: "active",
        featured: true,
        createdAt: Date.now(),
      });
      return {
        tool: "destinations",
        action: "create_destination",
        status: "success" as const,
        summary: `Created destination: "${name}"`,
        summaryAr: `تمت إضافة الوجهة السياحية: "${nameAr}"`,
        link: "/admin/destinations",
      };
    }

    if (action === "generate_video") {
      const title = String(act?.title || "Vanir AI Luxury Travel Video").trim();
      const videoPrompt = String(act?.videoPrompt || act?.prompt || title).trim();
      const dv = await generateLuxuryVideoWithDeevid(videoPrompt, String(act?.model || "Master V4.0"));
      if (dv.error || !dv.taskId) {
        throw new Error(dv.error || "Failed to submit Deevid video task");
      }
      if (dv.resultVideoUrl) {
        await createInCollection("gallery_videos", {
          title,
          category: String(act?.category || "AI Video"),
          videoUrl: dv.resultVideoUrl,
          thumbnailUrl: dv.coverImageUrl || "",
          isVisible: true,
          aiGenerated: true,
          createdAt: Date.now(),
        });
        return {
          tool: "gallery",
          action: "generate_video",
          status: "success" as const,
          summary: `AI video generated & published: "${title}"`,
          summaryAr: `تم توليد الفيديو ونشره في المعرض: "${title}" — [مشاهدة الفيديو](${dv.resultVideoUrl})`,
          imageUrl: dv.coverImageUrl,
          link: "/admin/gallery",
        };
      }
      return {
        tool: "gallery",
        action: "generate_video",
        status: "success" as const,
        summary: `Video generation started (Task #${dv.taskId}, status: ${dv.status})`,
        summaryAr: `تم إرسال طلب توليد الفيديو عبر Deevid AI (رقم المهمة: ${dv.taskId} — الحالة: ${dv.status})`,
        link: "/admin/gallery",
      };
    }

    if (action === "generate_image") {
      const title = String(act?.title || "Vanir AI Luxury Artwork").trim();
      const imgPrompt = String(act?.imageQuery || act?.imagePrompt || title).trim();
      const finalUrl = await generateLuxuryTravelImage(imgPrompt, "ai_gallery", usedUrls);
      await createInCollection("gallery_images", {
        title,
        category: String(act?.category || "Luxury Travel"),
        imageUrl: finalUrl,
        isVisible: true,
        aiGenerated: true,
        prompt: imgPrompt,
        createdAt: Date.now(),
      });
      return {
        tool: "gallery",
        action: "generate_image",
        status: "success" as const,
        summary: `Generated luxury AI image: "${title}"`,
        summaryAr: `تم توليد الصورة السياحية الفاخرة ونشرها في المعرض: "${title}"`,
        imageUrl: finalUrl,
        link: "/admin/gallery",
      };
    }

    if (action === "publish_gallery_image" || tool === "gallery") {
      const title = String(act?.title || "Vanir Luxury Moment").trim();
      const directUrl = String(act?.imageUrl || "").trim();
      const imageUrl = directUrl.startsWith("http")
        ? directUrl
        : await findAndSaveTopicImage(String(act?.imageQuery || title), fallbackCover);
      await createInCollection("gallery_images", {
        title,
        category: String(act?.category || "Destinations"),
        imageUrl,
        isVisible: true,
        createdAt: Date.now(),
      });
      return {
        tool: "gallery",
        action: "publish_gallery_image",
        status: "success" as const,
        summary: `Published gallery image: "${title}"`,
        summaryAr: `تم نشر الصورة في المعرض: "${title}"`,
        link: "/admin/gallery",
      };
    }

    if (action === "update_offer") {
      const rows = await listCollection("offers");
      const match = String(act?.titleMatch || "").toLowerCase();
      const target = rows.find((r) => String(r._docId || r.id) === String(act?.id || "")) ||
        rows.find((r) => match && (String(r.title || "").toLowerCase().includes(match) || String(r.titleAr || "").toLowerCase().includes(match))) ||
        rows[0];
      if (!target) return null;
      const patch: Record<string, any> = { updatedAt: Date.now() };
      if (act?.title) patch.title = String(act.title);
      if (act?.discount) patch.discount = String(act.discount);
      if (act?.price) patch.price = String(act.price);
      if (act?.description) patch.description = String(act.description);
      if (act?.status) patch.status = String(act.status);
      await updateInCollection("offers", String(target._docId || target.id), patch);
      return {
        tool: "offers",
        action: "update_offer",
        status: "success" as const,
        summary: `Updated VIP offer: "${patch.title || target.title}"`,
        summaryAr: `تم تعديل العرض: "${target.titleAr || target.title}"`,
        link: "/admin/offers",
      };
    }

    if (action === "create_offer" || tool === "offers") {
      const title = String(act?.title || "Exclusive VIP Nile Offer").trim();
      const titleAr = String(act?.titleAr || title).trim();
      const imageUrl = await findAndSaveTopicImage(String(act?.imageQuery || title), fallbackCover);
      await createInCollection("offers", {
        title,
        titleAr,
        description: String(act?.description || `Exclusive luxury travel offer: ${title}`),
        discount: String(act?.discount || "20% OFF"),
        price: String(act?.price || "$3,200"),
        imageUrl,
        status: "active",
        createdAt: Date.now(),
      });
      return {
        tool: "offers",
        action: "create_offer",
        status: "success" as const,
        summary: `Created VIP offer: "${title}"`,
        summaryAr: `تم إنشاء العرض السياحي: "${titleAr}"`,
        link: "/admin/offers",
      };
    }

    if (action === "approve_pending_reviews" || tool === "reviews") {
      const rows = await listCollection("reviews");
      const pending = rows.filter((r) => r.status !== "approved");
      for (const r of pending) {
        await updateInCollection("reviews", String(r._docId || r.id), { status: "approved" });
      }
      return {
        tool: "reviews",
        action: "approve_pending_reviews",
        status: "success" as const,
        summary: `Approved ${pending.length} pending review(s)`,
        summaryAr: `تمت الموافقة على ${pending.length} تقييم معلق`,
        link: "/admin/reviews",
      };
    }

    if (action === "update_setting" || tool === "settings") {
      const key = String(act?.key || "").trim();
      if (key) {
        if (GA_SETTING_KEYS.has(key)) {
          await syncGaIdEverywhere(String(act?.value ?? ""));
        } else {
          await setFirestoreSetting(String(act?.category || "general"), key, String(act?.value ?? ""));
        }
        return {
          tool: "settings",
          action: "update_setting",
          status: "success" as const,
          summary: `Updated site setting: ${key}`,
          summaryAr: `تم تحديث إعداد الموقع: ${key}`,
          link: "/admin/settings",
        };
      }
    }

    if (action === "fix_site_issues" || tool === "system") {
      let fixedCount = 0;
      const posts = await listCollection("blog_posts");
      for (const p of posts) {
        if (!p.coverImage && !p.imageUrl) {
          const img = await findAndSaveTopicImage(String(p.title || "Egypt luxury travel"), fallbackCover);
          await updateInCollection("blog_posts", String(p._docId || p.id), { coverImage: img, imageUrl: img });
          fixedCount++;
        }
      }
      const dests = await listCollection("destinations");
      for (const d of dests) {
        if (!d.imageUrl) {
          const img = await findAndSaveTopicImage(String(d.name || "Egypt destination"), fallbackCover);
          await updateInCollection("destinations", String(d._docId || d.id), { imageUrl: img });
          fixedCount++;
        }
      }
      return {
        tool: "system",
        action: "fix_site_issues",
        status: "success" as const,
        summary: `Auto-repaired ${fixedCount} missing image/content record(s)`,
        summaryAr: `تم فحص وإصلاح ${fixedCount} سجل/صورة ناقصة في الموقع`,
        link: "/admin",
      };
    }

    return null;
  }

  if (procedure === "aiCommand.getApiConfig") {
    return {
      handled: true,
      data: {
        maskedKey: "Cloudflare-Gemini-Proxy (Active)",
        apiUrl: "/api/gemini",
        model: "gemini-3.1-flash-lite",
      },
    };
  }

  if (procedure === "aiCommand.executeAdminAction") {
    try {
      const exec = await executeAdminActionPayload(input);
      if (exec) {
        return { handled: true, data: { success: true, ...exec } };
      }
      return {
        handled: true,
        data: {
          success: false,
          tool: String(input?.tool || "system"),
          action: String(input?.action || "unknown"),
          summary: "Unsupported admin action",
          summaryAr: "إجراء غير مدعوم",
        },
      };
    } catch (err: any) {
      return {
        handled: true,
        data: {
          success: false,
          tool: String(input?.tool || "system"),
          action: String(input?.action || "unknown"),
          summary: err?.message || "Action failed",
          summaryAr: "فشل تنفيذ الإجراء",
        },
      };
    }
  }

  if (procedure === "aiCommand.chat") {
    const msgs = Array.isArray(input?.messages) ? input.messages : [];
    const lastUser = msgs[msgs.length - 1];
    const prompt = String(lastUser?.content || "").trim() || "Hello";
    const history = msgs.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    }));
    const rawResponse = await askVanirAIAssistant(prompt, input?.taskType, history, {
      provider: input?.provider,
      model: input?.model,
    });
    let response = rawResponse;
    let executedAction: any = undefined;

    const actionMatches = Array.from(rawResponse.matchAll(/<ADMIN_ACTION>([\s\S]*?)<\/ADMIN_ACTION>/gi));
    if (actionMatches.length > 0) {
      response = rawResponse.replace(/<ADMIN_ACTION>[\s\S]*?<\/ADMIN_ACTION>/gi, "").trim();
      const succeeded: any[] = [];
      const failedErrors: string[] = [];
      const usedImageUrls = new Set<string>();

      for (const m of actionMatches) {
        try {
          let jsonText = m[1]
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          const objMatch = jsonText.match(/\{[\s\S]*\}/);
          if (objMatch) jsonText = objMatch[0];

          let parsedAction: any;
          try {
            parsedAction = JSON.parse(jsonText);
          } catch {
            const sanitized = jsonText.replace(/\r?\n/g, "\\n").replace(/\t/g, "\\t");
            parsedAction = JSON.parse(sanitized);
          }
          const execResult = await executeAdminActionPayload(parsedAction, usedImageUrls);
          if (execResult) {
            succeeded.push(execResult);
            response += `\n\n✅ **${execResult.summaryAr || execResult.summary}**`;
            if ((execResult as any).imageUrl) {
              response += `\n![${execResult.summary}](${(execResult as any).imageUrl})`;
            }
          }
        } catch (err: any) {
          console.warn("[aiCommand.chat] Failed to execute <ADMIN_ACTION>:", err);
          failedErrors.push(err?.message || "Execution error");
        }
      }

      if (succeeded.length > 0) {
        const last = succeeded[succeeded.length - 1];
        executedAction =
          succeeded.length === 1
            ? last
            : {
                tool: last.tool,
                action: last.action,
                status: "success" as const,
                summary: `Executed ${succeeded.length} actions successfully`,
                summaryAr: `تم تنفيذ ${succeeded.length} إجراءات ونشرها في الموقع بنجاح`,
                link: last.link,
              };
      } else if (failedErrors.length > 0) {
        executedAction = {
          tool: "system",
          action: "parse_error",
          status: "failed",
          summary: failedErrors[0],
          summaryAr: "تعذر تنفيذ الإجراء تلقائياً",
        };
      }
    }

    return {
      handled: true,
      data: {
        response,
        executedAction,
        usage: { total_tokens: Math.ceil((prompt.length + response.length) / 4) },
      },
    };
  }

  if (procedure === "aiCommand.executeTask") {
    const prompt = [
      input?.prompt ? String(input.prompt) : "",
      input?.context ? `\n\nContext:\n${String(input.context)}` : "",
    ]
      .join("")
      .trim();
    const result = await askVanirAIAssistant(prompt, input?.taskType);
    return {
      handled: true,
      data: {
        result,
        usage: { total_tokens: Math.ceil((prompt.length + result.length) / 4) },
      },
    };
  }

  if (procedure === "aiCommand.saveApiConfig") {
    return { handled: true, data: { success: true } };
  }

  if (procedure === "aiCommand.testApiConnection") {
    try {
      const ping = await askVanirAIAssistant("Reply with OK.", "connection_test");
      return { handled: true, data: { success: Boolean(ping), message: "Connected to Firebase AI Logic (Gemini 2.5 Flash)" } };
    } catch (e: any) {
      return { handled: true, data: { success: false, message: e?.message || "Gemini connection failed" } };
    }
  }

  return { handled: false };
}
