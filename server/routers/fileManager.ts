import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

const PUBLIC_DIR = fsSync.existsSync(path.resolve(process.cwd(), "public"))
  ? path.resolve(process.cwd(), "public")
  : path.resolve(process.cwd(), "client", "public");

const PROTECTED_FILES = new Set([
  "index.html",
  ".htaccess",
  "robots.txt",
  "favicon.ico",
  "manifest.json",
]);

function resolveSafePublicPath(relativeInput: string, allowRoot = false): string {
  const cleaned = relativeInput.replace(/\\/g, "/").replace(/^\/+/, "");
  const resolved = path.resolve(PUBLIC_DIR, cleaned);
  if (allowRoot && resolved === PUBLIC_DIR) {
    return resolved;
  }
  if (!resolved.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error("Invalid path: Access outside public directory is denied");
  }
  return resolved;
}

export const fileManagerRouter = router({
  listFiles: adminProcedure.input(z.object({ folder: z.string().optional() })).query(async ({ input }) => {
    const targetFolder = resolveSafePublicPath(input.folder || "", true);

    try {
      const entries = await fs.readdir(targetFolder, { withFileTypes: true });
      const files = await Promise.all(
        entries
          .filter((entry) => !entry.name.startsWith(".env") && entry.name !== ".htaccess")
          .map(async (entry) => {
            const fullPath = path.join(targetFolder, entry.name);
            const stats = await fs.stat(fullPath).catch(() => null);
            return {
              name: entry.name,
              isDirectory: entry.isDirectory(),
              size: stats?.size || 0,
              lastModified: stats?.mtime.toISOString() || new Date().toISOString(),
              path: path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, "/"),
            };
          })
      );

      // Sort: Directories first
      return files.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
        return a.isDirectory ? -1 : 1;
      });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }),

  deleteFile: adminProcedure.input(z.object({ path: z.string().min(1) })).mutation(async ({ input }) => {
    const targetFile = resolveSafePublicPath(input.path, false);
    const relPath = path.relative(PUBLIC_DIR, targetFile).replace(/\\/g, "/");
    const baseName = path.basename(targetFile);

    if (
      PROTECTED_FILES.has(baseName) ||
      PROTECTED_FILES.has(relPath) ||
      relPath.startsWith("assets/") ||
      relPath.startsWith(".well-known/")
    ) {
      throw new Error("Protected system file cannot be deleted");
    }

    try {
      const stat = await fs.stat(targetFile);
      if (stat.isDirectory()) {
        throw new Error("Cannot delete directories");
      }
      await fs.unlink(targetFile);
      return { success: true };
    } catch (e: any) {
      throw new Error(e?.message || "Cannot delete file");
    }
  }),
});
