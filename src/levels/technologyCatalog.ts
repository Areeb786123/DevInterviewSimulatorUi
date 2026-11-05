import type { ComponentKind } from './types'
import { getComponentKnowledge } from './componentKnowledge'

export type TechnologyMeta = {
  kind: ComponentKind
  name: string
  category: string
  primaryPurpose: string
  strengths: string[]
  weaknesses: string[]
  typicalUseCases: string[]
  scalingNotes: string
  consistencyNotes?: string
  operationalNotes: string
  alternatives: string[]
  useWhen: string
}

/** Decision-dialog meta derived from the full knowledge catalog. */
export function getTechnologyMeta(kind: ComponentKind): TechnologyMeta {
  const k = getComponentKnowledge(kind)
  return {
    kind,
    name: k.name,
    category: k.category,
    primaryPurpose: k.purpose,
    strengths: k.advantages.map((a) => a.point),
    weaknesses: k.disadvantages.map((d) => d.point),
    typicalUseCases: k.useCases,
    scalingNotes: k.scaling,
    operationalNotes: k.optionalNote,
    alternatives: k.alternatives.map((a) => a.name),
    useWhen: k.useCases[0] ?? k.purpose,
  }
}

export const TECHNOLOGY_CATALOG: Record<ComponentKind, TechnologyMeta> = {
  client: getTechnologyMeta('client'),
  server: getTechnologyMeta('server'),
  'load-balancer': getTechnologyMeta('load-balancer'),
  postgres: getTechnologyMeta('postgres'),
  mongodb: getTechnologyMeta('mongodb'),
  redis: getTechnologyMeta('redis'),
  kafka: getTechnologyMeta('kafka'),
  'object-store': getTechnologyMeta('object-store'),
  cdn: getTechnologyMeta('cdn'),
  websocket: getTechnologyMeta('websocket'),
  custom: getTechnologyMeta('custom'),
}
