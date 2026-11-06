import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import {
  createOffer,
  getActiveOffers,
  getAllOffers,
  getOfferByPromoCode,
  updateOffer,
} from "../db";
import {
  list as firestoreList,
  getById as firestoreGetById,
  findOne as firestoreFindOne,
  insert as firestoreInsert,
  update as firestoreUpdate,
} from "../_core/firestore-db";
import { logError } from "../utils/errorLogger";

export const offersRouter = router({
  /** Public: List active offers with optional category filter */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(100),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 100, offset = 0, category } = input ?? {};
      try {
        const whereClauses: [string, any, any][] = [["isActive", "==", "active"]];
        if (category && category !== "all") {
          whereClauses.push(["category", "==", category]);
        }
        let items: any[] = [];
        try {
          items = (await firestoreList("offers", {
            where: whereClauses,
            limit,
            offset,
          })) as any[];
        } catch (fsErr) {
          console.warn("[offers.list] Firestore query failed, falling back to SQLite:", fsErr);
        }

        if (!items || items.length === 0) {
          items = (await getActiveOffers()) as any[];
          if (category && category !== "all") {
            items = items.filter((o) => o.category === category);
          }
        }

        return items;
      } catch (err) {
        logError("offers.list", "fetch error", err);
        return [];
      }
    }),

  /** List active offers (public) */
  listActive: publicProcedure.query(async () => {
    try {
      let items: any[] = [];
      try {
        items = (await firestoreList("offers", {
          where: [["isActive", "==", "active"]],
          limit: 100,
        })) as any[];
      } catch (fsErr) {
        console.warn("[offers.listActive] Firestore query failed:", fsErr);
      }
      if (items && items.length > 0) return items;
      return getActiveOffers();
    } catch {
      return getActiveOffers();
    }
  }),

  /** Public: Get single offer by id */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        let offer = (await firestoreGetById("offers", input.id)) as any;
        if (!offer) {
          const all = await getAllOffers(100, 0);
          offer = all.find((o) => o.id === input.id) || null;
        }
        return offer;
      } catch (err) {
        logError("offers.getById", "fetch error", err, { id: input.id });
        return null;
      }
    }),

  /** Validate a promo code (public) */
  validatePromo: publicProcedure
    .input(z.object({ promoCode: z.string().min(1) }))
    .query(async ({ input }) => {
      let offer: any = null;
      try {
        offer = await firestoreFindOne("offers", [["promoCode", "==", input.promoCode]]);
      } catch {}
      if (!offer) {
        offer = await getOfferByPromoCode(input.promoCode);
      }
      if (!offer) return { valid: false, message: "رمز الخصم غير صالح" } as const;

      const now = Date.now();
      if (offer.isActive !== "active") return { valid: false, message: "هذا العرض غير نشط" } as const;
      if (offer.startDate && now < offer.startDate) return { valid: false, message: "هذا العرض لم يبدأ بعد" } as const;
      if (offer.endDate && now > offer.endDate) return { valid: false, message: "انتهت صلاحية هذا العرض" } as const;
      if (offer.totalSpots && offer.bookedSpots && offer.bookedSpots >= offer.totalSpots) {
        return { valid: false, message: "نفدت جميع الأماكن المتاحة" } as const;
      }

      return {
        valid: true,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        title: offer.title,
        message: "تم تطبيق رمز الخصم بنجاح",
      } as const;
    }),

  /** List all offers (admin only) */
  listAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      try {
        const items = (await firestoreList("offers", { limit, offset })) as any[];
        if (items && items.length > 0) return items;
      } catch {}
      return getAllOffers(limit, offset);
    }),

  /** Create a new offer (admin only) */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.string(),
        promoCode: z.string().optional(),
        startDate: z.number(),
        endDate: z.number(),
        category: z.string().optional(),
        destination: z.string().optional(),
        imageUrl: z.string().optional(),
        totalSpots: z.number().optional(),
        badgeText: z.string().optional(),
        badgeColor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ...input,
        isActive: "active" as const,
        bookedSpots: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = await firestoreInsert("offers", data);
      createOffer(data as any).catch(() => {});
      return result;
    }),

  /** Update an offer (admin only) */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.string().optional(),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        isActive: z.enum(["active", "inactive", "expired"]).optional(),
        totalSpots: z.number().optional(),
        badgeText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      const updated = await firestoreUpdate("offers", id, updateData);
      updateOffer(id, data).catch(() => {});
      return updated;
    }),
});
