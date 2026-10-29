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
    armDefaultMusic: vi.fn(async () => undefined),
    musicOn: true,
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
    const onDsa = vi.fn()
    render(
      <ModeSelect onSystemDesignEnter={onEnter} onDsaEnter={onDsa} />,
    )
    await user.click(screen.getByRole('button', { name: /system design/i }))
    expect(onEnter).toHaveBeenCalled()
  })

  it('calls onDsaEnter for DSA Prep', async () => {
    const user = userEvent.setup()
    const onEnter = vi.fn()
    const onDsa = vi.fn()
    render(
      <ModeSelect onSystemDesignEnter={onEnter} onDsaEnter={onDsa} />,
    )
    await user.click(screen.getByRole('button', { name: /dsa prep/i }))
    expect(onDsa).toHaveBeenCalled()
    expect(onEnter).not.toHaveBeenCalled()
  })

  it('shows coming soon for SQL and does not navigate', async () => {
    const user = userEvent.setup()
    const onEnter = vi.fn()
    const onDsa = vi.fn()
    render(
      <ModeSelect onSystemDesignEnter={onEnter} onDsaEnter={onDsa} />,
    )
    await user.click(screen.getByRole('button', { name: /sql/i }))
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
    expect(onEnter).not.toHaveBeenCalled()
    expect(onDsa).not.toHaveBeenCalled()
  })
})
