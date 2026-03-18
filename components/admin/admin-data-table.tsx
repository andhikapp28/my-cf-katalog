import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminDataTable({
  children,
  className,
  tableClassName
}: {
  children: ReactNode;
  className?: string;
  tableClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-visible rounded-[28px] border border-line bg-white/90 shadow-soft", className)}>
      <table className={cn("w-full border-separate border-spacing-0 text-sm", tableClassName)}>{children}</table>
    </div>
  );
}

export function AdminTableHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-line bg-brand-50/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-ink-500",
        className
      )}
    >
      {children}
    </th>
  );
}

export function AdminTableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("break-words border-b border-line/80 px-4 py-4 align-top text-sm text-ink-700", className)}>{children}</td>;
}