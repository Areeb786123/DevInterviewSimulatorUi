import type { Edge, LevelConfig, PlacedNode } from './types'

const KIND_LABEL: Record<string, string> = {
  client: 'client',
  server: 'app server',
  'load-balancer': 'load balancer',
  postgres: 'postgres',
  mongodb: 'mongodb',
  redis: 'redis',
  kafka: 'kafka',
  'object-store': 'object store',
  cdn: 'cdn',
  websocket: 'websocket',
  custom: 'custom',
}

function labelFor(kind: string, palette?: LevelConfig['palette']) {
  const fromPalette = palette?.find((p) => p.kind === kind)?.label
  if (fromPalette) return fromPalette.toLowerCase()
  return KIND_LABEL[kind] ?? kind
}

function displayLabel(n: PlacedNode, palette?: LevelConfig['palette']) {
  if (n.label?.trim()) return n.label.trim()
  return labelFor(n.kind, palette)
}

/**
 * Build a readable architecture line from the board graph, e.g.
 * "client -> app server -> load balancer -> mongodb"
 */
export function formatArchitecturePath(
  nodes: PlacedNode[],
  edges: Edge[],
  palette?: LevelConfig['palette'],
): string {
  if (nodes.length === 0) return '(empty board)'

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const out = new Map<string, string[]>()
  for (const e of edges) {
    const list = out.get(e.from) ?? []
    list.push(e.to)
    out.set(e.from, list)
  }

  const incoming = new Set(edges.map((e) => e.to))
  const starts = nodes.filter((n) => !incoming.has(n.id))
  const roots = starts.length > 0 ? starts : [nodes[0]!]

  const paths: string[] = []
  const traversedIds = new Set<string>()
  for (const root of roots) {
    const path: string[] = []
    const pathSeen = new Set<string>()
    let cur: PlacedNode | undefined = root
    while (cur && !pathSeen.has(cur.id)) {
      pathSeen.add(cur.id)
      traversedIds.add(cur.id)
      path.push(displayLabel(cur, palette))
      const nextIds = out.get(cur.id)
      const nextId: string | undefined = nextIds?.[0]
      cur = nextId ? byId.get(nextId) : undefined
    }
    if (path.length > 0) paths.push(path.join(' -> '))
  }

  const unused = nodes.filter((n) => !traversedIds.has(n.id))
  // Prefer longest path; append orphan kinds if any
  paths.sort((a, b) => b.length - a.length)
  const primary =
    paths[0] ?? nodes.map((n) => displayLabel(n, palette)).join(' + ')
  if (unused.length === 0) return primary
  const extra = [...new Set(unused.map((n) => displayLabel(n, palette)))].join(
    ', ',
  )
  return `${primary} (also: ${extra})`
}

/** Auto narrative for AI submit — user is not forced to type. */
export function buildAutoExplanation(
  nodes: PlacedNode[],
  edges: Edge[],
  level: LevelConfig,
): string {
  const path = formatArchitecturePath(nodes, edges, level.palette)
  return [
    `Game architecture path: ${path}`,
    `Level: ${level.title}`,
    `Objective: ${level.question.split('\n').slice(0, 4).join(' ').slice(0, 280)}`,
    `Placed ${nodes.length} component(s) with ${edges.length} connection(s).`,
    'This design was submitted from the ArchQuest board for AI interview review.',
  ].join('\n')
}
