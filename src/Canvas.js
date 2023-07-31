import React, { useEffect } from "react";
import { useCanvas } from "./CanvasContext";

export function Canvas() {
  const {
    canvasRef,
    prepareCanvas,
    startDrawing,
    finishDrawing,
    draw,
    socketRef,  // NOTE: socket.io code
  } = useCanvas();

  useEffect(() => {
    prepareCanvas();

    // 이벤트 리스너 추가
    if (socketRef.current) {
      socketRef.current.on('drawing', (data) => {
          console.log(data);
      });
    }
  }, [socketRef]);  // NOTE: socketRef를 dependency로 추가

  return (
    <canvas
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      ref={canvasRef}
    />
  );
}
