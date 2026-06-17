import { useEffect, useRef, useState } from 'react'

export interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: React.ReactNode
}

interface TooltipProps {
  state: TooltipState
  containerRef: React.RefObject<SVGSVGElement | SVGGElement | HTMLDivElement | null>
}

/** Floating tooltip that positions itself relative to a container element */
export function Tooltip({ state, containerRef }: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    if (!state.visible || !tooltipRef.current || !containerRef.current) return
    const container = containerRef.current
    const rect = container instanceof Element ? container.getBoundingClientRect() : null
    const tip = tooltipRef.current.getBoundingClientRect()
    if (!rect) return
    const x = state.x + rect.left
    const y = state.y + rect.top
    // Flip left if overflowing right edge
    const left = x + tip.width + 12 > window.innerWidth ? x - tip.width - 12 : x + 12
    // Flip up if overflowing bottom
    const top = y + tip.height + 12 > window.innerHeight ? y - tip.height - 12 : y + 12
    setPosition({ left, top })
  }, [state, containerRef])

  if (!state.visible) return null

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      className="pointer-events-none fixed z-50 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg"
      style={{ left: position.left, top: position.top }}
    >
      {state.content}
    </div>
  )
}

export function useTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  })

  const show = (x: number, y: number, content: React.ReactNode) =>
    setTooltip({ visible: true, x, y, content })

  const hide = () => setTooltip((prev) => ({ ...prev, visible: false }))

  return { tooltip, show, hide }
}
