# Blend-a-Web — Technical Implementation Plan

## 1. Architecture Overview

- **Stack**: Next.js 14+ (App Router), React, Matter.js, HTML5 Canvas, Puppeteer (server-only).
- **Rendering**: Client-side Canvas for physics + visuals; React for UI shell and state.
- **Data**: API route `/api/capture` runs Puppeteer; capture result (image + metadata) flows to frontend; blend results persisted in `localStorage` only.
- **Flow**: URL → API capture → image + metadata → frontend fragments + physics → representative color → save to localStorage.

```
┌─────────────────┐     POST /api/capture      ┌──────────────────┐
│  Next.js Client │ ─────────────────────────►│  Next.js Server  │
│  (React + Canvas)│                           │  (Puppeteer)      │
└────────┬────────┘     image + metadata       └──────────────────┘
         │                      ▲
         │                      │
         ▼                      │
┌─────────────────┐             │
│  Matter.js      │  fragments from image
│  + Canvas       │◄────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  localStorage   │  saved blendas
└─────────────────┘
```

---

## 2. Folder Structure

```
blenda-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       └── capture/
│           └── route.ts
├── components/
│   ├── url-input.tsx
│   ├── blend-container.tsx
│   ├── physics-canvas.tsx
│   ├── rotation-knob.tsx
│   ├── color-output.tsx
│   └── saved-blendas.tsx
├── hooks/
│   ├── use-capture.ts
│   ├── use-physics.ts
│   └── use-saved-blendas.ts
├── lib/
│   ├── physics.ts
│   ├── color.ts
│   └── storage.ts
├── types/
│   └── blenda.ts
├── TECHNICAL_PLAN.md
├── PRD.md
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.example
```

---

## 3. Required Dependencies

| Package | Purpose |
|---------|---------|
| `next` | App Router, API routes, SSR/SSG |
| `react`, `react-dom` | UI |
| `matter-js` | Physics engine (bodies, gravity, collisions) |
| `puppeteer` | Headless browser for URL capture (server-only) |
| `@types/matter-js` | TypeScript types for Matter.js |
| `typescript` | Type checking |
| `@types/node` | Node types for API routes |

Optional later: `sharp` for server-side image processing if needed.

---

## 4. Backend API Design

### `POST /api/capture`

**Request**

- Body: `{ url: string }` (required, must be valid HTTP/HTTPS URL).

**Response**

- Success `200`: JSON with:
  - `image`: base64-encoded PNG (or URL to stored file) — screenshot of the page.
  - `metadata`: `{ width: number, height: number, boundingBoxes?: Array<{ ... }> }` for optional element boxes.
- Client uses `image` to create fragments and sample pixels; `metadata` for layout/slicing if needed.

**Errors**

- `400`: Invalid or missing URL.
- `500`: Puppeteer/load/capture failure (timeout, unreachable, etc.).

**Implementation notes**

- Run Puppeteer only in Node (API route); do not expose to client.
- Consider timeouts and max payload size for base64 image.
- TODO: Validate URL scheme and host; optional screenshot dimensions.

---

## 5. Frontend Component List

| Component | Responsibility |
|-----------|----------------|
| `url-input` | Input field + submit; calls `useCapture` or fetch to `/api/capture`. |
| `blend-container` | Wraps canvas + knob; owns “current blend” state (image, color, rotation). |
| `physics-canvas` | Canvas ref; runs Matter.js world; draws fragments; applies container rotation to world. |
| `rotation-knob` | Circular control; reports rotation angle to parent (e.g. 0–360°). |
| `color-output` | Displays representative color (swatch + HEX). |
| `saved-blendas` | Reads from `useSavedBlendas`; lists saved blendas (preview, color, timestamp); delete/compare placeholders. |

---

## 6. Data Flow Between Systems

1. **User enters URL**  
   - `UrlInput` → `fetch('/api/capture', { method: 'POST', body: JSON.stringify({ url }) })`.

2. **API route**  
   - Validates URL → Puppeteer loads page → captures screenshot (and optional metadata) → returns `{ image, metadata }`.

3. **Frontend receives capture**  
   - Store in React state (e.g. in `BlendContainer` or a small context).
   - Optional: decode image to bitmap for pixel sampling.

4. **Physics + canvas**  
   - `usePhysics` / `lib/physics.ts`: create Matter.js engine/world; create bodies from fragments (from image + metadata).
   - `PhysicsCanvas`: animation loop; read rotation from `RotationKnob`; apply rotation to container body or world gravity; draw fragments on canvas.

5. **Representative color**  
   - `lib/color.ts`: sample pixels from screenshot (or from canvas); average RGB → HEX.
   - Result stored in state and passed to `ColorOutput`.

6. **Save blenda**  
   - User action “Save” → `lib/storage.ts` / `useSavedBlendas`: build blenda object (url, screenshot preview, color, timestamp) → `localStorage.setItem(...)`.
   - `SavedBlendas` reads from `localStorage` via hook and displays list.

7. **Persistence**  
   - Only localStorage; key e.g. `blenda-web-saved`; value JSON array of blenda objects. No backend persistence in MVP.

---

## Implementation Order (Scaffold → Features)

1. Scaffold: Next.js app, API route stub, components/hooks/types placeholders.
2. Implement `/api/capture` with Puppeteer (screenshot + minimal metadata).
3. Implement fragment generation from image + Matter.js bodies in `lib/physics.ts` and `PhysicsCanvas`.
4. Implement rotation knob and wire to physics (container rotation).
5. Implement color sampling and `ColorOutput`.
6. Implement localStorage save/load and `SavedBlendas` list.
