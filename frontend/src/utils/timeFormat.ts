// src/utils/timeFormat.ts
export function digitsToHMS(d: string): string | null {
  if (d.length !== 6) return null;
  const hh = Number(d.slice(0, 2)),
    mm = Number(d.slice(2, 4)),
    ss = Number(d.slice(4, 6));
  if (![hh, mm, ss].every(Number.isFinite) || mm > 59 || ss > 59 || hh < 0)
    return null;
  return `${String(hh)}:${String(mm).padStart(2, "0")}:${String(ss).padStart(
    2,
    "0"
  )}`;
}
export function digitsToMMSS(d: string): string | null {
  if (d.length !== 4) return null;
  const mm = Number(d.slice(0, 2)),
    ss = Number(d.slice(2, 4));
  if (
    ![mm, ss].every(Number.isFinite) ||
    mm > 59 ||
    ss > 59 ||
    mm < 0 ||
    ss < 0
  )
    return null;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
export function maskFromDigits(digits: string, template: string): string {
  const d = digits.replace(/\D+/g, "");
  let i = 0,
    out = "";
  for (const ch of template)
    out += /[HMS]/.test(ch) ? (i < d.length ? d[i++] : ch) : ch;
  return out;
}
export const formatHMSFromDigits = (d: string) => maskFromDigits(d, "HH:MM:SS");
export const formatMMSSFromDigits = (d: string) => maskFromDigits(d, "MM:SS");

// cursor helpers can stay in component (they are UI-ish), but could be extracted too:
export function hmsCaretIndex(len: number): number {
  switch (Math.max(0, Math.min(6, len))) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 2:
      return 3;
    case 3:
      return 4;
    case 4:
      return 6;
    case 5:
      return 7;
    default:
      return 8;
  }
}
export function mmssCaretIndex(len: number): number {
  switch (Math.max(0, Math.min(4, len))) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 2:
      return 3;
    case 3:
      return 4;
    default:
      return 5;
  }
}
