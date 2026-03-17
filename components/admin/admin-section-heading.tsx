import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminSectionHeading({
  title,
  description,
  actions,
  className
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <h2 className="font-[var(--font-display)] text-2xl font-semibold text-ink-900">{title}</h2>
        {description ? <p className="mt-2 text-sm text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}