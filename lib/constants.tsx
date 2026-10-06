export const productStatuses = [
  "TARGET",
  "PO_OPEN",
  "PO_DONE",
  "PURCHASED",
  "CANCELLED",
  "SOLD_OUT"
] as const;

export const priorities = ["HIGH", "MEDIUM", "LOW"] as const;
export const purchaseTypes = ["PO", "ON_THE_SPOT"] as const;
export const eventDays = ["DAY_1", "DAY_2", "ALL_DAYS"] as const;
export type EventDay = (typeof eventDays)[number];

export const eventDayLabels: Record<EventDay, string> = {
  DAY_1: "Day 1 (Sabtu)",
  DAY_2: "Day 2 (Minggu)",
  ALL_DAYS: "Day 1 & 2"
};

export const eventDayShortLabels: Record<EventDay, string> = {
  DAY_1: "Day 1",
  DAY_2: "Day 2",
  ALL_DAYS: "Both Days"
};

export const eventDayBadgeStyles: Record<EventDay, string> = {
  DAY_1: "bg-blue-500/10 text-blue-700 ring-blue-600/20",
  DAY_2: "bg-purple-500/10 text-purple-700 ring-purple-600/20",
  ALL_DAYS: "bg-teal-500/10 text-teal-700 ring-teal-600/20"
};

export const statusStyles: Record<(typeof productStatuses)[number], string> = {
  TARGET: "bg-stone-100 text-stone-800",
  PO_OPEN: "bg-sky-100 text-sky-800",
  PO_DONE: "bg-indigo-100 text-indigo-800",
  PURCHASED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
  SOLD_OUT: "bg-amber-100 text-amber-800"
};

export const priorityStyles: Record<(typeof priorities)[number], string> = {
  HIGH: "bg-rose-500/10 text-rose-700 ring-rose-600/20",
  MEDIUM: "bg-amber-500/10 text-amber-700 ring-amber-600/20",
  LOW: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20"
};
