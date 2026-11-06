import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import {
  list,
  insert,
  removeAll,
  count as countDocs,
  getSettingValue,
  setSettingValue,
} from "../_core/firestore-db";
import {
  testR2Connection,
  uploadDatabaseSnapshotToR2,
  listR2Snapshots,
  downloadSnapshotFromR2,
  deleteR2Snapshot,
} from "../_core/r2Client";
import { ENV } from "../_core/env";

/**
 * Backup Router - Real data export from Firestore.
 * Exports actual documents from all collections, not fake data.
 */

const TABLE_MAP: Record<string, { collection: string; label: string }> = {
  destinations: { collection: "destinations", label: "Destinations" },
  offers: { collection: "offers", label: "Offers & Packages" },
  blog: { collection: "blogPosts", label: "Blog Articles" },
  bookings: { collection: "bookings", label: "Bookings" },
  users: { collection: "users", label: "Users" },
  gallery: { collection: "galleryItems", label: "Gallery" },
  reviews: { collection: "reviews", label: "Reviews" },
  settings: { collection: "siteSettings", label: "Settings" },
  contacts: { collection: "contactMessages", label: "Contact Messages" },
  marketing: { collection: "marketingContent", label: "Marketing Content" },
};

export const backupRouter = router({
  /**
   * Get record counts for all exportable collections
   */
  getExportSections: adminProcedure.query(async () => {
    const sections = [];
    for (const [id, { collection, label }] of Object.entries(TABLE_MAP)) {
      try {
        const recordCount = await countDocs(collection);
        sections.push({ id, label, recordCount });
      } catch {
        sections.push({ id, label, recordCount: 0 });
      }
    }
    return sections;
  }),

  /**
   * Export selected sections as JSON data
   */
  exportData: adminProcedure
    .input(z.object({
      sections: z.array(z.string()),
      format: z.enum(["json", "csv"]).default("json"),
    }))
    .mutation(async ({ input }) => {
      const exportResult: Record<string, { label: string; recordCount: number; data: any[] }> = {};

      for (const sectionId of input.sections) {
        const mapping = TABLE_MAP[sectionId];
        if (!mapping) continue;

        try {
          const rows = await list(mapping.collection);
          exportResult[sectionId] = {
            label: mapping.label,
            recordCount: rows.length,
            data: rows,
          };
        } catch {
          exportResult[sectionId] = {
            label: mapping.label,
            recordCount: 0,
            data: [],
          };
        }
      }

      return {
        exportedAt: new Date().toISOString(),
        format: input.format,
        totalRecords: Object.values(exportResult).reduce((sum, s) => sum + s.recordCount, 0),
        sections: exportResult,
      };
    }),

  /**
   * Get backup settings from Firestore
   */
  getSettings: adminProcedure.query(async () => {
    const rows = await list("siteSettings", {
      where: [["category", "==", "backup"]],
    });
    const settings: Record<string, string> = {};
    for (const row of rows as any[]) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),

  /**
   * Restore data from backup file
   */
  restoreData: adminProcedure
    .input(z.object({
      sections: z.record(z.string(), z.object({
        label: z.string(),
        recordCount: z.number(),
        data: z.array(z.any()),
      })),
      mode: z.enum(["merge", "replace"]).default("merge"),
    }))
    .mutation(async ({ input }) => {
      const results: Record<string, { restored: number; skipped: number; errors: number }> = {};

      for (const [sectionId, section] of Object.entries(input.sections)) {
        const mapping = TABLE_MAP[sectionId];
        if (!mapping || !section.data || section.data.length === 0) {
          results[sectionId] = { restored: 0, skipped: 0, errors: 0 };
          continue;
        }

        let restored = 0;
        const skipped = 0;
        let errors = 0;

        try {
          // In replace mode, delete existing documents first
          if (input.mode === "replace") {
            await removeAll(mapping.collection);
          }

          // Insert documents one by one
          for (const row of section.data) {
            try {
              const cleanRow = { ...row };
              delete cleanRow.id; // Let the data layer auto-generate ids
              await insert(mapping.collection, cleanRow);
              restored++;
            } catch {
              errors++;
            }
          }
        } catch {
          errors = section.data.length;
        }

        results[sectionId] = { restored, skipped, errors };
      }

      const totalRestored = Object.values(results).reduce((s, r) => s + r.restored, 0);
      const totalSkipped = Object.values(results).reduce((s, r) => s + r.skipped, 0);
      const totalErrors = Object.values(results).reduce((s, r) => s + r.errors, 0);

      return {
        success: true,
        restoredAt: new Date().toISOString(),
        totalRestored,
        totalSkipped,
        totalErrors,
        details: results,
      };
    }),

  /**
   * Save backup settings
   */
  saveSettings: adminProcedure
    .input(z.object({
      settings: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      for (const [key, value] of Object.entries(input.settings)) {
        await setSettingValue("backup", key, value, ctx.user.id);
      }
      return { success: true };
    }),

  /* ═══════════════════════════════════════════════════════════════
     Cloudflare R2 Automated Cloud Backup Procedures
     ═══════════════════════════════════════════════════════════════ */

  /**
   * Test connection and get Cloudflare R2 backup status
   */
  r2Status: adminProcedure.query(async () => {
    const result = await testR2Connection();
    return {
      ...result,
      accountId: ENV.r2AccountId,
      endpoint: ENV.r2Endpoint,
      bucket: ENV.r2BucketName,
    };
  }),

  /**
   * Trigger on-demand backup of all collections to Cloudflare R2
   */
  createR2Backup: adminProcedure
    .input(
      z.object({
        sections: z.array(z.string()).optional(),
      }).optional()
    )
    .mutation(async ({ input }) => {
      const sectionsToExport =
        input?.sections && input.sections.length > 0
          ? input.sections
          : Object.keys(TABLE_MAP);

      const exportResult: Record<string, { label: string; recordCount: number; data: any[] }> = {};

      for (const sectionId of sectionsToExport) {
        const mapping = TABLE_MAP[sectionId];
        if (!mapping) continue;

        try {
          const rows = await list(mapping.collection);
          exportResult[sectionId] = {
            label: mapping.label,
            recordCount: rows.length,
            data: rows,
          };
        } catch {
          exportResult[sectionId] = {
            label: mapping.label,
            recordCount: 0,
            data: [],
          };
        }
      }

      const totalRecords = Object.values(exportResult).reduce((sum, s) => sum + s.recordCount, 0);
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, "-");
      const snapshotName = `vanir_snapshot_${dateStr}.json`;

      const payload = JSON.stringify(
        {
          version: "1.0",
          snapshotName,
          exportedAt: now.toISOString(),
          totalRecords,
          sections: exportResult,
        },
        null,
        2
      );

      const uploadRes = await uploadDatabaseSnapshotToR2(snapshotName, payload, totalRecords);

      return {
        success: true,
        snapshotName,
        key: uploadRes.key,
        size: uploadRes.size,
        totalRecords,
        createdAt: now.toISOString(),
      };
    }),

  /**
   * List all database snapshots currently stored on Cloudflare R2
   */
  listR2Backups: adminProcedure.query(async () => {
    return await listR2Snapshots();
  }),

  /**
   * Restore database from a Cloudflare R2 snapshot
   */
  restoreFromR2: adminProcedure
    .input(
      z.object({
        key: z.string(),
        mode: z.enum(["merge", "replace"]).default("merge"),
      })
    )
    .mutation(async ({ input }) => {
      const rawJson = await downloadSnapshotFromR2(input.key);
      const parsed = JSON.parse(rawJson);

      if (!parsed.sections) {
        throw new Error("Invalid backup format: missing sections");
      }

      const results: Record<string, { restored: number; skipped: number; errors: number }> = {};

      for (const [sectionId, section] of Object.entries(parsed.sections as Record<string, any>)) {
        const mapping = TABLE_MAP[sectionId];
        if (!mapping || !section.data || section.data.length === 0) {
          results[sectionId] = { restored: 0, skipped: 0, errors: 0 };
          continue;
        }

        let restored = 0;
        let errors = 0;

        try {
          if (input.mode === "replace") {
            await removeAll(mapping.collection);
          }

          for (const row of section.data) {
            try {
              const cleanRow = { ...row };
              delete cleanRow.id;
              await insert(mapping.collection, cleanRow);
              restored++;
            } catch {
              errors++;
            }
          }
        } catch {
          errors = section.data.length;
        }

        results[sectionId] = { restored, skipped: 0, errors };
      }

      const totalRestored = Object.values(results).reduce((s, r) => s + r.restored, 0);

      return {
        success: true,
        restoredAt: new Date().toISOString(),
        totalRestored,
        details: results,
      };
    }),

  /**
   * Delete a snapshot from Cloudflare R2
   */
  deleteR2Backup: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const ok = await deleteR2Snapshot(input.key);
      return { success: ok };
    }),
});
