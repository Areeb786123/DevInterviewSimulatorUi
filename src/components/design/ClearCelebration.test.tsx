import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ClearCelebration } from './ClearCelebration'

describe('ClearCelebration', () => {
  it('shows Next Level link when a next route exists', () => {
    render(
      <MemoryRouter>
        <ClearCelebration
          next={{
            kind: 'next',
            route: '/system-design/social-media/level-2',
            label: 'Level 2',
          }}
        />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /next level/i })
    expect(link).toHaveAttribute(
      'href',
      '/system-design/social-media/level-2',
    )
  })

  it('shows Coming soon when there is no next level', () => {
    render(
      <MemoryRouter>
        <ClearCelebration next={{ kind: 'coming-soon' }} />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('button', { name: /coming soon/i }),
    ).toBeDisabled()
  })
})
