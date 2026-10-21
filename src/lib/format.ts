// Định dạng số theo vi-VN (dấu chấm ngăn nghìn, phẩy thập phân).
const LOCALE = "vi-VN";

export function fmtMoney(v: number | null, currency: string, compact = false): string {
  if (v === null || Number.isNaN(v)) return "—";
  if (compact) return fmtMoneyCompact(v, currency);
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

/**
 * Rút gọn tiền theo "tỷ / tr / k" cho MỌI loại tiền: compact của vi-VN in "T"
 * cho tỷ, dễ đọc nhầm thành triệu.
 */
export function fmtMoneyCompact(v: number, currency: string): string {
  const symbol =
    new Intl.NumberFormat(LOCALE, { style: "currency", currency, currencyDisplay: "narrowSymbol" })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency;
  const abs = Math.abs(v);
  const num = (x: number) =>
    new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(x);
  if (abs >= 1e9) return `${num(v / 1e9)} tỷ ${symbol}`;
  if (abs >= 1e6) return `${num(v / 1e6)} tr ${symbol}`;
  if (abs >= 1e3) return `${num(v / 1e3)}k ${symbol}`;
  return `${num(v)} ${symbol}`;
}

/** Rút gọn số không kèm đơn vị tiền ("1,5 tỷ", "500 tr") — cho nhãn trục. */
export function fmtCompact(v: number): string {
  const abs = Math.abs(v);
  const num = (x: number) =>
    new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(x);
  if (abs >= 1e9) return `${num(v / 1e9)} tỷ`;
  if (abs >= 1e6) return `${num(v / 1e6)} tr`;
  if (abs >= 1e3) return `${num(v / 1e3)}k`;
  return num(v);
}

export function fmtPct(v: number | null, digits = 1): string {
  if (v === null || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
}

export function fmtInt(v: number | null): string {
  if (v === null || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat(LOCALE).format(Math.round(v));
}

/** "2026-10-01" → "T10/2026". */
export function fmtMonth(iso: string): string {
  const [y, m] = iso.slice(0, 10).split("-");
  return `T${Number(m)}/${y}`;
}
