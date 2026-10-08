import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPathWithQuery } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  totalItems,
  pathname,
  query
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  pathname: string;
  query: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);
  const pages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="Navigasi Halaman"
      className="flex flex-col gap-3 rounded-2xl border border-line bg-white/85 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-ink-700">
        Showing <span className="font-semibold text-ink-900">{start}-{end}</span> of{" "}
        <span className="font-semibold text-ink-900">{totalItems}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <PaginationLink
          aria-label="Halaman Sebelumnya"
          href={
            page > 1
              ? buildPathWithQuery(pathname, { ...query, page: String(page - 1) })
              : undefined
          }
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </PaginationLink>
        {pages.map((value, index) =>
          value === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-ink-700 select-none">
              ...
            </span>
          ) : (
            <Link
              key={value}
              href={buildPathWithQuery(pathname, { ...query, page: String(value) })}
              aria-label={`Halaman ${value}`}
              aria-current={value === page ? "page" : undefined}
              className={cn(
                "flex min-h-[44px] min-w-[44px] sm:h-9 sm:min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-mono transition touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]",
                value === page
                  ? "border-brand-600 bg-brand-600 text-white font-bold"
                  : "border-line bg-white/90 text-ink-700 hover:border-brand-300 hover:bg-brand-50"
              )}
            >
              {value}
            </Link>
          )
        )}
        <PaginationLink
          aria-label="Halaman Selanjutnya"
          href={
            page < totalPages
              ? buildPathWithQuery(pathname, { ...query, page: String(page + 1) })
              : undefined
          }
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  href,
  children,
  "aria-label": ariaLabel
}: {
  href?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const className =
    "inline-flex min-h-[44px] sm:h-9 items-center gap-1.5 rounded-xl border px-3.5 sm:px-3 text-sm font-mono transition touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

  if (!href) {
    return (
      <span
        aria-disabled="true"
        aria-label={ariaLabel}
        className={cn(className, "cursor-not-allowed border-line bg-stone-100 text-zinc-500 select-none")}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        className,
        "border-line bg-white/90 text-ink-700 hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98]"
      )}
    >
      {children}
    </Link>
  );
}

function getVisiblePages(page: number, totalPages: number) {
  const output: Array<number | "ellipsis"> = [];

  for (let current = 1; current <= totalPages; current += 1) {
    const shouldShow =
      current === 1 || current === totalPages || Math.abs(current - page) <= 1;

    if (shouldShow) {
      output.push(current);
      continue;
    }

    if (output[output.length - 1] !== "ellipsis") {
      output.push("ellipsis");
    }
  }

  return output;
}
