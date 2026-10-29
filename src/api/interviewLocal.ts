import type {
  ArchitectureSubmit,
  EvaluationResult,
  FollowUpQuestion,
  Interview,
  InterviewStatus,
} from './interview'

type LocalSession = {
  interview: Interview
  architecture: ArchitectureSubmit | null
  answerAttempts: number
}

const sessions = new Map<string, LocalSession>()

function scoreSubmit(submit: ArchitectureSubmit): EvaluationResult {
  let score = 4
  const kinds = new Set(submit.components.map((c) => c.kind))
  if (kinds.has('server') || kinds.has('load-balancer')) score += 1
  if (kinds.has('postgres') || kinds.has('mongodb') || kinds.has('redis')) {
    score += 1
  }
  if (submit.connections.length > 0) score += 1
  if (submit.explanation.trim().length >= 40) score += 1
  if (submit.explanation.trim().length >= 120) score += 1
  const decided = submit.decisions.filter(
    (d) => (d.whyChosen ?? '').trim().length >= 8,
  ).length
  if (decided >= 1) score += 1
  if (decided >= 2) score += 1
  const tradeoffs = submit.decisions.some(
    (d) =>
      (d.advantages ?? '').trim().length > 0 &&
      (d.disadvantages ?? '').trim().length > 0,
  )
  if (tradeoffs) score += 1
  score = Math.min(10, Math.max(1, score))

  const passed = score >= 8
  const followUpQuestion: FollowUpQuestion | null = passed
    ? null
    : {
        question:
          'What is the main bottleneck under 10× traffic, and would you scale vertically, horizontally, or optimize first?',
        reason: 'Score is below the pass bar — scaling reasoning needs more depth.',
        expectedConcepts: [
          'horizontal scaling',
          'vertical scaling',
          'load balancing',
        ],
      }

  return {
    score,
    passed,
    summary: passed
      ? 'Local mock: design and reasoning meet the bar for this level.'
      : 'Local mock: gaps remain — answer the follow-up or revise the board.',
    strengths:
      submit.connections.length > 0
        ? ['Components are connected']
        : [],
    weaknesses: passed
      ? ['Optional: add monitoring notes']
      : ['Scaling / trade-offs need a clearer story'],
    followUpQuestion,
    suggestedImprovements: passed
      ? []
      : [
          {
            title: 'Explain scaling',
            description:
              'Say what breaks first under load and how you would fix it.',
            priority: 'high',
          },
        ],
    finalFeedback: passed
      ? 'Congratulations (local mock) — this design meets the bar.'
      : null,
  }
}

function toInterview(
  id: string,
  status: InterviewStatus,
  evaluation: EvaluationResult | null,
  followUp: FollowUpQuestion | null,
): Interview {
  return {
    id,
    status,
    latestEvaluation: evaluation,
    pendingFollowUp: followUp,
  }
}

export function startInterviewLocal(_input: {
  levelId: string
  mapId: string
}): { ok: true; interview: Interview; localMock: true } {
  const id = `local-${crypto.randomUUID()}`
  const interview = toInterview(id, 'IN_PROGRESS', null, null)
  sessions.set(id, {
    interview,
    architecture: null,
    answerAttempts: 0,
  })
  return { ok: true, interview, localMock: true }
}

export function evaluateInterviewLocal(
  interviewId: string,
  submit: ArchitectureSubmit,
):
  | { ok: true; interview: Interview; localMock: true }
  | { ok: false; error: string } {
  const session = sessions.get(interviewId)
  if (!session) {
    // Recover orphaned local id after refresh
    const interview = toInterview(interviewId, 'IN_PROGRESS', null, null)
    sessions.set(interviewId, {
      interview,
      architecture: null,
      answerAttempts: 0,
    })
    return evaluateInterviewLocal(interviewId, submit)
  }

  const evaluation = scoreSubmit(submit)
  const status: InterviewStatus = evaluation.passed
    ? 'PASSED'
    : 'NEEDS_REVISION'
  const interview = toInterview(
    interviewId,
    status,
    evaluation,
    evaluation.followUpQuestion,
  )
  sessions.set(interviewId, {
    interview,
    architecture: submit,
    answerAttempts: session.answerAttempts,
  })
  return { ok: true, interview, localMock: true }
}

export function answerInterviewLocal(
  interviewId: string,
  answer: string,
):
  | { ok: true; interview: Interview; localMock: true }
  | { ok: false; error: string; interview?: Interview } {
  const session = sessions.get(interviewId)
  if (!session?.architecture) {
    return { ok: false, error: 'no_architecture' }
  }
  if (session.interview.status === 'PASSED') {
    return {
      ok: false,
      error: 'already_passed',
      interview: session.interview,
    }
  }
  if (!session.interview.pendingFollowUp) {
    return {
      ok: false,
      error: 'no_pending_follow_up',
      interview: session.interview,
    }
  }

  const lower = answer.toLowerCase()
  const concepts = session.interview.pendingFollowUp.expectedConcepts ?? []
  const hits = concepts.filter((c) => lower.includes(c.toLowerCase()))
  let evaluation = scoreSubmit({
    ...session.architecture,
    explanation: `${session.architecture.explanation}\n\nFollow-up answer: ${answer}`,
  })
  if (
    !evaluation.passed &&
    answer.trim().length >= 40 &&
    hits.length > 0
  ) {
    const score = Math.min(10, evaluation.score + 2)
    evaluation = {
      ...evaluation,
      score,
      passed: score >= 8,
      summary:
        score >= 8
          ? 'Local mock: follow-up answered the key gap.'
          : evaluation.summary,
      followUpQuestion: score >= 8 ? null : evaluation.followUpQuestion,
      finalFeedback:
        score >= 8
          ? 'Congratulations (local mock) — follow-up meets the bar.'
          : null,
    }
  }

  const status: InterviewStatus = evaluation.passed
    ? 'PASSED'
    : 'NEEDS_REVISION'
  const interview = toInterview(
    interviewId,
    status,
    evaluation,
    evaluation.followUpQuestion,
  )
  sessions.set(interviewId, {
    interview,
    architecture: session.architecture,
    answerAttempts: session.answerAttempts + 1,
  })
  return { ok: true, interview, localMock: true }
}

export async function probeInterviewApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/interviews/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        levelId: '__probe__',
        mapId: '__probe__',
        clientId: 'probe',
      }),
      signal: AbortSignal.timeout(2500),
    })
    // Our API returns 201 or 400 — never HTML 500 from a live Express app for this shape
    if (res.status === 201 || res.status === 400) return true
    // Vite proxy returns 500 HTML when backend is down
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('application/json')) return false
    return res.ok
  } catch {
    return false
  }
}
