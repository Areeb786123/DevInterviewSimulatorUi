import type { LevelConfig } from './types'

/** Static stand-in for server-provided level config */
export const SOCIAL_MEDIA_L1: LevelConfig = {
  id: 'level-1',
  mapId: 'social-media',
  title: 'Training Grounds',
  subtitle: 'Social Media · Level 1',
  question:
    'SCENARIO\n' +
    'You are designing a brand-new social app. One user wants to write a short text post and save it.\n\n' +
    'PROBLEM RIGHT NOW\n' +
    'There is no working write path yet. Nothing is connected — a post cannot reach durable storage.\n\n' +
    'WHAT TO SOLVE\n' +
    'Build the simplest correct path: Client → App Server → Postgres (SQL).\n' +
    'Stay under budget. Skip Redis, Kafka, and Object Store — they solve later problems, not this one.',
  hints: [
    'Start with three boxes only: Client, App Server, Postgres.',
    'Drag the yellow → from Client to App Server, then Server to Postgres.',
    'Skip Redis/Kafka/Object Store — they burn budget and aren’t needed for a text post.',
  ],
  interviewerBubble:
    'First interview question: one user, one text post. Keep the architecture stupid-simple.',
  successBubble:
    'Nice. Traffic flowed Client → Server → SQL within budget. Remember: when the DB struggles, prefer cache (Redis) over cloning databases.',
  failBubble:
    'Not quite. Need Client → App Server → Postgres, under budget, before time runs out.',
  timeUpBubble:
    'Time’s up! Interviewers care about speed of thought too — try again with a cleaner path.',
  overBudgetBubble:
    'Over budget. Stacking databases is costly — a lean Client → Server → one SQL DB fits. Redis is cheaper when you need relief later.',
  timeLimitSec: 90,
  budget: 70,
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
      cost: 40,
      dbFamily: 'relational',
    },
    {
      kind: 'mongodb',
      label: 'MongoDB',
      tagline: 'Document',
      iconUrl: '/assets/sysdesign/mongodb.svg',
      cost: 40,
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
    requiredPath: ['client', 'server', 'postgres'],
  },
}
