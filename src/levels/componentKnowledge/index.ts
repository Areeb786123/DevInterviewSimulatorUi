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

const CUSTOM_KNOWLEDGE: ComponentKnowledge = {
  id: 'custom',
  name: 'Custom',
  category: 'free-form',
  iconUrl: '/assets/sysdesign/server.svg',
  shortDescription:
    'A free-form architecture box for naming a component that is not represented by the standard catalog.',
  beginnerExplanation:
    'Use a custom box when your design needs a clearly named service, gateway, worker, or external dependency that is not available in the standard palette. The label should tell the interviewer what role the box plays.',
  technicalExplanation:
    'A custom box is intentionally technology-neutral. Its behavior, storage model, scaling strategy, and reliability properties depend on the label and explanation you give it, so make those responsibilities explicit.',
  purpose:
    'Represent a named architecture component that does not have a dedicated catalog kind.',
  problemBefore:
    'Without a free-form box, important domain services and external systems may be omitted or mislabeled.',
  whatChanges:
    'The board can show a user-defined component while preserving the same connection and path behavior.',
  optionalNote:
    'Prefer a catalog component when one accurately represents the intended role.',
  howItWorks: [
    'Add the custom box to the architecture board where the missing component belongs.',
    'Give the box a concise label that clearly identifies its architectural responsibility.',
    'Connect the box to upstream and downstream components to show its data flow.',
    'Explain its behavior and trade-offs because the box itself is technology-neutral.',
  ],
  architectureExamples: [
    {
      title: 'Domain service',
      path: 'Client → Auth Service → App Server',
      explanation:
        'The custom box names a domain-specific service that is absent from the standard component palette.',
    },
    {
      title: 'External system',
      path: 'App Server → Payment Provider → Webhook',
      explanation:
        'The custom box identifies an external dependency and makes its place in the request flow visible.',
    },
  ],
  useCases: [
    'Representing a domain-specific internal service',
    'Showing an external provider or dependency',
    'Naming a specialized background worker',
    'Adding an infrastructure role missing from the palette',
  ],
  whenNotToUse: [
    'Do not use a custom box when a standard catalog component already describes the role.',
    'Avoid vague labels that do not communicate the responsibility of the component.',
    'Do not assume the custom box supplies unstated scaling or reliability properties.',
  ],
  advantages: [
    {
      point: 'Flexible naming',
      detail:
        'A user can represent domain-specific services without waiting for a dedicated catalog entry.',
    },
    {
      point: 'Clear diagrams',
      detail:
        'Explicit labels keep important systems visible in architecture paths and explanations.',
    },
    {
      point: 'Technology neutral',
      detail:
        'The box can represent software, infrastructure, or an external dependency as needed.',
    },
  ],
  disadvantages: [
    {
      point: 'No built-in semantics',
      detail:
        'The label alone does not define behavior, scaling, consistency, or operational guarantees.',
    },
    {
      point: 'Can become vague',
      detail:
        'Generic names may hide responsibilities instead of making the architecture easier to understand.',
    },
    {
      point: 'Harder comparison',
      detail:
        'Free-form components do not provide the standardized trade-offs of catalog technologies.',
    },
  ],
  alternatives: [
    {
      name: 'App Server',
      when: 'Use the standard server when the box represents ordinary API or business-logic compute.',
    },
    {
      name: 'Database',
      when: 'Use a catalog database when the main responsibility is durable or cached data storage.',
    },
    {
      name: 'Queue',
      when: 'Use Kafka when the component primarily represents asynchronous event transport.',
    },
  ],
  scaling:
    'Scaling depends entirely on the named component. State whether it scales vertically or horizontally, where state lives, and which downstream bottlenecks or limits remain.',
  failureScenarios: [
    'An unclear label leaves reviewers unable to infer the responsibility or ownership boundary.',
    'An external dependency fails and the design lacks timeouts, retries, or graceful degradation.',
    'The custom service becomes a bottleneck because its capacity and state model were never specified.',
  ],
  interviewQuestions: [
    {
      question: 'What responsibility does this custom component own?',
      testing: 'Whether the candidate can define a clear component boundary.',
      keyConcepts: ['responsibility', 'boundary'],
      sampleAnswer:
        'It owns one named capability and exposes a clear interface while leaving unrelated work to neighboring components.',
      commonMistakes: ['Giving the component a vague or overly broad responsibility'],
      level: 'beginner',
    },
    {
      question: 'Why is a catalog component not sufficient here?',
      testing: 'Whether the custom component has a justified role.',
      keyConcepts: ['fit', 'justification'],
      sampleAnswer:
        'The standard palette does not represent this domain-specific or external role, so a labeled custom box is clearer.',
      commonMistakes: ['Using custom when an existing component already fits'],
      level: 'beginner',
    },
    {
      question: 'How does this component communicate with its neighbors?',
      testing: 'Whether interfaces and data flow are understood.',
      keyConcepts: ['interface', 'data flow'],
      sampleAnswer:
        'It uses an explicit synchronous or asynchronous interface with defined requests, responses, and failure behavior.',
      commonMistakes: ['Drawing connections without explaining their protocol or direction'],
      level: 'intermediate',
    },
    {
      question: 'How would this component scale under load?',
      testing: 'Whether the candidate can reason beyond a generic box.',
      keyConcepts: ['capacity', 'state'],
      sampleAnswer:
        'I would identify its constrained resource, externalize state where appropriate, and add replicas only after measuring the bottleneck.',
      commonMistakes: ['Claiming it scales automatically without naming a mechanism'],
      level: 'intermediate',
    },
    {
      question: 'What happens when this component becomes unavailable?',
      testing: 'Whether failure handling is included in the design.',
      keyConcepts: ['failure isolation', 'recovery'],
      sampleAnswer:
        'Callers use bounded timeouts and an appropriate fallback, while monitoring and recovery restore the component safely.',
      commonMistakes: ['Assuming a custom component cannot fail'],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'Use a specific label that communicates the component responsibility.',
    'Explain behavior and trade-offs because custom boxes have no built-in semantics.',
    'Prefer a standard catalog component whenever it already represents the role.',
  ],
  biggestTradeOff:
    'Custom boxes add flexibility, but they require more explanation because their behavior is not standardized.',
  interviewTip:
    'Name the responsibility, interface, scaling model, and main failure mode when introducing a custom box.',
  relatedComponents: ['server'],
}

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
  custom: CUSTOM_KNOWLEDGE,
}

export function getComponentKnowledge(kind: ComponentKind): ComponentKnowledge {
  return COMPONENT_KNOWLEDGE[kind]
}

export function listComponentKnowledge(): ComponentKnowledge[] {
  return Object.values(COMPONENT_KNOWLEDGE)
}
