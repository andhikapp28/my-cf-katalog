import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[108px] w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink-900 transition placeholder:text-zinc-500 focus:border-brand-600 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className
      )}
      {...props}
    />
  );
}


