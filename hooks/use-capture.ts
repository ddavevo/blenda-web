"use client";

import { useState, useCallback } from "react";
import type { CaptureResult } from "@/types/blenda";

// TODO: Call POST /api/capture with url; return { data, loading, error }; on success return CaptureResult

export function useCapture() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async (url: string): Promise<CaptureResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error ?? `Capture failed: ${res.status}`);
        return null;
      }
      const data = await res.json();
      return data as CaptureResult;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Capture failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { capture, loading, error };
}
