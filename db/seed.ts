import { db } from "./index";
import { events, floorMaps, products } from "./schema";
import { eq, sql } from "drizzle-orm";

interface EventSeedData {
  slug: string;
  name: string;
  description: string;
  venue: string;
  bannerImageUrl: string;
  startsAt: Date;
  endsAt: Date;
  budget: number;
  isActive: boolean;
}

const comifuroMasterEvents: EventSeedData[] = [
  {
    slug: "cf23",
    name: "Comic Frontier 23 (Comifuro 23)",
    description: "Perhelatan akbar Comic Frontier 23 di ICE BSD City (Hall 5-10) bertema Halloween dengan 1.959 circle kreator terkurasi dan area Free Community Booths.",
    venue: "ICE BSD City (Hall 5, 6, 7, 8, 9, 10)",
    bannerImageUrl: "/banner/cf23.jpg",
    startsAt: new Date("2026-10-31T09:00:00+07:00"),
    endsAt: new Date("2026-11-01T18:00:00+07:00"),
    budget: 2500000,
    isActive: true
  },
  {
    slug: "cf22",
    name: "Comic Frontier 22 (Comifuro 22)",
    description: "1.500+ circle kreator, Bushiroad EXPO, dan tiket KMT KAI.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf22.jpg",
    startsAt: new Date("2026-05-16T09:00:00+07:00"),
    endsAt: new Date("2026-05-17T18:00:00+07:00"),
    budget: 2500000,
    isActive: false
  },
  {
    slug: "cf21",
    name: "Comic Frontier 21 (Comifuro 21)",
    description: "Rekor 70.000 pengunjung dan konser akbar hololive ID.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf21.jpg",
    startsAt: new Date("2025-11-15T09:00:00+07:00"),
    endsAt: new Date("2025-11-16T18:00:00+07:00"),
    budget: 2000000,
    isActive: false
  },
  {
    slug: "cf20",
    name: "Comic Frontier 20 (Comic Frontier XX)",
    description: "Edisi ke-20 (CF XX), Bushiroad EXPO, dan temu kreator.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf20.jpg",
    startsAt: new Date("2025-05-24T09:00:00+07:00"),
    endsAt: new Date("2025-05-25T18:00:00+07:00"),
    budget: 2000000,
    isActive: false
  },
  {
    slug: "cf19",
    name: "Comic Frontier 19 (Comifuro 19)",
    description: "Konser anisong Konomi Suzuki dan panggung musik J-pop.",
    venue: "ICE BSD City (Hall 7 - 10)",
    bannerImageUrl: "/banner/cf19.jpg",
    startsAt: new Date("2024-11-09T09:00:00+07:00"),
    endsAt: new Date("2024-11-10T18:00:00+07:00"),
    budget: 1500000,
    isActive: false
  },
  {
    slug: "cf18",
    name: "Comic Frontier 18 (Comifuro 18)",
    description: "Bushiroad EXPO 2024 dan temu bintang seiyuu Jepang.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf18.jpg",
    startsAt: new Date("2024-05-11T09:00:00+07:00"),
    endsAt: new Date("2024-05-12T18:00:00+07:00"),
    budget: 1500000,
    isActive: false
  },
  {
    slug: "cf17",
    name: "Comic Frontier 17 (Comifuro 17)",
    description: "Ekspansi 4 hall ICE BSD dan rute shuttle bus Lorena.",
    venue: "ICE BSD City (Hall 7 - 10)",
    bannerImageUrl: "/banner/cf17.jpg",
    startsAt: new Date("2023-12-16T09:00:00+07:00"),
    endsAt: new Date("2023-12-17T18:00:00+07:00"),
    budget: 1000000,
    isActive: false
  },
  {
    slug: "cf16",
    name: "Comic Frontier 16 (Comifuro 16)",
    description: "Ekspansi 3 hall ICE BSD dan temu virtual hololive.",
    venue: "ICE BSD City (Hall 8 - 10)",
    bannerImageUrl: "/banner/cf16.jpg",
    startsAt: new Date("2023-05-06T09:00:00+07:00"),
    endsAt: new Date("2023-05-07T18:00:00+07:00"),
    budget: 1000000,
    isActive: false
  }
];

async function main() {
  console.log("Menyinkronkan master event resmi Comic Frontier (CF 16 - CF 23)...");

  for (const item of comifuroMasterEvents) {
    const existing = await db.query.events.findFirst({
      where: eq(events.slug, item.slug)
    });

    if (existing) {
      await db
        .update(events)
        .set({
          name: item.name,
          description: item.description,
          venue: item.venue,
          bannerImageUrl: item.bannerImageUrl,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          budget: item.budget,
          isActive: item.isActive,
          updatedAt: new Date()
        })
        .where(eq(events.id, existing.id));
      console.log(` -> Event updated: ${item.name} (${item.slug})`);
    } else {
      const [inserted] = await db
        .insert(events)
        .values({
          slug: item.slug,
          name: item.name,
          description: item.description,
          venue: item.venue,
          bannerImageUrl: item.bannerImageUrl,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          budget: item.budget,
          isActive: item.isActive
        })
        .returning();
      console.log(` -> Event inserted: ${inserted.name} (${inserted.slug})`);
    }
  }

  // Pastikan 6 hall venue (Hall 5, 6, 7, 8, 9, 10 ICE BSD City) disinkronkan untuk CF 23
  const cf23Event = await db.query.events.findFirst({
    where: eq(events.slug, "cf23")
  });

  if (cf23Event) {
    const cf23Halls = [
      {
        name: "Hall 5 - Free Community Booths & Local Dev",
        hall: "Hall 5",
        imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        width: 1400,
        height: 900
      },
      {
        name: "Hall 6 - F&B, Rest Area & Cosplay Photo Zone",
        hall: "Hall 6",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        width: 1400,
        height: 900
      },
      {
        name: "Hall 7 - Artist Alley & Creators (Blok A-G)",
        hall: "Hall 7",
        imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        width: 1400,
        height: 900
      },
      {
        name: "Hall 8 - Artist Alley & Creators (Blok H-N)",
        hall: "Hall 8",
        imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        width: 1400,
        height: 900
      },
      {
        name: "Hall 9 - Creators Alley & Corporate Booths (Blok O-U)",
        hall: "Hall 9",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        width: 1400,
        height: 900
      },
      {
        name: "Hall 10 - Main Stage, Exhibition & Official Goods",
        hall: "Hall 10",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        width: 1400,
        height: 900
      }
    ];

    const existingMaps = await db.query.floorMaps.findMany({
      where: eq(floorMaps.eventId, cf23Event.id)
    });

    for (const h of cf23Halls) {
      const found = existingMaps.find((m) => m.hall === h.hall);
      if (found) {
        await db
          .update(floorMaps)
          .set({
            name: h.name,
            imageUrl: h.imageUrl,
            width: h.width,
            height: h.height,
            updatedAt: new Date()
          })
          .where(eq(floorMaps.id, found.id));
      } else {
        await db.insert(floorMaps).values({
          eventId: cf23Event.id,
          name: h.name,
          hall: h.hall,
          imageUrl: h.imageUrl,
          width: h.width,
          height: h.height
        });
      }
    }
    console.log(" -> Floor maps CF 23 (6 Hall Venue: Hall 5, 6, 7, 8, 9, 10 ICE BSD City) disinkronkan.");

    const pCount = await db
      .select({ c: sql`count(*)` })
      .from(products)
      .where(eq(products.eventId, cf23Event.id));

    console.log(`Katalog CF 23 aktif: ${pCount[0]?.c || 0} karya terindeks (kapasitas terdaftar: 1.959 Circle).`);
  }

  // Cek apakah data katalog CF 22 sudah terindeks
  const cf22Event = await db.query.events.findFirst({
    where: eq(events.slug, "cf22")
  });

  if (cf22Event) {
    const pCount = await db
      .select({ c: sql`count(*)` })
      .from(products)
      .where(eq(products.eventId, cf22Event.id));

    console.log(`Katalog CF 22 diarsipkan: ${pCount[0]?.c || 0} karya tersimpan.`);
  }

  console.log("Seed & sinkronisasi master event Comifuro selesai.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Gagal seed:", error);
    process.exit(1);
  });
