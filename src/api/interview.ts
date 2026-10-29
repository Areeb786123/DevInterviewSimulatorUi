import type { ComponentKind } from '../levels/types'
import {
  answerInterviewLocal,
  evaluateInterviewLocal,
  probeInterviewApi,
  startInterviewLocal,
} from './interviewLocal'

/** Empty VITE_API_BASE_URL → relative `/api` (Vite proxies to localhost:4000 in dev). */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const CLIENT_ID_KEY = 'devsim.clientId'

export type InterviewStatus =
  | 'IN_PROGRESS'
  | 'NEEDS_REVISION'
  | 'PASSED'
  | 'FAILED'
  | 'ABANDONED'

export type TechnologyDecision = {
  componentId: string
  technology: string
  whyChosen?: string
  advantages?: string
  disadvantages?: string
  alternatives?: string
  bottleneck?: string
}

export type ArchitectureComponent = {
  id: string
  kind: ComponentKind
  x: number
  y: number
}

export type ArchitectureConnection = {
  id: string
  from: string
  to: string
}

export type ArchitectureSubmit = {
  levelId: string
  mapId: string
  components: ArchitectureComponent[]
  connections: ArchitectureConnection[]
  decisions: TechnologyDecision[]
  explanation: string
  levelContext?: {
    title?: string
    question?: string
    win?: {
      requiredPath?: string[]
      minCounts?: Record<string, number>
    }
  }
}

export type FollowUpQuestion = {
  question: string
  reason: string
  expectedConcepts?: string[]
}

export type SuggestedImprovement = {
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high'
}

export type EvaluationResult = {
  score: number
  passed: boolean
  summary: string
  strengths: string[]
  weaknesses: string[]
  followUpQuestion: FollowUpQuestion | null
  suggestedImprovements: SuggestedImprovement[]
  finalFeedback: string | null
}

export type Interview = {
  id: string
  status: InterviewStatus
  latestEvaluation: EvaluationResult | null
  pendingFollowUp: FollowUpQuestion | null
}

type OkInterview = {
  ok: true
  interview: Interview
  /** True when scoring ran in the browser (backend offline). */
  localMock?: boolean
}
type ErrInterview = {
  ok: false
  error: string
  interview?: Interview
  details?: unknown
}

export function getOrCreateClientId(): string {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_KEY, id)
    return id
  } catch {
    return `anon-${crypto.randomUUID()}`
  }
}

function looksLikeDeadProxy(res: Response, bodyText: string): boolean {
  if (res.status !== 500 && res.status !== 502 && res.status !== 503) {
    return false
  }
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) return true
  // Vite proxy error pages sometimes still claim JSON incorrectly
  return (
    bodyText.includes('ECONNREFUSED') ||
    bodyText.includes('proxy error') ||
    bodyText.trimStart().startsWith('<!')
  )
}

async function parseJson(res: Response): Promise<OkInterview | ErrInterview> {
  const text = await res.text()
  if (looksLikeDeadProxy(res, text)) {
    return {
      ok: false,
      error: 'backend_offline',
    }
  }

  let body: unknown
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    return { ok: false, error: `http_${res.status}` }
  }
  if (
    body &&
    typeof body === 'object' &&
    'ok' in body &&
    (body as { ok: boolean }).ok === true &&
    'interview' in body
  ) {
    return body as OkInterview
  }
  const err = body as ErrInterview
  return {
    ok: false,
    error: err?.error ?? `http_${res.status}`,
    interview: err?.interview,
    details: err?.details,
  }
}

async function fetchInterview(
  path: string,
  init: RequestInit,
): Promise<OkInterview | ErrInterview> {
  try {
    const res = await fetch(`${API_BASE}${path}`, init)
    return await parseJson(res)
  } catch {
    return { ok: false, error: 'backend_offline' }
  }
}

export async function startInterview(input: {
  levelId: string
  mapId: string
  clientId?: string
}): Promise<OkInterview | ErrInterview> {
  const remote = await fetchInterview('/api/v1/interviews/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      levelId: input.levelId,
      mapId: input.mapId,
      clientId: input.clientId ?? getOrCreateClientId(),
    }),
  })
  if (remote.ok) return remote
  if (remote.error === 'backend_offline' || remote.error.startsWith('http_')) {
    return startInterviewLocal(input)
  }
  return remote
}

export async function evaluateInterview(
  interviewId: string,
  submit: ArchitectureSubmit,
): Promise<OkInterview | ErrInterview> {
  if (interviewId.startsWith('local-')) {
    return evaluateInterviewLocal(interviewId, submit)
  }
  const remote = await fetchInterview(
    `/api/v1/interviews/${encodeURIComponent(interviewId)}/evaluate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submit),
    },
  )
  if (remote.ok) return remote
  if (remote.error === 'backend_offline' || remote.error.startsWith('http_')) {
    const started = startInterviewLocal({
      levelId: submit.levelId,
      mapId: submit.mapId,
    })
    return evaluateInterviewLocal(started.interview.id, submit)
  }
  return remote
}

export async function reviseInterview(
  interviewId: string,
  submit: ArchitectureSubmit,
): Promise<OkInterview | ErrInterview> {
  if (interviewId.startsWith('local-')) {
    return evaluateInterviewLocal(interviewId, submit)
  }
  const remote = await fetchInterview(
    `/api/v1/interviews/${encodeURIComponent(interviewId)}/revise`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submit),
    },
  )
  if (remote.ok) return remote
  if (remote.error === 'backend_offline' || remote.error.startsWith('http_')) {
    return evaluateInterviewLocal(interviewId, submit)
  }
  return remote
}

export async function answerInterview(
  interviewId: string,
  answer: string,
): Promise<OkInterview | ErrInterview> {
  if (interviewId.startsWith('local-')) {
    return answerInterviewLocal(interviewId, answer)
  }
  const remote = await fetchInterview(
    `/api/v1/interviews/${encodeURIComponent(interviewId)}/answer`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    },
  )
  if (remote.ok) return remote
  if (remote.error === 'backend_offline' || remote.error.startsWith('http_')) {
    return answerInterviewLocal(interviewId, answer)
  }
  return remote
}

export { probeInterviewApi }
