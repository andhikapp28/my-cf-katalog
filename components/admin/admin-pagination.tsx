import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPathWithQuery } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export function AdminPagination({
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
    <div className="flex flex-col gap-3 rounded-[26px] border border-line bg-white/85 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-500">
        Showing <span className="font-semibold text-ink-900">{start}-{end}</span> of <span className="font-semibold text-ink-900">{totalItems}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <PaginationLink href={page > 1 ? buildPathWithQuery(pathname, { ...query, page: String(page - 1) }) : undefined}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </PaginationLink>
        {pages.map((value, index) =>
          value === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-ink-400">...</span>
          ) : (
            <Link
              key={value}
              href={buildPathWithQuery(pathname, { ...query, page: String(value) })}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm transition",
                value === page
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-line bg-white/90 text-ink-700 hover:border-brand-300 hover:bg-brand-50"
              )}
            >
              {value}
            </Link>
          )
        )}
        <PaginationLink href={page < totalPages ? buildPathWithQuery(pathname, { ...query, page: String(page + 1) }) : undefined}>
          Next
          <ChevronRight className="h-4 w-4" />
        </PaginationLink>
      </div>
    </div>
  );
}

function PaginationLink({ href, children }: { href?: string; children: ReactNode }) {
  const className = "inline-flex h-9 items-center gap-1 rounded-full border px-3 text-sm transition";

  if (!href) {
    return <span className={cn(className, "cursor-not-allowed border-line bg-stone-100 text-ink-400")}>{children}</span>;
  }

  return <Link href={href} className={cn(className, "border-line bg-white/90 text-ink-700 hover:border-brand-300 hover:bg-brand-50")}>{children}</Link>;
}

function getVisiblePages(page: number, totalPages: number) {
  const output: Array<number | "ellipsis"> = [];

  for (let current = 1; current <= totalPages; current += 1) {
    const shouldShow = current === 1 || current === totalPages || Math.abs(current - page) <= 1;

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