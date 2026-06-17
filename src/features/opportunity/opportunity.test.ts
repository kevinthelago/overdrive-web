import { OpportunitySchema, OpportunityPageSchema } from './types'

describe('OpportunitySchema', () => {
  it('parses a valid opportunity', () => {
    const raw = {
      id: 'opp-1',
      title: 'Expand TX coverage',
      type: 'UNDERSERVED_LANE',
      region: 'TX',
      score: 82,
      competitorId: null,
    }
    const result = OpportunitySchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('UNDERSERVED_LANE')
      expect(result.data.score).toBe(82)
    }
  })

  it('rejects score outside 0-100', () => {
    const raw = {
      id: 'opp-2',
      title: 'Bad score',
      type: 'COST_ADVANTAGE',
      region: 'CA',
      score: 150,
      competitorId: null,
    }
    expect(OpportunitySchema.safeParse(raw).success).toBe(false)
  })

  it('rejects an unknown opportunity type', () => {
    const raw = {
      id: 'opp-3',
      title: 'Unknown',
      type: 'MYSTERY_TYPE',
      region: 'CA',
      score: 50,
      competitorId: null,
    }
    expect(OpportunitySchema.safeParse(raw).success).toBe(false)
  })
})

describe('OpportunityPageSchema', () => {
  it('parses a Spring Data page response', () => {
    const raw = {
      content: [
        {
          id: 'opp-1',
          title: 'Test',
          type: 'NEW_MARKET',
          region: 'CA',
          score: 60,
          competitorId: 'comp-1',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 20,
    }
    const result = OpportunityPageSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.content).toHaveLength(1)
    }
  })
})
