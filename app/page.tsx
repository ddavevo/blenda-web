"use client";

import { useState } from "react";
import type { CaptureResult } from "@/types/blenda";
import { UrlInput } from "@/components/url-input";
import { BlendContainer } from "@/components/blend-container";
import { ColorOutput } from "@/components/color-output";
import { SavedBlendas } from "@/components/saved-blendas";

export default function Home() {
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Blend-a-Web</h1>
      <UrlInput onCapture={(result) => setCaptureResult(result)} />
      <BlendContainer
        captureImage={captureResult?.image}
        captureMetadata={captureResult?.metadata}
      />
      <ColorOutput />
      <SavedBlendas />
    </main>
  );
}
