import { describe, it, expect } from 'vitest'
import { evaluateInterviewLocal, startInterviewLocal } from './interviewLocal'
import type { ArchitectureSubmit } from './interview'

const submit = (mapId: string): ArchitectureSubmit => ({
  levelId: mapId === 'sandbox' ? 'playground' : 'level-1',
  mapId,
  components: [],
  connections: [],
  decisions: [],
  explanation: 'short',
})

describe('local interview mock', () => {
  it('sandbox: never emits a follow-up question', () => {
    const { interview } = startInterviewLocal({ levelId: 'playground', mapId: 'sandbox' })
    const res = evaluateInterviewLocal(interview.id, submit('sandbox'))
    if (!res.ok) throw new Error('expected ok')
    expect(res.interview.latestEvaluation?.passed).toBe(false)
    expect(res.interview.latestEvaluation?.followUpQuestion).toBeNull()
    expect(res.interview.pendingFollowUp).toBeNull()
  })

  it('campaign: still emits follow-up when below pass bar', () => {
    const { interview } = startInterviewLocal({ levelId: 'level-1', mapId: 'social-media' })
    const res = evaluateInterviewLocal(interview.id, submit('social-media'))
    if (!res.ok) throw new Error('expected ok')
    expect(res.interview.latestEvaluation?.followUpQuestion).not.toBeNull()
    expect(res.interview.pendingFollowUp).not.toBeNull()
  })
})
