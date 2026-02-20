"use client";

// Wrapper for capture display (and future PhysicsCanvas + RotationKnob).
// Accepts capture result and renders screenshot on canvas; physics layer can replace or wrap this later.

import { CanvasRenderer } from "@/components/canvas-renderer";

interface BlendContainerProps {
  captureImage?: string;
  captureMetadata?: { width: number; height: number };
}

export function BlendContainer({ captureImage, captureMetadata }: BlendContainerProps) {
  if (!captureImage || !captureMetadata) {
    return (
      <div style={{ padding: "1rem", color: "#888" }}>
        Capture a URL to see the result here.
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <CanvasRenderer
        imageBase64={captureImage}
        width={captureMetadata.width}
        height={captureMetadata.height}
      />
      {/* TODO: Physics layer — replace or wrap with PhysicsCanvas + RotationKnob */}
    </div>
  );
}
