import { describe, it, expect } from 'vitest'
import { colorForIndex, CHART_COLORS, POSITIVE_COLOR, NEGATIVE_COLOR } from '../chartColors'

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
  it('POSITIVE_COLOR is a valid hex color', () => {
    expect(POSITIVE_COLOR).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('NEGATIVE_COLOR is a valid hex color', () => {
    expect(NEGATIVE_COLOR).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('POSITIVE and NEGATIVE colors are different', () => {
    expect(POSITIVE_COLOR).not.toBe(NEGATIVE_COLOR)
  })
})
