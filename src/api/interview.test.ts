import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { evaluateInterview, startInterview } from './interview'

function jsonRes(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify(body),
  }
}

describe('interview API client', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('POSTs start and evaluate with relative /api paths', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonRes(201, {
          ok: true,
          interview: {
            id: 'iv-1',
            status: 'IN_PROGRESS',
            latestEvaluation: null,
            pendingFollowUp: null,
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonRes(200, {
          ok: true,
          interview: {
            id: 'iv-1',
            status: 'PASSED',
            latestEvaluation: {
              score: 9,
              passed: true,
              summary: 'Solid.',
              strengths: [],
              weaknesses: [],
              followUpQuestion: null,
              suggestedImprovements: [],
              finalFeedback: 'Nice work.',
            },
            pendingFollowUp: null,
          },
        }),
      )

    const started = await startInterview({
      levelId: 'level-1',
      mapId: 'social-media',
      clientId: 'test-client',
    })
    expect(started.ok).toBe(true)
    expect(String(fetchMock.mock.calls[0]![0])).toContain(
      '/api/v1/interviews/start',
    )

    const evaluated = await evaluateInterview('iv-1', {
      levelId: 'level-1',
      mapId: 'social-media',
      components: [{ id: 'n1', kind: 'client', x: 0, y: 0 }],
      connections: [],
      decisions: [],
      explanation: 'Simple client.',
    })
    expect(evaluated.ok).toBe(true)
    if (evaluated.ok) {
      expect(evaluated.interview.latestEvaluation?.score).toBe(9)
    }
    expect(String(fetchMock.mock.calls[1]![0])).toContain('/evaluate')
  })

  it('falls back to local mock when Vite proxy returns 500 HTML', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'text/plain' },
      text: async () => 'http proxy error: ECONNREFUSED',
    })

    const started = await startInterview({
      levelId: 'level-1',
      mapId: 'social-media',
    })
    expect(started.ok).toBe(true)
    if (!started.ok) return
    expect(started.localMock).toBe(true)
    expect(started.interview.id.startsWith('local-')).toBe(true)
  })
})
