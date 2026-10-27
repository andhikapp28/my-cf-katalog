import { describe, expect, it, vi } from "vitest";

const { mockCf23Event, mockCf23FloorMaps } = vi.hoisted(() => {
  const event = {
    id: "4861d20f-1a1a-4d01-aefa-4df21a4903a1",
    slug: "cf23",
    name: "Comic Frontier 23 (Comifuro 23)",
    description:
      "Perhelatan akbar Comic Frontier 23 di ICE BSD City (Hall 5-10) bertema Halloween dengan 1.959 circle kreator terkurasi dan area Free Community Booths.",
    venue: "ICE BSD City (Hall 5, 6, 7, 8, 9, 10)",
    bannerImageUrl: "/banner/cf23.jpg",
    startsAt: new Date("2026-10-31T09:00:00+07:00"),
    endsAt: new Date("2026-11-01T18:00:00+07:00"),
    budget: 2500000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const maps = [
    { id: "map-5", eventId: event.id, hall: "Hall 5", name: "Hall 5 - Community" },
    { id: "map-6", eventId: event.id, hall: "Hall 6", name: "Hall 6 - F&B" },
    { id: "map-7", eventId: event.id, hall: "Hall 7", name: "Hall 7 - Artist Alley" },
    { id: "map-8", eventId: event.id, hall: "Hall 8", name: "Hall 8 - Artist Alley" },
    { id: "map-9", eventId: event.id, hall: "Hall 9", name: "Hall 9 - Creators" },
    { id: "map-10", eventId: event.id, hall: "Hall 10", name: "Hall 10 - Main Stage" }
  ];

  return { mockCf23Event: event, mockCf23FloorMaps: maps };
});

vi.mock("@/db", () => {
  return {
    db: {
      query: {
        events: {
          findFirst: vi.fn().mockResolvedValue(mockCf23Event),
          findMany: vi.fn().mockResolvedValue([mockCf23Event])
        },
        floorMaps: {
          findMany: vi.fn().mockResolvedValue(mockCf23FloorMaps)
        },
        circles: {
          findMany: vi.fn().mockResolvedValue([])
        },
        products: {
          findMany: vi.fn().mockResolvedValue([])
        },
        boothLocations: {
          findMany: vi.fn().mockResolvedValue([])
        }
      },
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 0 }]),
          then: vi.fn().mockImplementation((resolve) => resolve([{ value: 1477 }]))
        })
      })
    }
  };
});

import { getActiveEvent, getLandingPageData, getActiveEventTicketPricing } from "@/db/queries";

describe("Database Queries - Active Event (CF 23) & Landing Page Data", () => {
  it("getActiveEvent() mengembalikan CF 23 sebagai event aktif", async () => {
    const active = await getActiveEvent();
    expect(active).toBeDefined();
    expect(active?.slug).toBe("cf23");
    expect(active?.name).toBe("Comic Frontier 23 (Comifuro 23)");
    expect(active?.isActive).toBe(true);
    expect(active?.venue).toBe("ICE BSD City (Hall 5, 6, 7, 8, 9, 10)");
  });

  it("getLandingPageData() mengembalikan statistik CF 23 akurat (1.957 circle, 6 hall venue)", async () => {
    const landing = await getLandingPageData();
    expect(landing).toBeDefined();
    expect(landing?.event.slug).toBe("cf23");
    expect(landing?.stats.totalCircles).toBe(1957);
    expect(landing?.stats.totalHalls).toBe(6);
    expect(landing?.maps.length).toBe(6);
  });

  it("getLandingPageData() menyinkronkan data tiket resmi CF 23 (Ticket2U Rp 75.000 / Rp 130.000)", async () => {
    const landing = await getLandingPageData();
    expect(landing?.ticketPricing).toBeDefined();
    expect(landing?.ticketPricing?.platform).toBe("Ticket2U");
    expect(landing?.ticketPricing?.regularPrice).toBe(75000);
    expect(landing?.ticketPricing?.regularPriceFormatted).toBe("Rp 75.000");
    expect(landing?.ticketPricing?.bundlePrice).toBe(130000);
    expect(landing?.ticketPricing?.bundlePriceFormatted).toBe("Rp 130.000");
    expect(landing?.ticketPricing?.salesModel).toBe("100% Online via Ticket2U");
  });

  it("getActiveEventTicketPricing() mengembalikan pricing tiket Ticket2U resmi untuk CF 23", async () => {
    const ticket = await getActiveEventTicketPricing();
    expect(ticket).toBeDefined();
    expect(ticket?.platform).toBe("Ticket2U");
    expect(ticket?.regularPrice).toBe(75000);
    expect(ticket?.regularPriceFormatted).toBe("Rp 75.000");
    expect(ticket?.bundlePrice).toBe(130000);
    expect(ticket?.bundlePriceFormatted).toBe("Rp 130.000");
  });
});
