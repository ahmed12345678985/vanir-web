import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { ENV } from "./env";

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: ENV.r2Endpoint,
      credentials: {
        accessKeyId: ENV.r2AccessKeyId,
        secretAccessKey: ENV.r2SecretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

export interface R2SnapshotItem {
  key: string;
  filename: string;
  size: number;
  lastModified?: string;
}

/**
 * Tests connection to Cloudflare R2 bucket.
 */
export async function testR2Connection(): Promise<{ success: boolean; bucket: string; message: string }> {
  try {
    const s3 = getR2Client();
    await s3.send(
      new ListObjectsV2Command({
        Bucket: ENV.r2BucketName,
        MaxKeys: 1,
      })
    );
    return {
      success: true,
      bucket: ENV.r2BucketName,
      message: `Successfully connected to Cloudflare R2 bucket "${ENV.r2BucketName}"`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[R2 Connection Error]:", errorMsg);
    return {
      success: false,
      bucket: ENV.r2BucketName,
      message: `Connection failed: ${errorMsg}`,
    };
  }
}

/**
 * Uploads a database snapshot JSON to Cloudflare R2.
 */
export async function uploadDatabaseSnapshotToR2(
  snapshotName: string,
  data: string | Buffer,
  recordCount = 0
): Promise<{ key: string; size: number }> {
  const s3 = getR2Client();
  const safeName = snapshotName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `backups/database/${safeName}`;

  const buffer = typeof data === "string" ? Buffer.from(data, "utf-8") : data;

  await s3.send(
    new PutObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: "application/json",
      Metadata: {
        recordcount: String(recordCount),
        createdat: new Date().toISOString(),
      },
    })
  );

  console.log(`[R2 Backup] Successfully uploaded snapshot: ${key} (${buffer.length} bytes)`);

  return {
    key,
    size: buffer.length,
  };
}

/**
 * Lists all database backup snapshots stored on Cloudflare R2.
 */
export async function listR2Snapshots(): Promise<R2SnapshotItem[]> {
  try {
    const s3 = getR2Client();
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: ENV.r2BucketName,
        Prefix: "backups/database/",
      })
    );

    if (!res.Contents || res.Contents.length === 0) {
      return [];
    }

    const sorted = [...res.Contents].sort((a, b) => {
      const timeA = a.LastModified ? a.LastModified.getTime() : 0;
      const timeB = b.LastModified ? b.LastModified.getTime() : 0;
      return timeB - timeA;
    });

    return sorted.map((item) => {
      const key = item.Key || "";
      const filename = key.split("/").pop() || key;
      return {
        key,
        filename,
        size: item.Size || 0,
        lastModified: item.LastModified ? item.LastModified.toISOString() : undefined,
      };
    });
  } catch (err) {
    console.error("[R2 List Error]:", err);
    return [];
  }
}

/**
 * Downloads a database snapshot JSON from Cloudflare R2.
 */
export async function downloadSnapshotFromR2(key: string): Promise<string> {
  const s3 = getR2Client();
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
    })
  );

  if (!res.Body) {
    throw new Error(`Empty body returned from R2 for key: ${key}`);
  }

  const str = await (res.Body as any).transformToString("utf-8");
  return str;
}

/**
 * Deletes a snapshot from Cloudflare R2.
 */
export async function deleteR2Snapshot(key: string): Promise<boolean> {
  const s3 = getR2Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
    })
  );
  console.log(`[R2 Backup] Deleted snapshot: ${key}`);
  return true;
}
