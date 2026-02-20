"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Renders a base64 screenshot onto a canvas. Kept separate from the future
 * physics layer so this is purely the capture display; physics can be added
 * in PhysicsCanvas later.
 */
interface CaptureCanvasProps {
  imageBase64: string;
  width: number;
  height: number;
  className?: string;
}

export function CaptureCanvas({
  imageBase64,
  width,
  height,
  className,
}: CaptureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageBase64) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.onerror = () => {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, width, height);
    };
    img.src = dataUrl;
  }, [imageBase64, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    />
  );
}
