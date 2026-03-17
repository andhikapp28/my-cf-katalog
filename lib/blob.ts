import "server-only";
import { del, put } from "@vercel/blob";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN belum diisi. Upload image hanya akan berfungsi setelah token Vercel Blob dimasukkan ke .env."
    );
  }

  return token;
}

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
    access: "public",
    token: getBlobToken()
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

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return;
  }

  try {
    await del(url, { token });
  } catch {
    // Ignore stale blob deletion failures so CRUD flow stays smooth.
  }
}
