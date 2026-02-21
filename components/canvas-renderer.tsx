"use client";

import { useRef, useEffect, useCallback } from "react";
import Matter from "matter-js";
import {
  createPhysicsWorld,
  CONTAINER_PADDING,
  rotateContainer,
  applyCircularMixingForce,
  clampTileVelocities,
  type PhysicsWorld,
} from "@/lib/physics";
import type { DragState } from "@/types/drag";

const MAX_DELTA_MS = 50;
/** Extra space so the rotated outline stays visible (sqrt(2) fits a 45° rotation). */
const ROTATION_MARGIN = Math.SQRT2;

/**
 * Splits the screenshot into a grid of tiles, creates a Matter.js world with a
 * container boundary. Gravity stays downward so chunks always fall down. When the
 * user drags the mixing knob, the container outline rotates and chunks tumble
 * against the rotating walls.
 */
interface CanvasRendererProps {
  imageBase64: string;
  width: number;
  height: number;
  dragStateRef?: React.MutableRefObject<DragState>;
  className?: string;
}

export function CanvasRenderer({
  imageBase64,
  width,
  height,
  dragStateRef,
  className,
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<PhysicsWorld | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const prevContainerAngleRef = useRef<number>(0);
  const hasSyncedAngleRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageBase64 || width <= 0 || height <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    const containerSize = Math.max(width, height) + CONTAINER_PADDING * 2;
    const canvasSize = Math.ceil(containerSize * ROTATION_MARGIN);
    canvas.width = canvasSize;
    canvas.height = canvasSize;

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
      hasSyncedAngleRef.current = false;
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

      const containerAngle = dragStateRef?.current?.containerAngle ?? 0;
      if (!hasSyncedAngleRef.current) {
        prevContainerAngleRef.current = containerAngle;
        hasSyncedAngleRef.current = true;
      }
      const prevAngle = prevContainerAngleRef.current;
      const deltaAngle = containerAngle - prevAngle;
      prevContainerAngleRef.current = containerAngle;

      rotateContainer(world, deltaAngle);
      applyCircularMixingForce(world, deltaAngle);

      Matter.Engine.update(world.engine, delta);
      clampTileVelocities(world);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const containerSize = world.containerWidth;
      const offset = (canvas.width - containerSize) / 2;
      ctx.translate(offset, offset);

      for (const { body, sx, sy, sw, sh } of world.tiles) {
        const { position, angle } = body;
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);
        ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      }

      const cx = containerSize / 2;
      const cy = containerSize / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(containerAngle);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 3;
      ctx.strokeRect(-cx, -cy, containerSize, containerSize);
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [imageBase64, width, height]);

  const containerSize = Math.max(width, height) + CONTAINER_PADDING * 2;
  const canvasSize = Math.ceil(containerSize * ROTATION_MARGIN);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className={className}
      style={{
        display: "block",
        maxWidth: "min(520px, 72vw)",
        height: "auto",
        aspectRatio: "1",
      }}
    />
  );
}
