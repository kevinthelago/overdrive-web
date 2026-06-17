import { describe, it, expect } from 'vitest'
import { SERVICE_LEVELS } from '../types'

describe('SERVICE_LEVELS', () => {
  it('contains GROUND, EXPRESS, PRIORITY', () => {
    const values = SERVICE_LEVELS.map((s) => s.value)
    expect(values).toContain('GROUND')
    expect(values).toContain('EXPRESS')
    expect(values).toContain('PRIORITY')
  })

  it('each entry has a non-empty label', () => {
    for (const s of SERVICE_LEVELS) {
      expect(s.label.length).toBeGreaterThan(0)
    }
  })
})
