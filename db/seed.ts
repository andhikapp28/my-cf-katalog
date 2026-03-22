import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  boothLocations,
  circles,
  events,
  expenseCategories,
  expenses,
  floorMaps,
  products,
  users
} from "./schema";
import { hasSeedData } from "./queries";
import { slugify } from "../lib/utils";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL dan ADMIN_PASSWORD sebelum menjalankan seed.");
  }

  const alreadySeeded = await hasSeedData();
  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: "ADMIN"
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash,
        updatedAt: new Date()
      }
    });

  if (alreadySeeded) {
    console.log("Seed dasar sudah ada. Admin disinkronkan.");
    return;
  }

  const [event] = await db
    .insert(events)
    .values({
      name: "Anime Event Sample",
      slug: "anime-event-sample",
      description: "Sample event untuk bootstrap katalog target belanja lintas event anime.",
      venue: "ICE BSD City",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date("2026-07-18T09:00:00+07:00"),
      endsAt: new Date("2026-07-19T18:00:00+07:00"),
      budget: 1500000,
      isActive: true
    })
    .returning();

  const insertedCircles = await db
    .insert(circles)
    .values([
      {
        name: "Atelier Hanami",
        slug: slugify("Atelier Hanami"),
        socialLink: "https://www.instagram.com/",
        notes: "Artbook dan acrylic merch."
      },
      {
        name: "Mikan Press",
        slug: slugify("Mikan Press"),
        socialLink: "https://twitter.com/",
        notes: "Fokus doujin original dan postcard."
      }
    ])
    .returning();

  const [map] = await db
    .insert(floorMaps)
    .values({
      eventId: event.id,
      name: "Hall A Main Floor",
      imageUrl:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
      width: 1200,
      height: 900
    })
    .returning();

  await db.insert(boothLocations).values([
    {
      eventId: event.id,
      circleId: insertedCircles[0].id,
      floorMapId: map.id,
      boothCode: "A-12",
      posX: 28,
      posY: 44,
      notes: "Dekat aisle utama."
    },
    {
      eventId: event.id,
      circleId: insertedCircles[1].id,
      floorMapId: map.id,
      boothCode: "B-07",
      posX: 63,
      posY: 32,
      notes: "Sisi kanan hall."
    }
  ]);

  const insertedProducts = await db
    .insert(products)
    .values([
      {
        eventId: event.id,
        circleId: insertedCircles[0].id,
        name: "Summer Illustration Book",
        price: 185000,
        poDeadline: "2026-07-10",
        productLink: "https://www.instagram.com/",
        status: "PO_OPEN",
        priority: "HIGH",
        quantity: 1,
        notes: "Prioritas utama untuk event.",
        purchaseType: "PO"
      },
      {
        eventId: event.id,
        circleId: insertedCircles[1].id,
        name: "Original Character Acrylic Stand",
        price: 95000,
        poDeadline: "2026-07-15",
        productLink: "https://twitter.com/",
        status: "TARGET",
        priority: "MEDIUM",
        quantity: 2,
        notes: "Bisa dibeli on the spot bila PO tutup.",
        purchaseType: "ON_THE_SPOT"
      }
    ])
    .returning();

  const insertedCategories = await db
    .insert(expenseCategories)
    .values([
      { name: "Merchandise", slug: "merchandise", color: "#D46A3A" },
      { name: "Transport", slug: "transport", color: "#0F766E" },
      { name: "Food", slug: "food", color: "#CA8A04" }
    ])
    .returning();

  await db.insert(expenses).values([
    {
      eventId: event.id,
      productId: insertedProducts[0].id,
      categoryId: insertedCategories[0].id,
      amount: 185000,
      expenseDate: "2026-07-09",
      note: "DP preorder",
      paymentMethod: "BANK_TRANSFER",
      isPlanned: false,
      isActual: true
    },
    {
      eventId: event.id,
      categoryId: insertedCategories[1].id,
      amount: 60000,
      expenseDate: "2026-07-18",
      note: "PP KRL + shuttle",
      paymentMethod: "QRIS",
      isPlanned: false,
      isActual: true
    }
  ]);

  console.log("Seed selesai.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
