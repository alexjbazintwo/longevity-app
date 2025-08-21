// src/utils/objects.ts
export function mergeDefined<T extends object>(base: T, delta?: Partial<T>): T {
  if (!delta) return base;
  const out = { ...base } as T;
  for (const k of Object.keys(delta) as Array<keyof T>) {
    const v = delta[k];
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}
