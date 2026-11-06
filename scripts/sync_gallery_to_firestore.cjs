const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

async function syncToFirestore() {
  console.log("--- Syncing Gallery Items to Firebase Firestore ---");

  const keyData = JSON.parse(fs.readFileSync("firebase-key.json", "utf-8"));
  if (!getApps().length) {
    initializeApp({ credential: cert(keyData) });
  }
  const db = getFirestore();

  const storePath = path.resolve(process.cwd(), "server", "data", "store.json");
  const storeData = JSON.parse(fs.readFileSync(storePath, "utf-8"));
  const galleryItems = storeData.gallery_items || [];

  console.log(`Found ${galleryItems.length} items to sync in store.json.`);

  const colRef = db.collection("gallery_items");

  // Firestore allows up to 500 writes in a single batch
  const batchSize = 400;
  for (let i = 0; i < galleryItems.length; i += batchSize) {
    const batch = db.batch();
    const chunk = galleryItems.slice(i, i + batchSize);

    for (const item of chunk) {
      const docRef = colRef.doc(String(item.id));
      batch.set(docRef, {
        ...item,
        createdAt: new Date(item.createdAt || Date.now()),
        updatedAt: new Date(item.updatedAt || Date.now()),
      }, { merge: true });
    }

    await batch.commit();
    console.log(`Committed batch ${Math.floor(i / batchSize) + 1} (${chunk.length} items).`);
  }

  // Also verify total count
  const snap = await colRef.get();
  console.log(`[SUCCESS] Firestore 'gallery_items' now has ${snap.docs.length} total documents!`);
}

syncToFirestore().catch(console.error);
