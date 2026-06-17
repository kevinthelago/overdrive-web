import { describe, it, expect } from 'vitest'
import { formatUsd, formatPct, formatCompactUsd } from '../formatters'

describe('formatUsd', () => {
  it('formats positive amounts with $ sign', () => {
    expect(formatUsd(1000)).toBe('$1,000')
  })

  it('formats zero', () => {
    expect(formatUsd(0)).toBe('$0')
  })

  it('formats fractional amounts (rounds)', () => {
    expect(formatUsd(1234.5)).toBe('$1,235')
  })

  it('formats negative amounts', () => {
    expect(formatUsd(-500)).toBe('-$500')
  })
})

describe('formatPct', () => {
  it('adds + sign for positive values', () => {
    expect(formatPct(0.05)).toBe('+5.0%')
  })

  it('formats negative values without +', () => {
    expect(formatPct(-0.12)).toBe('-12.0%')
  })

  it('formats zero as +0.0%', () => {
    expect(formatPct(0)).toBe('+0.0%')
  })
})

describe('formatCompactUsd', () => {
  it('formats thousands as K', () => {
    expect(formatCompactUsd(5000)).toBe('$5K')
  })

  it('formats millions as M', () => {
    expect(formatCompactUsd(1_500_000)).toBe('$1.5M')
  })

  it('formats small values as full USD', () => {
    expect(formatCompactUsd(99)).toBe('$99')
  })

  it('handles negative K', () => {
    expect(formatCompactUsd(-3000)).toBe('-$3K')
  })
})
