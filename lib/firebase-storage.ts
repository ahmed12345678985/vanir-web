import fs from 'fs';
import path from 'path';

/**
 * Uploads a file to local storage (cPanel) instead of Firebase
 *
 * @param filePath - Path where file will be stored (e.g., 'uploads/image.jpg' or 'user-1/general/img.jpg')
 * @param fileBuffer - Buffer containing the file data
 * @param contentType - MIME type of the file
 * @param metadata - Optional metadata
 * @returns Object with permanent public URL and file path
 */
export async function storagePut(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string = 'application/octet-stream',
  metadata?: Record<string, string>
): Promise<{
  url: string
  path: string
  bucket: string
}> {
  try {
    const uploadDir = '/home/vanitnet/public_html/uploads/';
    const fullPath = path.join(uploadDir, filePath);

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(fullPath, fileBuffer);

    // Generate permanent public URL
    const fileName = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const publicUrl = `https://vanirgroup.com${fileName}`;

    console.log(`[Local Storage] Successfully uploaded: ${filePath} to ${fullPath}`);

    return {
      url: publicUrl,
      path: filePath,
      bucket: 'local-storage',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[Local Storage] Upload failed for ${filePath}:`, errorMessage);
    throw new Error(`Failed to upload file to local storage: ${errorMessage}`);
  }
}

/**
 * Uploads a file to Local Storage from a URL
 */
export async function storagePutFromUrl(
  sourceUrl: string,
  destinationPath: string,
  contentType: string = 'application/octet-stream'
): Promise<{
  url: string
  path: string
  bucket: string
}> {
  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    return await storagePut(
      destinationPath,
      fileBuffer,
      contentType
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[Local Storage] Upload from URL failed:`, errorMessage);
    throw new Error(`Failed to upload file from URL: ${errorMessage}`);
  }
}

/**
 * Deletes a file from Local Storage
 */
export async function storageDelete(filePath: string): Promise<boolean> {
  try {
    const uploadDir = '/home/vanitnet/public_html/uploads/';
    const fullPath = path.join(uploadDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`[Local Storage] Successfully deleted: ${fullPath}`);
    } else {
      console.log(`[Local Storage] File not found for deletion: ${fullPath}`);
    }
    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[Local Storage] Delete failed for ${filePath}:`, errorMessage);
    throw new Error(`Failed to delete file from local storage: ${errorMessage}`);
  }
}

/**
 * Gets the permanent public URL for a file in Local Storage
 */
export function getStorageUrl(filePath: string): string {
  const fileName = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `https://vanirgroup.com${fileName}`;
}
