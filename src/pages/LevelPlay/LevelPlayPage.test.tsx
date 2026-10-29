import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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


