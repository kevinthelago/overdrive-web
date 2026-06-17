import { describe, it, expect } from 'vitest'
import { CompetitorSchema, CompetitorPageSchema } from './types'

describe('CompetitorSchema', () => {
  it('parses a valid competitor', () => {
    const raw = { id: '1', name: 'Acme', url: 'https://acme.com', region: 'CA', tags: ['truckload'] }
    const result = CompetitorSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Acme')
      expect(result.data.tags).toEqual(['truckload'])
    }
  })

  it('rejects a record missing required fields', () => {
    const result = CompetitorSchema.safeParse({ id: '1', name: 'Broken' })
    expect(result.success).toBe(false)
  })
})

describe('CompetitorPageSchema', () => {
  it('parses a valid page response', () => {
    const raw = {
      items: [{ id: '1', name: 'Acme', url: 'https://acme.com', region: 'CA', tags: [] }],
      total: 1,
      page: 0,
      pageSize: 20,
    }
    const result = CompetitorPageSchema.safeParse(raw)
    expect(result.success).toBe(true)
  })
})
