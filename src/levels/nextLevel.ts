import { LEVEL_NODES } from '../pages/LevelMap/mapConfig'

export type NextLevelResult =
  | { kind: 'next'; route: string; label: string }
  | { kind: 'coming-soon' }

/** Next playable node after `levelId` in map order, or coming-soon if last. */
export function getNextLevel(levelId: string): NextLevelResult {
  const idx = LEVEL_NODES.findIndex((n) => n.id === levelId)
  if (idx < 0) return { kind: 'coming-soon' }
  const next = LEVEL_NODES[idx + 1]
  if (!next) return { kind: 'coming-soon' }
  return { kind: 'next', route: next.route, label: next.label }
}
