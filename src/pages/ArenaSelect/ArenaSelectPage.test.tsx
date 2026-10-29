import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ArenaSelectPage } from './ArenaSelectPage'

vi.mock('../../audio/AudioProvider', () => ({
  useAudio: () => ({
    playSfx: vi.fn(),
    unlockAudio: vi.fn(async () => undefined),
    armDefaultMusic: vi.fn(async () => undefined),
    enableMusic: vi.fn(async () => undefined),
    disableMusic: vi.fn(),
    musicOn: true,
    muted: false,
    volume: 70,
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    unlocked: true,
  }),
}))

function renderApp(initial = '/system-design') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/system-design" element={<ArenaSelectPage />} />
        <Route
          path="/system-design/social-media"
          element={<div>Level Map Screen</div>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ArenaSelectPage', () => {
  it('links back to lobby', () => {
    renderApp()
    const back = screen.getByRole('link', { name: /back/i })
    expect(back).toHaveAttribute('href', '/')
  })

  it('navigates to Social Media level map on confirm', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /social media/i }))
    expect(screen.getByText(/level map screen/i)).toBeInTheDocument()
  })
})
