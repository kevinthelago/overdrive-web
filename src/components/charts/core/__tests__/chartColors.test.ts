import { describe, it, expect } from 'vitest'
import {
  colorForIndex,
  CHART_COLORS,
  POSITIVE_COLOR,
  NEGATIVE_COLOR,
  COST_COLORS,
  COST_BREAKDOWN_KEYS,
  COST_KEY_COLOR,
} from '../chartColors'

describe('colorForIndex', () => {
  it('returns first color for index 0', () => {
    expect(colorForIndex(0)).toBe(CHART_COLORS[0])
  })

  it('wraps around the palette', () => {
    expect(colorForIndex(CHART_COLORS.length)).toBe(CHART_COLORS[0])
  })

  it('returns distinct colors for sequential indices', () => {
    const colors = Array.from({ length: CHART_COLORS.length }, (_, i) => colorForIndex(i))
    const unique = new Set(colors)
    expect(unique.size).toBe(CHART_COLORS.length)
  })
})

describe('semantic colors', () => {
  it('POSITIVE_COLOR and NEGATIVE_COLOR are defined', () => {
    expect(POSITIVE_COLOR).toBeTruthy()
    expect(NEGATIVE_COLOR).toBeTruthy()
  })

  it('POSITIVE and NEGATIVE colors are different', () => {
    expect(POSITIVE_COLOR).not.toBe(NEGATIVE_COLOR)
  })
})

describe('cost color ramp', () => {
  it('has exactly 7 cost colors matching COST_BREAKDOWN_KEYS', () => {
    expect(COST_COLORS.length).toBe(7)
    expect(COST_BREAKDOWN_KEYS.length).toBe(7)
  })

  it('each key maps to a CSS variable in COST_KEY_COLOR', () => {
    for (const key of COST_BREAKDOWN_KEYS) {
      expect(COST_KEY_COLOR[key]).toMatch(/^var\(--color-cost-/)
    }
  })

  it('all cost color entries are unique', () => {
    const values = Object.values(COST_KEY_COLOR)
    expect(new Set(values).size).toBe(values.length)
  })
})
