import { NextResponse } from "next/server";
import { getCatalogCircles } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const eventSlug = searchParams.get("event") || "cf22";

    const allCircles = await getCatalogCircles({ eventId: eventSlug });

    let results = allCircles;

    if (query) {
      results = allCircles.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(query);
        const boothMatch = c.boothCode ? c.boothCode.toLowerCase().includes(query) : false;
        const fandomMatch = c.fandom ? c.fandom.toLowerCase().includes(query) : false;
        return nameMatch || boothMatch || fandomMatch;
      });
    }

    // Limit to top 16 items for fast response
    const topResults = results.slice(0, 16).map((c) => ({
      id: c.id,
      name: c.name,
      boothCode: c.boothCode,
      day: c.day || "ALL_DAYS",
      fandom: c.fandom,
      circleCutUrl: c.circleCutUrl,
      productsCount: c.products?.length || 0
    }));

    return NextResponse.json({
      query,
      event: eventSlug,
      totalMatches: results.length,
      items: topResults
    });
  } catch (error) {
    console.error("Quick lookup search error:", error);
    return NextResponse.json({ error: "Failed to perform search", items: [] }, { status: 500 });
  }
}
