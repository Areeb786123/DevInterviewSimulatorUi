export type DsaLanguage =
  | 'javascript'
  | 'python'
  | 'java'
  | 'kotlin'
  | 'c'
  | 'cpp'
  | 'go'
  | 'rust'

export type ArrayTestCase = {
  id: string
  label: string
  input: number[]
  expected: number[]
  hidden?: boolean
}

export type GraphTestCase = {
  id: string
  label: string
  input: number[][]
  expected: number
  hidden?: boolean
}

/** @deprecated use ArrayTestCase — kept for older imports */
export type DsaTestCase = ArrayTestCase

export type SimStep = {
  values: number[]
  focus: number[]
  swapped?: [number, number]
  line: number
  narration: string
}

export type GraphSimStep = {
  visited: boolean[]
  /** Province id per node, null if not yet assigned */
  provinceOf: (number | null)[]
  activeNode: number | null
  activeEdge: [number, number] | null
  provinceCount: number
  narration: string
}

type DsaQuestionBase = {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  statement: string
  examples: { input: string; output: string; explanation: string }[]
  constraints: string[]
  starterCode: Record<DsaLanguage, string>
  runnable: DsaLanguage[]
}

export type ArraySortQuestion = DsaQuestionBase & {
  kind: 'array-sort'
  referenceSource: string
  simValues: number[]
  simSteps: SimStep[]
  tests: ArrayTestCase[]
}

export type GraphProvincesQuestion = DsaQuestionBase & {
  kind: 'graph-provinces'
  /** Fixed matrix used by the visual simulator */
  simMatrix: number[][]
  tests: GraphTestCase[]
}

export type DsaQuestion = ArraySortQuestion | GraphProvincesQuestion

export type DsaQuestionCard = {
  id: string
  title: string
  difficulty: DsaQuestion['difficulty']
  blurb: string
}

export const DSA_LANGUAGES: { id: DsaLanguage; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
]
