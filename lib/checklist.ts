import { priorities, productStatuses } from "./constants";

/**
 * Status produk yang masih relevan untuk mode checklist di venue: item yang
 * masih perlu "diburu"/dibeli. Status akhir (PURCHASED/CANCELLED/SOLD_OUT)
 * sengaja tidak masuk daftar aktif checklist supaya daftar tetap ringkas
 * sambil jalan — tapi tetap bisa dilihat riwayatnya lewat log status produk.
 */
export const checklistStatuses = ["TARGET", "PO_OPEN", "PO_DONE"] as const;
export type ChecklistStatus = (typeof checklistStatuses)[number];

export function isChecklistStatus(status: string): status is ChecklistStatus {
  return (checklistStatuses as readonly string[]).includes(status);
}

const priorityWeight: Record<(typeof priorities)[number], number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2
};

export type SortableChecklistItem = {
  priority: (typeof priorities)[number];
  circleName: string;
  name: string;
  isRush?: boolean;
};

/**
 * Urutan checklist:
 * 1. Item "RUSH" (rebutan pagi hari-H) didahulukan paling awal agar tidak kehabisan.
 * 2. Prioritas HIGH dulu (paling penting diburu saat jalan di venue).
 * 3. Dikelompokkan per circle (biar belanja per booth tidak bolak-balik).
 * 4. Nama produk untuk urutan stabil.
 */
export function sortChecklistItems<T extends SortableChecklistItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aRush = a.isRush ? 1 : 0;
    const bRush = b.isRush ? 1 : 0;
    if (aRush !== bRush) {
      return bRush - aRush;
    }

    const weightDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
    if (weightDiff !== 0) {
      return weightDiff;
    }

    const circleDiff = a.circleName.localeCompare(b.circleName);
    if (circleDiff !== 0) {
      return circleDiff;
    }

    return a.name.localeCompare(b.name);
  });
}

export type ChecklistDayFilter = "ALL" | "DAY_1" | "DAY_2" | "RUSH_ONLY";

export function filterChecklistItemsByDay<T extends { targetDay?: string; isRush?: boolean }>(
  items: T[],
  filter: ChecklistDayFilter
): T[] {
  if (filter === "ALL") {
    return items;
  }
  if (filter === "RUSH_ONLY") {
    return items.filter((item) => Boolean(item.isRush));
  }
  return items.filter((item) => !item.targetDay || item.targetDay === "ALL_DAYS" || item.targetDay === filter);
}

export type ChecklistStatusFilter = "ALL" | ChecklistStatus;

export function filterChecklistItemsByStatus<T extends { status: string }>(
  items: T[],
  filter: ChecklistStatusFilter
): T[] {
  if (filter === "ALL") {
    return items;
  }

  return items.filter((item) => item.status === filter);
}

export function isDoneProductStatus(status: string) {
  return status === "PURCHASED" || status === "CANCELLED" || status === "SOLD_OUT";
}

// Re-export supaya caller tidak perlu import langsung dari constants untuk
// keperluan yang murni terkait checklist.
export const allProductStatuses = productStatuses;
