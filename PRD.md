# Blend-a-Web PRD

## Product Summary
Blend-a-Web is a playful web art toy that converts any website into a physics-based visual “blending container.”

Users paste a URL, watch fragments of the page tumble and react to rotation, and receive a single representative color generated from the page’s visual composition.

The focus is delight, experimentation, and shareable visual output.

## Goals

### Primary Goals
- Create a playful, physics-based visual interaction
- Generate a representative color from any webpage
- Allow users to save and compare multiple blend results locally

### Non-Goals (MVP)
- perfect DOM reconstruction
- real-time scraping updates
- social accounts or cloud storage
- palette extraction beyond single color

## Core User Flow
1. User pastes website URL
2. Backend loads site and captures:
- screenshot
- element bounding boxes
- color samples

3. Frontend generates physics fragments from captured visuals
4. User rotates container using circular knob
5. Objects tumble realistically inside container
6. System computes representative color from sampled pixels
7. User saves the result as a “blenda”

## Key Features
### 1. URL Ingestion
User enters URL in input field.
Backend:
- loads page with Puppeteer
- captures full screenshot
- returns image + metadata

### 2. Physics Blend Container
Canvas scene with:
- rectangular boundary
- physics engine (Matter.js)
- image fragments inside container
- gravity + collision enabled

User rotates container using circular drag control.

### 3. Representative Color Output
Color computed by:
- sampling pixels from screenshot
- averaging RGB values
- converting to HEX

Displayed as:
- large color swatch
- HEX code

### 4. Save Blend Results
Stored locally with:
- URL
- screenshot preview
- color result
- timestamp

Saved to localStorage.


## Technical Architecture
### Frontend
- Next.js React app
- Canvas rendering layer
- Matter.js physics simulation
- state managed via React hooks

### Backend
Next.js API routes:
/api/capture
- uses Puppeteer
- loads URL
- returns screenshot + metadata

## Data Flow
User URL → API route → Puppeteer capture →
returns image → frontend fragments → physics simulation →
color computed → result saved locally

## MVP Success Criteria
- Works with majority of public websites
- Physics feels smooth and responsive
- Color output always generated
- Interaction feels playful and surprising