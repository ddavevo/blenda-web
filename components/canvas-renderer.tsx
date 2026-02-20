"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Draws a base64 screenshot onto a canvas. Canvas size uses metadata width/height.
 * Clears the canvas before drawing a new image.
 */
interface CanvasRendererProps {
  imageBase64: string;
  width: number;
  height: number;
  className?: string;
}

export function CanvasRenderer({
  imageBase64,
  width,
  height,
  className,
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageBase64) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.onerror = () => {
      canvas.width = width;
      canvas.height = height;
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
      style={{
        display: "block",
        maxWidth: "100%",
        height: "auto",
        aspectRatio: `${width} / ${height}`,
      }}
    />
  );
}
