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
import {
  db,
  getFirestoreSetting,
  setFirestoreSetting,
  getFirestoreSettingsByCategory,
  setManyFirestoreSettings,
  uploadBase64Media,
} from "./siteSettingsApi";

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
    if (fileData) {
      const url = await uploadBase64Media(fileData, filename, mimeType, "gallery");
      return { handled: true, data: { url, fileKey: filename } };
    }
    throw new Error("No fileData provided for upload");
  }

  // ─── 2. Site Settings ───────────────────────────────────────
  if (procedure === "siteSettings.set") {
    if (input.category && input.key) {
      await setFirestoreSetting(input.category, input.key, input.value ?? "");
    }
    return { handled: true, data: { success: true } };
  }

  if (procedure === "siteSettings.setMany") {
    const items = Array.isArray(input.items) ? input.items : Array.isArray(input) ? input : [];
    await setManyFirestoreSettings(items);
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
    if (input.id) {
      await updateInCollection("users", input.id, input);
    }
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

  return { handled: false };
}
