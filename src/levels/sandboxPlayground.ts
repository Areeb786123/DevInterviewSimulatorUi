import { SOCIAL_MEDIA_PALETTE } from './sharedPalette'
import type { LevelConfig, PaletteItem } from './types'

/** Sandbox-only: name-your-own box. Must NOT be part of SOCIAL_MEDIA_PALETTE (campaign). */
export const CUSTOM_PALETTE_ITEM: PaletteItem = {
  kind: 'custom',
  label: 'Custom',
  tagline: 'Name your own',
  iconUrl: '/assets/sysdesign/custom.svg',
  cost: 0,
  dbFamily: 'compute',
}

function sandboxPalette(): PaletteItem[] {
  const clientIdx = SOCIAL_MEDIA_PALETTE.findIndex((p) => p.kind === 'client')
  if (clientIdx < 0) return [...SOCIAL_MEDIA_PALETTE, CUSTOM_PALETTE_ITEM]
  return [
    ...SOCIAL_MEDIA_PALETTE.slice(0, clientIdx + 1),
    CUSTOM_PALETTE_ITEM,
    ...SOCIAL_MEDIA_PALETTE.slice(clientIdx + 1),
  ]
}

export const SANDBOX_PLAYGROUND: LevelConfig = {
  id: 'playground',
  mapId: 'sandbox',
  title: 'Custom Design Simulate',
  subtitle: 'Free sandbox',
  question:
    'Design any architecture you want. Name Custom boxes, explain your goal and data path, then run AI for score + feedback.',
  hints: [
    'Drop Custom and name the box for anything not in the palette.',
    'Write a clear explanation before AI Run — the model grades against your stated goal.',
  ],
  interviewerBubble: 'Sandbox mode. Build freely, explain, then AI Run.',
  successBubble: 'Solid sandbox design.',
  failBubble: 'Feedback only — tweak and AI Run again.',
  timeUpBubble: '',
  overBudgetBubble: '',
  timeLimitSec: 0,
  budget: 999999,
  palette: sandboxPalette(),
  win: { requiredPath: [] },
  backgroundUrl: '/assets/bg/adventure-map.jpg',
}
