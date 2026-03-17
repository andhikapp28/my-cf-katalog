import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminCardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-5 md:grid-cols-2", className)}>{children}</div>;
}