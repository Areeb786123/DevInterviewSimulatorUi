import type { ComponentKnowledge } from './types'

export const OBJECT_STORE_KNOWLEDGE: ComponentKnowledge = {
  id: 'object-store',
  name: 'Object Store',
  category: 'blob',
  iconUrl: '/assets/sysdesign/object-store.svg',
  shortDescription:
    'Cheap, durable blob storage for media and large files — metadata and queries live in a real database.',
  beginnerExplanation:
    'Object storage (think S3-style buckets) holds large files: photos, videos, PDFs, backups. You do not run SQL against the bytes; you store an object under a key and get a URL. In social apps, the image bytes go to object storage while Postgres/Mongo keep who uploaded it, captions, and permissions. Beginners sometimes shove images into the database — that bloats backups and slows queries. Object stores scale storage cheaply; they are not your relational brain.',
  technicalExplanation:
    'Objects are immutable blobs addressed by key, with eventual or strong consistency depending on the provider/operation. Common pattern: app issues pre-signed upload URLs; client uploads directly to the store; app saves metadata in DB; CDN sits in front for reads. Versioning, lifecycle policies, and encryption matter for ops. Throughput scales independently of app DB. Not for low-latency tiny key-value of hot counters (use Redis) nor for transactional multi-row business logic (use Postgres).',
  purpose:
    'Store and serve large binary objects cheaply and durably while keeping queryable metadata elsewhere.',
  problemBefore:
    'App servers and databases drown in multi-MB blobs; disk on app boxes does not survive scale-out; backups become enormous.',
  whatChanges:
    'Media scales independently; app servers stay thin; CDN can cache objects near users; DB rows stay small and queryable.',
  optionalNote:
    'Always pair object keys with metadata in Postgres/Mongo — the bucket alone is a poor place to answer “posts by user last week.”',
  howItWorks: [
    'User requests upload; app authorizes and returns a pre-signed URL (or accepts a short proxy upload).',
    'Client PUTs bytes directly to the object store; app records key, owner, content-type, size in the database.',
    'On read, app returns a CDN or object URL after authz checks on metadata.',
    'Lifecycle rules move cold objects to cheaper tiers; versioning protects against overwrite mistakes.',
    'Workers may process objects asynchronously (thumbnails) writing derived keys back to metadata.',
  ],
  architectureExamples: [
    {
      title: 'Photo upload social path',
      path: 'Client → App Server (metadata) → Object Store (bytes); CDN for reads',
      explanation:
        'Postgres stores post rows with object keys; browsers fetch images via CDN without saturating app servers.',
    },
    {
      title: 'Async thumbnail pipeline',
      path: 'Object Store event → Kafka/Queue → Worker → derived objects + DB update',
      explanation:
        'Original upload is durable immediately; variants generate asynchronously without blocking the uploader.',
    },
  ],
  useCases: [
    'User photos, videos, and voice notes',
    'Static export files, invoices, and attachments',
    'Database backups and log archives',
    'ML training datasets and model artifacts',
    'Static website origins paired with a CDN',
  ],
  whenNotToUse: [
    'Do not use object storage as a general-purpose queryable database for relationships and transactions.',
    'Avoid for tiny hot mutable counters updated thousands of times per second — Redis/DB win.',
    'Skip storing secrets as world-readable public objects without encryption and IAM controls.',
  ],
  advantages: [
    {
      point: 'Cheap durable capacity',
      detail:
        'Store petabytes of media without expanding expensive database disks or app local volumes.',
    },
    {
      point: 'Independent scaling',
      detail:
        'Blob traffic and storage growth do not force Postgres resharding.',
    },
    {
      point: 'Direct client upload/download',
      detail:
        'Pre-signed URLs offload bandwidth from app servers.',
    },
    {
      point: 'CDN-friendly',
      detail:
        'Immutable object URLs cache cleanly at the edge for global read performance.',
    },
  ],
  disadvantages: [
    {
      point: 'Not queryable like SQL',
      detail:
        'Listing and scanning buckets is not a substitute for indexed metadata queries.',
    },
    {
      point: 'Consistency and rename semantics',
      detail:
        'Overwrite/read-after-write behaviors vary; apps should use unique keys and metadata transactions carefully.',
    },
    {
      point: 'Permission foot-guns',
      detail:
        'Public buckets and leaked pre-signed URLs cause data exposure incidents.',
    },
    {
      point: 'Small-object overhead',
      detail:
        'Millions of tiny objects can be inefficient versus packing or a different store.',
    },
  ],
  alternatives: [
    {
      name: 'Filesystem on app servers',
      when: 'Tiny single-node tools only — fails horizontal scale and durability needs.',
    },
    {
      name: 'Postgres BYTEA / Mongo GridFS',
      when: 'Very small binaries tightly bound to rows — still usually inferior to object storage at scale.',
    },
    {
      name: 'CDN origin only / specialized media platforms',
      when: 'Heavy video streaming with transcoding pipelines as a productized service.',
    },
    {
      name: 'Block storage volumes',
      when: 'Databases need POSIX disks — different problem than public media blobs.',
    },
  ],
  scaling:
    'Object stores scale storage and bandwidth with almost no app changes. Scale pressure moves to metadata DB, upload authorization QPS, and CDN cache hit ratio. Use partitioned key prefixes thoughtfully (avoid extreme hotspot prefixes on some providers). Lifecycle policies control cost as data ages.',
  failureScenarios: [
    'Metadata saved but upload fails (or reverse): orphaned objects or broken URLs — need reconciliation jobs.',
    'Public bucket misconfig: private user media exposed.',
    'Expired pre-signed URL UX failures during slow mobile uploads — need refresh strategy.',
    'CDN caches a wrong object after overwrite with same URL — prefer immutable versioned keys.',
  ],
  interviewQuestions: [
    {
      question: 'Where should photo bytes live in a social media design?',
      testing: 'Blob vs metadata placement.',
      keyConcepts: ['object store', 'metadata DB', 'CDN'],
      sampleAnswer:
        'Bytes in object storage; metadata (owner, caption, key, visibility) in Postgres/Mongo; CDN for reads. App servers should not be the long-term disk for media.',
      commonMistakes: [
        'Storing images only in the database',
        'No metadata store for queries',
      ],
      level: 'beginner',
    },
    {
      question: 'Why use pre-signed upload URLs?',
      testing: 'Offloading and authz pattern.',
      keyConcepts: ['pre-signed URL', 'bandwidth offload', 'authorization'],
      sampleAnswer:
        'The app authorizes the user then lets the client upload directly to the store, saving app bandwidth while still controlling who may write which keys.',
      commonMistakes: [
        'Proxying all multi-GB uploads through app servers forever',
        'Pre-signing without expiry or key scoping',
      ],
      level: 'beginner',
    },
    {
      question: 'How do you keep object storage and database metadata consistent?',
      testing: 'Distributed consistency practicality.',
      keyConcepts: ['orchestration', 'reconciliation', 'immutable keys'],
      sampleAnswer:
        'Prefer upload-then-confirm: client uploads, then calls API to commit metadata; or write pending metadata and mark ready after verify. Run sweeper jobs for orphans. Use unique keys to avoid overwrite races.',
      commonMistakes: [
        'Assuming both writes always succeed together with no recovery',
        'Mutable keys without cache busting',
      ],
      level: 'intermediate',
    },
    {
      question: 'Object store vs CDN — how do they work together?',
      testing: 'Origin vs edge roles.',
      keyConcepts: ['origin', 'edge cache', 'TTL'],
      sampleAnswer:
        'Object store is durable origin; CDN caches copies near users. Origin protects durability/cost; CDN protects latency and origin load. Invalidation/versioned URLs matter when content changes.',
      commonMistakes: [
        'Treating CDN as durable storage alone',
        'Skipping origin and only “CDN” without a store',
      ],
      level: 'intermediate',
    },
    {
      question: 'Design deletion and GDPR erasure when media sits in object storage.',
      testing: 'Lifecycle + compliance thinking.',
      keyConcepts: ['soft delete', 'lifecycle', 'CDN purge'],
      sampleAnswer:
        'Delete or mark metadata first to cut access, issue object deletes (and versions), purge CDN, and verify with audits. Lifecycle rules clean incomplete multipart uploads. Be explicit about backup retention windows.',
      commonMistakes: [
        'Deleting DB rows but leaving public objects',
        'Forgetting CDN cached copies',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'Object stores hold blobs; databases hold queryable metadata.',
    'Pre-signed URLs and CDNs keep app servers off the media path.',
    'Plan for orphans, permissions, and immutable keys.',
  ],
  biggestTradeOff:
    'Cheap independent blob scale versus lack of rich querying and the need for careful metadata/auth orchestration.',
  interviewTip:
    'Draw three boxes for media: Object Store, Metadata DB, CDN. Interviewers love that clean separation.',
  relatedComponents: ['cdn', 'postgres', 'server', 'kafka'],
}
