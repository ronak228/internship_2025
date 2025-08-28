const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Enable CORS
app.use(cors());

// Store online users
let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining
  socket.on('join', (userData) => {
    const user = {
      id: socket.id,
      userId: userData.userId,
      username: userData.username,
      avatar: userData.avatar
    };
    
    // Add user to online users if not already present
    const existingUserIndex = onlineUsers.findIndex(u => u.userId === userData.userId);
    if (existingUserIndex === -1) {
      onlineUsers.push(user);
    } else {
      onlineUsers[existingUserIndex] = user;
    }

    // Join the user to a room
    socket.join('chat-room');
    
    // Send updated online users list to all clients
    io.emit('onlineUsers', onlineUsers);
    
    // Notify others that user joined
    socket.to('chat-room').emit('userJoined', {
      username: userData.username,
      onlineUsers: onlineUsers
    });

    console.log(`${userData.username} joined the chat`);
  });

  // Handle messages
  socket.on('message', (messageData) => {
    console.log('Message received:', messageData.content);
    // Broadcast message to all users in the room
    io.to('chat-room').emit('message', messageData);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to('chat-room').emit('typing', data);
  });

  socket.on('stopTyping', (data) => {
    socket.to('chat-room').emit('stopTyping', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from online users
    const userIndex = onlineUsers.findIndex(user => user.id === socket.id);
    if (userIndex !== -1) {
      const disconnectedUser = onlineUsers[userIndex];
      onlineUsers.splice(userIndex, 1);
      
      // Notify others that user left
      socket.to('chat-room').emit('userLeft', {
        username: disconnectedUser.username,
        onlineUsers: onlineUsers
      });
      
      // Send updated online users list
      io.emit('onlineUsers', onlineUsers);
      
      console.log(`${disconnectedUser.username} left the chat`);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chat server is running',
    onlineUsers: onlineUsers.length
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
