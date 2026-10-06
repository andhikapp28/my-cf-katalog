"use client";

import React, { useState, useEffect } from "react";
import {
  CompactCircleCard,
  type CompactCircleItem
} from "@/components/products/compact-circle-card";
import { CircleCatalogModal } from "@/components/products/circle-catalog-modal";
import type { CatalogCircle } from "@/db/queries";

export interface CircleCatalogClientProps {
  circles: CatalogCircle[];
  initialCircleId?: string;
}

export function CircleCatalogClient({
  circles,
  initialCircleId
}: CircleCatalogClientProps) {
  const [selectedCircle, setSelectedCircle] = useState<CompactCircleItem | null>(null);

  useEffect(() => {
    if (initialCircleId) {
      const found = circles.find((c) => c.id === initialCircleId);
      if (found) {
        setSelectedCircle(found as unknown as CompactCircleItem);
      }
    }
  }, [initialCircleId, circles]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {circles.map((circle) => (
          <CompactCircleCard
            key={circle.id}
            circle={circle as unknown as CompactCircleItem}
            onSelectCircle={(c) => setSelectedCircle(c)}
          />
        ))}
      </div>

      <CircleCatalogModal
        circle={selectedCircle}
        isOpen={Boolean(selectedCircle)}
        onClose={() => setSelectedCircle(null)}
      />
    </>
  );
}
