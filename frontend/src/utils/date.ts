export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
export function addWeeks(from: Date, w: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + Math.round(w) * 7);
  return d;
}
export function addMonths(from: Date, m: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + Math.round(m));
  return d;
}
export function weeksBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24 * 7)));
}
export function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s.trim());
}
export function fmtDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
