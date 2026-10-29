import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DecisionDialog } from './DecisionDialog'

describe('DecisionDialog', () => {
  it('saves technology decision fields', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(
      <DecisionDialog
        open
        nodeLabel="PostgreSQL"
        componentId="n-1"
        initial={null}
        onSave={onSave}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByLabelText('Technology')).toHaveValue('PostgreSQL')

    fireEvent.change(screen.getByLabelText('Why chosen'), {
      target: { value: 'ACID + SQL' },
    })
    fireEvent.change(screen.getByLabelText('Advantages'), {
      target: { value: 'Consistency' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }))

    expect(onSave).toHaveBeenCalledWith({
      componentId: 'n-1',
      technology: 'PostgreSQL',
      whyChosen: 'ACID + SQL',
      advantages: 'Consistency',
      disadvantages: '',
      alternatives: '',
      bottleneck: '',
    })
  })

  it('calls onCancel', () => {
    const onCancel = vi.fn()
    render(
      <DecisionDialog
        open
        nodeLabel="Redis"
        componentId="n-2"
        onSave={vi.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
