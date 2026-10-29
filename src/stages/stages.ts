export type Stage = {
  id: string
  label: string
  tagline: string
  locked: boolean
  /** CSS gradient accents for the stage plate (no brand art). */
  plateFrom: string
  plateTo: string
  accent: string
  badge: string
  features: string[]
}

export const STAGES: Stage[] = [
  {
    id: 'social-media',
    label: 'Social Media',
    tagline: 'Feed · Graph · Scale',
    locked: false,
    plateFrom: '#5eb0e8',
    plateTo: '#1a3a5c',
    accent: '#7dd3fc',
    badge: 'FEED GRAPH',
    features: ['Feed', 'Graph', 'Cache', 'CDN', 'Auth'],
  },
  {
    id: 'messaging',
    label: 'Messaging',
    tagline: 'Realtime chat · Presence',
    locked: true,
    plateFrom: '#34d399',
    plateTo: '#0f3d2e',
    accent: '#6ee7b7',
    badge: 'REALTIME',
    features: ['WS', 'Inbox', 'Push', 'Ack', 'Sync'],
  },
  {
    id: 'video-streaming',
    label: 'Video Streaming',
    tagline: 'VOD · Adaptive bitrate',
    locked: true,
    plateFrom: '#f472b6',
    plateTo: '#4a1838',
    accent: '#f9a8d4',
    badge: 'ABR PIPE',
    features: ['Encode', 'CDN', 'ABR', 'Seek', 'DRM'],
  },
  {
    id: 'social-feed',
    label: 'Social Feed',
    tagline: 'Timeline · Ranking',
    locked: true,
    plateFrom: '#fbbf24',
    plateTo: '#3f2e0a',
    accent: '#fcd34d',
    badge: 'RANKED',
    features: ['Rank', 'Fanout', 'Cache', 'Graph', 'Ads'],
  },
  {
    id: 'ride-matching',
    label: 'Ride Matching',
    tagline: 'Geo · Dispatch',
    locked: true,
    plateFrom: '#a78bfa',
    plateTo: '#2a1848',
    accent: '#c4b5fd',
    badge: 'DISPATCH',
    features: ['Geo', 'Match', 'ETA', 'Pay', 'Track'],
  },
]

export const FIRST_UNLOCKED_ID =
  STAGES.find((s) => !s.locked)?.id ?? STAGES[0]!.id

export function getStage(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id)
}
