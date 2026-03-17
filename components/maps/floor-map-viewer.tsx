"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Marker = {
  id: string;
  circleId: string;
  circleName: string;
  boothCode: string;
  posX: number;
  posY: number;
  products: Array<{ id: string; name: string }>;
};

export function FloorMapViewer({
  name,
  imageUrl,
  width,
  height,
  markers,
  initialCircleId
}: {
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  markers: Marker[];
  initialCircleId?: string;
}) {
  const [activeId, setActiveId] = useState<string | undefined>(initialCircleId ?? markers[0]?.circleId);

  const activeMarker = useMemo(
    () => markers.find((item) => item.circleId === activeId) ?? markers[0],
    [activeId, markers]
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="panel overflow-hidden p-4">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-white" style={{ aspectRatio: `${width}/${height}` }}>
          <Image src={imageUrl} alt={name} fill className="object-cover" />
          {markers.map((marker) => (
            <button
              key={marker.id}
              type="button"
              onClick={() => setActiveId(marker.circleId)}
              className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition ${
                marker.circleId === activeId ? "bg-brand-500 scale-110" : "bg-ink-900/80"
              }`}
              style={{ left: `${marker.posX}%`, top: `${marker.posY}%` }}
              aria-label={marker.circleName}
            />
          ))}
        </div>
      </div>
      <div className="panel p-5">
        {activeMarker ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Selected Booth</p>
              <h3 className="mt-1 font-[var(--font-display)] text-2xl font-semibold">{activeMarker.circleName}</h3>
              <p className="mt-1 text-sm text-ink-500">Booth {activeMarker.boothCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-700">Target products</p>
              <div className="mt-3 space-y-2">
                {activeMarker.products.length ? (
                  activeMarker.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="block rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                    >
                      {product.name}
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-500">Belum ada target item untuk circle ini.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-500">Belum ada marker booth untuk map ini.</p>
        )}
      </div>
    </div>
  );
}


