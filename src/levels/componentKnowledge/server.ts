import type { ComponentKnowledge } from './types'

export const SERVER_KNOWLEDGE: ComponentKnowledge = {
  id: 'server',
  name: 'App Server',
  category: 'compute',
  iconUrl: '/assets/sysdesign/server.svg',
  shortDescription:
    'Compute that runs API and business logic — authenticates requests, orchestrates data stores, and enforces domain rules.',
  beginnerExplanation:
    'The app server is the “brain” of your backend: it receives HTTP requests, checks who you are, applies product rules (can this user like this post?), and talks to databases, caches, and queues. If you only had one box besides the client, it would be this. Beginners often put too much into one giant server; the interview skill is knowing what belongs in compute versus what belongs in storage or async pipelines.',
  technicalExplanation:
    'App servers are preferably mostly-stateless processes: session state in Redis or JWTs, durable state in databases, blobs in object storage. They expose REST/gRPC, run connection pools to Postgres/Mongo, publish events to Kafka, and cache hot reads in Redis. Horizontal scale means identical replicas behind a load balancer; sticky sessions are a smell unless WebSockets force affinity. Vertical scale (bigger machine) helps until a single process or DB connection budget caps you. Observability (metrics, traces, structured logs) is part of the design, not an afterthought.',
  purpose:
    'Execute business logic and orchestrate storage, cache, and messaging for each request or job.',
  problemBefore:
    'Without an app tier, clients would talk directly to databases — exposing credentials, skipping authorization, and coupling UX to schema.',
  whatChanges:
    'You centralize rules, authz, and composition of multiple data sources; you can scale compute independently from storage and introduce async work.',
  optionalNote:
    '“Serverless functions” are still an app server conceptually — short-lived compute with the same trust and scaling trade-offs.',
  howItWorks: [
    'Load balancer (or API gateway) forwards a request to a healthy app instance.',
    'Server authenticates the caller, authorizes the action, and validates input.',
    'Server reads/writes databases, checks caches, and may enqueue async work.',
    'Server shapes a response DTO and returns it; failures map to clear HTTP/gRPC status codes.',
    'Background workers (same or sibling services) consume jobs for slow paths like email or feed fan-out.',
  ],
  architectureExamples: [
    {
      title: 'Stateless API fleet',
      path: 'Client → Load Balancer → App Server × N → Postgres + Redis',
      explanation:
        'Identical servers share no local session state. Redis holds hot cache; Postgres is durable SoT. Adding servers increases request capacity if the DB can keep up.',
    },
    {
      title: 'Sync API + async worker',
      path: 'App Server → Kafka → Worker Server → Postgres / Object Store',
      explanation:
        'The request path acknowledges quickly after publishing an event; workers handle heavy processing so user-facing latency stays low.',
    },
  ],
  useCases: [
    'Public HTTPS APIs for web and mobile clients',
    'Authentication, authorization, and rate limiting enforcement',
    'Orchestrating reads across cache + primary database',
    'Internal microservices implementing bounded contexts',
    'Cron/worker processes that share domain libraries with the API',
  ],
  whenNotToUse: [
    'Do not use the app server as a blob store — put large media in object storage and keep metadata in a DB.',
    'Avoid stuffing long-running fan-out or video transcoding into the request thread; use queues/workers.',
    'Skip a custom app server for purely static sites that a CDN can serve from object storage alone.',
  ],
  advantages: [
    {
      point: 'Central place for rules',
      detail:
        'Domain invariants, authz, and auditing live in one trusted tier instead of being duplicated across clients and raw SQL access.',
    },
    {
      point: 'Independent compute scaling',
      detail:
        'You can add app instances for CPU/RAM pressure without immediately resharding databases — until storage becomes the bottleneck.',
    },
    {
      point: 'Composition of many backends',
      detail:
        'One request can fan out to Postgres, Redis, Kafka, and object storage with a coherent API for clients.',
    },
    {
      point: 'Easier evolution',
      detail:
        'You can change schemas behind DTOs, introduce BFFs, or split services without rewriting every client.',
    },
  ],
  disadvantages: [
    {
      point: 'Single instance saturates',
      detail:
        'One process has finite CPU, memory, and DB connections. Without horizontal scale + LB, traffic growth hits a hard wall.',
    },
    {
      point: 'Stateful pitfalls',
      detail:
        'In-memory sessions or local file uploads break multi-instance deploy; you must externalize state carefully.',
    },
    {
      point: 'Operational surface',
      detail:
        'Deployments, config, secrets, and rolling restarts need discipline or you get version skew and partial outages.',
    },
    {
      point: 'N+1 and chatty patterns',
      detail:
        'Poorly written handlers amplify DB load; compute looks “fine” while the database melts.',
    },
  ],
  alternatives: [
    {
      name: 'Serverless / Functions-as-a-Service',
      when: 'Spiky traffic and short handlers where ops wants less capacity planning; watch cold starts and connection pooling.',
    },
    {
      name: 'API Gateway + direct-to-storage (limited)',
      when: 'Very simple CRUD with IAM — rare for rich products; usually still need custom logic.',
    },
    {
      name: 'Monolith vs microservices',
      when: 'Start with a modular monolith; split services when teams and scale domains demand independent deploy.',
    },
    {
      name: 'Edge compute',
      when: 'Tiny auth or A/B routing near users; keep heavy domain logic in origin app servers.',
    },
  ],
  scaling:
    'Scale vertically first for simplicity, then horizontally with a load balancer and stateless instances. Watch DB connection pools (use pooling proxies), CPU-bound vs I/O-bound work, and hot endpoints. Autoscaling needs meaningful metrics (RPS, latency, queue depth) — not just CPU. Remember: more app servers without a scalable data tier only moves the bottleneck.',
  failureScenarios: [
    'Instance crash mid-request: without idempotent writes, clients retry and duplicate side effects.',
    'Deploy bad build: all replicas unhealthy; LB has nowhere to send traffic unless canaries/rollbacks exist.',
    'Connection pool exhaustion: every request waits on Postgres; latency spikes though CPU looks idle.',
    'Cascading timeout: slow dependency causes thread pile-up; circuit breakers and bulkheads prevent total meltdown.',
  ],
  interviewQuestions: [
    {
      question: 'What does an app server do that a database cannot?',
      testing: 'Separation of compute vs storage responsibilities.',
      keyConcepts: ['business logic', 'authorization', 'orchestration'],
      sampleAnswer:
        'It enforces product rules and authz, composes multiple stores, shapes APIs for clients, and coordinates async work. Databases store and query data; they should not be your only security or UX layer.',
      commonMistakes: [
        'Letting clients talk straight to the DB',
        'Putting all logic in stored procedures without an API boundary',
      ],
      level: 'beginner',
    },
    {
      question: 'Why prefer mostly-stateless app servers?',
      testing: 'Horizontal scaling readiness.',
      keyConcepts: ['stateless', 'load balancer', 'externalized session'],
      sampleAnswer:
        'Any replica can handle any request, enabling easy scale-out and rolling deploys. Sessions and uploads live in Redis/object store so killing an instance does not lose user state.',
      commonMistakes: [
        'Storing sessions only in process memory',
        'Writing uploads to local disk on one box',
      ],
      level: 'beginner',
    },
    {
      question: 'How do you decide sync work vs async work on the server?',
      testing: 'Latency budgets and failure isolation.',
      keyConcepts: ['SLA', 'queues', 'user-visible path'],
      sampleAnswer:
        'Keep on the request path what the user must wait for (auth, write confirmation). Push email, fan-out, thumbnails, and analytics to queues so spikes and dependency failures do not block the API.',
      commonMistakes: [
        'Sending email inside the HTTP handler',
        'Making everything async and confusing the user about success',
      ],
      level: 'intermediate',
    },
    {
      question: 'App servers scale out but Postgres is hot. What do you do next?',
      testing: 'Bottleneck diagnosis beyond “add more servers”.',
      keyConcepts: ['read replicas', 'caching', 'query optimization'],
      sampleAnswer:
        'Profile queries, add indexes, introduce Redis for hot reads, consider replicas for read traffic, and only then discuss sharding. More app servers alone can make DB contention worse.',
      commonMistakes: [
        'Blindly adding app replicas',
        'Sharding as the first move',
      ],
      level: 'intermediate',
    },
    {
      question: 'Design a safe deploy strategy for a fleet of app servers behind an LB.',
      testing: 'Operational maturity under change.',
      keyConcepts: ['rolling deploy', 'health checks', 'backward compatible migrations'],
      sampleAnswer:
        'Use rolling or blue/green with health probes, drain connections, keep APIs backward compatible during rollout, migrate DB expand-then-contract, and canary a fraction of traffic before full promote. Rollback must be one decision away.',
      commonMistakes: [
        'Big-bang restart of all instances',
        'Migrating DB in a breaking way mid-deploy',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'App servers own trusted business logic and orchestration.',
    'Prefer stateless compute so load balancers can spread traffic freely.',
    'Scaling compute does not fix a saturated database — find the real bottleneck.',
  ],
  biggestTradeOff:
    'Monolithic simplicity and transactional cohesion versus microservice isolation and independent scale — with distributed complexity as the cost.',
  interviewTip:
    'Say “stateless app tier behind an LB” early, then name what state you externalized (sessions, uploads, jobs). That shows you know how servers actually scale.',
  relatedComponents: ['client', 'load-balancer', 'postgres', 'redis', 'kafka'],
}
