import React, { useContext, useRef, useState, useEffect } from "react";
import io from 'socket.io-client';

const CanvasContext = React.createContext();

export const CanvasProvider = ({ children }) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const socketRef = useRef(null);  

  const [lineWidth, setLineWidth] = useState(5);  
  const [strokeColor, setStrokeColor] = useState('black');  


  //서버 연결부분

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:4001');
  
    socketRef.current.on('startDrawing', data => {  // Listen for 'startDrawing' events
      const { offsetX, offsetY, lineWidth, strokeColor } = data;
      contextRef.current.strokeStyle = strokeColor;  // Update stroke color
      contextRef.current.lineWidth = lineWidth;  // Update line width
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



  // 캔버스 준비
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
    context.strokeStyle = strokeColor;  
    context.lineWidth = lineWidth;  
    contextRef.current = context;
  };

  // 마우스 다운시 실행되는 함수
  const startDrawing = ({ nativeEvent }) => {
    const { clientX, clientY } = nativeEvent;
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = (clientX - canvasRect.left) * 2;  
    const offsetY = (clientY - canvasRect.top) * 2;  
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY, lineWidth, strokeColor);
    setIsDrawing(true);
  
    
    if (socketRef.current) {
      socketRef.current.emit('startDrawing', { offsetX, offsetY, lineWidth, strokeColor });  // Emit 'startDrawing' event
    }
    
  };

  //마우스 업시 실행되는 함수
  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    
    if (socketRef.current) {
    socketRef.current.emit('endDrawing');
    }
  };

  // 마우스 드래그시 실행되는 함수
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
        return;
    }
    const { clientX, clientY } = nativeEvent;
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = (clientX - canvasRect.left) * 2;  
    const offsetY = (clientY - canvasRect.top) * 2;  
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  
    if (socketRef.current) {
      socketRef.current.emit('drawing', { offsetX, offsetY });
    }
    
  };

  // 도형을 그리는 함수들 //JUNHO: 일단 도형 그리는 코드는 복잡성 증가때문에 보류
  // const drawCircle = ({ nativeEvent }) => {
  //   const { clientX, clientY } = nativeEvent;
  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext("2d");
  //   const radius = 50;  // Set the radius of the circle
  //   context.arc(clientX, clientY, radius, 0, 2 * Math.PI);
  //   context.stroke();
  // };

  // const drawSquare = ({ nativeEvent }) => {
  //   const { clientX, clientY } = nativeEvent;
  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext("2d");
  //   const sideLength = 100;  // Set the length of the square's sides
  //   context.rect(clientX - sideLength / 2, clientY - sideLength / 2, sideLength, sideLength);
  //   context.stroke();
  // };

  // const drawTriangle = ({ nativeEvent }) => {
  //   const { clientX, clientY } = nativeEvent;
  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext("2d");
  //   const sideLength = 100;  // Set the length of the triangle's sides
  //   context.moveTo(clientX, clientY - sideLength / 2);
  //   context.lineTo(clientX - sideLength / 2, clientY + sideLength / 2);
  //   context.lineTo(clientX + sideLength / 2, clientY + sideLength / 2);
  //   context.closePath();
  //   context.stroke();
  // };

  
  // 캔버스 초기화 버튼 관련 함수
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
  
    
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
        lineWidth, 
        strokeColor,  
        // drawCircle, //JUNHO: 일단 도형 그리는 코드는 복잡성 증가때문에 보류
        // drawSquare,
        // drawTriangle,
        setStrokeColor,  
        setLineWidth,  
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
