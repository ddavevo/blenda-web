import Matter from "matter-js";

const { Engine, World, Bodies } = Matter;

const WALL_THICKNESS = 12;
const TARGET_TILE_COUNT_MIN = 40;
const TARGET_TILE_COUNT_MAX = 80;
export const CONTAINER_PADDING = 40;
const POSITION_OFFSET_MAX = 14;
const VELOCITY_MAX = 35;
const ANGULAR_VELOCITY_MAX = 0.12;

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
  tiles: TileBody[];
  containerWidth: number;
  containerHeight: number;
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

function createWalls(
  world: Matter.World,
  width: number,
  height: number
): Matter.Body[] {
  const t = WALL_THICKNESS;
  const half = t / 2;
  const left = Bodies.rectangle(half, height / 2, t, height + t * 2, {
    isStatic: true,
    label: "wall-left",
  });
  const right = Bodies.rectangle(width - half, height / 2, t, height + t * 2, {
    isStatic: true,
    label: "wall-right",
  });
  const top = Bodies.rectangle(width / 2, half, width + t * 2, t, {
    isStatic: true,
    label: "wall-top",
  });
  const bottom = Bodies.rectangle(width / 2, height - half, width + t * 2, t, {
    isStatic: true,
    label: "wall-bottom",
  });
  World.add(world, [left, right, top, bottom]);
  return [left, right, top, bottom];
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
        restitution: 0.35,
        friction: 0.2,
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
 * Create a Matter.js world: container larger than image, walls at container bounds,
 * tiles spawn in image region with random position offsets and small random velocities.
 * Tiles rotate naturally via collisions (default inertia).
 */
export function createPhysicsWorld(
  imageWidth: number,
  imageHeight: number
): PhysicsWorld {
  const containerWidth = imageWidth + CONTAINER_PADDING * 2;
  const containerHeight = imageHeight + CONTAINER_PADDING * 2;
  const engine = Engine.create({
    gravity: { x: 0, y: 1 },
  });
  const world = engine.world;
  const walls = createWalls(world, containerWidth, containerHeight);
  const tiles = createTileBodies(
    world,
    imageWidth,
    imageHeight,
    CONTAINER_PADDING,
    CONTAINER_PADDING
  );
  return { engine, world, walls, tiles, containerWidth, containerHeight };
}

export function applyRotation(_world: PhysicsWorld, _deg: number): void {
  // TODO: Rotation interaction — rotate container or gravity
}
