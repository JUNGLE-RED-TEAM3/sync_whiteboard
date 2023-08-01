import React from 'react';
import { useCanvas } from './CanvasContext';
import './painter_tool.css';

export const LineWidthButtons = () => {
  const { lineWidth, setLineWidth } = useCanvas();

  return (
    <div className='LineWidthButtons'>
      <button className='' onClick={() => setLineWidth(lineWidth + 3)}>Increase line width</button>
      <button className='' onClick={() => setLineWidth(lineWidth - 3)}>Decrease line width</button>
    </div>
  );
};

export const ColorPicker = () => {
  const { strokeColor, setStrokeColor } = useCanvas();

  return (
    <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} />
  );
};

export const ShapeButtons = () => {
    const { drawCircle, drawSquare, drawTriangle } = useCanvas();
  
    return (
      <div className='ShapeButtons'>
        <button className='' onClick={drawCircle}>Draw Circle</button>
        <button className='' onClick={drawSquare}>Draw Square</button>
        <button className='' onClick={drawTriangle}>Draw Triangle</button>
      </div>
    );
  };
