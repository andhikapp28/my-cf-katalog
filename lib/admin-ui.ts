export type SearchParams = Record<string, string | string[] | undefined>;

export function getSearchParam(params: SearchParams, key: string) {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

export function getPageParam(params: SearchParams, key = "page") {
  const value = Number.parseInt(getSearchParam(params, key) ?? "1", 10);
  return Number.isNaN(value) || value < 1 ? 1 : value;
}

export function buildPathWithQuery(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export function toDateTimeLocalValue(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

export function truncateText(value?: string | null, maxLength = 72) {
  if (!value) {
    return "-";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

export function compactUrl(value?: string | null, maxLength = 34) {
  if (!value) {
    return "-";
  }

  try {
    const url = new URL(value);
    const label = `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
    return truncateText(label.replace(/^www\./, ""), maxLength);
  } catch {
    return truncateText(value.replace(/^https?:\/\//, ""), maxLength);
  }
}

export function formatEnumLabel(value?: string | null) {
  if (!value) {
    return "-";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

export function paginateItems<T>(items: T[], inputPage: number, pageSize: number) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(inputPage, 1), totalPages);
  const startIndex = (page - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page,
    pageSize,
    totalItems,
    totalPages
  };
}