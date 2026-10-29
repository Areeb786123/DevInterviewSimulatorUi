import type { LevelConfig } from './types'

/** L2: traffic grows — scale app tier with LB + 2 servers, not more DBs */
export const SOCIAL_MEDIA_L2: LevelConfig = {
  id: 'level-2',
  mapId: 'social-media',
  title: 'Traffic Spike',
  subtitle: 'Social Media · Level 2',
  question:
    'SCENARIO\n' +
    'Your text-post path works. Suddenly thousands of users hit the app at once after a viral moment.\n\n' +
    'PROBLEM RIGHT NOW\n' +
    'The single App Server is CPU-bound: requests queue up, APIs time out, users see errors. The database is still fine — compute is the bottleneck.\n\n' +
    'WHAT TO SOLVE\n' +
    'Scale the app tier: Client → Load Balancer → App Server → Postgres.\n' +
    'The Load Balancer must fan out to at least TWO App Servers. Do not clone the database to fix CPU load.',
  hints: [
    'Place: Client → Load Balancer → two App Servers → one Postgres.',
    'From the LB, draw arrows to BOTH App Servers (fan-out).',
    'Don’t drop a second database — buy another App Server instead; it’s cheaper and correct.',
  ],
  interviewerBubble:
    'Traffic spike. Apps are melting — not the DB. How do you scale compute?',
  successBubble:
    'Solid. Client → LB → App Servers (×2) → SQL. You scaled compute, not the database. Redis comes when reads melt the DB — not yet.',
  failBubble:
    'Need Client → Load Balancer → App Server → Postgres, with the LB fanning out to 2+ App Servers, under budget.',
  timeUpBubble:
    'Time’s up! Sketch LB + two servers + one SQL DB faster next run.',
  overBudgetBubble:
    'Over budget. Extra databases are pricey — buy another App Server + LB instead of another Postgres.',
  timeLimitSec: 120,
  budget: 120,
  backgroundUrl: '/assets/maps/countryside-arena.jpg',
  palette: [
    {
      kind: 'client',
      label: 'Client',
      tagline: 'User device',
      iconUrl: '/assets/sysdesign/client.svg',
      cost: 0,
      dbFamily: 'client',
    },
    {
      kind: 'server',
      label: 'App Server',
      tagline: 'API / compute',
      iconUrl: '/assets/sysdesign/server.svg',
      cost: 20,
      dbFamily: 'compute',
    },
    {
      kind: 'load-balancer',
      label: 'Load Balancer',
      tagline: 'Split traffic',
      iconUrl: '/assets/sysdesign/load-balancer.svg',
      cost: 25,
      dbFamily: 'compute',
    },
    {
      kind: 'postgres',
      label: 'Postgres',
      tagline: 'Table / SQL',
      iconUrl: '/assets/sysdesign/postgres.svg',
      cost: 45,
      dbFamily: 'relational',
    },
    {
      kind: 'mongodb',
      label: 'MongoDB',
      tagline: 'Document',
      iconUrl: '/assets/sysdesign/mongodb.svg',
      cost: 45,
      dbFamily: 'document',
    },
    {
      kind: 'redis',
      label: 'Redis',
      tagline: 'Cache · cheap',
      iconUrl: '/assets/sysdesign/redis.svg',
      cost: 15,
      dbFamily: 'cache',
    },
    {
      kind: 'kafka',
      label: 'Kafka',
      tagline: 'Event queue',
      iconUrl: '/assets/sysdesign/kafka.svg',
      cost: 35,
      dbFamily: 'queue',
    },
    {
      kind: 'object-store',
      label: 'Object Store',
      tagline: 'Image bytes',
      iconUrl: '/assets/sysdesign/object-store.svg',
      cost: 30,
      dbFamily: 'blob',
    },
  ],
  win: {
    requiredPath: ['client', 'load-balancer', 'server', 'postgres'],
    minCounts: { server: 2 },
    fanOut: { fromKind: 'load-balancer', toKind: 'server', min: 2 },
  },
}
