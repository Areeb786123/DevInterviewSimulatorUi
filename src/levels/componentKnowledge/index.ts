import type { ComponentKind } from '../types'
import type { ComponentKnowledge } from './types'
import { CDN_KNOWLEDGE } from './cdn'
import { CLIENT_KNOWLEDGE } from './client'
import { KAFKA_KNOWLEDGE } from './kafka'
import { LOAD_BALANCER_KNOWLEDGE } from './loadBalancer'
import { MONGODB_KNOWLEDGE } from './mongodb'
import { OBJECT_STORE_KNOWLEDGE } from './objectStore'
import { POSTGRES_KNOWLEDGE } from './postgres'
import { REDIS_KNOWLEDGE } from './redis'
import { SERVER_KNOWLEDGE } from './server'
import { WEBSOCKET_KNOWLEDGE } from './websocket'

export type { ComponentKnowledge, InterviewQuestion, InterviewQuestionLevel } from './types'

export const COMPONENT_KNOWLEDGE: Record<ComponentKind, ComponentKnowledge> = {
  client: CLIENT_KNOWLEDGE,
  server: SERVER_KNOWLEDGE,
  'load-balancer': LOAD_BALANCER_KNOWLEDGE,
  postgres: POSTGRES_KNOWLEDGE,
  mongodb: MONGODB_KNOWLEDGE,
  redis: REDIS_KNOWLEDGE,
  kafka: KAFKA_KNOWLEDGE,
  'object-store': OBJECT_STORE_KNOWLEDGE,
  cdn: CDN_KNOWLEDGE,
  websocket: WEBSOCKET_KNOWLEDGE,
}

export function getComponentKnowledge(kind: ComponentKind): ComponentKnowledge {
  return COMPONENT_KNOWLEDGE[kind]
}

export function listComponentKnowledge(): ComponentKnowledge[] {
  return Object.values(COMPONENT_KNOWLEDGE)
}
