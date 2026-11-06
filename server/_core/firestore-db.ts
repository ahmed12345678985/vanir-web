import fs from "fs";
import path from "path";
import { db } from "./firebaseAdmin";
import type {
  Query,
  CollectionReference,
} from "firebase-admin/firestore";

const DATA_FILE = path.resolve(process.cwd(), "server", "data", "store.json");

function getLocalData(): Record<string, any> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("[LocalStore] Read error:", e);
  }
  return { _counters: {} };
}

function saveLocalData(data: Record<string, any>) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("[LocalStore] Write error:", e);
  }
}

let storeCache: Record<string, any> = getLocalData();
let firestoreDisabled = false;
let lastFirestoreWarn = 0;

function handleFirestoreError(err: unknown, op: string) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("invalid_grant") || msg.includes("Could not load") || msg.includes("PERMISSION_DENIED")) {
    if (!firestoreDisabled) {
      firestoreDisabled = true;
      console.warn(`[Firestore Resilient] Switched to local JSON store (${op}): ${msg}`);
    }
  } else {
    const now = Date.now();
    if (now - lastFirestoreWarn > 60000) {
      lastFirestoreWarn = now;
      console.warn(`[Firestore Resilient] Operation ${op} fallback to local store: ${msg}`);
    }
  }
}

export type WhereTuple = [string, FirebaseFirestore.WhereFilterOp, unknown];
export type OrderTuple = [string, "asc" | "desc"];

export interface ListOptions {
  where?: WhereTuple[];
  orderBy?: OrderTuple[];
  limit?: number;
  offset?: number;
}

/** Atomically allocate the next numeric id for a collection. */
async function nextId(collection: string): Promise<number> {
  try {
    if (!firestoreDisabled) {
      const counterRef = db.collection("_counters").doc(collection);
      const next = await db.runTransaction(async (tx) => {
        const snap = await tx.get(counterRef);
        const current = (snap.exists ? (snap.data()?.value as number) : 0) || 0;
        const value = current + 1;
        tx.set(counterRef, { value }, { merge: true });
        return value;
      });
      return next;
    }
  } catch (e) {
    handleFirestoreError(e, `nextId(${collection})`);
  }
  if (!storeCache._counters) storeCache._counters = {};
  storeCache._counters[collection] = (storeCache._counters[collection] || 0) + 1;
  saveLocalData(storeCache);
  return storeCache._counters[collection];
}

/** Insert a new document with an auto-allocated numeric id. */
export async function insert<T extends Record<string, any>>(
  collection: string,
  data: T,
): Promise<T & { id: number }> {
  const now = new Date();
  let id = typeof data.id === "number" ? data.id : 0;

  if (!firestoreDisabled) {
    try {
      id = id || await nextId(collection);
      const record = {
        ...data,
        id,
        createdAt: data.createdAt ?? now,
        updatedAt: now,
      } as T & { id: number };
      await db.collection(collection).doc(String(id)).set(record);
      if (!storeCache[collection]) storeCache[collection] = [];
      storeCache[collection].push(record);
      saveLocalData(storeCache);
      return record;
    } catch (error) {
      handleFirestoreError(error, `insert(${collection})`);
    }
  }

  if (!storeCache._counters) storeCache._counters = {};
  if (!id) {
    storeCache._counters[collection] = (storeCache._counters[collection] || 0) + 1;
    id = storeCache._counters[collection];
  }
  const record = {
    ...data,
    id,
    createdAt: data.createdAt ?? now,
    updatedAt: now,
  } as T & { id: number };
  if (!storeCache[collection]) storeCache[collection] = [];
  storeCache[collection].push(record);
  saveLocalData(storeCache);
  return record;
}

/** Get a single document by numeric id. */
export async function getById<T = Record<string, any>>(
  collection: string,
  id: number,
): Promise<T | null> {
  if (!firestoreDisabled) {
    try {
      const snap = await db.collection(collection).doc(String(id)).get();
      if (snap.exists) return snap.data() as T;
    } catch (error) {
      handleFirestoreError(error, `getById(${collection}, ${id})`);
    }
  }
  const items = (storeCache[collection] || []) as any[];
  const found = items.find((item) => item.id === id || item.id === Number(id) || item._docId === String(id));
  return (found as T) || null;
}

/** Update a document by numeric id (merge). Returns the updated doc. */
export async function update<T = Record<string, any>>(
  collection: string,
  id: number,
  data: Record<string, any>,
): Promise<T | null> {
  const now = new Date();
  if (!firestoreDisabled) {
    try {
      const ref = db.collection(collection).doc(String(id));
      await ref.set({ ...data, updatedAt: now }, { merge: true });
      const updated = await ref.get();
      if (updated.exists) return (updated.data() as T) ?? null;
    } catch (error) {
      handleFirestoreError(error, `update(${collection}, ${id})`);
    }
  }
  const items = (storeCache[collection] || []) as any[];
  const idx = items.findIndex((item) => item.id === id || item.id === Number(id));
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data, updatedAt: now };
    saveLocalData(storeCache);
    return items[idx] as T;
  }
  return null;
}

/** Delete a document by numeric id. */
export async function remove(collection: string, id: number): Promise<void> {
  if (!firestoreDisabled) {
    try {
      await db.collection(collection).doc(String(id)).delete();
    } catch (error) {
      handleFirestoreError(error, `remove(${collection}, ${id})`);
    }
  }
  if (storeCache[collection]) {
    storeCache[collection] = storeCache[collection].filter((item: any) => item.id !== id && item.id !== Number(id));
    saveLocalData(storeCache);
  }
}

/** Delete every document in a collection (used by backup "replace" restore). */
export async function removeAll(collection: string): Promise<void> {
  if (!firestoreDisabled) {
    try {
      const snap = await db.collection(collection).get();
      const batchSize = 400;
      for (let i = 0; i < snap.docs.length; i += batchSize) {
        const batch = db.batch();
        for (const doc of snap.docs.slice(i, i + batchSize)) {
          batch.delete(doc.ref);
        }
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, `removeAll(${collection})`);
    }
  }
  storeCache[collection] = [];
  saveLocalData(storeCache);
}

/** List documents with optional filtering, ordering, and pagination. */
export async function list<T = Record<string, any>>(
  collection: string,
  options: ListOptions = {},
): Promise<T[]> {
  if (!firestoreDisabled) {
    try {
      let query: Query | CollectionReference = db.collection(collection);

      if (options.where) {
        for (const [field, op, value] of options.where) {
          query = query.where(field, op, value);
        }
      }
      if (options.orderBy) {
        for (const [field, dir] of options.orderBy) {
          query = query.orderBy(field, dir);
        }
      }
      if (typeof options.offset === "number") {
        query = query.offset(options.offset);
      }
      if (typeof options.limit === "number") {
        query = query.limit(options.limit);
      }

      const snap = await query.get();
      if (snap.docs.length > 0) {
        return snap.docs.map((d) => {
          const data = d.data() as any;
          if (!data.id) data.id = d.id;
          if (!data.docId) data.docId = d.id;
          if (!data.settingKey && typeof d.id === "string" && d.id.includes("__")) {
            const parts = d.id.split("__");
            data.category = data.category || parts[0];
            data.settingKey = data.settingKey || parts.slice(1).join("__");
          }
          return data as T;
        });
      }
    } catch (error) {
      handleFirestoreError(error, `list(${collection})`);
    }
  }

  // Local resilient store fallback
  let items = ((storeCache[collection] || []) as any[]).slice();
  if (options.where) {
    for (const [field, op, val] of options.where) {
      items = items.filter((item) => {
        if (op === "==") return item[field] === val;
        if (op === "!=") return item[field] !== val;
        if (op === ">") return item[field] > (val as any);
        if (op === ">=") return item[field] >= (val as any);
        if (op === "<") return item[field] < (val as any);
        if (op === "<=") return item[field] <= (val as any);
        return true;
      });
    }
  }
  if (options.orderBy) {
    for (const [field, dir] of options.orderBy) {
      items.sort((a, b) => {
        if (a[field] < b[field]) return dir === "desc" ? 1 : -1;
        if (a[field] > b[field]) return dir === "desc" ? -1 : 1;
        return 0;
      });
    }
  }
  const offset = options.offset || 0;
  const limit = typeof options.limit === "number" ? options.limit : items.length;
  return items.slice(offset, offset + limit) as T[];
}

/** Count documents in a collection (optionally filtered). */
export async function count(
  collection: string,
  where?: WhereTuple[],
): Promise<number> {
  if (!firestoreDisabled) {
    try {
      let query: Query | CollectionReference = db.collection(collection);
      if (where) {
        for (const [field, op, value] of where) {
          query = query.where(field, op, value);
        }
      }
      const snap = await query.count().get();
      return snap.data().count;
    } catch (error) {
      handleFirestoreError(error, `count(${collection})`);
    }
  }

  let items = (storeCache[collection] || []) as any[];
  if (where) {
    for (const [field, op, val] of where) {
      items = items.filter((item) => {
        if (op === "==") return item[field] === val;
        if (op === "!=") return item[field] !== val;
        return true;
      });
    }
  }
  return items.length;
}

/** Find the first document matching a set of equality/where conditions. */
export async function findOne<T = Record<string, any>>(
  collection: string,
  where: WhereTuple[],
): Promise<T | null> {
  if (!firestoreDisabled) {
    try {
      let query: Query | CollectionReference = db.collection(collection);
      for (const [field, op, value] of where) {
        query = query.where(field, op, value);
      }
      const snap = await query.limit(1).get();
      if (!snap.empty) return snap.docs[0].data() as T;
    } catch (error) {
      handleFirestoreError(error, `findOne(${collection})`);
    }
  }
  const items = await list<T>(collection, { where, limit: 1 });
  return items[0] || null;
}

/* ── Settings helpers (category + key composite identity) ── */

const SETTINGS_COL = "siteSettings";

/** Read a single setting value, or null if unset. */
export async function getSettingValue(
  category: string,
  key: string,
): Promise<string | null> {
  const docId = `${category}__${key}`;
  if (!firestoreDisabled) {
    try {
      const snap = await db.collection(SETTINGS_COL).doc(docId).get();
      if (snap.exists) return ((snap.data()?.settingValue as string) ?? null);
    } catch (error) {
      handleFirestoreError(error, `getSettingValue(${category}, ${key})`);
    }
  }
  const settings = (storeCache.siteSettings || []) as any[];
  const found = settings.find((s) => (s.category === category && s.settingKey === key) || s.docId === docId);
  return found?.settingValue ?? null;
}

/** Create or update a single setting value. */
export async function setSettingValue(
  category: string,
  key: string,
  value: string,
  updatedBy?: number | string | null,
): Promise<void> {
  const docId = `${category}__${key}`;
  const now = new Date();
  if (!firestoreDisabled) {
    try {
      const ref = db.collection(SETTINGS_COL).doc(docId);
      await ref.set({
        docId,
        category,
        settingKey: key,
        settingValue: value,
        updatedBy: updatedBy ?? null,
        updatedAt: now,
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, `setSettingValue(${category}, ${key})`);
    }
  }
  if (!storeCache.siteSettings) storeCache.siteSettings = [];
  const idx = storeCache.siteSettings.findIndex((s: any) => (s.category === category && s.settingKey === key) || s.docId === docId);
  if (idx !== -1) {
    storeCache.siteSettings[idx].category = category;
    storeCache.siteSettings[idx].settingKey = key;
    storeCache.siteSettings[idx].settingValue = value;
    storeCache.siteSettings[idx].updatedAt = now;
  } else {
    storeCache.siteSettings.push({
      id: (storeCache._counters?.siteSettings || 0) + 1,
      docId,
      category,
      settingKey: key,
      settingValue: value,
      updatedBy: updatedBy ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }
  saveLocalData(storeCache);
}

export { db as firestore };

