import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminField({
  label,
  hint,
  required,
  children,
  className
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink-800">
          {label}
          {required ? <span className="ml-1 text-brand-600">*</span> : null}
        </span>
        {hint ? <span className="text-xs text-ink-500">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}