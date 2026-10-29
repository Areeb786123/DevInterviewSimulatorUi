import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LevelMapPage } from './LevelMapPage'

vi.mock('../../audio/AudioProvider', () => ({
  useAudio: () => ({
    playSfx: vi.fn(),
    unlockAudio: vi.fn(async () => undefined),
    armDefaultMusic: vi.fn(async () => undefined),
    musicOn: true,
    muted: false,
    volume: 70,
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    enableMusic: vi.fn(),
    disableMusic: vi.fn(),
    unlocked: true,
  }),
}))

function renderMap() {
  return render(
    <MemoryRouter initialEntries={['/system-design/social-media']}>
      <Routes>
        <Route path="/system-design/social-media" element={<LevelMapPage />} />
        <Route
          path="/system-design/social-media/level-1"
          element={<div>Level 1 Fight</div>}
        />
        <Route
          path="/system-design/social-media/level-2"
          element={<div>Level 2 Fight</div>}
        />
        <Route
          path="/system-design/social-media/level-15"
          element={<div>Level 15 Capstone</div>}
        />
        <Route path="/system-design" element={<div>Arena Select</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LevelMapPage', () => {
  it('links back to arena select', () => {
    renderMap()
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute(
      'href',
      '/system-design',
    )
  })

  it('enters Level 1 from star node', async () => {
    const user = userEvent.setup()
    renderMap()
    await user.click(screen.getByRole('button', { name: 'Level 1' }))
    expect(screen.getByText(/level 1 fight/i)).toBeInTheDocument()
  })

  it('enters Level 2 from star node', async () => {
    const user = userEvent.setup()
    renderMap()
    await user.click(screen.getByRole('button', { name: 'Level 2' }))
    expect(screen.getByText(/level 2 fight/i)).toBeInTheDocument()
  })

  it('shows Level 15 on the map', async () => {
    const user = userEvent.setup()
    renderMap()
    await user.click(screen.getByRole('button', { name: 'Level 15' }))
    expect(screen.getByText(/level 15 capstone/i)).toBeInTheDocument()
  })

  it('zooms in when plus is pressed', async () => {
    const user = userEvent.setup()
    renderMap()
    expect(screen.getByText('115%')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /zoom in/i }))
    expect(screen.getByText('140%')).toBeInTheDocument()
  })
})
