"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface FlickeringGridProps {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  width?: number
  height?: number
  className?: string

  maxOpacity?: number
  minOpacity?: number
  fps?: number
  maxDevicePixelRatio?: number
  flickerDensity?: number
  hoverRadius?: number
  hoverOpacity?: number
  hoverScale?: number
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  minOpacity = 0.025,
  fps = 12,
  maxDevicePixelRatio = 1,
  flickerDensity = 0.045,
  hoverRadius = 120,
  hoverOpacity = 0.45,
  hoverScale = 2.4,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const memoizedColor = useMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`
      }
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 1
      const ctx = canvas.getContext("2d")
      if (!ctx) return "rgba(255, 0, 0,"
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
      return `rgba(${r}, ${g}, ${b},`
    }
    return toRGBA(color)
  }, [color])

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const cols = Math.floor(width / (squareSize + gridGap))
      const rows = Math.floor(height / (squareSize + gridGap))

      const squares = new Float32Array(cols * rows)
      const opacityRange = Math.max(maxOpacity - minOpacity, 0)
      for (let i = 0; i < squares.length; i++) {
        squares[i] = minOpacity + Math.random() * opacityRange
      }

      return { cols, rows, squares, dpr }
    },
    [squareSize, gridGap, maxOpacity, minOpacity, maxDevicePixelRatio],
  )

  const drawSquare = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      rows: number,
      squares: Float32Array,
      dpr: number,
      index: number,
      hoverPoint?: { x: number; y: number } | null,
    ) => {
      const col = Math.floor(index / rows)
      const row = index % rows
      const step = squareSize + gridGap
      const x = col * step * dpr
      const y = row * step * dpr
      const size = squareSize * dpr
      const centerX = (col * step + squareSize / 2) * dpr
      const centerY = (row * step + squareSize / 2) * dpr
      const hoverX = hoverPoint ? hoverPoint.x * dpr : 0
      const hoverY = hoverPoint ? hoverPoint.y * dpr : 0
      const distance = hoverPoint ? Math.hypot(centerX - hoverX, centerY - hoverY) / dpr : Infinity
      const intensity = hoverPoint ? Math.max(0, 1 - distance / hoverRadius) : 0
      const elevatedSize = size * (1 + intensity * (hoverScale - 1))
      const offset = (elevatedSize - size) / 2
      const opacity = Math.min(1, squares[index] + intensity * hoverOpacity)
      const maxElevatedSize = size * hoverScale
      const maxOffset = (maxElevatedSize - size) / 2

      ctx.clearRect(x - maxOffset - 1, y - maxOffset - 1, maxElevatedSize + 2, maxElevatedSize + 2)
      ctx.fillStyle = `${memoizedColor}${opacity})`
      ctx.fillRect(x - offset, y - offset, elevatedSize, elevatedSize)
    },
    [memoizedColor, squareSize, gridGap, hoverRadius, hoverOpacity, hoverScale],
  )

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width, height)
      for (let index = 0; index < squares.length; index += 1) {
        drawSquare(ctx, rows, squares, dpr, index)
      }
    },
    [drawSquare],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let hoverAnimationFrameId: number | null = null
    let gridParams: ReturnType<typeof setupCanvas>
    let hoverPoint: { x: number; y: number } | null = null
    let previousHoverIndexes = new Set<number>()

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth
      const newHeight = height || container.clientHeight
      setCanvasSize({ width: newWidth, height: newHeight })
      gridParams = setupCanvas(canvas, newWidth, newHeight)
    }

    updateCanvasSize()

    let lastFrameTime = 0
    const frameInterval = 1000 / fps
    const getHoverIndexes = (point: { x: number; y: number }) => {
      const indexes = new Set<number>()
      const step = squareSize + gridGap
      const minCol = Math.max(0, Math.floor((point.x - hoverRadius) / step))
      const maxCol = Math.min(gridParams.cols - 1, Math.ceil((point.x + hoverRadius) / step))
      const minRow = Math.max(0, Math.floor((point.y - hoverRadius) / step))
      const maxRow = Math.min(gridParams.rows - 1, Math.ceil((point.y + hoverRadius) / step))

      for (let col = minCol; col <= maxCol; col += 1) {
        for (let row = minRow; row <= maxRow; row += 1) {
          const centerX = col * step + squareSize / 2
          const centerY = row * step + squareSize / 2
          if (Math.hypot(centerX - point.x, centerY - point.y) <= hoverRadius) {
            indexes.add(col * gridParams.rows + row)
          }
        }
      }

      return indexes
    }

    const drawHover = (point: { x: number; y: number } | null) => {
      const nextIndexes = point ? getHoverIndexes(point) : new Set<number>()
      const indexesToRedraw = new Set([...previousHoverIndexes, ...nextIndexes])

      indexesToRedraw.forEach((index) => {
        drawSquare(ctx, gridParams.rows, gridParams.squares, gridParams.dpr, index, point)
      })

      previousHoverIndexes = nextIndexes
    }

    const scheduleHoverDraw = () => {
      if (hoverAnimationFrameId !== null) return

      hoverAnimationFrameId = requestAnimationFrame(() => {
        hoverAnimationFrameId = null
        drawHover(hoverPoint)
      })
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      hoverPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      scheduleHoverDraw()
    }

    const handlePointerLeave = () => {
      hoverPoint = null
      scheduleHoverDraw()
    }

    const animate = (time: number) => {
      if (!isInView) return

      if (time - lastFrameTime >= frameInterval) {
        lastFrameTime = time
        const changedSquares = Math.max(1, Math.floor(gridParams.squares.length * flickerChance * flickerDensity))
        const opacityRange = Math.max(maxOpacity - minOpacity, 0)

        for (let count = 0; count < changedSquares; count += 1) {
          const index = Math.floor(Math.random() * gridParams.squares.length)
          gridParams.squares[index] = minOpacity + Math.random() * opacityRange
          drawSquare(ctx, gridParams.rows, gridParams.squares, gridParams.dpr, index, hoverPoint)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })

    resizeObserver.observe(container)
    container.addEventListener("pointermove", handlePointerMove)
    container.addEventListener("pointerleave", handlePointerLeave)

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0 },
    )

    intersectionObserver.observe(canvas)

    if (isInView) {
      drawGrid(ctx, canvas.width, canvas.height, gridParams.rows, gridParams.squares, gridParams.dpr)
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (hoverAnimationFrameId !== null) {
        cancelAnimationFrame(hoverAnimationFrameId)
      }
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      container.removeEventListener("pointermove", handlePointerMove)
      container.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [setupCanvas, drawGrid, drawSquare, width, height, isInView, fps, flickerChance, flickerDensity, maxOpacity, minOpacity, squareSize, gridGap, hoverRadius])

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  )
}

export default FlickeringGrid
