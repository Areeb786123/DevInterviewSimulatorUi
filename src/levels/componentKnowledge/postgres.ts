import type { ComponentKnowledge } from './types'

export const POSTGRES_KNOWLEDGE: ComponentKnowledge = {
  id: 'postgres',
  name: 'PostgreSQL',
  category: 'relational',
  iconUrl: '/assets/sysdesign/postgres.svg',
  shortDescription:
    'Durable relational SQL database with ACID transactions, joins, constraints, and indexes — a default system of record.',
  beginnerExplanation:
    'PostgreSQL is a serious database for structured data that must stay correct: users, orders, follows, balances. Tables have schemas, foreign keys keep relationships honest, and transactions mean “all of this write succeeds or none of it does.” In system design interviews, Postgres (or “SQL”) is the usual source of truth. Redis may cache it; Kafka may stream changes from it; object stores hold blobs — but money and identity usually land in a relational DB first.',
  technicalExplanation:
    'Postgres offers MVCC, rich indexing (B-tree, GIN/GiST for JSON/search), constraints, and strong consistency for primary writes. Scale path: vertical sizing → connection pooling → read replicas → partitioning → careful sharding. Write amplification, vacuum, and long transactions matter operationally. JSONB exists for flexible fields without abandoning relational integrity. It is not a blob store for multi-GB videos, and it is not a global edge cache. Choose it when relationships and transactional correctness dominate access patterns.',
  purpose:
    'Persist structured, related data with transactional integrity and expressive querying (SQL joins, constraints, indexes).',
  problemBefore:
    'Files or ad-hoc stores lose ACID guarantees; concurrent updates corrupt counters; relationships become inconsistent across collections.',
  whatChanges:
    'You get durable SoT with schemas/migrations, transactional multi-row updates, and powerful queries — at the cost of careful schema and scale planning.',
  optionalNote:
    'Postgres can store JSONB documents, but “we might need flexible fields” alone is not a reason to skip relational modeling when joins and constraints matter.',
  howItWorks: [
    'App servers open pooled connections and issue SQL (or an ORM) inside transactions when needed.',
    'Writer commits to the primary; WAL records changes for durability and replication.',
    'Read replicas (optional) apply WAL asynchronously for read scale with possible lag.',
    'Indexes accelerate selective queries; EXPLAIN plans guide optimization.',
    'Backups/PITR and migrations keep the schema evolving without losing durability.',
  ],
  architectureExamples: [
    {
      title: 'Social graph + posts SoT',
      path: 'App Server → Postgres (users, posts, follows); Redis cache of hot timelines',
      explanation:
        'Relationships and post metadata live in Postgres. Redis accelerates reads but can be flushed; Postgres remains authoritative.',
    },
    {
      title: 'Orders with inventory decrement',
      path: 'App Server → Postgres transaction (orders + inventory rows)',
      explanation:
        'A single transaction prevents oversell under concurrency — exactly where ACID shines versus eventually consistent document patterns.',
    },
  ],
  useCases: [
    'User accounts, auth credentials metadata, and roles',
    'Financial ledgers, orders, and inventory with strong consistency',
    'Social graphs (follows) and relational post metadata',
    'Reporting joins across normalized tables',
    'Any domain where constraints and multi-row atomic updates matter',
  ],
  whenNotToUse: [
    'Do not store large media blobs in Postgres — use object storage and keep URLs/metadata in SQL.',
    'Avoid as a ultra-hot ephemeral cache; Redis is cheaper for TTL’d hot keys.',
    'Skip when the access pattern is pure append-only event log at massive fan-out — consider Kafka plus specialized stores.',
  ],
  advantages: [
    {
      point: 'ACID transactions',
      detail:
        'Multi-row updates commit atomically, which simplifies correctness for payments, inventory, and relationship changes.',
    },
    {
      point: 'Joins and constraints',
      detail:
        'Foreign keys and unique constraints push integrity into the database so app bugs are less likely to corrupt relationships.',
    },
    {
      point: 'Mature tooling',
      detail:
        'Migrations, backups, ORMs, monitoring, and hiring familiarity make Postgres a low-regret default SoT.',
    },
    {
      point: 'Powerful indexing',
      detail:
        'You can tune access paths for real query patterns instead of only primary-key gets.',
    },
  ],
  disadvantages: [
    {
      point: 'Write scaling is harder',
      detail:
        'A single primary absorbs writes; naive sharding is painful. Vertical scale and partitioning need deliberate design.',
    },
    {
      point: 'Schema migration discipline',
      detail:
        'Changing hot tables online requires expand/contract patterns or you lock and stall traffic.',
    },
    {
      point: 'Connection limits',
      detail:
        'Each app instance opens pools; without PgBouncer-style pooling, horizontal app scale kills the DB.',
    },
    {
      point: 'Not ideal for huge blobs',
      detail:
        'TOAST/large objects bloat backups and I/O; object stores win for media bytes.',
    },
  ],
  alternatives: [
    {
      name: 'MySQL / MariaDB',
      when: 'Similar relational needs with different ops ecosystem or existing expertise.',
    },
    {
      name: 'MongoDB',
      when: 'Document-centric access with fewer multi-document transactions and evolving shapes — not “because scale.”',
    },
    {
      name: 'DynamoDB / wide-column',
      when: 'Known access patterns and massive partition-friendly key design at extreme scale.',
    },
    {
      name: 'Redis',
      when: 'Ephemeral hot data only — never as durable SoT for critical records.',
    },
  ],
  scaling:
    'Start with good indexes and vertical resources. Add connection pooling. Offload hot reads with Redis and/or read replicas (mind replication lag). Partition large tables by time or tenant. Shard only with clear partition keys and cross-shard query strategy. Measure slow queries before architectural fireworks.',
  failureScenarios: [
    'Primary disk full or WAL storm: writes fail; need monitoring, autovacuum tuning, and storage headroom.',
    'Failover to replica with lag: recent writes appear missing until catch-up — apps must handle brief inconsistency windows.',
    'Lock contention from long transactions: latency spikes site-wide on hot rows.',
    'Bad migration locks a busy table: deploy-induced outage.',
  ],
  interviewQuestions: [
    {
      question: 'When is PostgreSQL a good default system of record?',
      testing: 'Fit for relational durable data.',
      keyConcepts: ['ACID', 'relationships', 'SoT'],
      sampleAnswer:
        'When data is structured, related, and must stay consistent under concurrent writes — users, orders, follows. Use other stores as caches, logs, or blob layers around it.',
      commonMistakes: [
        'Defaulting to NoSQL for “web scale” without access patterns',
        'Using Redis as the only database',
      ],
      level: 'beginner',
    },
    {
      question: 'How do read replicas help, and what don’t they fix?',
      testing: 'Replication lag and write bottleneck awareness.',
      keyConcepts: ['async replication', 'read scale', 'single primary writes'],
      sampleAnswer:
        'Replicas spread read traffic and isolate analytics. They do not increase write throughput on the primary and may return slightly stale data.',
      commonMistakes: [
        'Sending writes to replicas',
        'Assuming replicas remove all scaling limits',
      ],
      level: 'beginner',
    },
    {
      question: 'How would you prevent connection storms when autoscaling app servers?',
      testing: 'Pooling and operational design.',
      keyConcepts: ['PgBouncer', 'pool sizing', 'max_connections'],
      sampleAnswer:
        'Put a pooler in front of Postgres, size per-instance pools conservatively, and scale based on DB capacity — not only app CPU. Serverless functions especially need pooling proxies.',
      commonMistakes: [
        'Opening a new connection per request',
        'Multiplying max pool size by replica count blindly',
      ],
      level: 'intermediate',
    },
    {
      question: 'Compare storing post bodies in Postgres vs object storage.',
      testing: 'Data placement judgment.',
      keyConcepts: ['metadata vs blob', 'queryability'],
      sampleAnswer:
        'Small text posts fit in Postgres for transactional feed queries. Large images/videos belong in object storage with metadata (URL, owner, size) in Postgres. Mixing huge blobs into row storage hurts backups and latency.',
      commonMistakes: [
        'Putting multi-MB images as BYTEA by default',
        'Storing only blobs with no queryable metadata DB',
      ],
      level: 'intermediate',
    },
    {
      question: 'Walk through a safe online schema change for adding a non-null column on a hot table.',
      testing: 'Expand/contract migrations.',
      keyConcepts: ['expand-contract', 'backfill', 'locks'],
      sampleAnswer:
        'Add nullable column, deploy code that writes both old and new, backfill in batches, then add constraints/not-null, finally remove old path. Avoid long ACCESS EXCLUSIVE locks on huge tables without a plan.',
      commonMistakes: [
        'ALTER adding NOT NULL with default on huge table in one step without understanding lock behavior',
        'No backfill strategy',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'Postgres is a strong default durable system of record for relational data.',
    'Scale reads with indexes, cache, and replicas; treat write sharding as advanced.',
    'Keep large blobs elsewhere; keep constraints close to critical data.',
  ],
  biggestTradeOff:
    'Strong consistency and rich querying versus harder horizontal write scaling compared to carefully partitioned NoSQL designs.',
  interviewTip:
    'Anchor the design with “Postgres as SoT,” then explicitly say what is cache (Redis) vs async (Kafka) vs blobs (object store). Clarity beats buzzwords.',
  relatedComponents: ['server', 'redis', 'mongodb', 'object-store', 'kafka'],
}
