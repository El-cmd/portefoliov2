// components/FlickeringGrid.tsx
import type React from "react"
import { useState, useEffect } from "react"

interface FlickeringGridProps {
  rows: number
  cols: number
  flickerSpeed: number // milliseconds
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({ rows, cols, flickerSpeed }) => {
  const [grid, setGrid] = useState<Array<Array<boolean>>>([])

  useEffect(() => {
    const newGrid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() < 0.5))
    setGrid(newGrid)

    const intervalId = setInterval(() => {
      const newGrid = grid.map((row) => row.map((cell) => Math.random() < 0.5))
      setGrid(newGrid)
    }, flickerSpeed)

    return () => clearInterval(intervalId)
  }, [rows, cols, flickerSpeed])

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              backgroundColor: cell ? "white" : "black",
              width: "10px",
              height: "10px",
            }}
          />
        )),
      )}
    </div>
  )
}

export default FlickeringGrid
