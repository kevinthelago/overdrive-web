import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dimensions, Margin } from './types'
import { DEFAULT_MARGIN } from './types'

export function useChartDimensions(
  margin: Margin = DEFAULT_MARGIN,
): [React.RefObject<HTMLDivElement | null>, Dimensions] {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    boundedWidth: 0,
    boundedHeight: 0,
    margin,
  })

  const updateDimensions = useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (!entries[0]) return
      const { width, height } = entries[0].contentRect
      setDimensions({
        width,
        height,
        boundedWidth: Math.max(0, width - margin.left - margin.right),
        boundedHeight: Math.max(0, height - margin.top - margin.bottom),
        margin,
      })
    },
    [margin],
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(updateDimensions)
    observer.observe(el)
    // Capture initial size on mount
    const { width, height } = el.getBoundingClientRect()
    setDimensions({
      width,
      height,
      boundedWidth: Math.max(0, width - margin.left - margin.right),
      boundedHeight: Math.max(0, height - margin.top - margin.bottom),
      margin,
    })
    return () => observer.disconnect()
  }, [margin, updateDimensions])

  return [ref, dimensions]
}
