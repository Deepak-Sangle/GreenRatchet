import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// S3-compatible configuration for Supabase Storage
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for Supabase S3 compatibility
});

export const AVATAR_BUCKET = "public-files";
export const AVATAR_FOLDER = "avatars";

/**
 * Uploads an avatar image to Supabase Storage via S3 protocol
 * @param userId - User ID to namespace the avatar
 * @param file - File to upload
 * @returns Public URL of the uploaded file
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${AVATAR_FOLDER}/${userId}-${Date.now()}.${fileExt}`;

  // Convert File to Buffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Determine the content type
  const contentType = file.type || "image/jpeg";

  const command = new PutObjectCommand({
    Bucket: AVATAR_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "max-age=3600",
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error(
      `Failed to upload avatar: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Construct the public URL
  // Supabase public URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const endpoint = process.env.S3_ENDPOINT!;
  // Extract the base URL from the S3 endpoint
  const baseUrl = endpoint.replace("/storage/v1/s3", "");
  const publicUrl = `${baseUrl}/storage/v1/object/public/${AVATAR_BUCKET}/${fileName}`;

  return publicUrl;
}

/**
 * Deletes an avatar from Supabase Storage via S3 protocol
 * @param avatarUrl - Full URL of the avatar to delete
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  // Extract the file path from the URL
  const url = new URL(avatarUrl);
  const pathParts = url.pathname.split(`/${AVATAR_BUCKET}/`);

  if (pathParts.length < 2) {
    throw new Error("Invalid avatar URL");
  }

  const filePath = pathParts[1];

  const command = new DeleteObjectCommand({
    Bucket: AVATAR_BUCKET,
    Key: filePath,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Failed to delete old avatar:", error);
    // Don't throw - it's okay if old file deletion fails
  }
}
