import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NodeLabelDialog } from './NodeLabelDialog'

it('saves trimmed label and cancels without save', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  const onCancel = vi.fn()
  const { rerender } = render(
    <NodeLabelDialog
      open
      title="Name this box"
      initial=""
      onCancel={onCancel}
      onSave={onSave}
    />,
  )

  await user.type(screen.getByRole('textbox'), '  Auth Gateway  ')
  await user.click(screen.getByRole('button', { name: /save|ok|done/i }))
  expect(onSave).toHaveBeenCalledWith('Auth Gateway')

  rerender(
    <NodeLabelDialog
      open
      title="Name this box"
      initial="X"
      onCancel={onCancel}
      onSave={onSave}
    />,
  )
  await user.click(screen.getByRole('button', { name: /cancel/i }))
  expect(onCancel).toHaveBeenCalled()
  expect(onSave).toHaveBeenCalledTimes(1)
})

it('disables save for a blank label', () => {
  render(
    <NodeLabelDialog
      open
      title="Name this box"
      initial="   "
      onCancel={vi.fn()}
      onSave={vi.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: /save|ok|done/i })).toBeDisabled()
})

it('cancels when Escape is pressed', async () => {
  const user = userEvent.setup()
  const onCancel = vi.fn()
  render(
    <NodeLabelDialog
      open
      title="Rename this box"
      initial="Gateway"
      onCancel={onCancel}
      onSave={vi.fn()}
    />,
  )

  await user.keyboard('{Escape}')
  expect(onCancel).toHaveBeenCalledOnce()
})
