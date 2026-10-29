import type { ComponentKnowledge } from './types'

export const WEBSOCKET_KNOWLEDGE: ComponentKnowledge = {
  id: 'websocket',
  name: 'WebSocket',
  category: 'realtime',
  iconUrl: '/assets/sysdesign/websocket.svg',
  shortDescription:
    'Persistent bidirectional channel for low-latency realtime updates — chat, presence, and live feeds.',
  beginnerExplanation:
    'Normal HTTP is like mailing letters: client asks, server answers, connection often ends. WebSockets keep a phone line open so the server can push updates the instant something happens — new chat messages, live likes, presence “typing…”. That beats hammering the server with polls every second. The cost is connection state: millions of open sockets need careful architecture (sticky LB or a realtime gateway + pub/sub). Use WebSockets when push matters; do not use them for ordinary CRUD.',
  technicalExplanation:
    'WebSocket starts with an HTTP Upgrade, then frames data both ways over one TCP connection. Servers must track connection ownership; horizontal scale usually needs Redis/Kafka pub/sub or a managed realtime layer so an event on instance A reaches a socket on instance B. Sticky load balancing helps but does not replace fan-out. Heartbeats detect half-open connections; clients reconnect with backoff and resume cursors. Auth via first-message token or cookies; authorize per channel/room. Compare with SSE (server→client only) and long polling (simpler, chatty).',
  purpose:
    'Deliver realtime, bidirectional updates without constant client polling.',
  problemBefore:
    'Polling wastes requests and adds latency; users see stale UIs; servers drown in empty “anything new?” calls.',
  whatChanges:
    'Servers push events as they occur; perceived latency drops; you must design connection lifecycle, fan-out, and horizontal scale explicitly.',
  optionalNote:
    'Drawing a WebSocket box without explaining multi-instance fan-out is incomplete — sticky sessions alone are not a full answer at scale.',
  howItWorks: [
    'Client opens WS (possibly after HTTPS auth) and subscribes to rooms/topics.',
    'App server accepts the socket and registers connection metadata (user, rooms) in memory and/or a shared store.',
    'When an event occurs (DB write, Kafka message), the owning service publishes to a pub/sub channel.',
    'The instance holding the socket pushes a frame to the client; others ignore or forward via the bus.',
    'Heartbeats and reconnect logic keep sessions healthy across network blips and deploys.',
  ],
  architectureExamples: [
    {
      title: 'Chat with pub/sub fan-out',
      path: 'Client ⇄ WebSocket Server × N ↔ Redis Pub/Sub; messages persisted in Postgres',
      explanation:
        'Any server can accept sockets; Redis fans events to the instance with the recipient connection. Postgres remains durable history — WS is transport, not SoT.',
    },
    {
      title: 'Live feed counts',
      path: 'Write API → Kafka → Realtime Gateway → WebSocket clients',
      explanation:
        'Async pipeline updates counters; gateway pushes increments. Clients still reconcile with HTTP occasionally for correctness.',
    },
  ],
  useCases: [
    '1:1 and group chat messaging',
    'Presence, typing indicators, and online status',
    'Live collaboration cursors and document awareness',
    'Realtime dashboards and sports/score tickers',
    'Multiplayer game state channels (with specialized stacks often)',
  ],
  whenNotToUse: [
    'Do not replace ordinary request/response CRUD with WebSockets “for modernity.”',
    'Avoid if SSE or short polling meets needs with far simpler ops (server→client news ticks).',
    'Skip as durable storage — messages still need a database if history matters.',
  ],
  advantages: [
    {
      point: 'True server push',
      detail:
        'Events reach clients immediately without waiting for the next poll interval.',
    },
    {
      point: 'Lower overhead than naive polling',
      detail:
        'One connection carries many updates instead of repeated HTTP handshakes for empty polls.',
    },
    {
      point: 'Bidirectional',
      detail:
        'Clients can send and receive on the same channel — natural for chat and games.',
    },
    {
      point: 'Better UX for live products',
      detail:
        'Presence and instant reactions are hard to fake convincingly with slow polls.',
    },
  ],
  disadvantages: [
    {
      point: 'Stateful connections',
      detail:
        'Scale-out needs sticky routing and/or a shared pub/sub fabric; deploys must drain sockets.',
    },
    {
      point: 'Proxy and LB complexity',
      detail:
        'Timeouts, idle policies, and sticky sessions misconfigurations drop connections silently.',
    },
    {
      point: 'Resource limits',
      detail:
        'File descriptors, memory per connection, and heartbeat traffic become capacity planning items.',
    },
    {
      point: 'Harder debugging and authz',
      detail:
        'Long-lived channels need per-message authorization and careful reconnect/resume logic.',
    },
  ],
  alternatives: [
    {
      name: 'Server-Sent Events (SSE)',
      when: 'Mostly server→client updates (feeds, notifications) with simpler semantics than full duplex.',
    },
    {
      name: 'Long polling',
      when: 'Compatibility constraints or very simple realtime needs; higher overhead.',
    },
    {
      name: 'Short polling',
      when: 'Low fan-out and freshness of tens of seconds is acceptable.',
    },
    {
      name: 'Push notifications (APNs/FCM)',
      when: 'Mobile background delivery matters more than in-app socket liveliness.',
    },
  ],
  scaling:
    'Plan max connections per node, use horizontal gateways, and fan out via Redis/Kafka/managed pubsub. Sticky LBs help local socket affinity but cross-instance delivery still needs a bus. Separate realtime gateway from heavy CRUD services. Autoscale on connection count and message rate; load-test reconnect storms after outages.',
  failureScenarios: [
    'Deploy kills sockets without drain: mass reconnect thunders the fleet.',
    'Pub/sub outage: sockets stay up but no events flow — users see “connected” yet stale.',
    'Sticky LB backend dies: users drop until reconnect lands elsewhere; in-memory-only state is lost.',
    'Missing heartbeats behind NATs: half-open connections accumulate until capacity exhaustion.',
  ],
  interviewQuestions: [
    {
      question: 'When do you choose WebSockets over HTTP polling?',
      testing: 'Realtime transport selection.',
      keyConcepts: ['push', 'polling cost', 'latency'],
      sampleAnswer:
        'When the server must push frequent updates with low latency and polling would waste requests. Chat, presence, and live boards are classic. Ordinary form submits stay on HTTP.',
      commonMistakes: [
        'WebSockets for every API',
        'Polling every 100ms without considering WS/SSE',
      ],
      level: 'beginner',
    },
    {
      question: 'Are WebSockets a source of truth for chat history?',
      testing: 'Transport vs storage.',
      keyConcepts: ['durable storage', 'replay', 'reconnect'],
      sampleAnswer:
        'No. Persist messages in a database; WebSockets deliver live events. On reconnect, clients fetch missed history via HTTP or resume tokens.',
      commonMistakes: [
        'Only keeping messages in server memory',
        'No catch-up path after disconnect',
      ],
      level: 'beginner',
    },
    {
      question: 'How do you scale WebSockets across many servers?',
      testing: 'Fan-out architecture.',
      keyConcepts: ['sticky sessions', 'pub/sub', 'realtime gateway'],
      sampleAnswer:
        'Accept sockets on a fleet, use sticky LB optionally, and broadcast events through Redis/Kafka so the node holding a user’s socket can push. Persist durable data separately.',
      commonMistakes: [
        'Sticky sessions as the entire scale story',
        'Broadcasting via DB polling only',
      ],
      level: 'intermediate',
    },
    {
      question: 'WebSocket vs SSE — how do you decide?',
      testing: 'Protocol trade-offs.',
      keyConcepts: ['bidirectional', 'HTTP compatibility', 'complexity'],
      sampleAnswer:
        'SSE is enough for server→client streams and often easier through proxies. Choose WebSocket when clients must send frequently on the same channel or binary frames matter.',
      commonMistakes: [
        'Always picking WS',
        'Ignoring proxy support differences',
      ],
      level: 'intermediate',
    },
    {
      question: 'Design reconnect and exactly-once feel for chat over WebSockets.',
      testing: 'Reliability under disconnects.',
      keyConcepts: ['resume cursor', 'idempotent delivery', 'ack'],
      sampleAnswer:
        'Tag messages with monotonic ids per room; client acks; on reconnect, fetch gaps since last id from DB. Publishers remain idempotent. At-least-once push plus client dedupe beats pretending TCP is enough.',
      commonMistakes: [
        'Assuming no duplicates/loss across reconnect',
        'No server-side history for gap fill',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'WebSockets enable push realtime UX; they are a transport, not durable storage.',
    'Horizontal scale requires pub/sub (or equivalent), not sticky LB alone.',
    'Heartbeats, drain, and resume/catch-up are part of the design.',
  ],
  biggestTradeOff:
    'Instant bidirectional UX versus stateful connection management and fan-out complexity across instances.',
  interviewTip:
    'After drawing WebSockets, add Redis/Kafka pub-sub in the same breath. That shows you know the multi-server problem.',
  relatedComponents: ['client', 'server', 'load-balancer', 'redis', 'kafka'],
}
