import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StageStrip } from './StageStrip'
import { STAGES } from '../../stages/stages'

vi.mock('../../audio/AudioProvider', () => ({
  useAudio: () => ({
    playSfx: vi.fn(),
    unlockAudio: vi.fn(async () => undefined),
  }),
}))

describe('StageStrip', () => {
  it('moves focus right then clamps at end', async () => {
    const user = userEvent.setup()
    const onFocusChange = vi.fn()
    const { rerender, unmount } = render(
      <StageStrip
        stages={STAGES}
        focusedId="social-media"
        onFocusChange={onFocusChange}
        onConfirm={vi.fn()}
      />,
    )

    await user.keyboard('{ArrowRight}')
    expect(onFocusChange).toHaveBeenLastCalledWith('messaging')

    onFocusChange.mockClear()
    rerender(
      <StageStrip
        stages={STAGES}
        focusedId="ride-matching"
        onFocusChange={onFocusChange}
        onConfirm={vi.fn()}
      />,
    )
    await user.keyboard('{ArrowRight}')
    expect(onFocusChange).not.toHaveBeenCalled()
    unmount()
  })

  it('does not confirm locked stage', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <StageStrip
        stages={STAGES}
        focusedId="messaging"
        onFocusChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: /messaging/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirms unlocked social media', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <StageStrip
        stages={STAGES}
        focusedId="social-media"
        onFocusChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: /social media/i }))
    expect(onConfirm).toHaveBeenCalledWith('social-media')
  })
})
