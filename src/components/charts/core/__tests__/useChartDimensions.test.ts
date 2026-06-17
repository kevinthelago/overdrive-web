import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render } from '@testing-library/react'
import React, { useState } from 'react'
import { useChartDimensions } from '../useChartDimensions'
import type { Dimensions, Margin } from '../types'

// Captured from the mock constructor so tests can fire fake resize events
let resizeCb: ((entries: Partial<ResizeObserverEntry>[]) => void) | null = null
let disconnectSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  resizeCb = null
  disconnectSpy = vi.fn()
  vi.stubGlobal('ResizeObserver', class {
    constructor(cb: (entries: Partial<ResizeObserverEntry>[]) => void) {
      resizeCb = cb
    }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = disconnectSpy
  })
})

/** Wrapper component that attaches the hook's ref to a real div */
function Spy({ margin, onDims }: { margin: Margin; onDims: (d: Dimensions) => void }) {
  const [ref, dims] = useChartDimensions(margin)
  // Use state so re-renders propagate dims out
  const [, forceUpdate] = useState(0)
  // Store dims reference on render
  onDims(dims)
  void forceUpdate
  return React.createElement('div', { ref, 'data-testid': 'chart' })
}

const BASE = { top: 10, right: 10, bottom: 20, left: 30 }

describe('useChartDimensions', () => {
  it('starts with zero dimensions before any resize event', () => {
    let captured: Dimensions | undefined
    render(React.createElement(Spy, { margin: BASE, onDims: (d) => { captured = d } }))
    expect(captured!.width).toBe(0)
    expect(captured!.boundedWidth).toBe(0)
  })

  it('computes bounded dimensions after a resize callback fires', () => {
    let captured: Dimensions | undefined
    render(React.createElement(Spy, { margin: BASE, onDims: (d) => { captured = d } }))

    act(() => {
      resizeCb!([{ contentRect: { width: 400, height: 300 } }])
    })

    expect(captured!.width).toBe(400)
    expect(captured!.height).toBe(300)
    expect(captured!.boundedWidth).toBe(400 - BASE.left - BASE.right)
    expect(captured!.boundedHeight).toBe(300 - BASE.top - BASE.bottom)
  })

  it('clamps bounded dimensions to 0 when margin exceeds container size', () => {
    const big = { top: 200, right: 200, bottom: 200, left: 200 }
    let captured: Dimensions | undefined
    render(React.createElement(Spy, { margin: big, onDims: (d) => { captured = d } }))

    act(() => {
      resizeCb!([{ contentRect: { width: 100, height: 100 } }])
    })

    expect(captured!.boundedWidth).toBe(0)
    expect(captured!.boundedHeight).toBe(0)
  })

  it('disconnects the observer on unmount', () => {
    const spy = disconnectSpy
    const { unmount } = render(
      React.createElement(Spy, { margin: BASE, onDims: () => {} }),
    )
    unmount()
    expect(spy).toHaveBeenCalled()
  })
})
