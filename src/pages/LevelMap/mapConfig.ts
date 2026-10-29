/** Reusable island tile — stamp more via MAP_TILE_COLS/ROWS when level count grows. */
export const MAP_TILE_SRC = '/assets/maps/island-tile.jpg'

export const TILE_WIDTH = 1024
export const TILE_HEIGHT = 576

/** Wider world so L1–L15 can wind across the island. */
export const MAP_TILE_COLS = 2
export const MAP_TILE_ROWS = 2

export const MIN_ZOOM = 1
export const MAX_ZOOM = 3.5
export const ZOOM_STEP = 0.25
export const DEFAULT_ZOOM = 1.15

export type MapLevelNode = {
  id: string
  label: string
  shortLabel: string
  caption: string
  route: string
  leftPct: number
  topPct: number
}

const captions = [
  'START',
  'SCALE',
  'CACHE',
  'GRAPH',
  'FEED',
  'BYTES',
  'META',
  'EDGE',
  'VIDEO',
  'LIKES',
  'DMs',
  'NOTIFY',
  'LIVE',
  'CALLS',
  'BOSS',
] as const

/** Winding path across the 2×2 tiled island (percent of full map). */
const PATH: Array<{ leftPct: number; topPct: number }> = [
  { leftPct: 18, topPct: 72 },
  { leftPct: 28, topPct: 58 },
  { leftPct: 38, topPct: 48 },
  { leftPct: 48, topPct: 38 },
  { leftPct: 58, topPct: 32 },
  { leftPct: 68, topPct: 28 },
  { leftPct: 78, topPct: 36 },
  { leftPct: 82, topPct: 48 },
  { leftPct: 76, topPct: 60 },
  { leftPct: 66, topPct: 70 },
  { leftPct: 54, topPct: 76 },
  { leftPct: 42, topPct: 70 },
  { leftPct: 34, topPct: 58 },
  { leftPct: 44, topPct: 46 },
  { leftPct: 56, topPct: 42 },
]

export const LEVEL_NODES: MapLevelNode[] = PATH.map((p, i) => {
  const n = i + 1
  return {
    id: `level-${n}`,
    label: `Level ${n}`,
    shortLabel: `L${n}`,
    caption: captions[i]!,
    route: `/system-design/social-media/level-${n}`,
    leftPct: p.leftPct,
    topPct: p.topPct,
  }
})

/** Center camera near first unlocked node */
export const CAMERA_FOCUS = LEVEL_NODES[0]!
