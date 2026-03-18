"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminCreatePanel } from "./admin-create-panel";

type AdminCreateToggleContextValue = {
  isOpen: boolean;
  isMounted: boolean;
  panelId: string;
  toggle: () => void;
};

const AdminCreateToggleContext = createContext<AdminCreateToggleContextValue | null>(null);

function useAdminCreateToggleContext() {
  const context = useContext(AdminCreateToggleContext);

  if (!context) {
    throw new Error("AdminCreateToggle components must be used within AdminCreateToggle.");
  }

  return context;
}

export function AdminCreateToggle({ children }: { children: ReactNode }) {
  const panelId = useId();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const toggle = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (isOpen) {
      setIsOpen(false);
      closeTimerRef.current = setTimeout(() => {
        setIsMounted(false);
        closeTimerRef.current = null;
      }, 220);
      return;
    }

    setIsMounted(true);

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        setIsOpen(true);
      });
      return;
    }

    setIsOpen(true);
  };

  return (
    <AdminCreateToggleContext.Provider value={{ isOpen, isMounted, panelId, toggle }}>
      {children}
    </AdminCreateToggleContext.Provider>
  );
}

export function AdminCreateToggleButton({
  label,
  closeLabel = "Close form",
  className
}: {
  label: string;
  closeLabel?: string;
  className?: string;
}) {
  const { isOpen, panelId, toggle } = useAdminCreateToggleContext();

  return (
    <Button
      type="button"
      variant={isOpen ? "secondary" : "primary"}
      onClick={toggle}
      aria-expanded={isOpen}
      aria-controls={panelId}
      className={cn("w-full gap-2 sm:w-auto", className)}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {isOpen ? closeLabel : label}
    </Button>
  );
}

export function AdminCreateTogglePanel({
  title,
  description,
  children,
  className,
  panelClassName
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const { isOpen, isMounted, panelId } = useAdminCreateToggleContext();

  if (!isMounted) {
    return null;
  }

  return (
    <div
      id={panelId}
      aria-hidden={!isOpen}
      className={cn(
        "origin-top overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
        isOpen ? "max-h-[2400px] translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-2 opacity-0",
        className
      )}
    >
      <div className={cn("pt-1", !isOpen && "pointer-events-none")}>
        <AdminCreatePanel title={title} description={description} className={panelClassName}>
          {children}
        </AdminCreatePanel>
      </div>
    </div>
  );
}