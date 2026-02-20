"use client";

import { useRef, useEffect } from "react";

// TODO: Canvas ref; run Matter.js engine/world; create bodies from image fragments; draw on canvas
// TODO: Accept image (base64) + metadata; apply container rotation from parent (rotation angle)
// TODO: Animation loop: engine.update(), then draw all bodies as image slices

interface PhysicsCanvasProps {
  image?: string;
  width?: number;
  height?: number;
  metadata?: { width: number; height: number };
  rotationDeg?: number;
}

export function PhysicsCanvas({
  image,
  width = 800,
  height = 600,
  metadata,
  rotationDeg = 0,
}: PhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // TODO: Init Matter.js Engine, World, Render (or custom canvas render)
    // TODO: Create composite body for container boundary; create fragment bodies from image + metadata
    // TODO: RequestAnimationFrame loop: engine.update(), draw fragments to canvas
    return () => {
      // TODO: Destroy engine, cancel animation frame
    };
  }, [image, metadata, rotationDeg]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
