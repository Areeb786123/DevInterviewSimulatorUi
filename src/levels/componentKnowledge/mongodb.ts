import type { ComponentKnowledge } from './types'

export const MONGODB_KNOWLEDGE: ComponentKnowledge = {
  id: 'mongodb',
  name: 'MongoDB',
  category: 'document',
  iconUrl: '/assets/sysdesign/mongodb.svg',
  shortDescription:
    'Document database for flexible, denormalized JSON-like records — not automatic scalability by itself.',
  beginnerExplanation:
    'MongoDB stores data as documents (like JSON) in collections instead of rigid tables with joins everywhere. That feels natural when each record has nested fields that vary (a product with different attributes, a content card with mixed media metadata). Interview trap: MongoDB does not magically scale because it is “NoSQL.” Scaling still needs replica sets, shard keys that match access patterns, and indexes. Choosing Mongo “so we can scale” without a key design is a common fail.',
  technicalExplanation:
    'Documents embed related data to match read patterns; multi-document transactions exist but are not the sweet spot versus embedding. Replica sets provide HA and secondary reads; sharding distributes data by shard key — a bad key creates hot shards. Secondary indexes, aggregation pipeline, and tunable write/read concerns matter. Schema flexibility shifts discipline to the application: without constraints, garbage accumulates. Prefer Mongo when document access beats relational joins; prefer Postgres when relationships and multi-row ACID dominate.',
  purpose:
    'Store and query document-shaped data with flexible schemas aligned to how the application reads whole records.',
  problemBefore:
    'Rigid schemas force awkward null columns or constant migrations for evolving shapes; ORMs fight nested structures that the product naturally embeds.',
  whatChanges:
    'You model around documents and access patterns, accept duplication/denormalization trade-offs, and design indexes and shard keys deliberately for scale.',
  optionalNote:
    '“Flexible schema” is a product/ops trade-off, not free correctness. Mongo is not automatic scale — shard keys and workload design are.',
  howItWorks: [
    'App writes BSON documents to a primary in a replica set; secondaries replicate for HA.',
    'Queries use indexes on fields (and compound indexes) matching filter/sort patterns.',
    'Embedded subdocuments avoid joins for common reads; references used when embedding bloats.',
    'Sharded clusters route by shard key; mongos coordinates queries across shards.',
    'Read/write concern settings trade latency for durability/visibility guarantees.',
  ],
  architectureExamples: [
    {
      title: 'Content cards with varying fields',
      path: 'App Server → MongoDB (posts with embedded media metadata); Object Store for bytes',
      explanation:
        'Each post document holds heterogeneous attributes; large files stay in object storage. Mongo is not chosen merely because traffic is high.',
    },
    {
      title: 'Sharded tenant documents',
      path: 'App Server → Mongos → Sharded Mongo (shard key = tenantId)',
      explanation:
        'Workloads that always query by tenant map cleanly to a shard key. Cross-tenant analytics needs a different plan — sharding did not make that free.',
    },
  ],
  useCases: [
    'Product catalogs with sparse, varying attributes',
    'Content/CMS documents with nested blocks',
    'Event-like records where the whole document is read together',
    'Prototypes evolving fields quickly before schemas stabilize',
    'Workloads designed around document get-by-id and indexed field queries',
  ],
  whenNotToUse: [
    'Do not pick Mongo solely “for scale” — without access-pattern-aligned keys you will not scale well.',
    'Avoid as the ledger for complex multi-entity financial transactions better suited to relational ACID.',
    'Skip when heavy relational joins across many collections are the norm — you will reimplement a worse SQL.',
  ],
  advantages: [
    {
      point: 'Natural document model',
      detail:
        'Nested data matches many product payloads, reducing join-heavy reads when embedding is appropriate.',
    },
    {
      point: 'Schema flexibility',
      detail:
        'New fields can appear without immediate ALTER TABLE ceremonies — useful for evolving product shapes (with app-level discipline).',
    },
    {
      point: 'Horizontal scale path via sharding',
      detail:
        'When shard keys match queries, you can distribute data and load across machines — a designed outcome, not automatic.',
    },
    {
      point: 'Replica set HA',
      detail:
        'Automatic primary election and secondaries improve availability for the document store.',
    },
  ],
  disadvantages: [
    {
      point: 'Not automatic scale',
      detail:
        'Bad shard keys, missing indexes, and unbounded documents create hot partitions and slow queries just like any database.',
    },
    {
      point: 'Joins and relations are harder',
      detail:
        'Referencing across collections pushes complexity to the app; transactions across many docs cost more than people expect.',
    },
    {
      point: 'Duplication / denormalization drift',
      detail:
        'Embedded copies speed reads but need update strategies when shared data changes.',
    },
    {
      point: 'Weaker built-in relational constraints',
      detail:
        'Uniqueness and referential integrity need more application care than Postgres foreign keys.',
    },
  ],
  alternatives: [
    {
      name: 'PostgreSQL (incl. JSONB)',
      when: 'You want flexible fields plus real joins, constraints, and mature transactional patterns.',
    },
    {
      name: 'DynamoDB / key-value stores',
      when: 'Extreme scale with strictly known access patterns and partition keys.',
    },
    {
      name: 'Elasticsearch',
      when: 'Primary need is full-text search/analytics over documents (often fed from a primary DB).',
    },
    {
      name: 'Redis',
      when: 'Ephemeral hot keys — not a document SoT.',
    },
  ],
  scaling:
    'Index for real queries first. Use replica sets for HA and read offloading. Introduce sharding only with a shard key that appears in nearly every query and spreads writes. Monitor hot shards, document size limits, and working set vs RAM. Horizontal scale is engineered — MongoDB will not invent a good key for you.',
  failureScenarios: [
    'Hot shard from monotonic shard key (e.g., timestamp): one shard takes all writes while others idle.',
    'Unbounded array growth in documents: performance cliffs and large update costs.',
    'Primary election during write spike: brief write unavailability; apps need retries/idempotency.',
    'Missing index on a common filter: collection scans melt the cluster under load.',
  ],
  interviewQuestions: [
    {
      question: 'Why might you choose MongoDB over PostgreSQL?',
      testing: 'Document model fit, not hype.',
      keyConcepts: ['embedding', 'access patterns', 'flexible schema'],
      sampleAnswer:
        'When the unit of read/write is a document with nested varying fields and joins are rare. Not because NoSQL automatically scales better.',
      commonMistakes: [
        'Choosing Mongo for “web scale” by default',
        'Ignoring relational integrity needs',
      ],
      level: 'beginner',
    },
    {
      question: 'Does MongoDB automatically scale as traffic grows?',
      testing: 'Myth-busting automatic scale.',
      keyConcepts: ['sharding', 'shard key', 'indexes'],
      sampleAnswer:
        'No. You still need indexes, capacity, and — for horizontal scale — a shard key aligned to queries. Mis-sharding can make things worse.',
      commonMistakes: [
        'Equating NoSQL with free scale',
        'Sharding without knowing access patterns',
      ],
      level: 'beginner',
    },
    {
      question: 'Embed vs reference — how do you decide?',
      testing: 'Data modeling judgment.',
      keyConcepts: ['denormalization', 'document size', 'update frequency'],
      sampleAnswer:
        'Embed data read together and updated together. Reference when shared widely, updated independently, or when embedding would bloat documents past comfort.',
      commonMistakes: [
        'Always embedding everything',
        'Always normalizing like SQL without reason',
      ],
      level: 'intermediate',
    },
    {
      question: 'What makes a good shard key?',
      testing: 'Sharding fundamentals.',
      keyConcepts: ['cardinality', 'write distribution', 'query isolation'],
      sampleAnswer:
        'High cardinality, even write distribution, and present in targeted queries so mongos can avoid scatter-gather. Avoid purely sequential keys for write-heavy workloads.',
      commonMistakes: [
        'Sharding on createdAt alone',
        'Keys that force broadcast queries',
      ],
      level: 'intermediate',
    },
    {
      question: 'How do multi-document transactions change the Mongo vs Postgres decision?',
      testing: 'Nuanced consistency discussion.',
      keyConcepts: ['transactions', 'modeling', 'performance'],
      sampleAnswer:
        'Mongo can do multi-doc transactions, but heavy reliance suggests a relational model may fit better. Prefer document designs that need single-doc atomicity; use Postgres when complex multi-entity ACID is core.',
      commonMistakes: [
        'Assuming transactions make modeling irrelevant',
        'Ignoring transaction overhead under contention',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'Mongo fits document-shaped access patterns — not a generic “scale” button.',
    'Sharding and indexes must match how you query; otherwise horizontal scale fails.',
    'Denormalization speeds reads but creates update and consistency work.',
  ],
  biggestTradeOff:
    'Flexible documents and embed-friendly reads versus weaker relational constraints and shard-key-sensitive scaling.',
  interviewTip:
    'If you propose Mongo, state the document shape and access pattern in one sentence. If you cannot, consider Postgres.',
  relatedComponents: ['postgres', 'server', 'object-store', 'redis'],
}
