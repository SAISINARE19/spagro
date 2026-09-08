"use server";

import { createInsforgeAdminClient } from "@/lib/insforge/admin";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadedImage = { url: string; key: string };

export async function uploadAdminImage(bucket: string, file: FormDataEntryValue | null, folder: string): Promise<UploadedImage | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Use a JPG, PNG, or WebP image no larger than 10 MB.");
  }
  const db = createInsforgeAdminClient();
  if (!db) throw new Error("InsForge admin storage is not configured.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { data, error } = await db.storage.from(bucket).upload(key, file);
  if (error || !data) throw new Error(error?.message ?? "The image upload did not complete.");
  return { url: data.url, key: data.key };
}
