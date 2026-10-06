import "server-only";
import { and, asc, count, desc, eq, gt, ilike, inArray, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  boothLocations,
  circles,
  events,
  floorMaps,
  products
} from "@/db/schema";
import type { Product } from "@/db/schema";
import { checklistStatuses, sortChecklistItems } from "@/lib/checklist";

export type ProductListFilters = {
  q?: string;
  fandom?: string;
  status?: string;
  priority?: string;
  circleId?: string;
  eventId?: string;
  sort?: string;
  targetDay?: string;
  isRush?: boolean;
  paidOnly?: boolean;
  limit?: number;
  offset?: number;
};

export async function getActiveEvent() {
  return db.query.events.findFirst({
    where: eq(events.isActive, true),
    orderBy: [desc(events.startsAt)]
  });
}

export async function getEventList() {
  return db.query.events.findMany({
    orderBy: [desc(events.startsAt), desc(events.createdAt)]
  });
}

export async function getCircleList() {
  return db.query.circles.findMany({
    orderBy: [asc(circles.name)]
  });
}

export async function getFloorMapsList(eventId?: string) {
  return db.query.floorMaps.findMany({
    where: eventId ? eq(floorMaps.eventId, eventId) : undefined,
    orderBy: [asc(floorMaps.hall), asc(floorMaps.name)],
    with: {
      event: true
    }
  });
}

export async function getProducts(filters: ProductListFilters = {}) {
  const conditions = [];

  // Pencarian teks terpadu (q): nama produk, notes produk, nama circle, notes circle, atau kode booth
  if (filters.q && filters.q.trim()) {
    const qTrim = filters.q.trim();
    const term = `%${qTrim}%`;

    const matchingCircles = await db
      .select({ id: circles.id })
      .from(circles)
      .leftJoin(boothLocations, eq(boothLocations.circleId, circles.id))
      .where(
        or(
          ilike(circles.name, term),
          ilike(circles.notes, term),
          ilike(boothLocations.boothCode, term)
        )
      );

    const circleIds = Array.from(new Set(matchingCircles.map((c) => c.id)));

    const qOrConditions = [
      ilike(products.name, term),
      ilike(products.notes, term)
    ];

    if (circleIds.length > 0) {
      qOrConditions.push(inArray(products.circleId, circleIds));
    }

    conditions.push(or(...qOrConditions));
  }

  // Filter fandom khusus (misal dari quick tag fandom)
  if (filters.fandom && filters.fandom.trim()) {
    const fandomTrim = filters.fandom.trim();
    const fandomTerm = `%${fandomTrim}%`;

    const matchingFandomCircles = await db
      .select({ id: circles.id })
      .from(circles)
      .where(
        or(
          ilike(circles.name, fandomTerm),
          ilike(circles.notes, fandomTerm)
        )
      );

    const fandomCircleIds = Array.from(new Set(matchingFandomCircles.map((c) => c.id)));

    const fandomOrConditions = [
      ilike(products.name, fandomTerm),
      ilike(products.notes, fandomTerm)
    ];

    if (fandomCircleIds.length > 0) {
      fandomOrConditions.push(inArray(products.circleId, fandomCircleIds));
    }

    conditions.push(or(...fandomOrConditions));
  }

  if (filters.status) {
    conditions.push(eq(products.status, filters.status as Product["status"]));
  }

  if (filters.priority) {
    conditions.push(eq(products.priority, filters.priority as Product["priority"]));
  }

  if (filters.circleId) {
    conditions.push(eq(products.circleId, filters.circleId));
  }

  if (filters.eventId) {
    conditions.push(eq(products.eventId, filters.eventId));
  }

  if (filters.targetDay && filters.targetDay !== "ALL_DAYS" && filters.targetDay !== "ALL") {
    conditions.push(
      or(
        eq(products.targetDay, filters.targetDay as Product["targetDay"]),
        eq(products.targetDay, "ALL_DAYS")
      )
    );
  }

  if (typeof filters.isRush === "boolean") {
    conditions.push(eq(products.isRush, filters.isRush));
  }

  if (filters.paidOnly) {
    conditions.push(gt(products.price, 0));
  }

  let orderBy;
  switch (filters.sort) {
    case "price":
      orderBy = [desc(products.price), desc(products.updatedAt)];
      break;
    case "price_asc":
      orderBy = [asc(products.price), desc(products.updatedAt)];
      break;
    case "deadline":
      orderBy = [asc(products.poDeadline), desc(products.updatedAt)];
      break;
    case "name":
      orderBy = [asc(products.name)];
      break;
    case "updated":
    case "latest":
    default:
      orderBy = [desc(products.updatedAt), desc(products.createdAt)];
      break;
  }

  return db.query.products.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy,
    limit: filters.limit,
    offset: filters.offset,
    with: {
      event: true,
      circle: true
    }
  });
}

export async function getProductById(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      event: true,
      circle: true
    }
  });
}

export async function getBoothLocationForCircle(eventId: string, circleId: string) {
  return db.query.boothLocations.findFirst({
    where: and(eq(boothLocations.eventId, eventId), eq(boothLocations.circleId, circleId)),
    with: {
      floorMap: true
    }
  });
}

export async function getCircleById(id: string) {
  const circle = await db.query.circles.findFirst({
    where: eq(circles.id, id)
  });

  if (!circle) {
    return null;
  }

  const [circleProducts, locations] = await Promise.all([
    db.query.products.findMany({
      where: eq(products.circleId, id),
      orderBy: [desc(products.updatedAt)],
      with: {
        event: true
      }
    }),
    db.query.boothLocations.findMany({
      where: eq(boothLocations.circleId, id),
      with: {
        event: true,
        floorMap: true
      }
    })
  ]);

  return {
    ...circle,
    products: circleProducts,
    locations
  };
}

export async function getMapById(id: string) {
  return db.query.floorMaps.findFirst({
    where: eq(floorMaps.id, id),
    with: {
      event: true,
      boothLocations: {
        with: {
          circle: true
        }
      }
    }
  });
}

export async function getDashboardData(eventId?: string) {
  const selectedEvent =
    (eventId
      ? await db.query.events.findFirst({ where: eq(events.id, eventId) })
      : await getActiveEvent()) ?? (await db.query.events.findFirst({ orderBy: [desc(events.startsAt)] }));

  if (!selectedEvent) {
    return null;
  }

  const [eventProducts, locations] = await Promise.all([
    db.query.products.findMany({
      where: eq(products.eventId, selectedEvent.id),
      with: {
        circle: true
      },
      orderBy: [desc(products.updatedAt)]
    }),
    db.query.boothLocations.findMany({
      where: eq(boothLocations.eventId, selectedEvent.id),
      with: {
        circle: true,
        floorMap: true
      }
    })
  ]);

  const totalEstimated = eventProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const purchasedProducts = eventProducts.filter((item) => item.status === "PURCHASED");
  const totalActual = purchasedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const statusCounts = eventProducts.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  const highPriorityItems = eventProducts.filter((item) => item.priority === "HIGH").slice(0, 6);
  const upcomingDeadlines = eventProducts
    .filter((item) => item.poDeadline)
    .sort((a, b) => new Date(a.poDeadline ?? "").getTime() - new Date(b.poDeadline ?? "").getTime())
    .slice(0, 5);

  const priorityCircles = Array.from(
    new Map(
      highPriorityItems.map((item) => {
        const location = locations.find((candidate) => candidate.circleId === item.circleId);
        return [
          item.circleId,
          {
            circleId: item.circleId,
            circleName: item.circle.name,
            boothCode: location?.boothCode ?? "-",
            floorMapId: location?.floorMapId ?? null
          }
        ];
      })
    ).values()
  ).slice(0, 5);

  const cashNeeded = eventProducts
    .filter(
      (item) =>
        item.purchaseType === "ON_THE_SPOT" &&
        (item.status === "TARGET" || item.status === "PO_OPEN" || item.status === "PO_DONE")
    )
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const rushItems = eventProducts.filter(
    (item) => item.isRush && (item.status === "TARGET" || item.status === "PO_OPEN" || item.status === "PO_DONE")
  );

  const day1Estimated = eventProducts
    .filter((item) => item.targetDay === "DAY_1" || item.targetDay === "ALL_DAYS")
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const day2Estimated = eventProducts
    .filter((item) => item.targetDay === "DAY_2" || item.targetDay === "ALL_DAYS")
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    selectedEvent,
    totalItems: eventProducts.length,
    totalEstimated,
    totalActual,
    remainingBudget: selectedEvent.budget - totalEstimated,
    cashNeeded,
    rushItems,
    day1Estimated,
    day2Estimated,
    statusCounts,
    highPriorityItems,
    upcomingDeadlines,
    priorityCircles,
    products: eventProducts,
    locations
  };
}

export async function getEventsWithCounts() {
  return db
    .select({
      id: events.id,
      name: events.name,
      slug: events.slug,
      isActive: events.isActive,
      startsAt: events.startsAt,
      budget: events.budget,
      bannerImageUrl: events.bannerImageUrl,
      productCount: count(products.id)
    })
    .from(events)
    .leftJoin(products, eq(products.eventId, events.id))
    .groupBy(events.id)
    .orderBy(desc(events.startsAt));
}

export async function getBooths(eventId?: string) {
  return db.query.boothLocations.findMany({
    where: eventId ? eq(boothLocations.eventId, eventId) : undefined,
    orderBy: [asc(boothLocations.boothCode)],
    with: {
      event: true,
      circle: true,
      floorMap: true
    }
  });
}

export async function getRelatedProductsByCircle(eventId: string, circleId: string) {
  return db.query.products.findMany({
    where: and(eq(products.eventId, eventId), eq(products.circleId, circleId)),
    orderBy: [desc(products.updatedAt)]
  });
}

export async function hasSeedData() {
  const existingEvent = await db.query.events.findFirst({
    columns: { id: true }
  });

  return Boolean(existingEvent);
}

export async function getChecklistData(eventId?: string, limit = 100) {
  const selectedEvent =
    (eventId
      ? await db.query.events.findFirst({ where: eq(events.id, eventId) })
      : await getActiveEvent()) ?? (await db.query.events.findFirst({ orderBy: [desc(events.startsAt)] }));

  if (!selectedEvent) {
    return null;
  }

  const [items, locations] = await Promise.all([
    db.query.products.findMany({
      where: and(eq(products.eventId, selectedEvent.id), inArray(products.status, [...checklistStatuses])),
      orderBy: [desc(products.isRush), desc(products.priority), desc(products.updatedAt)],
      limit,
      with: { circle: true }
    }),
    db.query.boothLocations.findMany({
      where: eq(boothLocations.eventId, selectedEvent.id)
    })
  ]);

  const boothByCircle = new Map(locations.map((location) => [location.circleId, location]));

  const enriched = items.map((item) => {
    const booth = boothByCircle.get(item.circleId);
    return {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
      priority: item.priority,
      status: item.status,
      targetDay: item.targetDay,
      isRush: item.isRush,
      poPickupNotes: item.poPickupNotes,
      notes: item.notes,
      productLink: item.productLink,
      circleId: item.circleId,
      circleName: item.circle.name,
      boothCode: booth?.boothCode ?? null,
      floorMapId: booth?.floorMapId ?? null
    };
  });

  return {
    event: selectedEvent,
    items: sortChecklistItems(enriched)
  };
}

export async function getUpcomingDeadlines(limit = 8) {
  return db.query.products.findMany({
    where: and(isNotNull(products.poDeadline), inArray(products.status, ["TARGET", "PO_OPEN"])),
    orderBy: [asc(products.poDeadline)],
    limit,
    with: {
      event: true,
      circle: true
    }
  });
}

export async function getLandingPageData() {
  const activeEvent = (await getActiveEvent()) ?? (await db.query.events.findFirst({ orderBy: [desc(events.startsAt)] }));

  if (!activeEvent) {
    return null;
  }

  const [
    totalCirclesResult,
    totalProductsResult,
    maps,
    featuredCircles,
    featuredProducts,
    allLocations
  ] = await Promise.all([
    db.select({ value: count() }).from(circles),
    db.select({ value: count() }).from(products).where(eq(products.eventId, activeEvent.id)),
    db.query.floorMaps.findMany({
      where: eq(floorMaps.eventId, activeEvent.id),
      orderBy: [asc(floorMaps.hall), asc(floorMaps.name)]
    }),
    db.query.circles.findMany({
      limit: 8,
      orderBy: [asc(circles.name)],
      with: {
        boothLocations: {
          where: eq(boothLocations.eventId, activeEvent.id),
          with: { floorMap: true }
        },
        products: {
          where: eq(products.eventId, activeEvent.id),
          limit: 3
        }
      }
    }),
    db.query.products.findMany({
      where: and(eq(products.eventId, activeEvent.id), isNotNull(products.imageUrl)),
      limit: 8,
      orderBy: [desc(products.isRush), desc(products.priority), desc(products.updatedAt)],
      with: {
        circle: true
      }
    }),
    db.query.boothLocations.findMany({
      where: eq(boothLocations.eventId, activeEvent.id)
    })
  ]);

  return {
    event: activeEvent,
    stats: {
      totalCircles: totalCirclesResult[0]?.value ?? 0,
      totalProducts: totalProductsResult[0]?.value ?? 0,
      totalHalls: maps.length || 2,
      totalBooths: allLocations.length
    },
    maps,
    featuredCircles,
    featuredProducts,
    locations: allLocations
  };
}
