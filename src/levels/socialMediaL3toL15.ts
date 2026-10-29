import { SOCIAL_MEDIA_PALETTE } from './sharedPalette'
import type { LevelConfig } from './types'

const bg = '/assets/maps/countryside-arena.jpg'
const palette = SOCIAL_MEDIA_PALETTE

function base(
  partial: Omit<LevelConfig, 'mapId' | 'backgroundUrl' | 'palette'> & {
    backgroundUrl?: string
  },
): LevelConfig {
  return {
    mapId: 'social-media',
    backgroundUrl: partial.backgroundUrl ?? bg,
    palette,
    ...partial,
  }
}

function q(scenario: string, problem: string, solve: string): string {
  return (
    `SCENARIO\n${scenario}\n\n` +
    `PROBLEM RIGHT NOW\n${problem}\n\n` +
    `WHAT TO SOLVE\n${solve}`
  )
}

/** L3: hot reads — cache before/at DB, not more app servers alone */
export const SOCIAL_MEDIA_L3 = base({
  id: 'level-3',
  title: 'Hot Reads',
  subtitle: 'Social Media · Level 3',
  question: q(
    'You already scaled App Servers behind a load balancer. Read traffic keeps climbing — profiles, posts, and timelines are fetched constantly.',
    'App CPU looks healthy, but Postgres is melting: disk I/O spikes, query latency climbs, and every new App Server makes it worse because each one still hits the DB on every read.',
    'Add a cache tier. Build: Client → App Server → Redis → Postgres.\nDo not “fix” this by buying only more App Servers — that multiplies DB load.',
  ),
  hints: [
    'Put Redis between the App Server and Postgres for hot reads.',
    'Path: Client → App Server → Redis → Postgres.',
    'More servers without a cache just multiply DB load.',
  ],
  interviewerBubble:
    'Apps are fine. The database is drowning in reads. What’s the cheap fix?',
  successBubble:
    'Yes — cache hot reads. Redis shields Postgres. Scaling apps alone would have melted the DB.',
  failBubble:
    'Need Client → App Server → Redis → Postgres under budget.',
  timeUpBubble: 'Time’s up! Reach for Redis when reads hammer the DB.',
  overBudgetBubble: 'Over budget. Redis is cheap — prefer it over another heavy DB.',
  timeLimitSec: 120,
  budget: 100,
  win: { requiredPath: ['client', 'server', 'redis', 'postgres'] },
})

/** L4: follow graph — relational edges, not document-only */
export const SOCIAL_MEDIA_L4 = base({
  id: 'level-4',
  title: 'Follow Graph',
  subtitle: 'Social Media · Level 4',
  question: q(
    'Users can follow and unfollow each other. The product needs a reliable “who follows whom” graph for feeds and profiles.',
    'If you jam follows into a blob/document with no clear edges, joins break, consistency gets messy, and “list my followers” becomes painful.',
    'Store follow relationships in a relational table DB.\nBuild: Client → App Server → Postgres.\nA document DB alone is the wrong default for this graph.',
  ),
  hints: [
    'Follows are edges between users — table/SQL fits.',
    'Wire Client → App Server → Postgres.',
    'Mongo-only paths won’t pass this level.',
  ],
  interviewerBubble:
    'Design follows. Think relationships and joins — which store?',
  successBubble:
    'Good. Relational storage for follow edges. Document DBs shine elsewhere.',
  failBubble: 'Need Client → App Server → Postgres for the follow graph.',
  timeUpBubble: 'Time’s up! Follow edges want a table DB.',
  overBudgetBubble: 'Over budget. One Postgres is enough for follows.',
  timeLimitSec: 100,
  budget: 90,
  win: { requiredPath: ['client', 'server', 'postgres'] },
})

/** L5: home feed — cached feed reads */
export const SOCIAL_MEDIA_L5 = base({
  id: 'level-5',
  title: 'Home Feed',
  subtitle: 'Social Media · Level 5',
  question: q(
    'Each user opens a home feed built from people they follow. Popular users open the feed many times per minute.',
    'A naive design scans the database for every followee’s posts on every open. Latency explodes and Postgres starts timing out under feed read load.',
    'Cache the hot feed path.\nBuild: Client → App Server → Redis → Postgres.\nRedis serves hot reads; Postgres remains source of truth on misses.',
  ),
  hints: [
    'Cache the feed (or feed keys) in Redis.',
    'Fall back to Postgres for misses.',
    'Path: Client → App Server → Redis → Postgres.',
  ],
  interviewerBubble:
    'Home feed for many followees. How do you avoid death-by-scan?',
  successBubble:
    'Cached feed path. Redis takes the hit; Postgres stays the source of truth.',
  failBubble: 'Need Client → App Server → Redis → Postgres.',
  timeUpBubble: 'Time’s up! Feed reads need a cache tier.',
  overBudgetBubble: 'Over budget. Redis is the cheap feed shield.',
  timeLimitSec: 120,
  budget: 100,
  win: { requiredPath: ['client', 'server', 'redis', 'postgres'] },
})

/** L6: photo bytes live in object storage */
export const SOCIAL_MEDIA_L6 = base({
  id: 'level-6',
  title: 'Photo Bytes',
  subtitle: 'Social Media · Level 6',
  question: q(
    'Users start uploading photos. Each image is several megabytes of binary data, not a short text string.',
    'If you store those bytes inside Postgres or Mongo, the database balloons, backups crawl, and normal queries get crushed by blob I/O.',
    'Put image bytes in object storage.\nBuild: Client → App Server → Object Store.\nDo not end the path on a SQL/document DB for the bytes.',
  ),
  hints: [
    'Object Store (S3-style) holds the bytes.',
    'Path ends at Object Store — not Postgres/Mongo.',
    'DBs for blobs = backup and size death.',
  ],
  interviewerBubble:
    'Photos are multi‑MB blobs. Where do the actual bytes live?',
  successBubble:
    'Bytes in object storage. Databases stay for structured data.',
  failBubble: 'Need Client → App Server → Object Store for photo bytes.',
  timeUpBubble: 'Time’s up! Blobs belong in object storage.',
  overBudgetBubble: 'Over budget. Object Store beats stuffing blobs in a DB.',
  timeLimitSec: 100,
  budget: 90,
  win: { requiredPath: ['client', 'server', 'object-store'] },
})

/** L7: metadata in SQL; bytes already taught in L6 */
export const SOCIAL_MEDIA_L7 = base({
  id: 'level-7',
  title: 'Photo Metadata',
  subtitle: 'Social Media · Level 7',
  question: q(
    'Bytes now live in Object Store. The product still needs to answer: who owns this photo, what’s the URL, width, size, and album?',
    'If metadata only lives as object keys/tags in the bucket, you cannot efficiently query “all photos by user X” or filter by size/date.',
    'Keep structured metadata in Postgres and still place Object Store for the bytes.\nBuild: Client → App Server → Postgres, and place at least one Object Store on the board.',
  ),
  hints: [
    'Metadata → Postgres. Bytes → Object Store (must be placed).',
    'Wire Client → App Server → Postgres.',
    'Don’t put metadata only in the bucket.',
  ],
  interviewerBubble:
    'Bytes are in the bucket. Where does queryable metadata live?',
  successBubble:
    'Metadata in Postgres, bytes in Object Store. Classic split.',
  failBubble:
    'Need Client → App Server → Postgres and at least one Object Store on the board.',
  timeUpBubble: 'Time’s up! Metadata wants a table DB beside the bucket.',
  overBudgetBubble: 'Over budget. One SQL + one Object Store is enough.',
  timeLimitSec: 120,
  budget: 120,
  win: {
    requiredPath: ['client', 'server', 'postgres'],
    minCounts: { 'object-store': 1 },
  },
})

/** L8: CDN in front of media */
export const SOCIAL_MEDIA_L8 = base({
  id: 'level-8',
  title: 'Edge Cache',
  subtitle: 'Social Media · Level 8',
  question: q(
    'The same popular images are opened by users worldwide — India, US, Europe — over and over.',
    'Every request hitting Object Store origin burns bandwidth and latency. Origin becomes a hot bottleneck even though the bytes rarely change.',
    'Put a CDN in front of media.\nBuild: Client → CDN → Object Store.\nEdge caches serve repeats; origin stays cool.',
  ),
  hints: [
    'CDN sits at the edge in front of Object Store.',
    'Path: Client → CDN → Object Store.',
    'App servers aren’t the worldwide image pipe.',
  ],
  interviewerBubble:
    'Images go global. What sits in front of object storage?',
  successBubble:
    'CDN edges the world; Object Store is origin. Origin stays cool.',
  failBubble: 'Need Client → CDN → Object Store.',
  timeUpBubble: 'Time’s up! Put a CDN in front of media.',
  overBudgetBubble: 'Over budget. CDN + Object Store is the lean worldwide path.',
  timeLimitSec: 100,
  budget: 100,
  win: { requiredPath: ['client', 'cdn', 'object-store'] },
})

/** L9: heavy video — async via Kafka */
export const SOCIAL_MEDIA_L9 = base({
  id: 'level-9',
  title: 'Heavy Video',
  subtitle: 'Social Media · Level 9',
  question: q(
    'Users upload video. Transcoding (compressing, thumbnails, multiple resolutions) can take seconds to minutes of CPU.',
    'If the App Server does that work inside the HTTP request, API threads block, timeouts explode, and the whole site feels dead during uploads.',
    'Make heavy work async with a queue.\nBuild: Client → App Server → Kafka → Object Store.\nAPI enqueues; workers (implied) land processed media in Object Store.',
  ),
  hints: [
    'Queue the work: Server publishes to Kafka.',
    'Workers (implied) land results in Object Store.',
    'Don’t sync-transcode inside the API.',
  ],
  interviewerBubble:
    'Video is heavy. How do you keep the API alive?',
  successBubble:
    'Async via Kafka. API stays light; processing happens off-path.',
  failBubble: 'Need Client → App Server → Kafka → Object Store.',
  timeUpBubble: 'Time’s up! Queue heavy video work.',
  overBudgetBubble: 'Over budget. Kafka + Object Store beats sync encode.',
  timeLimitSec: 130,
  budget: 130,
  win: { requiredPath: ['client', 'server', 'kafka', 'object-store'] },
})

/** L10: hot likes — counters/cache */
export const SOCIAL_MEDIA_L10 = base({
  id: 'level-10',
  title: 'Hot Likes',
  subtitle: 'Social Media · Level 10',
  question: q(
    'A celebrity post goes viral. Thousands of likes hit the same post row every second.',
    'Updating one Postgres row per like causes lock storms, contention, and cascading timeouts on that hot post.',
    'Absorb the hot counter in cache, then persist.\nBuild: Client → App Server → Redis → Postgres.\nRedis handles the spam; Postgres stays durable truth.',
  ),
  hints: [
    'Buffer/aggregate likes in Redis.',
    'Flush or snapshot to Postgres.',
    'Path: Client → App Server → Redis → Postgres.',
  ],
  interviewerBubble:
    'Hot post, like flood. How do you avoid a lock storm?',
  successBubble:
    'Redis absorbs the hot counter; Postgres remains durable truth.',
  failBubble: 'Need Client → App Server → Redis → Postgres.',
  timeUpBubble: 'Time’s up! Hot counters want a cache.',
  overBudgetBubble: 'Over budget. Redis is cheaper than another DB clone.',
  timeLimitSec: 110,
  budget: 100,
  win: { requiredPath: ['client', 'server', 'redis', 'postgres'] },
})

/** L11: realtime DMs */
export const SOCIAL_MEDIA_L11 = base({
  id: 'level-11',
  title: 'Realtime DMs',
  subtitle: 'Social Media · Level 11',
  question: q(
    'Users want 1:1 direct messages that feel instant — typing, delivery, live receive.',
    'Polling Postgres every 100ms for new messages floods the DB with useless reads and still feels laggy.',
    'Use a realtime channel, then persist.\nBuild: Client → WebSocket → App Server → Postgres.\nWebSocket for live delivery; Postgres for durable history.',
  ),
  hints: [
    'WebSocket (or similar) for the realtime channel.',
    'Persist messages via App Server → Postgres.',
    'Polling SQL will blast the DB.',
  ],
  interviewerBubble:
    'Realtime DMs. What’s the pipe — and where do messages land?',
  successBubble:
    'WebSocket for live delivery; Postgres for durable history.',
  failBubble: 'Need Client → WebSocket → App Server → Postgres.',
  timeUpBubble: 'Time’s up! Use a realtime channel, not DB poll.',
  overBudgetBubble: 'Over budget. WebSocket + one SQL DB is enough.',
  timeLimitSec: 120,
  budget: 120,
  win: { requiredPath: ['client', 'websocket', 'server', 'postgres'] },
})

/** L12: notify millions via queue */
export const SOCIAL_MEDIA_L12 = base({
  id: 'level-12',
  title: 'Notify Millions',
  subtitle: 'Social Media · Level 12',
  question: q(
    'When a star posts, millions of followers should get a notification. The write (“create post”) must still feel fast.',
    'Sending every push/email inside the original request path makes the poster wait forever and can take the API down.',
    'Enqueue notifications and process with workers.\nBuild: Client → App Server → Kafka → App Server (worker).\nPlace two App Servers: one API, one worker consumer.',
  ),
  hints: [
    'API enqueues to Kafka.',
    'A second App Server acts as the worker consumer.',
    'Sync push inside the request = lag city.',
  ],
  interviewerBubble:
    'Notify millions. How do you keep the write path snappy?',
  successBubble:
    'Queue + worker. Request returns fast; delivery scales out.',
  failBubble: 'Need Client → App Server → Kafka → App Server.',
  timeUpBubble: 'Time’s up! Notifications want a queue.',
  overBudgetBubble: 'Over budget. Kafka + two servers beats sync push.',
  timeLimitSec: 130,
  budget: 130,
  win: {
    requiredPath: ['client', 'server', 'kafka', 'server'],
    minCounts: { server: 2 },
  },
})

/** L13: live events → packaging → CDN */
export const SOCIAL_MEDIA_L13 = base({
  id: 'level-13',
  title: 'Live Events',
  subtitle: 'Social Media · Level 13',
  question: q(
    'The product adds Live / events: many viewers watch a stream at once.',
    'Piping live media through App Servers into the database melts compute and storage. Viewers worldwide also need low-latency playback.',
    'Keep apps as control plane; stream via queue toward the edge.\nBuild: Client → App Server → Kafka → CDN.',
  ),
  hints: [
    'Ingest/control via App Server.',
    'Kafka carries stream/events work.',
    'CDN delivers playback at the edge.',
  ],
  interviewerBubble:
    'Live event. Keep media off the app/DB melt path.',
  successBubble:
    'Ingest → queue → CDN playback. Apps stay control-plane.',
  failBubble: 'Need Client → App Server → Kafka → CDN.',
  timeUpBubble: 'Time’s up! Live wants queue + CDN, not DB relay.',
  overBudgetBubble: 'Over budget. Kafka + CDN is the live spine.',
  timeLimitSec: 130,
  budget: 140,
  win: { requiredPath: ['client', 'server', 'kafka', 'cdn'] },
})

/** L14: video calls — signaling over WS, not media in SQL */
export const SOCIAL_MEDIA_L14 = base({
  id: 'level-14',
  title: 'Video Calls',
  subtitle: 'Social Media · Level 14',
  question: q(
    'Users start 1:1 video calls. Devices must exchange signaling (who’s calling, SDP/ICE-style setup) before media flows peer-to-peer or via an SFU.',
    'Writing call media frames into Postgres (or treating SQL as the media path) is impossible at scale and destroys the database.',
    'Build a signaling path only: Client → WebSocket → App Server.\nMedia stays off the SQL path.',
  ),
  hints: [
    'WebSocket carries signaling (SDP/ICE-style control).',
    'Media stays peer/SFU — not in the SQL path.',
    'Path: Client → WebSocket → App Server.',
  ],
  interviewerBubble:
    'Video call. What’s the signaling path? (Media stays off SQL.)',
  successBubble:
    'Signaling via WebSocket → App Server. Media never touches the DB.',
  failBubble: 'Need Client → WebSocket → App Server.',
  timeUpBubble: 'Time’s up! Signaling is WS → App — not DB media.',
  overBudgetBubble: 'Over budget. Signaling doesn’t need a blob DB.',
  timeLimitSec: 100,
  budget: 90,
  win: { requiredPath: ['client', 'websocket', 'server'] },
})

/** L15: capstone — scale pieces together */
export const SOCIAL_MEDIA_L15 = base({
  id: 'level-15',
  title: 'Capstone',
  subtitle: 'Social Media · Level 15',
  question: q(
    'Final interview: the social product must survive spike traffic, hot reads, and worldwide media at the same time.',
    'A single-server + single-DB design will fail on CPU, DB reads, and origin bandwidth all at once if you ignore the lessons from earlier levels.',
    'Combine the scale spine:\n• Client → Load Balancer → App Server → Redis → Postgres\n• LB fans out to 2+ App Servers\n• Also place CDN and Object Store on the board for the media edge.',
  ),
  hints: [
    'LB + two App Servers for compute.',
    'Redis in front of Postgres for hot reads.',
    'Also place CDN and Object Store (media spine).',
  ],
  interviewerBubble:
    'Capstone: scale compute, cache reads, and keep media at the edge.',
  successBubble:
    'Capstone clear. You scaled apps, cached reads, and kept media on CDN/object storage.',
  failBubble:
    'Need Client → LB → App Server → Redis → Postgres, 2+ servers behind the LB, plus CDN and Object Store placed.',
  timeUpBubble: 'Time’s up! Capstone wants LB, cache, and media edge pieces.',
  overBudgetBubble: 'Over budget. Prefer Redis + CDN over cloning databases.',
  timeLimitSec: 180,
  budget: 220,
  win: {
    requiredPath: ['client', 'load-balancer', 'server', 'redis', 'postgres'],
    minCounts: { server: 2, cdn: 1, 'object-store': 1 },
    fanOut: { fromKind: 'load-balancer', toKind: 'server', min: 2 },
  },
})

export const SOCIAL_MEDIA_L3_TO_L15: LevelConfig[] = [
  SOCIAL_MEDIA_L3,
  SOCIAL_MEDIA_L4,
  SOCIAL_MEDIA_L5,
  SOCIAL_MEDIA_L6,
  SOCIAL_MEDIA_L7,
  SOCIAL_MEDIA_L8,
  SOCIAL_MEDIA_L9,
  SOCIAL_MEDIA_L10,
  SOCIAL_MEDIA_L11,
  SOCIAL_MEDIA_L12,
  SOCIAL_MEDIA_L13,
  SOCIAL_MEDIA_L14,
  SOCIAL_MEDIA_L15,
]
