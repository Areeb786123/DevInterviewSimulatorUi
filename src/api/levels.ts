import { SANDBOX_PLAYGROUND } from '../levels/sandboxPlayground'
import { SOCIAL_MEDIA_L1 } from '../levels/socialMediaL1'
import { SOCIAL_MEDIA_L2 } from '../levels/socialMediaL2'
import { SOCIAL_MEDIA_L3_TO_L15 } from '../levels/socialMediaL3toL15'
import type { LevelConfig } from '../levels/types'

const LEVELS: Record<string, LevelConfig> = {
  'sandbox/playground': SANDBOX_PLAYGROUND,
  'social-media/level-1': SOCIAL_MEDIA_L1,
  'social-media/level-2': SOCIAL_MEDIA_L2,
}

for (const lvl of SOCIAL_MEDIA_L3_TO_L15) {
  LEVELS[`${lvl.mapId}/${lvl.id}`] = lvl
}

/**
 * Level loader — static today, swap body for fetch() when Gin is ready.
 * Shape matches future: GET /api/v1/maps/:mapId/levels/:levelId
 */
export async function getLevel(
  mapId: string,
  levelId: string,
): Promise<LevelConfig> {
  await new Promise((r) => setTimeout(r, 80))
  const cfg = LEVELS[`${mapId}/${levelId}`]
  if (!cfg) throw new Error(`Level not found: ${mapId}/${levelId}`)
  return cfg
}
