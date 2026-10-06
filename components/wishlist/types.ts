export type WishlistProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  status: string;
  targetDay: "DAY_1" | "DAY_2" | "ALL_DAYS" | string;
  isRush: boolean;
  purchaseType: "PO" | "ON_THE_SPOT" | string;
  productLink: string | null;
  poDeadline: string | null;
  poPickupNotes: string | null;
  notes: string | null;
  circleId: string;
  circleName: string;
  eventId: string;
  eventName: string;
  boothCode: string | null;
  hall: string | null;
  floorMapId: string | null;
};

export type BoothGroup = {
  circleId: string;
  circleName: string;
  boothCode: string;
  hall: string;
  floorMapId: string | null;
  items: WishlistProduct[];
  allPurchased: boolean;
  hasRush: boolean;
};

export type WishlistTabFilter = "ALL" | "DAY_1" | "DAY_2" | "RUSH";
