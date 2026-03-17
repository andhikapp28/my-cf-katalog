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
    <div className={cn("rounded-[28px] border border-line bg-white/90 shadow-soft", className)}>
      <div className="overflow-x-auto overflow-y-visible">
        <table className={cn("min-w-full border-separate border-spacing-0 text-sm", tableClassName)}>{children}</table>
      </div>
    </div>
  );
}

export function AdminTableHead({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap border-b border-line bg-brand-50/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-ink-500", className)}>{children}</th>;
}

export function AdminTableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("border-b border-line/80 px-4 py-4 align-top text-sm text-ink-700", className)}>{children}</td>;
}