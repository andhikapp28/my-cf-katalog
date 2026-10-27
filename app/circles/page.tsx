export const revalidate = 120;

import { CirclesDirectoryClient, type EventOption } from "@/components/circles/circles-directory-client";
import { getCatalogCircles, getEventsWithCounts } from "@/db/queries";
import { getSearchParam, type SearchParams } from "@/lib/admin-ui";

export default async function CirclesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const eventParam = getSearchParam(params, "event") || getSearchParam(params, "eventId");

  const allEvents = await getEventsWithCounts();

  // Tentukan default event: jika event aktif punya circle, pakai itu; jika tidak, fallback ke event yang ada circlenya (CF 22)
  const defaultEvent =
    allEvents.find((e) => e.isActive && e.circleCount > 0) ??
    allEvents.find((e) => e.circleCount > 0) ??
    allEvents[0];

  const activeEventSlug = eventParam || defaultEvent?.slug || "cf23";

  const rawCircles = await getCatalogCircles({ eventId: activeEventSlug });

  // Ringkas payload props untuk Client Component: hilangkan metadata berat (floorMap SVG, timestamp internal)
  // agar SSR payload turun dari 8.8 MB menjadi ~2 MB, mempercepat render dev & prod secara drastis
  const circles = rawCircles.map((circle) => ({
    id: circle.id,
    name: circle.name,
    slug: circle.slug,
    notes: circle.notes,
    socialLink: circle.socialLink,
    circleCutUrl: circle.circleCutUrl,
    fandom: circle.fandom,
    categories: circle.categories,
    rating: circle.rating ?? undefined,
    day: circle.day,
    boothCode: circle.boothCode,
    productCount: circle.products?.length ?? 0,
    socialLinks: circle.socialLinks,
    products: circle.products?.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      ...(p.poPickupNotes ? { poPickupNotes: p.poPickupNotes } : {})
    }))
  }));

  // Siapkan opsi event switcher untuk UI
  const eventOptions: EventOption[] = allEvents
    .filter((e) => e.slug === "cf22" || e.slug === "cf23" || e.circleCount > 0)
    .map((e) => ({
      slug: e.slug,
      name: e.name.replace(/\s*\(.*?\)/, ""), // Format ringkas "Comic Frontier 23"
      circleCount: e.circleCount,
      isActive: e.isActive
    }));

  return (
    <div className="container-shell py-8">
      <CirclesDirectoryClient
        initialCircles={circles}
        activeEventSlug={activeEventSlug}
        events={eventOptions}
      />
    </div>
  );
}