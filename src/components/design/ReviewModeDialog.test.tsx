import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewModeDialog } from './ReviewModeDialog'

describe('ReviewModeDialog', () => {
  it('shows three review options and architecture preview', () => {
    const onChoose = vi.fn()
    render(
      <ReviewModeDialog
        open
        architecturePreview="client -> app server -> mongodb"
        onChoose={onChoose}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText(/client -> app server -> mongodb/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /choose base run/i }))
    expect(onChoose).toHaveBeenCalledWith('base')
    fireEvent.click(screen.getByRole('button', { name: /choose ai run/i }))
    expect(onChoose).toHaveBeenCalledWith('ai')
    fireEvent.click(screen.getByRole('button', { name: /choose ultra ai run/i }))
    expect(onChoose).toHaveBeenCalledWith('ultra')
  })
})
