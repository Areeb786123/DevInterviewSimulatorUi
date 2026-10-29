import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentPalette } from './ComponentPalette'
import { SOCIAL_MEDIA_PALETTE } from '../../levels/sharedPalette'

describe('ComponentPalette info panel', () => {
  it('opens the detailed info panel from the info button', () => {
    render(<ComponentPalette items={SOCIAL_MEDIA_PALETTE.slice(0, 3)} />)

    fireEvent.click(screen.getByRole('button', { name: /what is client/i }))

    expect(
      screen.getByRole('dialog', { name: /^Client$/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/COMPONENT GUIDE/i)).toBeInTheDocument()
    expect(screen.getAllByText(/BEGINNER/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument()
  })

  it('closes the panel without changing inventory items', () => {
    render(<ComponentPalette items={SOCIAL_MEDIA_PALETTE.slice(0, 1)} />)
    fireEvent.click(screen.getByRole('button', { name: /what is client/i }))
    fireEvent.click(screen.getByRole('button', { name: 'CLOSE' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Client' })).toBeInTheDocument()
  })
})
