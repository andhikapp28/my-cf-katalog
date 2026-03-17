import type { ReactNode } from "react";
import {
  Banknote,
  Boxes,
  LayoutDashboard,
  Map,
  MapPinned,
  Settings,
  ShoppingBag,
  Users2
} from "lucide-react";

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
export const paymentMethods = ["CASH", "QRIS", "CARD", "BANK_TRANSFER", "E_WALLET", "OTHER"] as const;

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

export const adminNavigation: Array<{ href: string; label: string; icon: ReactNode }> = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/events", label: "Events", icon: <Boxes className="h-4 w-4" /> },
  { href: "/admin/circles", label: "Circles", icon: <Users2 className="h-4 w-4" /> },
  { href: "/admin/floor-maps", label: "Floor Maps", icon: <Map className="h-4 w-4" /> },
  { href: "/admin/booths", label: "Booth Locations", icon: <MapPinned className="h-4 w-4" /> },
  { href: "/admin/products", label: "Products", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/admin/expenses", label: "Expenses", icon: <Banknote className="h-4 w-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> }
];



