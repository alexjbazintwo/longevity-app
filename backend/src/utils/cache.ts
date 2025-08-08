// src/utils/cache.ts
const cache = new Map<string, any>();

export const resultCache = {
  get: (key: string) => cache.get(key),
  set: (key: string, value: any) => cache.set(key, value),
};
