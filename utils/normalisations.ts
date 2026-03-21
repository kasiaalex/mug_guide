/** Normalize Excel row so column names are lowercase (e.g. "City" -> "city") */
export function normalizeRowKeys<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v])
    ) as Record<string, unknown>;
  }

/** Parse coordinate from Excel (handles comma decimal and string numbers) */
export function parseCoord(value: unknown): number {
    if (value == null) return NaN;
    const s = String(value).trim().replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }