"use client";

import { useEffect, useRef, useState } from "react";
import { AdminField } from "@/components/admin/admin-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type CircleValue =
  | { mode: "existing"; id: string; name: string }
  | { mode: "new"; name: string; socialLink: string; notes: string };

type CircleOption = { id: string; name: string };

export function CircleCombobox({
  circles,
  value,
  onChange
}: {
  circles: CircleOption[];
  value: CircleValue | null;
  onChange: (value: CircleValue | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalized = query.trim().toLowerCase();
  const filtered = circles.filter((circle) => circle.name.toLowerCase().includes(normalized)).slice(0, 8);
  const exactMatch = circles.some((circle) => circle.name.toLowerCase() === normalized);
  const showCreate = query.trim().length >= 2 && !exactMatch;

  return (
    <div className="space-y-3">
      <div className="relative" ref={containerRef}>
        <Input
          value={query}
          placeholder="Ketik untuk cari atau buat circle…"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (value) {
              onChange(null);
            }
          }}
          onFocus={() => setOpen(true)}
        />
        {open && (filtered.length > 0 || showCreate) ? (
          <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-white shadow-soft">
            {filtered.map((circle) => (
              <button
                key={circle.id}
                type="button"
                className="block w-full px-4 py-2.5 text-left text-sm text-ink-800 transition hover:bg-brand-50"
                onClick={() => {
                  onChange({ mode: "existing", id: circle.id, name: circle.name });
                  setQuery(circle.name);
                  setOpen(false);
                }}
              >
                {circle.name}
              </button>
            ))}
            {showCreate ? (
              <button
                type="button"
                className="block w-full border-t border-line px-4 py-2.5 text-left text-sm font-medium text-brand-700 transition hover:bg-brand-50"
                onClick={() => {
                  onChange({ mode: "new", name: query.trim(), socialLink: "", notes: "" });
                  setOpen(false);
                }}
              >
                + Buat circle baru: “{query.trim()}”
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {value?.mode === "existing" ? (
        <p className="text-xs text-emerald-700">
          Circle dipilih: <span className="font-medium">{value.name}</span>
        </p>
      ) : null}

      {value?.mode === "new" ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-4">
          <p className="text-xs font-medium text-brand-700">
            Circle baru: “{value.name}” — slug dibuat otomatis saat disimpan.
          </p>
          <AdminField label="Social link">
            <Input
              type="url"
              value={value.socialLink}
              placeholder="https://x.com/…"
              onChange={(event) => onChange({ ...value, socialLink: event.target.value })}
            />
          </AdminField>
          <AdminField label="Notes">
            <Textarea
              value={value.notes}
              placeholder="Catatan singkat circle (opsional)…"
              onChange={(event) => onChange({ ...value, notes: event.target.value })}
            />
          </AdminField>
        </div>
      ) : null}
    </div>
  );
}
