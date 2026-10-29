import { NUMBER_OF_PROVINCES } from '../dsa/numberOfProvinces'
import { SORT_BY_ABSOLUTE_VALUE } from '../dsa/sortByAbsoluteValue'
import type { DsaQuestion, DsaQuestionCard } from '../dsa/types'

const QUESTIONS: Record<string, DsaQuestion> = {
  [SORT_BY_ABSOLUTE_VALUE.id]: SORT_BY_ABSOLUTE_VALUE,
  [NUMBER_OF_PROVINCES.id]: NUMBER_OF_PROVINCES,
}

const CARDS: DsaQuestionCard[] = [
  {
    id: SORT_BY_ABSOLUTE_VALUE.id,
    title: SORT_BY_ABSOLUTE_VALUE.title,
    difficulty: SORT_BY_ABSOLUTE_VALUE.difficulty,
    blurb: 'Sort by |x|; on ties, smaller number first.',
  },
  {
    id: NUMBER_OF_PROVINCES.id,
    title: NUMBER_OF_PROVINCES.title,
    difficulty: NUMBER_OF_PROVINCES.difficulty,
    blurb: 'Count connected components in a city road graph.',
  },
]

/** Static today — swap for GET /api/v1/dsa/questions later. */
export async function listDsaQuestions(): Promise<DsaQuestionCard[]> {
  await new Promise((r) => setTimeout(r, 40))
  return CARDS
}

export async function getDsaQuestion(id: string): Promise<DsaQuestion> {
  await new Promise((r) => setTimeout(r, 40))
  const q = QUESTIONS[id]
  if (!q) throw new Error(`DSA question not found: ${id}`)
  return q
}
