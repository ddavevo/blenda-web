"use client";

// TODO: Use useSavedBlendas() to read list from localStorage; render list (preview, color, timestamp)
// TODO: Optional: delete item, "compare" placeholder

import { useSavedBlendas } from "@/hooks/use-saved-blendas";

export function SavedBlendas() {
  const { blendas } = useSavedBlendas();

  return (
    <section>
      <h2>Saved Blendas</h2>
      {/* TODO: Map blendas to cards: thumbnail, color swatch, URL, date; delete button */}
      <ul>
        {blendas.length === 0 && <li>No saved blendas yet.</li>}
      </ul>
    </section>
  );
}
