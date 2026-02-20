"use client";

// TODO: Display representative color: large swatch + HEX code
// TODO: Accept color (HEX string) from parent (computed from pixel sampling in lib/color or canvas)

interface ColorOutputProps {
  color?: string; // HEX
}

export function ColorOutput({ color = "#000000" }: ColorOutputProps) {
  return (
    <div>
      <div
        style={{
          width: 120,
          height: 120,
          backgroundColor: color,
          borderRadius: 8,
        }}
      />
      <p>HEX: {color}</p>
    </div>
  );
}
