"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/products/product-image";

export function ProductImageUrlField({
  name,
  defaultValue,
  placeholder = "https://cdn.example.com/product.jpg"
}: {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [debouncedValue, setDebouncedValue] = useState(defaultValue ?? "");

  useEffect(() => {
    setValue(defaultValue ?? "");
    setDebouncedValue(defaultValue ?? "");
  }, [defaultValue]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value.trim());
    }, 280);

    return () => window.clearTimeout(timer);
  }, [value]);

  const previewMessage = useMemo(() => {
    if (!value.trim()) {
      return null;
    }

    try {
      const url = new URL(value.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "Gunakan URL dengan protocol http atau https.";
      }
      return null;
    } catch {
      return "Gunakan URL gambar yang valid untuk menampilkan preview.";
    }
  }, [value]);

  const previewUrl = previewMessage ? null : debouncedValue;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
      <div className="space-y-2">
        <Input
          name={name}
          type="url"
          inputMode="url"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
        />
        <p className="text-xs text-ink-500">Gunakan direct image URL untuk preview produk.</p>
        {previewMessage ? <p className="text-xs text-rose-600">{previewMessage}</p> : null}
      </div>
      <div className="space-y-2">
        <ProductImage
          src={previewUrl}
          alt="Product image preview"
          className="aspect-[4/3]"
          fallbackLabel="No image preview"
          fallbackDescription={previewMessage ? previewMessage : "Preview akan muncul otomatis saat image URL valid."}
        />
      </div>
    </div>
  );
}