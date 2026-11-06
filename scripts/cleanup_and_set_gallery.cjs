const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

async function cleanupAndSet() {
  console.log("--- Cleaning up old gallery items and setting only the 193 new pic items ---");

  const keyData = JSON.parse(fs.readFileSync("firebase-key.json", "utf-8"));
  initializeApp({ credential: cert(keyData) });
  const db = getFirestore();

  const colRef = db.collection("gallery_items");
  const snap = await colRef.get();
  console.log(`Current total docs in Firestore: ${snap.docs.length}`);

  // Delete all docs that are NOT pic_001..pic_193
  const toDelete = snap.docs.filter(d => !d.id.startsWith("pic_"));
  console.log(`Deleting ${toDelete.length} old/duplicate docs...`);

  // Delete in batches of 400
  for (let i = 0; i < toDelete.length; i += 400) {
    const chunk = toDelete.slice(i, i + 400);
    const batch = db.batch();
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`Deleted chunk ${Math.floor(i / 400) + 1} (${chunk.length} docs).`);
  }

  // Verify remaining docs
  const finalSnap = await colRef.get();
  console.log(`[SUCCESS] Firestore 'gallery_items' now has exactly ${finalSnap.docs.length} items (all from pic folder).`);
}

cleanupAndSet().catch(console.error);
