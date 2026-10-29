import type { ComponentKnowledge } from './types'

export const REDIS_KNOWLEDGE: ComponentKnowledge = {
  id: 'redis',
  name: 'Redis',
  category: 'cache',
  iconUrl: '/assets/sysdesign/redis.svg',
  shortDescription:
    'In-memory data store for ultra-fast ephemeral structures — a cache and coordination tool, not a durable system of record.',
  beginnerExplanation:
    'Redis keeps data in memory so reads and writes are extremely fast. Teams use it to cache hot database results, store sessions, rate-limit APIs, and keep leaderboards or counters. Critical interview rule: Redis is not your durable source of truth. If Redis restarts and data vanishes (or evicts under memory pressure), the system must still be correct by reading Postgres/Mongo/object metadata. Treat Redis as a speed layer and coordination helper, not the ledger of record.',
  technicalExplanation:
    'Redis offers strings, hashes, lists, sets, sorted sets, streams, and more with microsecond-scale ops on a single thread per shard. Persistence (RDB/AOF) exists but is a trade-off — enablement does not make Redis a substitute for a transactional DB for critical entities. Patterns: cache-aside, write-through, write-behind (risky), distributed locks (careful), rate limiting, pub/sub (ephemeral). Clustering and replicas address memory and HA. Always design TTL, eviction (LRU/LFU), and stampede protection. Invalidation is the hard part.',
  purpose:
    'Accelerate hot paths and hold ephemeral coordination state with low latency — while a durable database remains SoT.',
  problemBefore:
    'Every request hammers the primary database for the same hot keys; latency and cost soar; ephemeral needs (rate limits) abuse the durable DB.',
  whatChanges:
    'Hot reads become cheap and fast; you accept invalidation complexity, memory limits, and the rule that loss of Redis must not corrupt durable truth.',
  optionalNote:
    'AOF/RDB can reduce data loss for some use cases (sessions), but interview answers should still refuse Redis as durable SoT for money, identity source, or irreplaceable content.',
  howItWorks: [
    'App checks Redis for a key (cache-aside); on miss, loads from durable DB and populates Redis with TTL.',
    'Writes go to the durable DB first (or in the same logical flow); then cache is updated or invalidated.',
    'Memory pressure triggers eviction per policy; TTLs expire stale entries intentionally.',
    'Replicas/failover provide HA; cluster shards keys across nodes for more memory/throughput.',
    'Specialized structures (sorted sets, atomic INCR) implement leaderboards, rate limits, and locks.',
  ],
  architectureExamples: [
    {
      title: 'Cache-aside timeline',
      path: 'App Server → Redis (hot feed); miss → Postgres; fill Redis with TTL',
      explanation:
        'Postgres remains SoT for posts. Redis may serve stale data briefly; flush/restart only causes more DB load, not permanent data loss of posts.',
    },
    {
      title: 'Rate limiting gateway',
      path: 'Load Balancer → App Server → Redis INCR + EXPIRE per user/IP',
      explanation:
        'Ephemeral counters enforce quotas. Losing Redis may briefly loosen limits — acceptable vs losing the user database.',
    },
  ],
  useCases: [
    'Cache-aside for expensive read queries and hot profiles',
    'Session store and short-lived auth metadata',
    'API rate limiting and abuse throttles',
    'Ephemeral leaderboards, presence flags, and counters',
    'Distributed locks or idempotency keys with short TTL (carefully)',
  ],
  whenNotToUse: [
    'Never as the only store for durable business records (orders, balances, posts canonical body).',
    'Avoid when you cannot articulate invalidation/TTL — a wrong cache is worse than a slow correct DB.',
    'Skip for large binary media — use object storage; Redis memory is expensive.',
  ],
  advantages: [
    {
      point: 'Extremely low latency',
      detail:
        'In-memory operations absorb hot-key traffic that would overwhelm disk-backed databases.',
    },
    {
      point: 'Rich data structures',
      detail:
        'Sorted sets, hashes, and atomic counters implement features that are awkward in SQL alone.',
    },
    {
      point: 'Cheap hot-path offload',
      detail:
        'Reducing primary DB QPS often buys more headroom than premature sharding.',
    },
    {
      point: 'Simple operational mental model for caching',
      detail:
        'Key-value with TTL is easy to reason about when paired with clear SoT ownership.',
    },
  ],
  disadvantages: [
    {
      point: 'Not durable SoT',
      detail:
        'Restarts, failover, and eviction can drop data. Critical truth must live in a real database.',
    },
    {
      point: 'Invalidation complexity',
      detail:
        'Stale reads, thundering herds, and inconsistent multi-key updates are classic failure modes.',
    },
    {
      point: 'Memory-bound cost',
      detail:
        'Working set must fit (clustered) memory; treating Redis like cheap disk leads to OOM and eviction storms.',
    },
    {
      point: 'Single-threaded command execution per shard',
      detail:
        'Heavy commands or huge keys stall others; need careful key design and sometimes clustering.',
    },
  ],
  alternatives: [
    {
      name: 'Memcached',
      when: 'Simple volatile cache without Redis data structures.',
    },
    {
      name: 'Application-level / CDN cache',
      when: 'Static or edge-cacheable content without per-key server coordination.',
    },
    {
      name: 'DB materialized views / better indexes',
      when: 'The “cache” need is really a missing query plan — fix Postgres first.',
    },
    {
      name: 'Kafka / streams',
      when: 'Durable event ordering and replay — not ephemeral pub/sub.',
    },
  ],
  scaling:
    'Size for working set + headroom. Use clustering for memory/throughput; replicas for HA/read offload. Protect with TTLs, request coalescing, and soft/hard hit limits to the DB on miss. Watch eviction rates and hot keys. Scale Redis after proving a specific hot path — not as a default second database.',
  failureScenarios: [
    'Cache stampede: key expires, many app servers miss simultaneously and stampede the DB.',
    'Full memory + aggressive eviction: hit ratio collapses and DB load spikes.',
    'Treating Redis as SoT then losing the node: irrecoverable business data.',
    'Incorrect invalidation after writes: users see stale permissions or prices.',
  ],
  interviewQuestions: [
    {
      question: 'Is Redis a good primary database for user posts?',
      testing: 'Durable SoT discipline.',
      keyConcepts: ['cache vs SoT', 'durability', 'eviction'],
      sampleAnswer:
        'No. Posts belong in a durable store (Postgres/Mongo). Redis may cache hot posts; if Redis dies, you reload from SoT. Durability modes do not change this interview answer for critical content.',
      commonMistakes: [
        'Using Redis as the only store “for speed”',
        'Ignoring eviction and restarts',
      ],
      level: 'beginner',
    },
    {
      question: 'Explain cache-aside versus write-through.',
      testing: 'Caching patterns.',
      keyConcepts: ['cache-aside', 'write-through', 'invalidation'],
      sampleAnswer:
        'Cache-aside: app reads cache, loads DB on miss, populates cache; writes update DB then invalidate/update cache. Write-through: writes go to cache and DB together. Cache-aside is common; both still need a durable DB underneath.',
      commonMistakes: [
        'Write-behind to Redis without durable backup for critical data',
        'Never invalidating after writes',
      ],
      level: 'beginner',
    },
    {
      question: 'How do you prevent a thundering herd on cache expiry?',
      testing: 'Stampede control.',
      keyConcepts: ['singleflight', 'probabilistic early expiry', 'locking'],
      sampleAnswer:
        'Coalesce misses (singleflight), use soft TTL with probabilistic refresh, or allow one waiter to fill while others serve stale briefly. Also jitter TTLs so keys do not align.',
      commonMistakes: [
        'Same TTL on millions of keys set at once',
        'No miss coalescing',
      ],
      level: 'intermediate',
    },
    {
      question: 'When is Redis appropriate for sessions?',
      testing: 'Ephemeral state judgment.',
      keyConcepts: ['session store', 'TTL', 'externalized state'],
      sampleAnswer:
        'Sessions are ephemeral and regenerable via re-login, so Redis fits: fast, TTL’d, shared across app servers. Still back identity/credentials metadata in a durable DB. Losing sessions is annoying, not catastrophic like losing orders.',
      commonMistakes: [
        'Storing irreversible business events only in session store',
        'No TTL on sessions',
      ],
      level: 'intermediate',
    },
    {
      question: 'Design a rate limiter with Redis and discuss failure modes.',
      testing: 'End-to-end ephemeral design.',
      keyConcepts: ['INCR', 'sliding window', 'fail open vs closed'],
      sampleAnswer:
        'Use INCR+EXPIRE or a sliding window / token bucket in Redis keyed by user. On Redis outage, choose fail-open (availability) or fail-closed (safety) deliberately. Do not use the durable DB for per-request counters at high QPS.',
      commonMistakes: [
        'No decision on fail-open/closed',
        'Unbounded keys without expiry',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'Redis is a speed and coordination layer — not durable SoT for critical data.',
    'TTL, eviction, and invalidation define correctness of cached reads.',
    'Use Redis to protect databases on proven hot paths, not as a default second SoT.',
  ],
  biggestTradeOff:
    'Microsecond latency and DB offload versus stale-data risk, memory cost, and operational complexity of invalidation.',
  interviewTip:
    'Say out loud: “Redis is not the source of truth.” Then name the durable store. That single sentence prevents a common fail.',
  relatedComponents: ['postgres', 'mongodb', 'server', 'load-balancer'],
}
