import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  asChild?: boolean;
};

export function Button({ className, variant = "primary", asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-brand-600 text-white hover:bg-brand-700",
        variant === "secondary" && "border border-line bg-white/80 text-ink-900 hover:bg-brand-50",
        variant === "ghost" && "text-ink-700 hover:bg-brand-50",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
        className
      )}
      {...props}
    />
  );
}


