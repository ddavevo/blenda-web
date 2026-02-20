"use client";

// TODO: Compose UrlInput, BlendContainer, ColorOutput, SavedBlendas
// TODO: Manage "current capture" state and pass to BlendContainer
import { UrlInput } from "@/components/url-input";
import { BlendContainer } from "@/components/blend-container";
import { ColorOutput } from "@/components/color-output";
import { SavedBlendas } from "@/components/saved-blendas";

export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Blend-a-Web</h1>
      <UrlInput onCapture={(result) => console.log(result)} />
      <BlendContainer />
      <ColorOutput />
      <SavedBlendas />
    </main>
  );
}
