"use client";

import { useState, useEffect, useCallback } from "react";
import type { Blenda } from "@/types/blenda";
import { loadBlendas, saveBlendas } from "@/lib/storage";

const STORAGE_KEY = "blenda-web-saved";

// TODO: Read/write localStorage; sync state with storage; provide addBlenda, removeBlenda

export function useSavedBlendas() {
  const [blendas, setBlendas] = useState<Blenda[]>([]);

  useEffect(() => {
    setBlendas(loadBlendas(STORAGE_KEY));
  }, []);

  const addBlenda = useCallback(
    (blenda: Omit<Blenda, "id" | "timestamp">) => {
      const newBlenda: Blenda = {
        ...blenda,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const next = [...blendas, newBlenda];
      setBlendas(next);
      saveBlendas(STORAGE_KEY, next);
    },
    [blendas]
  );

  const removeBlenda = useCallback(
    (id: string) => {
      const next = blendas.filter((b) => b.id !== id);
      setBlendas(next);
      saveBlendas(STORAGE_KEY, next);
    },
    [blendas]
  );

  return { blendas, addBlenda, removeBlenda };
}
