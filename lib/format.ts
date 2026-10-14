export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatDateRange(
  startsAt?: Date | string | null,
  endsAt?: Date | string | null
): string {
  if (!startsAt) return "-";
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  if (!end || start.toDateString() === end.toDateString()) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(start);
  }

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(start);
  const endMonth = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(end);
  const year = end.getFullYear();

  if (startMonth === endMonth && start.getFullYear() === end.getFullYear()) {
    return `${startDay} - ${endDay} ${endMonth} ${year}`;
  }

  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
}



