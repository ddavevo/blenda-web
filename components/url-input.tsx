"use client";

// TODO: Input field for URL; submit calls POST /api/capture and passes result up (e.g. onCapture(captureResult))
// TODO: Loading and error states

interface UrlInputProps {
  onCapture?: (result: { image: string; metadata: { width: number; height: number } }) => void;
}

export function UrlInput({ onCapture }: UrlInputProps) {
  return (
    <div>
      <label htmlFor="url">Website URL</label>
      <input id="url" type="url" placeholder="https://example.com" />
      <button type="button">Blend</button>
    </div>
  );
}
