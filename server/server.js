// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');  // Import cors module

// Our server port
const port = 4001;

const app = express();

app.use(cors());  // Use cors middleware

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server, {
  cors: {
    origin: "*",  // Allow all origins
    methods: ["GET", "POST"]  // Allow GET and POST methods
  }
});

io.on('connection', socket => {
    console.log('User connected');
  
    socket.on('startDrawing', (data) => {
      console.log(data);
      socket.broadcast.emit('startDrawing', data);  // Broadcast 'startDrawing' event
    });
  
    socket.on('drawing', (data) => {
      console.log(data);
      socket.broadcast.emit('drawing', data);
    });
  
    socket.on('endDrawing', () => {
      socket.broadcast.emit('endDrawing');
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on('clearCanvas', () => {
        socket.broadcast.emit('clearCanvas');
      });
  });

server.listen(port, () => console.log(`Listening on port ${port}`));
