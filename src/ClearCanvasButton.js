import React from 'react'
import { useCanvas } from './CanvasContext'

export const ClearCanvasButton = () => {
  const { clearCanvas } = useCanvas()

  return <button onClick={clearCanvas}>캔버스 초기화</button>
}