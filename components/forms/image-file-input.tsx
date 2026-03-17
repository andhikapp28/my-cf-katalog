"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function ImageFileInput({
  name,
  defaultUrl,
  label
}: {
  name: string;
  defaultUrl?: string | null;
  label: string;
}) {
  const [preview, setPreview] = useState<string | null>(defaultUrl ?? null);

  useEffect(() => {
    setPreview(defaultUrl ?? null);
  }, [defaultUrl]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      {preview ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-white">
          <Image src={preview} alt={label} fill className="object-cover" />
        </div>
      ) : null}
      <input
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/webp"
        className="block w-full text-sm text-ink-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) {
            setPreview(defaultUrl ?? null);
            return;
          }

          const objectUrl = URL.createObjectURL(file);
          setPreview(objectUrl);
        }}
      />
      <p className="text-xs text-ink-500">JPG, PNG, atau WEBP. Maksimal 5MB.</p>
    </div>
  );
}


