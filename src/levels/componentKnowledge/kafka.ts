import type { ComponentKnowledge } from './types'

export const KAFKA_KNOWLEDGE: ComponentKnowledge = {
  id: 'kafka',
  name: 'Kafka',
  category: 'queue',
  iconUrl: '/assets/sysdesign/kafka.svg',
  shortDescription:
    'Durable distributed event log for asynchronous processing, fan-out, and replayable streams.',
  beginnerExplanation:
    'Kafka is like a durable diary of events: producers append messages to topics, and consumers read at their own pace. Unlike a quick in-memory pub/sub, Kafka keeps events so you can replay, fan out to many consumer groups, and survive consumer crashes without losing work. Use it when something should happen eventually — send notifications, build feeds, sync search indexes — without blocking the user’s HTTP request. It adds operational complexity; do not use Kafka to “look distributed” for simple sync CRUD.',
  technicalExplanation:
    'Topics are partitioned for parallelism; ordering is per partition, not global. Consumer groups share partitions for scale-out; multiple groups independently read the same events (fan-out). Retention is time/size based. Exactly-once is nuanced — prefer idempotent consumers and transactional outbox patterns from the DB. Compared to Redis pub/sub, Kafka is durable and replayable. Compared to SQS, Kafka excels at high-throughput log fan-out and replay, with more ops overhead. Design keys for ordering, handle poison messages with DLQs/retries, and never assume global order.',
  purpose:
    'Decouple producers from consumers with a durable, replayable event stream for async workflows and integration.',
  problemBefore:
    'Sync request paths do heavy fan-out (email, feeds, search updates); consumer crashes lose work; multiple downstreams amplify load on the primary service.',
  whatChanges:
    'Producers acknowledge after durable publish (or via outbox); consumers scale independently; events can be reprocessed; the user-facing path stays lean.',
  optionalNote:
    'Kafka is not a database replacement — it is an event log. Materialize durable queryable state into Postgres/search/etc.',
  howItWorks: [
    'Producer writes events to a topic partition (often keyed by entity id for ordering).',
    'Brokers replicate partitions for durability; retention keeps data for configured window.',
    'Consumer group members each own partitions and process messages, committing offsets.',
    'Additional consumer groups can read the same topic for different purposes (notifications vs analytics).',
    'Failed messages retry; poison pills go to a DLQ after policy; replay resets offsets if needed.',
  ],
  architectureExamples: [
    {
      title: 'Async feed fan-out',
      path: 'App Server → Kafka (post.created) → Feed Workers → Cache/DB timelines',
      explanation:
        'Creating a post returns quickly after the event is durably logged; workers update follower timelines without blocking the author.',
    },
    {
      title: 'Transactional outbox',
      path: 'Postgres transaction (business row + outbox) → Publisher → Kafka → Consumers',
      explanation:
        'Avoids “DB committed but event lost” by writing the event intent in the same DB transaction, then publishing reliably.',
    },
  ],
  useCases: [
    'Async notifications, email, and push pipelines',
    'Feed generation and fan-out on write',
    'Search/index updates and data warehouse ingestion',
    'Activity streams and audit-like event histories with retention',
    'Decoupling microservices with event-driven integration',
  ],
  whenNotToUse: [
    'Do not insert Kafka for a single sync DB write that the user must wait on with no async consumers.',
    'Avoid when you need a simple task queue with tiny volume and minimal ops — SQS/Rabbit may be enough.',
    'Skip as a queryable SoT for user-facing reads — use a database or materialized views.',
  ],
  advantages: [
    {
      point: 'Durable and replayable',
      detail:
        'Consumers can crash and resume; new services can rebuild state by replaying retained events.',
    },
    {
      point: 'Fan-out via consumer groups',
      detail:
        'Many independent pipelines read the same topic without producers knowing each subscriber.',
    },
    {
      point: 'High throughput partitioning',
      detail:
        'Partitions parallelize produce/consume for large event volumes when keys are designed well.',
    },
    {
      point: 'Decouples latency',
      detail:
        'User requests stay fast while heavy work happens asynchronously.',
    },
  ],
  disadvantages: [
    {
      point: 'Operational complexity',
      detail:
        'Brokers, partitions, consumer lag, and retention need real ownership — not a free checkbox.',
    },
    {
      point: 'Ordering and exactly-once nuance',
      detail:
        'Ordering is per partition; end-to-end exactly-once needs careful idempotency and often outbox/transactions.',
    },
    {
      point: 'Lag and backpressure',
      detail:
        'Slow consumers create lag; user-visible freshness depends on consumer health, not just produce success.',
    },
    {
      point: 'Overkill for simple jobs',
      detail:
        'Small systems pay Kafka’s cost without benefiting from replay/fan-out.',
    },
  ],
  alternatives: [
    {
      name: 'SQS / cloud queues',
      when: 'Simple task buffering with managed ops and less need for multi-group replay.',
    },
    {
      name: 'RabbitMQ',
      when: 'Flexible routing and classic messaging patterns at moderate scale.',
    },
    {
      name: 'Redis Streams / pub-sub',
      when: 'Lightweight streaming with weaker durability needs — not a Kafka substitute for critical durable logs.',
    },
    {
      name: 'Synchronous calls',
      when: 'The user must see the side effect immediately and volume is manageable.',
    },
  ],
  scaling:
    'Scale throughput with more partitions (planned ahead — shrinking is hard). Scale consumers with group members ≤ partitions. Watch consumer lag, disk retention, and key skew (hot partitions). Separate topics by failure domains. Capacity-plan brokers for peak produce + retention window.',
  failureScenarios: [
    'Consumer bug poison-pills a partition: lag grows forever without DLQ/skip policy.',
    'Hot key (all events same partition key): one partition bottlenecks despite many consumers.',
    'Produced event but DB write failed (or vice versa) without outbox: split-brain between state and stream.',
    'Retention expired before a new consumer needed replay: cannot rebuild without another source.',
  ],
  interviewQuestions: [
    {
      question: 'When should you introduce Kafka in a system design?',
      testing: 'Async boundary judgment.',
      keyConcepts: ['async processing', 'fan-out', 'durability'],
      sampleAnswer:
        'When work can be asynchronous, must not be lost, and/or multiple consumers need the same events. Not for every write path by default.',
      commonMistakes: [
        'Adding Kafka to look scalable',
        'Using it as the primary user database',
      ],
      level: 'beginner',
    },
    {
      question: 'What ordering guarantees does Kafka provide?',
      testing: 'Partition ordering literacy.',
      keyConcepts: ['partitions', 'keys', 'no global order'],
      sampleAnswer:
        'Messages in a single partition are ordered. Global order across partitions is not guaranteed. Key by entity id when per-entity order matters.',
      commonMistakes: [
        'Assuming total global order',
        'Random keys when order per user matters',
      ],
      level: 'beginner',
    },
    {
      question: 'How do consumer groups enable fan-out and scale-out?',
      testing: 'Consumer model understanding.',
      keyConcepts: ['consumer group', 'partitions', 'independent groups'],
      sampleAnswer:
        'Within a group, partitions are split among members (scale-out). Separate groups each receive all messages (fan-out) for different processing pipelines.',
      commonMistakes: [
        'Putting unrelated processors in one group unintentionally',
        'More consumers than partitions with expectation of higher parallelism',
      ],
      level: 'intermediate',
    },
    {
      question: 'What is the dual-write problem and how does the outbox pattern help?',
      testing: 'Reliability between DB and bus.',
      keyConcepts: ['dual write', 'outbox', 'idempotency'],
      sampleAnswer:
        'Writing DB and Kafka separately can leave one succeeding. Outbox writes the event in the same DB transaction; a publisher pushes to Kafka later. Consumers remain idempotent.',
      commonMistakes: [
        'Ignoring dual-write races',
        'Assuming producer acknowledgements equal DB commit',
      ],
      level: 'intermediate',
    },
    {
      question: 'How would you design idempotent consumers for at-least-once delivery?',
      testing: 'Exactly-once realism.',
      keyConcepts: ['at-least-once', 'idempotency keys', 'dedupe store'],
      sampleAnswer:
        'Assume duplicates. Use event ids in a processed-set (DB unique constraint) or make updates naturally idempotent. Combine with retries/DLQ. “Exactly-once” end-to-end is a property you build, not a checkbox.',
      commonMistakes: [
        'Relying only on Kafka exactly-once flags without app semantics',
        'Non-idempotent email sends on retry',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'Kafka is a durable event log for async, fan-out, and replay — not a user-facing DB.',
    'Ordering is per partition; design keys deliberately.',
    'Pair producers with outbox/idempotent consumers to survive real failure modes.',
  ],
  biggestTradeOff:
    'Decoupling, durability, and replay power versus operational complexity and eventual processing lag.',
  interviewTip:
    'When you add Kafka, name one concrete consumer and what happens if it lags. Vague “event-driven” answers ring hollow.',
  relatedComponents: ['server', 'postgres', 'redis', 'websocket'],
}
