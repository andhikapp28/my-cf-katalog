"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import { cn } from "@/lib/utils";

const itemClassName =
  "flex w-full items-center rounded-xl px-3 py-2 text-sm text-ink-700 transition hover:bg-brand-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30";

const AdminActionDropdownContext = createContext<{ closeMenu: () => void } | null>(null);

export function AdminActionDropdown({
  children,
  label = "Open actions"
}: {
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleOtherDropdownOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      if (customEvent.detail.id !== dropdownId) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("admin-action-dropdown:open", handleOtherDropdownOpen as EventListener);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("admin-action-dropdown:open", handleOtherDropdownOpen as EventListener);
    };
  }, [dropdownId, open]);

  const toggleOpen = () => {
    setOpen((current) => {
      const next = !current;
      if (next) {
        document.dispatchEvent(new CustomEvent("admin-action-dropdown:open", { detail: { id: dropdownId } }));
      }
      return next;
    });
  };

  const closeMenu = () => setOpen(false);

  return (
    <AdminActionDropdownContext.Provider value={{ closeMenu }}>
      <div ref={containerRef} className="group relative inline-block text-left">
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/90 text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          onClick={toggleOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open ? (
          <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-line bg-white/95 p-2 shadow-soft backdrop-blur">
            <div className="space-y-1">{children}</div>
          </div>
        ) : null}
      </div>
    </AdminActionDropdownContext.Provider>
  );
}

export function AdminActionLink({
  href,
  children,
  destructive = false,
  onClick
}: {
  href: string;
  children: ReactNode;
  destructive?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const context = useContext(AdminActionDropdownContext);

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        context?.closeMenu();
      }}
      className={cn(itemClassName, destructive && "text-rose-700 hover:bg-rose-50 hover:text-rose-800")}
    >
      {children}
    </Link>
  );
}

export function AdminActionButton({
  children,
  className,
  destructive = false,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  destructive?: boolean;
}) {
  const context = useContext(AdminActionDropdownContext);

  return (
    <button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        context?.closeMenu();
      }}
      className={cn(itemClassName, destructive && "text-rose-700 hover:bg-rose-50 hover:text-rose-800", className)}
    >
      {children}
    </button>
  );
}

export function AdminActionDivider() {
  return <div className="my-2 border-t border-line/80" />;
}

export function AdminActionLabel({ children }: { children: ReactNode }) {
  return <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">{children}</p>;
}