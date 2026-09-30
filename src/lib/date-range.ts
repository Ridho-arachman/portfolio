const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 365;

export interface DateRangeFilter {
  gte?: Date;
  lte?: Date;
}

export interface ParsedDateRange {
  from?: Date;
  to?: Date;
  whereCreatedAt?: DateRangeFilter;
}

function parseDateParam(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/**
 * Parse `?from=&to=` (ISO date string) jadi rentang Date.
 * Tidak pernah throw: param invalid -> undefined agar UI tidak pecah.
 * Clamp maksimal 365 hari agar query tidak berat.
 *
 * @param defaultDays bila diisi, `from` kosong fallback ke `to - defaultDays`.
 *   Analytics memanggil dengan 30 (backward-compat 30 hari terakhir),
 *   dashboard-stats memanggil tanpa argumen (tanpa param = all-time).
 */
export function parseDateRange(
  searchParams: URLSearchParams,
  defaultDays?: number,
): ParsedDateRange {
  const now = new Date();

  const rawFrom = parseDateParam(searchParams.get("from"));
  const rawTo = parseDateParam(searchParams.get("to"));

  // `to` invalid/kosong -> now; `from` invalid -> undefined (fallback default di bawah).
  const to = rawTo ?? now;
  let from = rawFrom;

  // from > to -> abaikan from (fallback default), jangan throw 400.
  if (from && from > to) {
    from = undefined;
  }

  if (!from && defaultDays !== undefined && defaultDays > 0) {
    from = new Date(to.getTime() - defaultDays * DAY_MS);
  }

  if (!from) {
    // Tanpa filter: caller (dashboard-stats) berarti all-time.
    // Bila `to` eksplisit diberikan saja, tetap hormati sebagai batas atas.
    if (!rawTo) {
      return { from: undefined, to: undefined, whereCreatedAt: undefined };
    }
    return { from: undefined, to, whereCreatedAt: { lte: to } };
  }

  // Clamp maksimal 365 hari: geser `from` maju bila rentang terlalu panjang.
  const maxSpanMs = MAX_RANGE_DAYS * DAY_MS;
  if (to.getTime() - from.getTime() > maxSpanMs) {
    from = new Date(to.getTime() - maxSpanMs);
  }

  return {
    from,
    to,
    whereCreatedAt: { gte: from, lte: to },
  };
}

/** Deret tanggal per hari (startOfDay) dari from..to inklusif, sudah di-clamp 365 hari. */
export function eachDayInRange(from: Date, to: Date): Date[] {
  const start = startOfDay(from);
  const end = startOfDay(to);
  const days: Date[] = [];
  for (
    let d = new Date(start);
    d <= end && days.length <= MAX_RANGE_DAYS + 1;
    d = new Date(d.getTime() + DAY_MS)
  ) {
    days.push(new Date(d));
  }
  return days;
}

export { startOfDay, endOfDay };
