"use client";

// TODO: Circular drag control; report rotation angle (0–360°) to parent via onRotationChange
// TODO: Visual: circle with handle; drag updates angle and calls callback

interface RotationKnobProps {
  rotationDeg?: number;
  onRotationChange?: (deg: number) => void;
}

export function RotationKnob({ rotationDeg = 0, onRotationChange }: RotationKnobProps) {
  return (
    <div
      role="slider"
      aria-valuenow={rotationDeg}
      aria-valuemin={0}
      aria-valuemax={360}
    >
      {/* TODO: Draw circle + handle; attach mouse/touch handlers to compute angle and call onRotationChange */}
      Rotation: {rotationDeg}°
    </div>
  );
}
