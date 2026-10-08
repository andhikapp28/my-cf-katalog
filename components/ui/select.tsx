import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-ink-900 transition focus:border-brand-600 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className
      )}
      {...props}
    />
  );
}


