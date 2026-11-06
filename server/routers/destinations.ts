import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { list, getById } from "../_core/firestore-db";
import { logError } from "../utils/errorLogger";

export const destinationsRouter = router({
  /** Public: List active destinations */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(100),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        region: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 100, offset = 0, search, region } = input ?? {};
      try {
        const whereClauses: [string, any, any][] = [["isActive", "==", "active"]];
        if (region && region !== "all") {
          whereClauses.push(["region", "==", region]);
        }
        let items = (await list("destinations", {
          where: whereClauses,
          limit,
          offset,
        })) as any[];

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          items = items.filter((d: any) =>
            (d.name && d.name.toLowerCase().includes(q)) ||
            (d.location && d.location.toLowerCase().includes(q)) ||
            (d.nameAr && d.nameAr.includes(q)) ||
            (d.country && d.country.toLowerCase().includes(q))
          );
        }

        return items;
      } catch (err) {
        logError("destinations.list", "fetch error", err);
        return [];
      }
    }),

  /** Public: Get single destination by id */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        return (await getById("destinations", input.id)) as any;
      } catch (err) {
        logError("destinations.getById", "fetch error", err, { id: input.id });
        return null;
      }
    }),
});
