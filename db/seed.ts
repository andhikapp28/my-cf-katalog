import { db } from "./index";
import { events, products } from "./schema";
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
    description: "Edisi tematik Halloween Weekend di ICE BSD City dengan seleksi circle terkurasi ketat dan free community booth.",
    venue: "ICE BSD City (Hall 6 - 10 & Hall 5)",
    bannerImageUrl: "/banner/cf23.jpg",
    startsAt: new Date("2026-10-31T09:00:00+07:00"),
    endsAt: new Date("2026-11-01T18:00:00+07:00"),
    budget: 2500000,
    isActive: false
  },
  {
    slug: "cf22",
    name: "Comic Frontier 22 (Comifuro 22)",
    description: "1.500+ Circle kreator independen, Bushiroad EXPO 2026, kolaborasi resmi Kartu Multi Trip KAI Commuter, dan stage kreatif.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf22.jpg",
    startsAt: new Date("2026-05-16T09:00:00+07:00"),
    endsAt: new Date("2026-05-17T18:00:00+07:00"),
    budget: 2500000,
    isActive: true
  },
  {
    slug: "cf21",
    name: "Comic Frontier 21 (Comifuro 21)",
    description: "Edisi pemecah rekor 70.000 pengunjung dengan konser akbar hololive ID 5th Anniversary LIVE 'Chromatic Future' dan guest author LN Roshidere.",
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
    description: "Perayaan edisi ke-20 menyatukan Bushiroad EXPO 2025, Q&A CEO Takaaki Kidani, seiyuu BanG Dream!, dan panggung kreator lokal.",
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
    description: "Menghadirkan konser anisong Konomi Suzuki dan panggung kolaborasi Yuko Suzuhana (Wagakki Band) x Upiko di 4 hall ICE BSD.",
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
    description: "Penyelenggaraan Bushiroad EXPO 2024, bintang tamu seiyuu Aina Aiba & Yuka Nishio, serta pembukaan Hall 6 terdedikasi kuliner F&B.",
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
    description: "Ekspansi 4 hall di ICE BSD, peluncuran perdana shuttle bus gratis Lorena, dan implementasi 100% online ticketing via Ticket2u.",
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
    description: "Perluasan ke 3 hall ICE BSD, sesi Meet & Greet hololive ID, dan pasar doujinshi 800+ circle kreator.",
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

  // Cek apakah data katalog CF 22 sudah terindeks
  const cf22Event = await db.query.events.findFirst({
    where: eq(events.slug, "cf22")
  });

  if (cf22Event) {
    const pCount = await db
      .select({ c: sql`count(*)` })
      .from(products)
      .where(eq(products.eventId, cf22Event.id));

    console.log(`Katalog CF 22 aktif: ${pCount[0]?.c || 0} karya terindeks.`);
    if (Number(pCount[0]?.c || 0) === 0) {
      console.log("Tip: Jalankan 'npm run db:import' untuk mengimpor seluruh katalog resmi Comifuro 22.");
    }
  }

  console.log("Seed & sinkronisasi master event Comifuro selesai.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Gagal seed:", error);
    process.exit(1);
  });
