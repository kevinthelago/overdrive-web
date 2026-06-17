import { useRef, useEffect, useState } from 'react'

interface Dims { width: number; height: number }

interface ResponsiveContainerProps {
  children: (dims: Dims) => React.ReactNode
  minHeight?: number
}

export default function ResponsiveContainer({ children, minHeight = 300 }: ResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState<Dims>({ width: 0, height: minHeight })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDims({ width: Math.floor(width), height: Math.max(Math.floor(height), minHeight) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [minHeight])

  return (
    <div ref={containerRef} style={{ width: '100%', minHeight }}>
      {dims.width > 0 && children(dims)}
    </div>
  )
}
