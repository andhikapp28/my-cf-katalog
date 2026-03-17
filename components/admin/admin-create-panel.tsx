import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminCreatePanel({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-ink-900">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}