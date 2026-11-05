/** Mirrors future GET /api/v1/maps/:mapId/levels/:levelId */

export type ComponentKind =
  | 'client'
  | 'server'
  | 'load-balancer'
  | 'postgres'
  | 'mongodb'
  | 'redis'
  | 'kafka'
  | 'object-store'
  | 'cdn'
  | 'websocket'
  | 'custom'

export type PaletteItem = {
  kind: ComponentKind
  label: string
  tagline: string
  iconUrl: string
  /** Build cost — Redis is cheap vs another DB when load is the problem */
  cost: number
  dbFamily?: 'relational' | 'document' | 'cache' | 'queue' | 'blob' | 'compute' | 'client'
}

export type WinRule = {
  /** Ordered kinds that must appear as a connected path */
  requiredPath: ComponentKind[]
  /** Minimum number of placed nodes per kind (e.g. 2 app servers) */
  minCounts?: Partial<Record<ComponentKind, number>>
  /**
   * If set, that kind must have outgoing edges to at least this many
   * nodes of `fanOutKind` (e.g. LB → 2 servers).
   */
  fanOut?: {
    fromKind: ComponentKind
    toKind: ComponentKind
    min: number
  }
}

export type LevelConfig = {
  id: string
  mapId: string
  title: string
  subtitle: string
  /** Always-visible level objective (right rail · question pane) */
  question: string
  /** Progressive hints from Miss AI */
  hints: string[]
  /** Opening line / idle interviewer voice */
  interviewerBubble: string
  successBubble: string
  failBubble: string
  timeUpBubble: string
  overBudgetBubble: string
  timeLimitSec: number
  budget: number
  palette: PaletteItem[]
  win: WinRule
  backgroundUrl: string
}

export type PlacedNode = {
  id: string
  kind: ComponentKind
  x: number
  y: number
  /** User-facing name; required for `custom`, optional override for catalog kinds */
  label?: string
}

export type Edge = {
  id: string
  from: string
  to: string
}
