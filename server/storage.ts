import fs from "fs/promises";
import path from "path";

// Resolves to <project_root>/public/uploads
const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");

// Ensure the directory exists
async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

function normalizeKey(relKey: string): string {
  // Replace slashes and spaces to prevent directory traversal and URI issues
  const safeName = relKey.replace(/^\/+/, "").replace(/[^a-zA-Z0-9.-]/g, "_");
  // Ensure a timestamp is prefixed to avoid naming collisions
  return `${Date.now()}_${safeName}`;
}

/**
 * Uploads a file to local storage (cPanel public/uploads folder)
 * 
 * @param relKey - Relative path for the file (will be sanitized)
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await ensureDir(UPLOADS_DIR);
  
  // Create a safe, unique filename
  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOADS_DIR, key);

  let fileBuffer: Buffer;
  if (typeof data === 'string') {
    fileBuffer = Buffer.from(data, 'utf-8'); // could be base64? No, uploadHelper decodes it.
  } else if (ArrayBuffer.isView(data)) {
    fileBuffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    fileBuffer = data as Buffer;
  }

  try {
    console.log(`[Storage] Saving file to local disk: ${filePath}`);
    await fs.writeFile(filePath, fileBuffer);
    
    // The public URL to access this file via Express
    const url = `/uploads/${key}`;
    console.log(`[Storage] Local upload successful: ${url}`);
    
    return { key, url };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Storage] Local upload FAILED for ${key}:`, errorMessage);
    throw new Error(`Failed to save file to disk: ${errorMessage}`);
  }
}

/**
 * Gets a file URL from storage (Local)
 * 
 * @param relKey - Relative path for the file
 * @returns Object with key and URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  return { key: relKey, url: `/uploads/${relKey}` };
}

/**
 * Deletes a file from storage (Local)
 * 
 * @param relKey - Relative path for the file
 * @returns true if deletion successful
 */
export async function storageDelete(relKey: string): Promise<boolean> {
  const filePath = path.join(UPLOADS_DIR, relKey);
  try {
    console.log(`[Storage] Deleting from local disk: ${filePath}`);
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    // If it doesn't exist, we can ignore it
    if ((err as any).code === 'ENOENT') {
      return true;
    }
    console.error(`[Storage] Local delete FAILED for ${relKey}:`, errorMessage);
    throw new Error(`Failed to delete file from disk: ${errorMessage}`);
  }
}
