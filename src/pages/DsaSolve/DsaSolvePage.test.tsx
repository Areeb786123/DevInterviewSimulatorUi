import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DsaSolvePage } from './DsaSolvePage'

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

function renderSolve() {
  return render(
    <MemoryRouter
      initialEntries={['/dsa/sort-by-absolute-value']}
    >
      <Routes>
        <Route path="/dsa/:questionId" element={<DsaSolvePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DsaSolvePage', () => {
  it('loads question, simulator, and runs failing starter', async () => {
    const user = userEvent.setup()
    renderSolve()
    await waitFor(() => {
      expect(screen.getByText('Sort Array By Absolute Value')).toBeInTheDocument()
    })
    expect(screen.getByTestId('ball-simulator')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /run/i }))
    await waitFor(() => {
      expect(screen.getAllByText('FAIL').length).toBeGreaterThan(0)
    })
  })

  it('shows runner coming soon for Python', async () => {
    const user = userEvent.setup()
    renderSolve()
    await waitFor(() => screen.getByLabelText('Language'))
    await user.selectOptions(screen.getByLabelText('Language'), 'python')
    await user.click(screen.getByRole('button', { name: /run/i }))
    expect(
      screen.getByText(/runner coming soon/i),
    ).toBeInTheDocument()
  })

  it('loads number of provinces with graph simulator', async () => {
    render(
      <MemoryRouter initialEntries={['/dsa/number-of-provinces']}>
        <Routes>
          <Route path="/dsa/:questionId" element={<DsaSolvePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByText('Number of Provinces')).toBeInTheDocument()
    })
    expect(screen.getByTestId('graph-simulator')).toBeInTheDocument()
  })
})

