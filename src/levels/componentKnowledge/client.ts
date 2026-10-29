import type { ComponentKnowledge } from './types'

export const CLIENT_KNOWLEDGE: ComponentKnowledge = {
  id: 'client',
  name: 'Client',
  category: 'client',
  iconUrl: '/assets/sysdesign/client.svg',
  shortDescription:
    'The user-facing device or app where traffic begins — browsers, mobile apps, and desktop clients that initiate requests.',
  beginnerExplanation:
    'The client is whatever the user actually uses: a phone app, a browser tab, or a desktop program. Every system-design diagram starts here because requests do not magically appear on your servers — a real person (or bot) opens an app and taps something. The client draws the UI, holds auth tokens, retries failed calls, and often caches a bit of data locally. In interviews, placing a Client box is your reminder that latency, offline behavior, and untrusted input all begin at the edge of the system — not inside the data center.',
  technicalExplanation:
    'Clients are untrusted endpoints over variable networks. They speak HTTP(S), WebSocket, or gRPC to backends; they manage connection pools, TLS, cookies/JWTs, and optimistic UI. Mobile clients contend with flaky radios and background suspension; browsers contend with CORS, same-origin policy, and limited storage. Good designs push validation and authorization to the server while keeping clients thin on secrets. Clients scale horizontally by nature (millions of devices); the backend must absorb that fan-in. Never treat client-side checks as security — they are UX only.',
  purpose:
    'Represent the origin of user traffic and the place where UX, local state, and first-hop networking decisions live.',
  problemBefore:
    'Without modeling the client, designs skip real-world constraints: slow networks, retries, auth token expiry, and the fact that users can forge any request.',
  whatChanges:
    'You design APIs for chatty vs batchy clients, plan auth refresh, decide polling vs push, and size backends for client fan-in rather than assuming trusted callers.',
  optionalNote:
    'In whiteboard interviews, always draw the client first — it anchors “who starts the request” and keeps discussions grounded in user experience.',
  howItWorks: [
    'User opens the app or page; the client loads static assets (often via CDN) and bootstraps runtime state.',
    'Client authenticates (login or refresh token) and stores credentials in memory, secure storage, or cookies.',
    'User actions become API calls: REST/GraphQL over HTTPS, or a persistent WebSocket for realtime features.',
    'Client renders responses, handles errors/retries with backoff, and may apply optimistic updates before confirmation.',
    'On network loss, the client queues or degrades gracefully; when connectivity returns, it syncs pending work.',
  ],
  architectureExamples: [
    {
      title: 'Classic web request path',
      path: 'Client → CDN (static) → Load Balancer → App Server → Database',
      explanation:
        'The browser fetches JS/CSS from the CDN, then calls APIs through a load balancer to stateless servers that read/write a durable database.',
    },
    {
      title: 'Mobile app with offline queue',
      path: 'Mobile Client → API Gateway → App Server; Client local SQLite for drafts',
      explanation:
        'The phone keeps drafts locally and syncs when online. The server remains source of truth; the client is a temporary buffer, not durable SoT.',
    },
  ],
  useCases: [
    'Browser SPAs consuming a public REST or GraphQL API',
    'Native iOS/Android apps with push notifications and background sync',
    'Admin dashboards used by internal operators over VPN',
    'Embedded or IoT devices posting telemetry on a schedule',
    'Third-party integrations acting as API clients with service credentials',
  ],
  whenNotToUse: [
    'Do not put business-critical authorization only on the client — anything shipped to devices can be bypassed.',
    'Avoid making the client the system of record for money, inventory, or identity; servers and databases own truth.',
    'Skip heavy client-side processing when devices are low-powered or when consistency across users matters more than local speed.',
  ],
  advantages: [
    {
      point: 'Direct user context',
      detail:
        'Clients know screen size, locale, battery, and network type, so they can adapt UX (image quality, prefetch) without round-trips for every preference.',
    },
    {
      point: 'Natural horizontal scale',
      detail:
        'Adding users adds clients automatically. You do not “scale the phone farm”; you scale the backend that serves them.',
    },
    {
      point: 'Optimistic and offline UX',
      detail:
        'Clients can update UI immediately and sync later, making apps feel fast even when the network is slow — if conflict resolution is designed carefully.',
    },
    {
      point: 'Protocol flexibility at the edge',
      detail:
        'A single product can mix HTTPS APIs, WebSockets, and background sync tailored to each platform without changing core domain models.',
    },
  ],
  disadvantages: [
    {
      point: 'Untrusted by definition',
      detail:
        'Attackers control clients. Rate limits, authz, and validation must live server-side or the system is unsafe.',
    },
    {
      point: 'Heterogeneous environments',
      detail:
        'Old OS versions, flaky networks, and varied hardware make client bugs hard to reproduce and force defensive API design.',
    },
    {
      point: 'Release and version skew',
      detail:
        'Mobile apps update slowly; APIs must stay backward compatible or use versioning, or old clients break in production.',
    },
    {
      point: 'Limited secrets and compute',
      detail:
        'You cannot safely embed private keys or run heavy ML inference on every device; sensitive work belongs on servers.',
    },
  ],
  alternatives: [
    {
      name: 'Server-rendered pages only',
      when: 'Simple content sites where SEO and first paint matter more than rich client interactivity.',
    },
    {
      name: 'Server-initiated push without a rich client',
      when: 'Rare notification-only flows (SMS/email) where no interactive app is needed.',
    },
    {
      name: 'BFF (Backend-for-Frontend)',
      when: 'Multiple client types need tailored payloads — keep clients thin and shape responses per platform on a BFF.',
    },
    {
      name: 'Edge workers / CDN compute',
      when: 'Tiny personalization or auth checks can run near the user without a full app round-trip to origin.',
    },
  ],
  scaling:
    'Clients themselves do not need horizontal scaling in the data-center sense — millions of devices already exist. Scaling work focuses on API fan-in: connection limits, rate limiting, pagination, compression, and CDN offload for static assets. Design for bursty open-app storms (morning commute) and for slow clients that hold connections open. Prefer idempotent writes so client retries are safe.',
  failureScenarios: [
    'Network partition: client cannot reach APIs; without offline handling, users see hard failures and duplicate taps create duplicate writes on reconnect.',
    'Expired or stolen tokens: if refresh is broken or tokens are stored insecurely, sessions drop or accounts are hijacked.',
    'API version skew: a forced backend change breaks older app builds still in the wild, causing mass client errors.',
    'Clock skew / timezone bugs: clients with wrong clocks mishandle token expiry or scheduled posts.',
  ],
  interviewQuestions: [
    {
      question: 'Why do we draw a Client box in a system design diagram?',
      testing: 'Whether the candidate understands traffic origin and user-facing constraints.',
      keyConcepts: ['request origin', 'untrusted edge', 'UX constraints'],
      sampleAnswer:
        'The client is where users initiate work. Drawing it forces discussion of networks, auth, retries, and that backends must handle fan-in from many devices. It also reminds us the client is untrusted.',
      commonMistakes: [
        'Skipping the client and starting at the load balancer',
        'Treating the client as a trusted security boundary',
      ],
      level: 'beginner',
    },
    {
      question: 'What should never live only on the client?',
      testing: 'Security instincts around authorization and secrets.',
      keyConcepts: ['authorization', 'secrets', 'server-side validation'],
      sampleAnswer:
        'Authorization decisions, private API keys, and business invariants (prices, inventory). Clients can enforce UX rules, but the server must re-validate everything.',
      commonMistakes: [
        'Hiding admin buttons and calling that security',
        'Embedding service account credentials in mobile apps',
      ],
      level: 'beginner',
    },
    {
      question: 'How do clients and backends cooperate on retries without creating duplicate orders?',
      testing: 'Idempotency and client retry design.',
      keyConcepts: ['idempotency keys', 'at-least-once delivery', 'deduplication'],
      sampleAnswer:
        'Clients retry with the same idempotency key; servers store processed keys and return the original result. Timeouts alone are not enough — networks can deliver the first request after the client already retried.',
      commonMistakes: [
        'Retrying POST blindly without keys',
        'Assuming TCP means exactly-once',
      ],
      level: 'intermediate',
    },
    {
      question: 'Mobile apps update slowly. How do you design APIs for version skew?',
      testing: 'Backward compatibility and API evolution.',
      keyConcepts: ['API versioning', 'additive changes', 'feature flags'],
      sampleAnswer:
        'Prefer additive fields, keep old endpoints for a deprecation window, version when breaking, and use feature flags so new server behavior activates only for capable clients. Contract tests against supported app versions help.',
      commonMistakes: [
        'Renaming fields without a migration plan',
        'Forcing all users to update before deploying',
      ],
      level: 'intermediate',
    },
    {
      question: 'When would you push significant logic to the client versus keeping it on the server?',
      testing: 'Trade-off judgment between UX latency and consistency/security.',
      keyConcepts: ['consistency', 'trust boundary', 'edge compute'],
      sampleAnswer:
        'Push presentation, validation for UX, and offline drafts to the client. Keep money, permissions, ranking that must be consistent, and secret-dependent work on the server. Edge workers sit in between for cacheable personalization without full origin hits.',
      commonMistakes: [
        'Moving core business rules client-side for “speed”',
        'Never considering offline needs for field apps',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'Clients start every user journey and are always untrusted.',
    'Scale the backend for client fan-in; do not treat devices as your system of record.',
    'Design APIs for retries, version skew, and flaky networks from day one.',
  ],
  biggestTradeOff:
    'Rich offline/optimistic client UX versus stronger server-side consistency and simpler conflict models.',
  interviewTip:
    'Open by stating “traffic starts at the client” and call out one client constraint (auth, retries, or mobile versioning) before diving into databases — interviewers notice grounded framing.',
  relatedComponents: ['cdn', 'load-balancer', 'server', 'websocket'],
}
