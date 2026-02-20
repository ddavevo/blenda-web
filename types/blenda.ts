// TODO: Align with API response and localStorage schema

export interface CaptureMetadata {
  width: number;
  height: number;
  boundingBoxes?: Array<{ x: number; y: number; width: number; height: number }>;
}

export interface CaptureResult {
  image: string; // base64 data URL or blob URL
  metadata: CaptureMetadata;
}

export interface Blenda {
  id: string;
  url: string;
  screenshotPreview: string; // base64 or blob URL thumbnail
  color: string; // HEX
  timestamp: number;
}

export type SavedBlendasStorage = Blenda[];
