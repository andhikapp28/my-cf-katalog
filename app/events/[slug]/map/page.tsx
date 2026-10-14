import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventMapPageData } from "@/lib/map-data";
import { EventMapClient } from "@/components/map/event-map-client";

export const revalidate = 120;

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEventMapPageData(slug);

  const title = `Denah & Peta Interaktif ${data.event.name} (Hall 5-10) | ComiPocket`;
  const description = `Peta denah interaktif ICE BSD City untuk ${data.event.name}. Navigasi pan-zoom lorong stan booth circle, filter hari Day 1 & 2, dan drawer detail stan kreator.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website"
    }
  };
}

export default async function EventMapPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getEventMapPageData(slug);

  if (!data || !data.event) {
    notFound();
  }

  return (
    <EventMapClient
      initialEvent={data.event}
      initialHalls={data.halls}
      initialZones={data.communityZones}
      archiveMarkers={data.archiveMarkers}
      isCf23={data.isCf23}
      statusNotice={data.statusText}
    />
  );
}
