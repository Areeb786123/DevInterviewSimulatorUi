import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InterviewerPanel } from './InterviewerPanel'
import type { EvaluationResult } from '../../api/interview'

const evaluation: EvaluationResult = {
  score: 5,
  passed: false,
  summary: 'Needs work',
  strengths: [],
  weaknesses: [],
  followUpQuestion: {
    question: 'How do you scale 10x?',
    reason: 'r',
    expectedConcepts: [],
  },
  suggestedImprovements: [],
  finalFeedback: null,
}

const base = {
  answer: '',
  onAnswerChange: vi.fn(),
  onSubmitAnswer: vi.fn(),
}

describe('InterviewerPanel follow-up', () => {
  it('does not show follow-up controls from evaluation when pendingFollowUp is null', () => {
    render(
      <InterviewerPanel {...base} evaluation={evaluation} pendingFollowUp={null} />,
    )
    expect(screen.getByText('Needs work')).toBeInTheDocument()
    expect(screen.queryByText('FOLLOW-UP')).not.toBeInTheDocument()
    expect(screen.queryByText('How do you scale 10x?')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Follow-up answer')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /submit answer/i }),
    ).not.toBeInTheDocument()
  })

  it('shows follow-up controls when pendingFollowUp is provided', () => {
    render(
      <InterviewerPanel
        {...base}
        evaluation={evaluation}
        pendingFollowUp={evaluation.followUpQuestion}
      />,
    )
    expect(screen.getByLabelText('Follow-up answer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit answer/i })).toBeInTheDocument()
  })
})
