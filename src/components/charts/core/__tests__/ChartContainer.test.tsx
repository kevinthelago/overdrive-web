import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartContainer } from '../ChartContainer'

// ResizeObserver is not available in jsdom
class MockResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

describe('ChartContainer', () => {
  it('renders a div wrapper', () => {
    const { container } = render(
      <ChartContainer height={300}>
        {() => <text data-testid="inner">content</text>}
      </ChartContainer>,
    )
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('passes the height style to the container', () => {
    const { container } = render(
      <ChartContainer height={400}>
        {() => null}
      </ChartContainer>,
    )
    const div = container.querySelector('div')!
    expect(div.style.height).toBe('400px')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ChartContainer height={300} className="my-chart">
        {() => null}
      </ChartContainer>,
    )
    expect(container.querySelector('.my-chart')).toBeTruthy()
  })

  it('does not render SVG when width is zero (initial state)', () => {
    const { container } = render(
      <ChartContainer height={300}>
        {() => <text data-testid="inner">content</text>}
      </ChartContainer>,
    )
    // In jsdom getBoundingClientRect returns 0,0 so width is 0 → no SVG
    expect(container.querySelector('svg')).toBeNull()
  })
})
