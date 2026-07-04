"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const errorMessages: Record<string, string> = {
  validation: "Data yang dikirim tidak valid. Periksa kembali isian form.",
  "invalid-status": "Status produk tidak valid.",
  "product-not-found": "Produk tidak ditemukan.",
  "image-required": "Floor map wajib memiliki gambar."
};

const successMessages: Record<string, string> = {
  "product-saved": "Produk berhasil disimpan.",
  "status-updated": "Status produk diperbarui.",
  "image-removed": "Gambar produk dihapus.",
  "product-deleted": "Produk dihapus.",
  "event-saved": "Event berhasil disimpan.",
  "event-deleted": "Event dihapus.",
  "circle-saved": "Circle berhasil disimpan.",
  "circle-deleted": "Circle dihapus.",
  "floor-map-saved": "Floor map berhasil disimpan.",
  "floor-map-deleted": "Floor map dihapus.",
  "booth-saved": "Booth berhasil disimpan.",
  "booth-deleted": "Booth dihapus.",
  "category-saved": "Kategori expense disimpan.",
  "category-deleted": "Kategori expense dihapus.",
  "expense-saved": "Expense berhasil disimpan.",
  "expense-deleted": "Expense dihapus.",
  "admin-synced-from-env": "Admin disinkronkan dari environment."
};

function prettify(code: string) {
  return code.replace(/-/g, " ");
}

export function SearchParamToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success(successMessages[success] ?? prettify(success));
    }

    if (error) {
      toast.error(errorMessages[error] ?? prettify(error));
    }
  }, [searchParams]);

  return null;
}
