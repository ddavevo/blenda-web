"use client";

import { useState } from "react";

interface UrlInputProps {
  onCapture?: (result: {
    image: string;
    metadata: { width: number; height: number };
  }) => void;
}

export function UrlInput({ onCapture }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBlend() {
    if (!url) return;
  
    const normalizedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
  
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Capture failed");
      }
  
      onCapture?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label htmlFor="url">Website URL</label>

      <input
        id="url"
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button type="button" onClick={handleBlend} disabled={loading}>
        {loading ? "Blending…" : "Blend"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}