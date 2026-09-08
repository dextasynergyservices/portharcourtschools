import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Checks if Cloudflare R2 environment variables are properly configured.
 * Does not throw if unset; returns boolean for graceful degradation.
 */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

function getS3Client(): S3Client | null {
  if (!isR2Configured()) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });
}

export type PresignedUploadResult =
  | {
      success: true;
      uploadUrl: string;
      fileUrl: string;
      key: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Generate a presigned PUT URL for direct client-to-R2 upload.
 * Zero files are written to local disk.
 */
export async function getR2PresignedUploadUrl({
  filename,
  mimeType,
  folder = "uploads",
}: {
  filename: string;
  mimeType: string;
  folder?: string;
}): Promise<PresignedUploadResult> {
  if (!isR2Configured()) {
    return {
      success: false,
      error:
        "Cloudflare R2 is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in your environment.",
    };
  }

  const s3 = getS3Client();
  if (!s3) {
    return {
      success: false,
      error: "Unable to initialize Cloudflare R2 client.",
    };
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const key = `${folder}/${Date.now()}-${cleanFilename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: mimeType,
    });

    // 15-minute validity
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    // Determine public CDN URL
    let fileUrl: string;
    if (process.env.R2_PUBLIC_DOMAIN) {
      const baseDomain = process.env.R2_PUBLIC_DOMAIN.replace(/\/$/, "");
      fileUrl = `${baseDomain}/${key}`;
    } else {
      fileUrl = `https://${bucketName}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
    }

    return {
      success: true,
      uploadUrl,
      fileUrl,
      key,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate presigned URL";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Delete an object from Cloudflare R2 bucket.
 */
export async function deleteR2Object(
  key: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isR2Configured()) {
    return {
      success: false,
      error: "Cloudflare R2 is not configured.",
    };
  }

  const s3 = getS3Client();
  if (!s3) {
    return {
      success: false,
      error: "Unable to initialize Cloudflare R2 client.",
    };
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    await s3.send(command);
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete object from R2";
    return { success: false, error: message };
  }
}
