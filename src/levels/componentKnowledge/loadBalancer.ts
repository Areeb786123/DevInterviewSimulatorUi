import type { ComponentKnowledge } from './types'

export const LOAD_BALANCER_KNOWLEDGE: ComponentKnowledge = {
  id: 'load-balancer',
  name: 'Load Balancer',
  category: 'load_balancing',
  iconUrl: '/assets/sysdesign/load-balancer.svg',
  shortDescription:
    'A front door that spreads traffic across healthy app instances — enables horizontal scale, not scalability by itself.',
  beginnerExplanation:
    'A load balancer is a traffic cop in front of several identical app servers. Users hit one address; the LB picks a healthy server for each request. Without it, you are stuck with one machine or ugly DNS hacks. Important interview truth: a load balancer alone is not “scalability.” It only helps if you have multiple capable backends and a data tier that can absorb the work. Drawing an LB with a single overloaded database is theater.',
  technicalExplanation:
    'LBs operate at L4 (TCP/UDP) or L7 (HTTP/gRPC): routing, TLS termination, health checks, sticky sessions, and sometimes WAF/rate limits. Algorithms include round-robin, least connections, and latency-aware. Health probes remove bad instances from rotation. Sticky sessions pin a client to one server — useful for WebSockets, harmful for general APIs if overused. LBs are themselves highly available pairs or managed cloud services. They add a hop and can become a bottleneck if mis-sized, but correctly used they unlock horizontal compute scale.',
  purpose:
    'Provide a single stable entry point and distribute requests across multiple app instances with health awareness.',
  problemBefore:
    'One server handles all traffic; upgrades take the site down; DNS round-robin lacks health checks and slow failover.',
  whatChanges:
    'You can add/remove app instances, roll deploys with draining, and survive single-instance failure — provided backends are mostly interchangeable.',
  optionalNote:
    'Saying “we’ll add a load balancer for scale” without multiple app servers and a plan for the database is a classic interview red flag.',
  howItWorks: [
    'Clients resolve a hostname to the load balancer (or Anycast IP).',
    'LB terminates TLS (often) and inspects L4/L7 attributes for routing.',
    'Health checks mark backends up/down; only healthy instances receive traffic.',
    'LB selects a backend via its algorithm and forwards the request.',
    'On deploy, instances are drained (connection draining) then replaced; LB updates membership.',
  ],
  architectureExamples: [
    {
      title: 'Horizontal API scale-out',
      path: 'Client → Load Balancer → App Server × N → Postgres',
      explanation:
        'N stateless servers share one VIP. Capacity grows with N until Postgres or another dependency saturates — the LB did not magically fix storage.',
    },
    {
      title: 'WebSocket with affinity',
      path: 'Client → L7 LB (sticky) → WebSocket-capable App Server',
      explanation:
        'Long-lived connections need sticky routing or a shared pub/sub layer so messages reach the right process. Sticky alone does not replace a realtime fan-out design.',
    },
  ],
  useCases: [
    'Spreading HTTPS API traffic across identical app replicas',
    'Zero-downtime rolling deployments with health checks',
    'TLS termination and centralized certificate management',
    'Routing by path/host to different services (L7)',
    'Shielding backends from direct public exposure',
  ],
  whenNotToUse: [
    'Do not add an LB in front of a single server and call the system “scalable.”',
    'Avoid sticky sessions for ordinary REST APIs — they hinder even load and graceful deploys.',
    'Skip a custom LB when a managed API gateway or service mesh already provides equivalent routing for your stage.',
  ],
  advantages: [
    {
      point: 'Enables horizontal compute scale',
      detail:
        'With interchangeable backends, you add instances under the same hostname and increase request capacity without changing clients.',
    },
    {
      point: 'Health-aware failover',
      detail:
        'Failed instances are pulled from rotation automatically, shrinking blast radius compared to raw DNS round-robin.',
    },
    {
      point: 'Operational flexibility',
      detail:
        'Rolling deploys, canaries, and blue/green become practical because traffic can be shifted gradually.',
    },
    {
      point: 'Central policy point',
      detail:
        'TLS, basic rate limits, and routing rules live in one place instead of on every app box.',
    },
  ],
  disadvantages: [
    {
      point: 'Extra network hop',
      detail:
        'Adds latency and another component to operate; misconfiguration can black-hole traffic.',
    },
    {
      point: 'Not a database scale solution',
      detail:
        'More app servers behind an LB can increase pressure on Postgres/Mongo — LB ≠ end-to-end scalability.',
    },
    {
      point: 'Sticky session traps',
      detail:
        'Affinity creates hot spots and makes instance replacement harder; prefer externalized state.',
    },
    {
      point: 'LB as SPOF if poorly designed',
      detail:
        'A single non-HA balancer becomes the new single point of failure; use managed HA or active-passive pairs.',
    },
  ],
  alternatives: [
    {
      name: 'DNS round-robin',
      when: 'Tiny scale with tolerant failover; lacks fast health removal — usually inferior to a real LB.',
    },
    {
      name: 'Service mesh / client-side LB',
      when: 'East-west microservice traffic inside a cluster with sophisticated policies.',
    },
    {
      name: 'API Gateway',
      when: 'You need auth plugins, request transforms, and product APIs in addition to balancing.',
    },
    {
      name: 'Anycast / global LB',
      when: 'Multi-region entry with geo routing beyond a single regional balancer.',
    },
  ],
  scaling:
    'Scale the LB tier with HA pairs or cloud-managed capacity; scale app backends independently. Measure backend saturation, not only LB CPU. Pair with autoscaling groups driven by RPS/latency. For multi-region, combine DNS/global LB with regional balancers. Always ask what saturates next — often the database.',
  failureScenarios: [
    'All backends fail health checks: LB returns 502/503; need capacity headroom and faster rollback.',
    'Mis-set health check path: healthy apps marked down (or sick apps marked up), causing outages or bad traffic.',
    'TLS cert expiry on the LB: entire product unreachable despite healthy apps.',
    'Sticky session backend dies: users lose in-memory state unless sessions were externalized.',
  ],
  interviewQuestions: [
    {
      question: 'What problem does a load balancer solve?',
      testing: 'Basic role of LB in architecture.',
      keyConcepts: ['traffic distribution', 'single entry point', 'health checks'],
      sampleAnswer:
        'It gives one stable address and spreads requests across healthy app instances so you can scale compute horizontally and deploy with less downtime.',
      commonMistakes: [
        'Saying LB alone makes the whole system scalable',
        'Confusing LB with a database proxy',
      ],
      level: 'beginner',
    },
    {
      question: 'Why is “add a load balancer” not enough for scalability?',
      testing: 'Whether the candidate understands end-to-end bottlenecks.',
      keyConcepts: ['bottleneck', 'stateless apps', 'data tier'],
      sampleAnswer:
        'An LB only helps if multiple app instances can share work and dependencies (DB, cache, disk) can handle the aggregate load. Otherwise you just fan more traffic into the same bottleneck.',
      commonMistakes: [
        'Drawing LB + 1 DB and claiming infinite scale',
        'Ignoring connection limits on the database',
      ],
      level: 'beginner',
    },
    {
      question: 'L4 vs L7 load balancing — when do you pick each?',
      testing: 'Protocol-layer understanding.',
      keyConcepts: ['TCP', 'HTTP routing', 'TLS termination'],
      sampleAnswer:
        'L4 is simpler and fast for raw TCP (including TLS passthrough). L7 understands HTTP paths/hosts/headers for routing, rewrites, and sticky cookies — at higher cost and complexity.',
      commonMistakes: [
        'Always choosing L7 “because HTTP”',
        'Using L4 when path-based routing is required',
      ],
      level: 'intermediate',
    },
    {
      question: 'When are sticky sessions justified, and what is the better alternative?',
      testing: 'State management judgment.',
      keyConcepts: ['session affinity', 'externalized state', 'WebSockets'],
      sampleAnswer:
        'Justify for WebSockets or legacy apps that keep local state. Better: store sessions in Redis and keep servers interchangeable so any instance can serve any user.',
      commonMistakes: [
        'Defaulting to sticky for all APIs',
        'Forgetting sticky complicates deploys',
      ],
      level: 'intermediate',
    },
    {
      question: 'How would you design LB health checks to avoid flapping and false downs?',
      testing: 'Operational nuance.',
      keyConcepts: ['shallow vs deep health', 'thresholds', 'dependency failure'],
      sampleAnswer:
        'Use a cheap /healthz for liveness. Optionally a deeper readiness that checks critical deps — but if deep checks fail when a dependency is degraded, you may remove all instances at once. Use thresholds, hysteresis, and separate “accept traffic” from “process dying.”',
      commonMistakes: [
        'Health check that hits the primary DB on every probe at high QPS',
        'Marking down the whole fleet when Redis blips',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'Load balancers enable horizontal app scale — they are not scalability by themselves.',
    'Health checks and draining make deploys and failover practical.',
    'Prefer stateless backends; use sticky sessions sparingly.',
  ],
  biggestTradeOff:
    'Centralized routing power and operational control versus an extra hop and a critical component that must itself be highly available.',
  interviewTip:
    'When you place an LB, immediately say “N app servers + what happens to the DB.” Interviewers listen for that next sentence.',
  relatedComponents: ['client', 'server', 'websocket', 'cdn'],
}
