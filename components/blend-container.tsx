"use client";

// TODO: Wrapper for PhysicsCanvas + RotationKnob; owns current blend state (image, rotation, color)
// TODO: Accept capture result (image + metadata) and pass to physics/canvas

interface BlendContainerProps {
  captureImage?: string;
  captureMetadata?: { width: number; height: number };
}

export function BlendContainer({ captureImage, captureMetadata }: BlendContainerProps) {
  return (
    <div>
      <div>Blend container (canvas + knob)</div>
      {/* TODO: <PhysicsCanvas image={captureImage} metadata={captureMetadata} /> */}
      {/* TODO: <RotationKnob onRotationChange={...} /> */}
    </div>
  );
}
