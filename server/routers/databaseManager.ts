import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { db as firestore } from "../_core/firebaseAdmin";
import { list, remove } from "../_core/firestore-db";

export const databaseManagerRouter = router({
  listCollections: adminProcedure.query(async () => {
    try {
      const collections = await firestore.listCollections();
      const result = await Promise.all(
        collections.map(async (col) => {
          const snap = await col.limit(1).get();
          return {
            id: col.id,
            hasDocuments: !snap.empty,
          };
        })
      );
      if (result.length > 0) return result;
    } catch (e) {
      console.warn("[databaseManager] Firestore listCollections failed, falling back to local collections:", e);
    }

    const knownCollections = [
      "destinations",
      "offers",
      "bookings",
      "gallery_items",
      "reviews",
      "blogPosts",
      "contact_messages",
      "siteSettings",
      "users",
      "design_versions",
    ];
    return knownCollections.map((id) => ({ id, hasDocuments: true }));
  }),

  getDocuments: adminProcedure
    .input(
      z.object({
        collectionName: z.string(),
        limit: z.number().default(50),
        offsetId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = firestore.collection(input.collectionName).limit(input.limit);

        if (input.offsetId) {
          const offsetDoc = await firestore.collection(input.collectionName).doc(input.offsetId).get();
          if (offsetDoc.exists) {
            query = query.startAfter(offsetDoc);
          }
        }

        const snap = await query.get();
        const documents = snap.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));

        return {
          documents,
          hasMore: snap.docs.length === input.limit,
          lastId: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1].id : null,
        };
      } catch (err) {
        const rows = await list(input.collectionName, { limit: input.limit });
        return {
          documents: rows.map((r: any) => ({ _id: String(r.id || r.docId || Math.random()), ...r })),
          hasMore: false,
          lastId: null,
        };
      }
    }),

  deleteDocument: adminProcedure
    .input(z.object({ collectionName: z.string(), documentId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await firestore.collection(input.collectionName).doc(input.documentId).delete();
      } catch (e) {
        await remove(input.collectionName, input.documentId as any);
      }
      return { success: true };
    }),
});
