export const revalidate = 60;

import type { Metadata } from "next";
import { getActiveEvent, getBooths, getProducts } from "@/db/queries";
import { WishlistPageClient } from "@/components/wishlist/wishlist-page-client";
import type { WishlistProduct } from "@/components/wishlist/types";

export const metadata: Metadata = {
  title: "My Wishlist & Checklist · ComiPocket",
  description:
    "Rekap booth belanja, rute hunting Comic Frontier (Comifuro), checklist interaktif offline hari-H, dan kalkulator kesiapan tunai ATM ICE BSD."
};

export default async function WishlistPage() {
  const [products, booths, activeEvent] = await Promise.all([
    getProducts().catch(() => []),
    getBooths().catch(() => []),
    getActiveEvent().catch(() => null)
  ]);

  // Map circleId & eventId to booth information
  const boothMap = new Map<
    string,
    { boothCode: string; hall: string | null; floorMapId: string | null }
  >();

  for (const booth of booths) {
    const key = `${booth.eventId}:${booth.circleId}`;
    boothMap.set(key, {
      boothCode: booth.boothCode,
      hall: booth.floorMap?.hall || booth.floorMap?.name || null,
      floorMapId: booth.floorMapId || null
    });
  }

  // Format products for wishlist client
  const formattedProducts: WishlistProduct[] = products.map((item) => {
    const boothInfo = boothMap.get(`${item.eventId}:${item.circleId}`);

    return {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
      priority: item.priority,
      status: item.status,
      targetDay: item.targetDay || "ALL_DAYS",
      isRush: Boolean(item.isRush),
      purchaseType: item.purchaseType || "ON_THE_SPOT",
      productLink: item.productLink,
      poDeadline: item.poDeadline,
      poPickupNotes: item.poPickupNotes,
      notes: item.notes,
      circleId: item.circleId,
      circleName: item.circle?.name || "Circle Kreator",
      eventId: item.eventId,
      eventName: item.event?.name || "Comic Frontier (Comifuro)",
      boothCode: boothInfo?.boothCode || null,
      hall: boothInfo?.hall || null,
      floorMapId: boothInfo?.floorMapId || null
    };
  });

  return (
    <WishlistPageClient
      initialProducts={formattedProducts}
      activeEventName={activeEvent?.name || "Comic Frontier (Comifuro)"}
    />
  );
}
