import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DsaListPage } from './DsaListPage'

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

describe('DsaListPage', () => {
  it('lists sort-by-abs and provinces questions', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/dsa']}>
        <Routes>
          <Route path="/dsa" element={<DsaListPage />} />
          <Route
            path="/dsa/:questionId"
            element={<div>Solve screen</div>}
          />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /sort array by absolute value/i,
        }),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: /number of provinces/i }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: /number of provinces/i }),
    )
    expect(screen.getByText(/solve screen/i)).toBeInTheDocument()
  })
})

