import Matter from "matter-js";

const { Engine, World, Bodies, Composite } = Matter;

const WALL_THICKNESS = 1000;
const TARGET_TILE_COUNT_MIN = 96;
const TARGET_TILE_COUNT_MAX = 160;
export const CONTAINER_PADDING = 40;
const POSITION_OFFSET_MAX = 8;
const VELOCITY_MAX = 28;
const ANGULAR_VELOCITY_MAX = 0.1;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomSigned(max: number): number {
  return randomBetween(-max, max);
}

export interface TileBody {
  body: Matter.Body;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface PhysicsWorld {
  engine: Matter.Engine;
  world: Matter.World;
  walls: Matter.Body[];
  containerComposite: Matter.Composite;
  containerCenter: Matter.Vector;
  tiles: TileBody[];
  containerWidth: number;
  containerHeight: number;
}

/** Clamp tile body speeds so they don't clip through walls. */
export const MAX_TILE_SPEED = 110;

export function clampTileVelocities(world: PhysicsWorld): void {
  for (const { body } of world.tiles) {
    const v = body.velocity;
    const speed = Math.hypot(v.x, v.y);
    if (speed > MAX_TILE_SPEED) {
      const scale = MAX_TILE_SPEED / speed;
      Matter.Body.setVelocity(body, { x: v.x * scale, y: v.y * scale });
    }
    const maxAngular = 0.18;
    if (Math.abs(body.angularVelocity) > maxAngular) {
      Matter.Body.setAngularVelocity(
        body,
        body.angularVelocity > 0 ? maxAngular : -maxAngular
      );
    }
  }
}

/**
 * Pick grid dimensions so total tiles is in [TARGET_TILE_COUNT_MIN, TARGET_TILE_COUNT_MAX].
 * Prefer roughly square grid (e.g. 8x8).
 */
function getGridDimensions(
  imageWidth: number,
  imageHeight: number
): { cols: number; rows: number } {
  const totalPixels = imageWidth * imageHeight;
  const target = (TARGET_TILE_COUNT_MIN + TARGET_TILE_COUNT_MAX) / 2;
  const areaPerTile = totalPixels / target;
  const side = Math.sqrt(areaPerTile);
  let cols = Math.max(2, Math.round(imageWidth / side));
  let rows = Math.max(2, Math.round(imageHeight / side));
  let count = cols * rows;
  if (count < TARGET_TILE_COUNT_MIN) {
    if (cols <= rows) cols = Math.min(cols + 1, Math.ceil(imageWidth / 8));
    else rows = Math.min(rows + 1, Math.ceil(imageHeight / 8));
    count = cols * rows;
  }
  if (count > TARGET_TILE_COUNT_MAX) {
    if (cols >= rows) cols = Math.max(2, cols - 1);
    else rows = Math.max(2, rows - 1);
  }
  return { cols, rows };
}

/**
 * Walls are positioned so their inner edges align with the container boundary.
 * All thickness extends outward, so chunks can touch the container edges without clipping.
 */
function createContainerComposite(
  world: Matter.World,
  width: number,
  height: number
): { composite: Matter.Composite; walls: Matter.Body[] } {
  const t = WALL_THICKNESS;
  const half = t / 2;
  const left = Bodies.rectangle(-half, height / 2, t, height + t * 2, {
    isStatic: true,
    label: "wall-left",
  });
  const right = Bodies.rectangle(width + half, height / 2, t, height + t * 2, {
    isStatic: true,
    label: "wall-right",
  });
  const top = Bodies.rectangle(width / 2, -half, width + t * 2, t, {
    isStatic: true,
    label: "wall-top",
  });
  const bottom = Bodies.rectangle(width / 2, height + half, width + t * 2, t, {
    isStatic: true,
    label: "wall-bottom",
  });
  const composite = Composite.create({ label: "container" });
  Composite.add(composite, [left, right, top, bottom]);
  World.add(world, composite);
  return { composite, walls: [left, right, top, bottom] };
}

function createTileBodies(
  world: Matter.World,
  imageWidth: number,
  imageHeight: number,
  paddingX: number,
  paddingY: number
): TileBody[] {
  const { cols, rows } = getGridDimensions(imageWidth, imageHeight);
  const tw = imageWidth / cols;
  const th = imageHeight / rows;
  const tiles: TileBody[] = [];

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const sx = i * tw;
      const sy = j * th;
      const baseX = paddingX + (i + 0.5) * tw;
      const baseY = paddingY + (j + 0.5) * th;
      const x = baseX + randomSigned(POSITION_OFFSET_MAX);
      const y = baseY + randomSigned(POSITION_OFFSET_MAX);
      const body = Bodies.rectangle(x, y, tw, th, {
        restitution: 0.25,
        friction: 0.3,
        density: 0.001,
        label: "tile",
      });
      Matter.Body.setVelocity(body, {
        x: randomSigned(VELOCITY_MAX),
        y: randomSigned(VELOCITY_MAX),
      });
      Matter.Body.setAngularVelocity(body, randomSigned(ANGULAR_VELOCITY_MAX));
      World.add(world, body);
      tiles.push({ body, sx, sy, sw: tw, sh: th });
    }
  }

  return tiles;
}

/**
 * Create a Matter.js world: container is a SQUARE (symmetrical, no long/short edges)
 * so rotation feels uniform and edge distance changes are gradual. Tiles spawn in
 * the image region centered within the square.
 */
export function createPhysicsWorld(
  imageWidth: number,
  imageHeight: number
): PhysicsWorld {
  const containerSize =
    Math.max(imageWidth, imageHeight) + CONTAINER_PADDING * 2;
  const containerWidth = containerSize;
  const containerHeight = containerSize;
  const paddingX = (containerSize - imageWidth) / 2;
  const paddingY = (containerSize - imageHeight) / 2;
  const engine = Engine.create({
    gravity: { x: 0, y: 1 },
  });
  const world = engine.world;
  const { composite, walls } = createContainerComposite(
    world,
    containerSize,
    containerSize
  );
  const containerCenter = { x: containerSize / 2, y: containerSize / 2 };
  const tiles = createTileBodies(world, imageWidth, imageHeight, paddingX, paddingY);
  return {
    engine,
    world,
    walls,
    containerComposite: composite,
    containerCenter,
    tiles,
    containerWidth,
    containerHeight,
  };
}

/**
 * Apply tangential force so chunks orbit around the center when the user rotates.
 * Creates a "race around the track" mixing feel. Strength scales with distance from center.
 */
export function applyCircularMixingForce(
  world: PhysicsWorld,
  deltaAngleRad: number
): void {
  if (Math.abs(deltaAngleRad) < 1e-6) return;
  const cx = world.containerCenter.x;
  const cy = world.containerCenter.y;
  const baseStrength = 0.5;
  for (const { body } of world.tiles) {
    const dx = body.position.x - cx;
    const dy = body.position.y - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const tangentX = dy / dist;
    const tangentY = -dx / dist;
    const scale = Math.min(dist / 300, 1.2);
    const mag = baseStrength * deltaAngleRad * scale;
    Matter.Body.applyForce(body, body.position, {
      x: tangentX * mag,
      y: tangentY * mag,
    });
  }
}

/** Rotate the container composite by delta angle around its center. */
export function rotateContainer(
  world: PhysicsWorld,
  deltaAngleRad: number
): void {
  if (Math.abs(deltaAngleRad) < 1e-6) return;
  Matter.Composite.rotate(
    world.containerComposite,
    deltaAngleRad,
    world.containerCenter,
    true
  );
}
