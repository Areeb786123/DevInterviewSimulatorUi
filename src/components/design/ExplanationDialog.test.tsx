import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExplanationDialog } from './ExplanationDialog'

describe('ExplanationDialog', () => {
  it('saves typed explanation', () => {
    const onSave = vi.fn()
    render(
      <ExplanationDialog
        open
        initial=""
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.change(
      screen.getByRole('textbox', { name: /architecture explanation text/i }),
      { target: { value: 'Client to server to Postgres.' } },
    )
    expect(screen.getByText(/COVER THESE/i)).toBeInTheDocument()
    expect(screen.getByText(/How does a request travel/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalledWith('Client to server to Postgres.')
  })

  it('shows mic control when speech API exists', () => {
    class FakeRec {
      continuous = false
      interimResults = false
      lang = ''
      onresult = null
      onerror = null
      onend = null
      start() {}
      stop() {}
      abort() {}
    }
    ;(window as unknown as { SpeechRecognition: unknown }).SpeechRecognition =
      FakeRec

    render(
      <ExplanationDialog
        open
        initial="hi"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(
      screen.getByRole('button', { name: /start dictation/i }),
    ).toBeInTheDocument()
  })
})
