"use client";

import { useRef, useEffect, useCallback } from "react";
import Matter from "matter-js";
import {
  createPhysicsWorld,
  CONTAINER_PADDING,
  type PhysicsWorld,
} from "@/lib/physics";

const MAX_DELTA_MS = 50;

/**
 * Splits the screenshot into a grid of tiles (40–80 pieces), creates a Matter.js
 * world with a container boundary, and renders each tile at its physics body position.
 * Tiles fall naturally inside the container.
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
  const worldRef = useRef<PhysicsWorld | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageBase64 || width <= 0 || height <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    const containerWidth = width + CONTAINER_PADDING * 2;
    const containerHeight = height + CONTAINER_PADDING * 2;
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      worldRef.current = createPhysicsWorld(width, height);
    };
    img.onerror = () => {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, width, height);
    };
    img.src = dataUrl;

    return () => {
      imageRef.current = null;
      if (worldRef.current) {
        Matter.World.clear(worldRef.current.world, false);
        Matter.Engine.clear(worldRef.current.engine);
        worldRef.current = null;
      }
    };
  }, [imageBase64, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    prevTimeRef.current = performance.now();

    function loop(now: number) {
      if (!running) return;

      rafRef.current = requestAnimationFrame(loop);

      const world = worldRef.current;
      const img = imageRef.current;
      if (!world || !img || !canvas || !ctx) return;

      const delta = Math.min(MAX_DELTA_MS, now - prevTimeRef.current);
      prevTimeRef.current = now;

      Matter.Engine.update(world.engine, delta);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const { body, sx, sy, sw, sh } of world.tiles) {
        const { position, angle } = body;
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);
        ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      }
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [imageBase64, width, height]);

  const containerWidth = width + CONTAINER_PADDING * 2;
  const containerHeight = height + CONTAINER_PADDING * 2;

  return (
    <canvas
      ref={canvasRef}
      width={containerWidth}
      height={containerHeight}
      className={className}
      style={{
        display: "block",
        maxWidth: "100%",
        height: "auto",
        aspectRatio: `${containerWidth} / ${containerHeight}`,
      }}
    />
  );
}
