import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentInfoPanel } from './ComponentInfoPanel'
import { getComponentKnowledge } from '../../levels/componentKnowledge'

describe('ComponentInfoPanel', () => {
  it('renders overview and expands another section without AI calls', () => {
    const knowledge = getComponentKnowledge('postgres')
    render(
      <ComponentInfoPanel open knowledge={knowledge} onClose={() => {}} />,
    )

    expect(
      screen.getByRole('dialog', { name: /^PostgreSQL$/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/BEGINNER/i).length).toBeGreaterThan(0)
    expect(
      screen.getByText(knowledge.beginnerExplanation.slice(0, 40), {
        exact: false,
      }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /interview questions/i }),
    )
    expect(screen.getByText(/Q1\./i)).toBeInTheDocument()
    expect(screen.getAllByText(/SAMPLE:/i).length).toBeGreaterThan(0)
    // Overview closes when another section opens (accordion)
    expect(
      screen.queryByText(knowledge.beginnerExplanation.slice(0, 40), {
        exact: false,
      }),
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /why does it exist/i }),
    )
    expect(screen.queryByText(/Q1\./i)).not.toBeInTheDocument()
  })

  it('calls onClose from CLOSE', () => {
    let closed = false
    render(
      <ComponentInfoPanel
        open
        knowledge={getComponentKnowledge('redis')}
        onClose={() => {
          closed = true
        }}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'CLOSE' }))
    expect(closed).toBe(true)
  })
})
