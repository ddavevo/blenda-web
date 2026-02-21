"use client";

import { useRef } from "react";
import { CanvasRenderer } from "@/components/canvas-renderer";
import { RotationKnob } from "@/components/rotation-knob";
import { INITIAL_DRAG_STATE } from "@/types/drag";

interface BlendContainerProps {
  captureImage?: string;
  captureMetadata?: { width: number; height: number };
}

export function BlendContainer({ captureImage, captureMetadata }: BlendContainerProps) {
  const dragStateRef = useRef<typeof INITIAL_DRAG_STATE>({ ...INITIAL_DRAG_STATE });

  if (!captureImage || !captureMetadata) {
    return (
      <div style={{ padding: "1rem", color: "#888" }}>
        Capture a URL to see the result here.
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <CanvasRenderer
        imageBase64={captureImage}
        width={captureMetadata.width}
        height={captureMetadata.height}
        dragStateRef={dragStateRef}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", color: "#888" }}>Mix</span>
        <RotationKnob dragStateRef={dragStateRef} />
      </div>
    </div>
  );
}
