import "server-only";
import { del, put } from "@vercel/blob";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export async function uploadImageToBlob(
  file: File,
  folder: "products" | "maps",
  previousUrl?: string | null
) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error("File harus berupa JPG, PNG, atau WEBP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran file maksimal 5MB.");
  }

  const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
  const blob = await put(filename, file, {
    access: "public"
  });

  if (previousUrl) {
    await safeDeleteBlob(previousUrl);
  }

  return blob.url;
}

export async function safeDeleteBlob(url?: string | null) {
  if (!url) {
    return;
  }

  try {
    await del(url);
  } catch {
    // Ignore stale blob deletion failures so CRUD flow stays smooth.
  }
}



