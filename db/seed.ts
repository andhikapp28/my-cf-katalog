import { db } from "./index";
import {
  boothLocations,
  circles,
  events,
  floorMaps,
  products
} from "./schema";
import { hasSeedData } from "./queries";
import { slugify } from "../lib/utils";

async function main() {
  const isFresh = process.argv.includes("--fresh") || process.argv.includes("--force");
  const alreadySeeded = await hasSeedData();

  if (alreadySeeded && !isFresh) {
    console.log("Seed dasar sudah ada.");
    console.log("Tip: Jalankan 'npm run db:seed -- --fresh' bila ingin me-reset ke data Comifuro 20.");
    return;
  }

  if (isFresh) {
    console.log("Membersihkan data lama untuk fresh seed Comifuro 20...");
    await db.delete(products);
    await db.delete(boothLocations);
    await db.delete(floorMaps);
    await db.delete(circles);
    await db.delete(events);
  }

  // 1. Event Utama: Comic Frontier 20
  const [event] = await db
    .insert(events)
    .values({
      name: "Comic Frontier 20 (Comifuro 20)",
      slug: "comifuro-20",
      description: "Comic Frontier 20 di ICE BSD City. Pasar kreatif anime/pop culture terbesar di Indonesia. Katalog buruan circle artist alley, booth korporat, dan panduan belanja multi-day.",
      venue: "ICE BSD City (Hall 8, 9, 10), Tangerang",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date("2026-07-18T09:00:00+07:00"),
      endsAt: new Date("2026-07-19T18:00:00+07:00"),
      budget: 2500000,
      isActive: true
    })
    .returning();

  // 2. Circles Khas Comifuro
  const insertedCircles = await db
    .insert(circles)
    .values([
      {
        name: "Atelier Hanami",
        slug: slugify("Atelier Hanami"),
        socialLink: "https://twitter.com/atelierhanami",
        notes: "Spesialis artbook original & Hololive illustration. Sering war pagi!"
      },
      {
        name: "Mikan Press",
        slug: slugify("Mikan Press"),
        socialLink: "https://twitter.com/mikanpress",
        notes: "Doujinshi original, postcard set, dan sticker vinyl."
      },
      {
        name: "Hoshizora Project",
        slug: slugify("Hoshizora Project"),
        socialLink: "https://instagram.com/hoshizoraproject",
        notes: "Acrylic shaker, enamel pin, dan phone strap Genshin/Star Rail."
      },
      {
        name: "NekoWorks ID",
        slug: slugify("NekoWorks ID"),
        socialLink: "https://twitter.com/nekoworksid",
        notes: "Wall scroll tapestry kain sutra & dakimakura limited edition."
      }
    ])
    .returning();

  // 3. Multi-Hall Floor Maps (Hall 8 & Hall 9 ICE BSD)
  const insertedMaps = await db
    .insert(floorMaps)
    .values([
      {
        eventId: event.id,
        name: "Hall 8 - Artist Alley (Blok A-M)",
        hall: "Hall 8",
        imageUrl:
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        width: 1400,
        height: 900
      },
      {
        eventId: event.id,
        name: "Hall 9 - Creators & Corporate (Blok N-Z)",
        hall: "Hall 9",
        imageUrl:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        width: 1400,
        height: 900
      }
    ])
    .returning();

  // 4. Lokasi Booth Sesuai Format Comifuro (A-15a, C-02b, G-08, TC-12)
  await db.insert(boothLocations).values([
    {
      eventId: event.id,
      circleId: insertedCircles[0].id,
      floorMapId: insertedMaps[0].id,
      boothCode: "A-15a",
      day: "DAY_1",
      posX: 25,
      posY: 40,
      notes: "Lorong utama Hall 8 dekat gate masuk. Target war pagi!"
    },
    {
      eventId: event.id,
      circleId: insertedCircles[1].id,
      floorMapId: insertedMaps[0].id,
      boothCode: "C-02b",
      day: "ALL_DAYS",
      posX: 52,
      posY: 35,
      notes: "Aisle C tengah Hall 8. Buka dua hari penuh."
    },
    {
      eventId: event.id,
      circleId: insertedCircles[2].id,
      floorMapId: insertedMaps[0].id,
      boothCode: "G-08",
      day: "DAY_2",
      posX: 75,
      posY: 65,
      notes: "Hanya hadir di Day 2 (Minggu)!"
    },
    {
      eventId: event.id,
      circleId: insertedCircles[3].id,
      floorMapId: insertedMaps[1].id,
      boothCode: "TC-12",
      day: "ALL_DAYS",
      posX: 45,
      posY: 50,
      notes: "Hall 9 Creator Alley baris tengah."
    }
  ]);

  // 5. Produk Target dengan Jadwal Day 1/2, Rush Tags, & Data PO
  await db.insert(products).values([
    {
      eventId: event.id,
      circleId: insertedCircles[0].id,
      name: "Summer Memories 2026 Artbook",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      price: 185000,
      poDeadline: "2026-07-10",
      productLink: "https://twitter.com/atelierhanami",
      status: "TARGET",
      priority: "HIGH",
      targetDay: "DAY_1",
      isRush: true,
      poPickupNotes: null,
      quantity: 1,
      notes: "⚡ RUSH ITEM! Stok on-the-spot hanya 100 copy. Datang jam 10:00 sebelum ludes.",
      purchaseType: "ON_THE_SPOT"
    },
    {
      eventId: event.id,
      circleId: insertedCircles[0].id,
      name: "Raiden Shogun Acrylic Shaker Standee",
      imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
      price: 120000,
      poDeadline: "2026-07-05",
      productLink: "https://twitter.com/atelierhanami",
      status: "PO_DONE",
      priority: "HIGH",
      targetDay: "DAY_1",
      isRush: false,
      poPickupNotes: "Nama: Budi Santoso / WA: 081299887766 / Order #CF20-042",
      quantity: 1,
      notes: "PO sudah lunas transfer. Tinggal tunjukkan kartu ini ke penjaga booth A-15a.",
      purchaseType: "PO"
    },
    {
      eventId: event.id,
      circleId: insertedCircles[1].id,
      name: "Catgirl Maid Postcard & Vinyl Sticker Pack",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      price: 65000,
      poDeadline: null,
      productLink: "https://twitter.com/mikanpress",
      status: "TARGET",
      priority: "MEDIUM",
      targetDay: "ALL_DAYS",
      isRush: false,
      poPickupNotes: null,
      quantity: 2,
      notes: "Bisa santai dibeli kapan saja di Day 1 atau Day 2.",
      purchaseType: "ON_THE_SPOT"
    },
    {
      eventId: event.id,
      circleId: insertedCircles[3].id,
      name: "Limited Wall Scroll Silk Tapestry (Batch 1)",
      imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
      price: 250000,
      poDeadline: null,
      productLink: "https://twitter.com/nekoworksid",
      status: "TARGET",
      priority: "HIGH",
      targetDay: "DAY_1",
      isRush: true,
      poPickupNotes: null,
      quantity: 1,
      notes: "⚡ RUSH ITEM! Hanya 50 pcs per hari di booth TC-12 Hall 9.",
      purchaseType: "ON_THE_SPOT"
    },
    {
      eventId: event.id,
      circleId: insertedCircles[2].id,
      name: "Hololive Enamel Pins Collection (Set of 3)",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      price: 90000,
      poDeadline: null,
      productLink: "https://instagram.com/hoshizoraproject",
      status: "TARGET",
      priority: "LOW",
      targetDay: "DAY_2",
      isRush: false,
      poPickupNotes: null,
      quantity: 1,
      notes: "Beli hari Minggu di Booth G-08 Hall 8.",
      purchaseType: "ON_THE_SPOT"
    }
  ]);

  console.log("Seed Comifuro 20 selesai! Siap dipakai.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
