import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModeSelect } from './ModeSelect'

vi.mock('../../audio/AudioProvider', () => ({
  useAudio: () => ({
    playSfx: vi.fn(),
    unlockAudio: vi.fn(async () => undefined),
    enableMusic: vi.fn(async () => undefined),
    disableMusic: vi.fn(),
    musicOn: false,
    muted: false,
    volume: 70,
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    unlocked: true,
  }),
}))

describe('ModeSelect', () => {
  it('calls onSystemDesignEnter for unlocked mode', async () => {
    const user = userEvent.setup()
    const onEnter = vi.fn()
    render(<ModeSelect onSystemDesignEnter={onEnter} />)
    await user.click(screen.getByRole('button', { name: /system design/i }))
    expect(onEnter).toHaveBeenCalled()
  })

  it('shows coming soon for DSA and does not navigate', async () => {
    const user = userEvent.setup()
    const onEnter = vi.fn()
    render(<ModeSelect onSystemDesignEnter={onEnter} />)
    await user.click(screen.getByRole('button', { name: /dsa/i }))
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
    expect(onEnter).not.toHaveBeenCalled()
  })
})
