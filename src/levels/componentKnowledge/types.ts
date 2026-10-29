import type { ComponentKind } from '../types'

export type InterviewQuestionLevel = 'beginner' | 'intermediate' | 'advanced'

export type InterviewQuestion = {
  question: string
  testing: string
  keyConcepts: string[]
  sampleAnswer: string
  commonMistakes: string[]
  level: InterviewQuestionLevel
}

export type AdvantageRow = {
  point: string
  detail: string
}

export type AlternativeRow = {
  name: string
  when: string
}

export type ArchitectureExample = {
  title: string
  path: string
  explanation: string
}

/** Full static learning content for one inventory component. */
export type ComponentKnowledge = {
  id: ComponentKind
  name: string
  category: string
  iconUrl: string
  shortDescription: string
  beginnerExplanation: string
  technicalExplanation: string
  purpose: string
  problemBefore: string
  whatChanges: string
  optionalNote: string
  howItWorks: string[]
  architectureExamples: ArchitectureExample[]
  useCases: string[]
  whenNotToUse: string[]
  advantages: AdvantageRow[]
  disadvantages: AdvantageRow[]
  alternatives: AlternativeRow[]
  scaling: string
  failureScenarios: string[]
  interviewQuestions: InterviewQuestion[]
  keyTakeaways: string[]
  biggestTradeOff: string
  interviewTip: string
  relatedComponents: ComponentKind[]
}
