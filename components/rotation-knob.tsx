"use client";

import { useRef, useCallback } from "react";
import type { DragState } from "@/types/drag";

const KNOB_SIZE = 56;

interface RotationKnobProps {
  dragStateRef: React.MutableRefObject<DragState>;
  className?: string;
}

function angleFromCenter(centerX: number, centerY: number, clientX: number, clientY: number): number {
  return Math.atan2(clientY - centerY, clientX - centerX);
}

function normalizeDelta(prev: number, curr: number): number {
  let delta = curr - prev;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
}

export function RotationKnob({ dragStateRef, className }: RotationKnobProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  const getCenter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const center = getCenter();
      lastAngleRef.current = angleFromCenter(center.x, center.y, e.clientX, e.clientY);
      isDraggingRef.current = true;
      const currentAngle = dragStateRef.current.containerAngle;
      dragStateRef.current = {
        isDragging: true,
        containerAngle: currentAngle,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [dragStateRef, getCenter]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const center = getCenter();
      const angle = angleFromCenter(center.x, center.y, e.clientX, e.clientY);
      const delta = normalizeDelta(lastAngleRef.current, angle);
      lastAngleRef.current = angle;
      const newAngle = dragStateRef.current.containerAngle + delta;
      dragStateRef.current = {
        isDragging: true,
        containerAngle: newAngle,
      };
    },
    [dragStateRef, getCenter]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      isDraggingRef.current = false;
      dragStateRef.current = {
        ...dragStateRef.current,
        isDragging: false,
      };
    },
    [dragStateRef]
  );

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Mixing rotation"
      aria-valuemin={0}
      aria-valuemax={360}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.4)",
        background: "rgba(0,0,0,0.3)",
        cursor: "grab",
        touchAction: "none",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.9)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
