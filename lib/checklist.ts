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
};

/**
 * Urutan checklist: prioritas HIGH dulu (paling penting diburu duluan saat
 * jalan di venue), lalu dikelompokkan per circle (biar belanja per booth
 * tidak bolak-balik), lalu nama produk untuk urutan stabil.
 */
export function sortChecklistItems<T extends SortableChecklistItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
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
