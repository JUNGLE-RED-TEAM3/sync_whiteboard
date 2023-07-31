import React, { useContext, useRef, useState, useEffect } from "react";
import io from 'socket.io-client';

const CanvasContext = React.createContext();

export const CanvasProvider = ({ children }) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const socketRef = useRef(null);  // socketRef 추가

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:4001');
  
    socketRef.current.on('startDrawing', data => {  // Listen for 'startDrawing' events
      const { offsetX, offsetY } = data;
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
    });
  
    socketRef.current.on('drawing', data => {
      const { offsetX, offsetY } = data;
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    });
  
    socketRef.current.on('endDrawing', () => {
      contextRef.current.closePath();
      setIsDrawing(false);
    });

    socketRef.current.on('clearCanvas', () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d")
      context.fillStyle = "white"
      context.fillRect(0, 0, canvas.width, canvas.height)
    });
  }, []);

  const prepareCanvas = () => {
    const canvas = canvasRef.current
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth*0.7}px`;
    canvas.style.height = `${window.innerHeight*0.7}px`;
    canvas.style.boxShadow = "10px 10px 5px grey"; // 그림자 추가

    const context = canvas.getContext("2d")
    context.scale(1.42, 1.42);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
  };

  const startDrawing = ({ nativeEvent }) => {
    const { clientX, clientY } = nativeEvent;
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = (clientX - canvasRect.left) * 2;  // 곱하기 2를 추가
    const offsetY = (clientY - canvasRect.top) * 2;  // 곱하기 2를 추가
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  
    // NOTE: socket.io code
    if (socketRef.current) {
      socketRef.current.emit('startDrawing', { offsetX, offsetY });  // Emit 'startDrawing' event
    }
    // NOTE: socket.io code
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Send 'endDrawing' event to the server
    if (socketRef.current) {
    socketRef.current.emit('endDrawing');
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
        return;
    }
    const { clientX, clientY } = nativeEvent;
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = (clientX - canvasRect.left) * 2;  // 곱하기 2를 추가
    const offsetY = (clientY - canvasRect.top) * 2;  // 곱하기 2를 추가
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    // NOTE: socket.io code
    if (socketRef.current) {
      socketRef.current.emit('drawing', { offsetX, offsetY });
    }
    // NOTE: socket.io code
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
  
    // Emit 'clearCanvas' event
    if (socketRef.current) {
      socketRef.current.emit('clearCanvas');
    }
  }

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        contextRef,
        socketRef,  // socketRef를 값에 추가
        prepareCanvas,
        startDrawing,
        finishDrawing,
        clearCanvas,
        draw,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);
