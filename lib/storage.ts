import type { Blenda, SavedBlendasStorage } from "@/types/blenda";

// TODO: Persist to localStorage; handle SSR (typeof window === 'undefined')

export function loadBlendas(key: string): Blenda[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedBlendasStorage;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBlendas(key: string, blendas: Blenda[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(blendas));
  } catch {
    // TODO: QuotaExceeded or other errors
  }
}
