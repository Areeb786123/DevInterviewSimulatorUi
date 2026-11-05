import type { ComponentKind } from './types'
import { getComponentKnowledge } from './componentKnowledge'

export type ComponentTip = {
  title: string
  what: string
  useWhen: string
}

/** Short tip derived from the full knowledge catalog (no separate content). */
export function getComponentTip(kind: ComponentKind): ComponentTip {
  const k = getComponentKnowledge(kind)
  return {
    title: k.name,
    what: k.shortDescription,
    useWhen: k.useCases[0] ?? k.purpose,
  }
}

export const COMPONENT_TIPS: Record<ComponentKind, ComponentTip> = {
  client: getComponentTip('client'),
  server: getComponentTip('server'),
  'load-balancer': getComponentTip('load-balancer'),
  postgres: getComponentTip('postgres'),
  mongodb: getComponentTip('mongodb'),
  redis: getComponentTip('redis'),
  kafka: getComponentTip('kafka'),
  'object-store': getComponentTip('object-store'),
  cdn: getComponentTip('cdn'),
  websocket: getComponentTip('websocket'),
  custom: getComponentTip('custom'),
}
