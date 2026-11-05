import { describe, it, expect } from 'vitest'
import type { ComponentKind } from '../types'
import {
  COMPONENT_KNOWLEDGE,
  getComponentKnowledge,
  listComponentKnowledge,
} from './index'
import type { ComponentKnowledge } from './types'

const ALL_KINDS: ComponentKind[] = [
  'client',
  'server',
  'load-balancer',
  'postgres',
  'mongodb',
  'redis',
  'kafka',
  'object-store',
  'cdn',
  'websocket',
  'custom',
]

function expectNonEmptyString(value: string, min = 20) {
  expect(typeof value).toBe('string')
  expect(value.trim().length).toBeGreaterThanOrEqual(min)
}

function assertKnowledgeShape(k: ComponentKnowledge) {
  expect(ALL_KINDS).toContain(k.id)
  expectNonEmptyString(k.name, 3)
  expectNonEmptyString(k.category, 3)
  expect(k.iconUrl).toMatch(/^\/assets\/sysdesign\/.+\.svg$/)
  expectNonEmptyString(k.shortDescription, 40)
  expectNonEmptyString(k.beginnerExplanation, 120)
  expectNonEmptyString(k.technicalExplanation, 120)
  expectNonEmptyString(k.purpose, 40)
  expectNonEmptyString(k.problemBefore, 40)
  expectNonEmptyString(k.whatChanges, 40)
  expectNonEmptyString(k.optionalNote, 20)
  expectNonEmptyString(k.scaling, 80)
  expectNonEmptyString(k.biggestTradeOff, 40)
  expectNonEmptyString(k.interviewTip, 40)

  expect(k.howItWorks.length).toBeGreaterThanOrEqual(4)
  for (const step of k.howItWorks) expectNonEmptyString(step, 20)

  expect(k.architectureExamples.length).toBeGreaterThanOrEqual(2)
  for (const ex of k.architectureExamples) {
    expectNonEmptyString(ex.title, 5)
    expectNonEmptyString(ex.path, 10)
    expectNonEmptyString(ex.explanation, 40)
  }

  expect(k.useCases.length).toBeGreaterThanOrEqual(4)
  for (const u of k.useCases) expectNonEmptyString(u, 15)

  expect(k.whenNotToUse.length).toBeGreaterThanOrEqual(3)
  for (const w of k.whenNotToUse) expectNonEmptyString(w, 20)

  expect(k.advantages.length).toBeGreaterThanOrEqual(3)
  for (const a of k.advantages) {
    expectNonEmptyString(a.point, 5)
    expectNonEmptyString(a.detail, 30)
  }

  expect(k.disadvantages.length).toBeGreaterThanOrEqual(3)
  for (const d of k.disadvantages) {
    expectNonEmptyString(d.point, 5)
    expectNonEmptyString(d.detail, 30)
  }

  expect(k.alternatives.length).toBeGreaterThanOrEqual(3)
  for (const alt of k.alternatives) {
    expectNonEmptyString(alt.name, 3)
    expectNonEmptyString(alt.when, 20)
  }

  expect(k.failureScenarios.length).toBeGreaterThanOrEqual(3)
  for (const f of k.failureScenarios) expectNonEmptyString(f, 30)

  expect(k.interviewQuestions.length).toBeGreaterThanOrEqual(5)
  const levels = new Set(k.interviewQuestions.map((q) => q.level))
  expect(levels.has('beginner')).toBe(true)
  expect(levels.has('intermediate')).toBe(true)
  expect(levels.has('advanced')).toBe(true)
  for (const q of k.interviewQuestions) {
    expectNonEmptyString(q.question, 15)
    expectNonEmptyString(q.testing, 15)
    expect(q.keyConcepts.length).toBeGreaterThanOrEqual(2)
    expectNonEmptyString(q.sampleAnswer, 40)
    expect(q.commonMistakes.length).toBeGreaterThanOrEqual(1)
    expect(['beginner', 'intermediate', 'advanced']).toContain(q.level)
  }

  expect(k.keyTakeaways.length).toBeGreaterThanOrEqual(3)
  for (const t of k.keyTakeaways) expectNonEmptyString(t, 20)

  expect(k.relatedComponents.length).toBeGreaterThanOrEqual(1)
  for (const rel of k.relatedComponents) {
    expect(ALL_KINDS).toContain(rel)
    expect(rel).not.toBe(k.id)
  }
}

describe('componentKnowledge', () => {
  it('covers every ComponentKind exactly once', () => {
    expect(Object.keys(COMPONENT_KNOWLEDGE).sort()).toEqual([...ALL_KINDS].sort())
    expect(listComponentKnowledge()).toHaveLength(ALL_KINDS.length)
  })

  it('getComponentKnowledge returns the record entry', () => {
    for (const kind of ALL_KINDS) {
      expect(getComponentKnowledge(kind)).toBe(COMPONENT_KNOWLEDGE[kind])
      expect(getComponentKnowledge(kind).id).toBe(kind)
    }
  })

  it('every entry meets minimum educational content lengths', () => {
    for (const kind of ALL_KINDS) {
      assertKnowledgeShape(getComponentKnowledge(kind))
    }
  })

  it('encodes key interview guardrails in Redis, MongoDB, and load balancer copy', () => {
    const redis = getComponentKnowledge('redis')
    const mongo = getComponentKnowledge('mongodb')
    const lb = getComponentKnowledge('load-balancer')

    const redisBlob = [
      redis.shortDescription,
      redis.beginnerExplanation,
      redis.technicalExplanation,
      redis.optionalNote,
      ...redis.keyTakeaways,
      redis.biggestTradeOff,
    ].join(' ')
    expect(redisBlob.toLowerCase()).toMatch(/not.*(?:durable )?sot|not (?:your |a )?durable|not.*source of truth/)

    const mongoBlob = [mongo.shortDescription, mongo.beginnerExplanation, ...mongo.keyTakeaways].join(
      ' ',
    )
    expect(mongoBlob.toLowerCase()).toMatch(/not automatic|not.*automatic scale|does not magically scale/)

    const lbBlob = [lb.shortDescription, lb.beginnerExplanation, ...lb.keyTakeaways].join(' ')
    expect(lbBlob.toLowerCase()).toMatch(/not (?:scalability|.*scalab)|alone is not|not enough for scalab/)
  })
})
