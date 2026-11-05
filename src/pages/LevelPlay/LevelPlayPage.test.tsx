import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, createEvent, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LevelPlayPage } from './LevelPlayPage'

vi.mock('../../audio/AudioProvider', () => ({
  useAudio: () => ({
    playSfx: vi.fn(),
    armDefaultMusic: vi.fn(async () => undefined),
    musicOn: true,
    muted: false,
    volume: 70,
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    unlockAudio: vi.fn(),
    enableMusic: vi.fn(),
    disableMusic: vi.fn(),
    unlocked: true,
  }),
}))

function renderLevel(levelId: string) {
  return render(
    <MemoryRouter initialEntries={[`/system-design/social-media/${levelId}`]}>
      <Routes>
        <Route
          path="/system-design/social-media/:levelId"
          element={<LevelPlayPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LevelPlayPage', () => {
  it('loads level 1', async () => {
    renderLevel('level-1')
    await waitFor(() => {
      expect(screen.getByText(/training grounds/i)).toBeInTheDocument()
    })
  })

  it('loads level 2 traffic spike', async () => {
    renderLevel('level-2')
    await waitFor(() => {
      expect(screen.getByText('Traffic Spike')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Load Balancer' })).toBeInTheDocument()
  })

  it('does not place on bare board click', async () => {
    renderLevel('level-1')
    await waitFor(() => screen.getByRole('button', { name: 'Client' }))
    fireEvent.click(screen.getByTestId('design-board'))
    expect(screen.getByText(/drag parts from inventory/i)).toBeInTheDocument()
  })

  it('does not show clear celebration before a win', async () => {
    renderLevel('level-1')
    await waitFor(() => screen.getByRole('button', { name: 'Client' }))
    expect(screen.queryByTestId('clear-celebration')).not.toBeInTheDocument()
  })

  it('opens review mode dialog from AI REVIEW', async () => {
    renderLevel('level-1')
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /open ai interview review options/i }),
      ).toBeInTheDocument()
    })
    fireEvent.click(
      screen.getByRole('button', { name: /open ai interview review options/i }),
    )
    expect(
      screen.getByRole('dialog', { name: /choose interview review mode/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /choose base run/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /choose ai run/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /choose ultra ai run/i }),
    ).toBeInTheDocument()
  })



  it('keeps timer and budget in the top HUD', async () => {
    renderLevel('level-1')
    await waitFor(() => {
      expect(screen.getByLabelText(/time remaining/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^budget$/i)).toBeInTheDocument()
    })
  })

  it('opens explanation dialog from the edit strip', async () => {
    renderLevel('level-1')
    await waitFor(() =>
      screen.getByRole('button', { name: /edit architecture explanation/i }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: /edit architecture explanation/i }),
    )
    expect(
      screen.getByRole('dialog', { name: /explain your architecture/i }),
    ).toBeInTheDocument()
  })
})

describe('LevelPlayPage interview API', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not call API until a review mode is chosen', async () => {
    renderLevel('level-1')
    await waitFor(() =>
      screen.getByRole('button', { name: /open ai interview review options/i }),
    )

    fireEvent.click(
      screen.getByRole('button', { name: /open ai interview review options/i }),
    )
    expect(fetchMock).not.toHaveBeenCalled()
    expect(
      screen.getByRole('dialog', { name: /choose interview review mode/i }),
    ).toBeInTheDocument()
  })
})

function renderSandbox() {
  return render(
    <MemoryRouter initialEntries={['/system-design/sandbox']}>
      <Routes>
        <Route path="/system-design/sandbox" element={<LevelPlayPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function dropKind(kind: string) {
  const event = createEvent.drop(screen.getByTestId('design-board'), {
    dataTransfer: { getData: () => kind },
  })
  // jsdom has no DragEvent, so pointer coords must be defined by hand
  Object.defineProperty(event, 'clientX', { value: 100 })
  Object.defineProperty(event, 'clientY', { value: 100 })
  fireEvent(screen.getByTestId('design-board'), event)
}

async function saveExplanation(text: string) {
  fireEvent.click(
    screen.getByRole('button', { name: /edit architecture explanation/i }),
  )
  fireEvent.change(screen.getByLabelText(/architecture explanation text/i), {
    target: { value: text },
  })
  const dialog = screen.getByRole('dialog', { name: /explain your architecture/i })
  fireEvent.click(within(dialog).getByRole('button', { name: 'SAVE' }))
}

describe('LevelPlayPage sandbox', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows AI Run instead of PLAY / AI REVIEW', async () => {
    renderSandbox()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'AI Run' })).toBeInTheDocument(),
    )
    expect(screen.getByText('Custom Design Simulate')).toBeInTheDocument()
    expect(screen.queryByText(/▶ PLAY/)).not.toBeInTheDocument()
    expect(screen.queryByText('AI REVIEW')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /play simulation/i }),
    ).not.toBeInTheDocument()
  })

  it('does not render timer or budget HUD', async () => {
    renderSandbox()
    await waitFor(() => screen.getByRole('button', { name: 'AI Run' }))
    expect(screen.queryByText('TIMER')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/time remaining/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^budget$/i)).not.toBeInTheDocument()
  })

  it('links back to home', async () => {
    renderSandbox()
    await waitFor(() => screen.getByRole('button', { name: 'AI Run' }))
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/')
  })

  it('disables AI Run until a node and explanation exist', async () => {
    renderSandbox()
    await waitFor(() => screen.getByRole('button', { name: 'AI Run' }))
    const run = screen.getByRole('button', { name: 'AI Run' })
    expect(run).toBeDisabled()

    dropKind('client')
    expect(run).toBeDisabled()

    await saveExplanation('Client talks to my thing.')
    expect(screen.getByRole('button', { name: 'AI Run' })).toBeEnabled()
  })

  it('prompts for a label on custom drop and removes node on cancel', async () => {
    renderSandbox()
    await waitFor(() => screen.getByRole('button', { name: 'AI Run' }))
    dropKind('custom')
    const dialog = screen.getByRole('dialog', { name: /name your component/i })
    fireEvent.click(within(dialog).getByRole('button', { name: 'CANCEL' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await saveExplanation('x')
    expect(screen.getByRole('button', { name: 'AI Run' })).toBeDisabled()
  })

  it('submits labels and user-only explanation with reviewMode ai', async () => {
    const interview = {
      id: 'iv-1',
      status: 'AWAITING_FOLLOW_UP',
      latestEvaluation: {
        score: 60,
        passed: false,
        summary: 'Needs work',
        strengths: [],
        weaknesses: [],
        followUpQuestion: null,
        suggestedImprovements: [],
        finalFeedback: null,
      },
      pendingFollowUp: { question: 'Why?', reason: 'r' },
    }
    fetchMock.mockImplementation(async (url: string) => ({
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () =>
        JSON.stringify({
          ok: true,
          interview: url.endsWith('/start')
            ? { id: 'iv-1', status: 'IN_PROGRESS', latestEvaluation: null, pendingFollowUp: null }
            : interview,
        }),
    }))

    renderSandbox()
    await waitFor(() => screen.getByRole('button', { name: 'AI Run' }))
    dropKind('custom')
    fireEvent.change(screen.getByLabelText('Node label'), {
      target: { value: 'Auth Gateway' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }))
    await saveExplanation('My own words')

    fireEvent.click(screen.getByRole('button', { name: 'AI Run' }))
    await waitFor(() => expect(screen.getByText('Needs work')).toBeInTheDocument())

    const evalCall = fetchMock.mock.calls.find(([u]) =>
      String(u).endsWith('/evaluate'),
    )!
    const body = JSON.parse(evalCall[1].body as string)
    expect(body.mapId).toBe('sandbox')
    expect(body.explanation).toBe('My own words')
    expect(body.levelContext.reviewMode).toBe('ai')
    expect(body.components[0]).toMatchObject({
      kind: 'custom',
      label: 'Auth Gateway',
    })

    // no follow-up answer UI, and AI Run stays available for re-run
    expect(screen.queryByText('Why?')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AI Run' })).toBeEnabled()
  })

  it('starts a fresh interview on re-run after PASSED (no revise on passed id)', async () => {
    let startCount = 0
    const passedEval = {
      score: 95,
      passed: true,
      summary: 'Great design',
      strengths: [],
      weaknesses: [],
      followUpQuestion: null,
      suggestedImprovements: [],
      finalFeedback: null,
    }
    fetchMock.mockImplementation(async (url: string) => {
      const u = String(url)
      let interview
      if (u.endsWith('/start')) {
        startCount += 1
        interview = {
          id: `iv-${startCount}`,
          status: 'IN_PROGRESS',
          latestEvaluation: null,
          pendingFollowUp: null,
        }
      } else {
        const id = u.match(/interviews\/([^/]+)\//)?.[1] ?? 'iv-?'
        interview = {
          id,
          status: 'PASSED',
          latestEvaluation: passedEval,
          pendingFollowUp: null,
        }
      }
      return {
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ ok: true, interview }),
      }
    })

    renderSandbox()
    await waitFor(() => screen.getByRole('button', { name: 'AI Run' }))
    dropKind('client')
    await saveExplanation('Client design')

    fireEvent.click(screen.getByRole('button', { name: 'AI Run' }))
    await waitFor(() => expect(screen.getByText('Great design')).toBeInTheDocument())
    expect(startCount).toBe(1)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'AI Run' })).toBeEnabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'AI Run' }))
    await waitFor(() => expect(startCount).toBe(2))
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([u]) => String(u).includes('/iv-2/evaluate')),
      ).toBe(true),
    )

    const urls = fetchMock.mock.calls.map(([u]) => String(u))
    expect(urls.some((u) => u.endsWith('/revise'))).toBe(false)
    expect(urls.filter((u) => u.endsWith('/evaluate'))).toHaveLength(2)
  })
})
