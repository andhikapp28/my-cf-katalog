import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  boothLocations,
  circles,
  events,
  expenseCategories,
  expenses,
  floorMaps,
  productStatusLogs,
  products
} from "@/db/schema";
import type { Product } from "@/db/schema";

export type ProductListFilters = {
  q?: string;
  status?: string;
  priority?: string;
  circleId?: string;
  eventId?: string;
  sort?: string;
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
    orderBy: [asc(floorMaps.name)],
    with: {
      event: true
    }
  });
}

export async function getExpenseCategories() {
  return db.query.expenseCategories.findMany({
    orderBy: [asc(expenseCategories.name)]
  });
}

export async function getProducts(filters: ProductListFilters = {}) {
  const conditions = [];

  if (filters.q) {
    conditions.push(ilike(products.name, `%${filters.q}%`));
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

  const orderBy =
    filters.sort === "price"
      ? [desc(products.price)]
      : filters.sort === "updated"
        ? [desc(products.updatedAt)]
        : [asc(products.poDeadline), desc(products.updatedAt)];

  return db.query.products.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy,
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
      circle: true,
      statusLogs: {
        orderBy: [desc(productStatusLogs.createdAt)],
        with: {
          createdByUser: true
        }
      }
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

  const [eventProducts, eventExpenses, locations] = await Promise.all([
    db.query.products.findMany({
      where: eq(products.eventId, selectedEvent.id),
      with: {
        circle: true
      },
      orderBy: [desc(products.updatedAt)]
    }),
    db.query.expenses.findMany({
      where: eq(expenses.eventId, selectedEvent.id),
      with: {
        category: true,
        product: true
      },
      orderBy: [desc(expenses.expenseDate)]
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
  const totalActual = eventExpenses
    .filter((item) => item.isActual)
    .reduce((sum, item) => sum + item.amount, 0);

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

  return {
    selectedEvent,
    totalItems: eventProducts.length,
    totalEstimated,
    totalActual,
    remainingBudget: selectedEvent.budget - totalActual,
    statusCounts,
    highPriorityItems,
    upcomingDeadlines,
    priorityCircles,
    products: eventProducts,
    expenses: eventExpenses,
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
      productCount: count(products.id)
    })
    .from(events)
    .leftJoin(products, eq(products.eventId, events.id))
    .groupBy(events.id)
    .orderBy(desc(events.startsAt));
}

export async function getExpenseSummary(eventId?: string) {
  const targetEvent = eventId
    ? await db.query.events.findFirst({ where: eq(events.id, eventId) })
    : await getActiveEvent();

  if (!targetEvent) {
    return null;
  }

  const [categoryBreakdown, records, plannedFromItems] = await Promise.all([
    db
      .select({
        categoryId: expenses.categoryId,
        categoryName: expenseCategories.name,
        total: sql<number>`sum(${expenses.amount})`
      })
      .from(expenses)
      .innerJoin(expenseCategories, eq(expenseCategories.id, expenses.categoryId))
      .where(and(eq(expenses.eventId, targetEvent.id), eq(expenses.isActual, true)))
      .groupBy(expenses.categoryId, expenseCategories.name),
    db.query.expenses.findMany({
      where: eq(expenses.eventId, targetEvent.id),
      with: {
        category: true,
        product: true
      },
      orderBy: [desc(expenses.expenseDate)]
    }),
    db
      .select({
        total: sql<number>`coalesce(sum(${products.price} * ${products.quantity}), 0)`
      })
      .from(products)
      .where(
        and(eq(products.eventId, targetEvent.id), inArray(products.status, ["TARGET", "PO_OPEN", "PO_DONE", "PURCHASED"]))
      )
  ]);

  const actual = records.filter((item) => item.isActual).reduce((sum, item) => sum + item.amount, 0);

  return {
    event: targetEvent,
    records,
    categoryBreakdown,
    totalBudget: targetEvent.budget,
    totalPlanned: plannedFromItems[0]?.total ?? 0,
    totalActual: actual,
    difference: targetEvent.budget - actual
  };
}

export async function getAdminOverviewCounts() {
  const [eventCount, circleCount, productCount, expenseCount] = await Promise.all([
    db.select({ value: count() }).from(events),
    db.select({ value: count() }).from(circles),
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(expenses)
  ]);

  return {
    eventCount: eventCount[0]?.value ?? 0,
    circleCount: circleCount[0]?.value ?? 0,
    productCount: productCount[0]?.value ?? 0,
    expenseCount: expenseCount[0]?.value ?? 0
  };
}

export async function getAdminProductsForEvent(eventId?: string) {
  return db.query.products.findMany({
    where: eventId ? eq(products.eventId, eventId) : undefined,
    with: {
      event: true,
      circle: true
    },
    orderBy: [desc(products.updatedAt)]
  });
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

export async function getExpensesAdmin(eventId?: string) {
  return db.query.expenses.findMany({
    where: eventId ? eq(expenses.eventId, eventId) : undefined,
    orderBy: [desc(expenses.expenseDate), desc(expenses.createdAt)],
    with: {
      event: true,
      category: true,
      product: true
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


