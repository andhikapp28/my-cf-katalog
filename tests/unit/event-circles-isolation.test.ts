import { describe, expect, it, vi } from "vitest";

const { mockCf22Event, mockCf23Event, mockCircles } = vi.hoisted(() => {
  const cf22 = {
    id: "3ba6a647-3acf-4eeb-b9e4-d53fba95b5e5",
    slug: "cf22",
    name: "Comic Frontier 22 (Comifuro 22)",
    isActive: false,
    startsAt: new Date("2026-05-16T09:00:00+07:00")
  };

  const cf23 = {
    id: "4861d20f-1a1a-4d01-aefa-4df21a4903a1",
    slug: "cf23",
    name: "Comic Frontier 23 (Comifuro 23)",
    isActive: true,
    startsAt: new Date("2026-10-31T09:00:00+07:00")
  };

  const circlesData = [
    {
      id: "circle-1",
      name: "Atelier Hanami",
      notes: "Booth: AA-01 (Day 1)",
      socialLink: "https://x.com/atelier_hanami",
      boothLocations: [
        {
          id: "booth-1",
          eventId: cf22.id,
          circleId: "circle-1",
          boothCode: "AA-01",
          day: "DAY_1",
          floorMap: { id: "map-1", name: "Hall 8" }
        }
      ],
      products: []
    },
    {
      id: "circle-2",
      name: "Sakura Studio",
      notes: "Booth: B-12 (Both Days)",
      socialLink: null,
      boothLocations: [
        {
          id: "booth-2",
          eventId: cf22.id,
          circleId: "circle-2",
          boothCode: "B-12",
          day: "ALL_DAYS",
          floorMap: { id: "map-1", name: "Hall 8" }
        }
      ],
      products: []
    }
  ];

  return { mockCf22Event: cf22, mockCf23Event: cf23, mockCircles: circlesData };
});

vi.mock("@/db", () => {
  return {
    db: {
      query: {
        events: {
          findFirst: vi.fn().mockImplementation(({ where }) => {
            // Check if looking for cf23 or cf22
            return Promise.resolve(mockCf23Event);
          }),
          findMany: vi.fn().mockResolvedValue([mockCf23Event, mockCf22Event])
        },
        circles: {
          findMany: vi.fn().mockImplementation(({ with: withClause }) => {
            // When querying with eventId filter:
            // If event is cf23, boothLocations should be empty!
            return Promise.resolve(mockCircles.map(c => ({
              ...c,
              boothLocations: [] // CF23 has 0 booth allocations
            })));
          })
        },
        boothLocations: {
          findMany: vi.fn().mockResolvedValue([])
        },
        products: {
          findMany: vi.fn().mockResolvedValue([])
        }
      }
    }
  };
});

import { getCatalogCircles, getCircleList } from "@/db/queries";

describe("Event Circles Isolation - CF22 vs CF23 Independence", () => {
  it("getCatalogCircles({ eventId: 'cf23' }) tidak membocorkan circle CF22 sebagai TBA", async () => {
    const circles = await getCatalogCircles({ eventId: "cf23" });
    // Circles list must be empty, NOT circles from CF22 with booth TBA!
    expect(circles).toEqual([]);
    expect(circles).toHaveLength(0);
  });

  it("getCircleList('cf23') mengembalikan array kosong ketika event belum memiliki alokasi booth", async () => {
    const list = await getCircleList("cf23");
    expect(list).toEqual([]);
    expect(list).toHaveLength(0);
  });
});
