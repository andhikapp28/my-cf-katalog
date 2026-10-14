export const revalidate = 60;

import type { Metadata } from "next";
import { getActiveEvent, getCatalogCircles } from "@/db/queries";
import { WishlistPageClient } from "@/components/wishlist/wishlist-page-client";

export const metadata: Metadata = {
  title: "Circle Tersimpan (Bookmark) · ComiPocket",
  description:
    "Daftar circle dan nomor meja booth kreator incaranmu di Comic Frontier (Comifuro). Akses rute jalan dan data stan 100% offline di venue."
};

export default async function WishlistPage() {
  const [circles, activeEvent] = await Promise.all([
    getCatalogCircles().catch(() => []),
    getActiveEvent().catch(() => null)
  ]);

  return (
    <WishlistPageClient
      allCircles={circles}
      activeEventName={activeEvent?.name || "Comic Frontier 22 (Comifuro 22)"}
    />
  );
}
