import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',  //process.env.FRONTEND_URL 
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// Store socket-to-room mappings and room states
const socketToRoom = {}; // Maps socketId to roomId

const roomStates = {
  roomId: {
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    participants: {
      socketId: {
        id: "userId",
        name: "userName"
      }
    }
  }
};


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', (data) => {
    const { roomId, user } = data;
    
    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
    
    // Initialize room state if it doesn't exist
    if (!roomStates[roomId]) {
      roomStates[roomId] = {
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        participants: {}
      };
    }
    
    // Add user to room participants
    roomStates[roomId].participants[socket.id] = {
      id: socket.id,
      name: user?.name || `User ${socket.id.slice(0, 4)}`
    };
    
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Send current room state to the new user
    socket.emit('room-state', roomStates[roomId]);
    
    // Notify other users in the room
    socket.to(roomId).emit('user-joined', {
      user: roomStates[roomId].participants[socket.id],
      participantCount: Object.keys(roomStates[roomId].participants).length
    });
    
    // Emit updated participant list to all users in room
    io.to(roomId).emit('participants-updated', {
      participants: Object.values(roomStates[roomId].participants),
      count: Object.keys(roomStates[roomId].participants).length
    });
  });

  // Handle song play/pause
  socket.on('play-song', (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { song, isPlaying = true, currentTime = 0 } = data;
    
    // Update room state
    roomStates[roomId].currentSong = song;
    roomStates[roomId].isPlaying = isPlaying;
    roomStates[roomId].currentTime = currentTime;
    
    // Broadcast to all users in the room
    io.to(roomId).emit('song-changed', {
      song,
      isPlaying,
      currentTime,
      timestamp: Date.now()
    });
    
    console.log(`Song played in room ${roomId}:`, song.title);
  });

  // Handle play/pause toggle
  socket.on('toggle-play-pause', (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { isPlaying, currentTime = 0 } = data;
    
    roomStates[roomId].isPlaying = isPlaying;
    roomStates[roomId].currentTime = currentTime;
    
    // Broadcast to all users in the room
    io.to(roomId).emit('playback-state-changed', {
      isPlaying,
      currentTime,
      timestamp: Date.now()
    });
    
    console.log(`Playback ${isPlaying ? 'resumed' : 'paused'} in room ${roomId}`);
  });

  // Handle seek/time sync
  socket.on('sync-time', (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { currentTime } = data;
    roomStates[roomId].currentTime = currentTime;
    
    socket.to(roomId).emit('time-synced', {
      currentTime,
      timestamp: Date.now()
    });
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { message } = data;
    const user = roomStates[roomId].participants[socket.id];
    
    const messageData = {
      id: Date.now().toString(),
      user: user,
      message: message,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast message to all users in the room
    io.to(roomId).emit('new-message', messageData);
    
    console.log(`Message sent in room ${roomId} by ${user.name}: ${message}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const roomId = socketToRoom[socket.id];
    
    if (roomId && roomStates[roomId]) {
      // Remove user from room participants
      const user = roomStates[roomId].participants[socket.id];
      delete roomStates[roomId].participants[socket.id];
      
      console.log(`Socket ${socket.id} disconnected from room ${roomId}`);
      
      // Notify other users in the room
      socket.to(roomId).emit('user-left', {
        user: user,
        participantCount: Object.keys(roomStates[roomId].participants).length
      });
      
      // Emit updated participant list
      io.to(roomId).emit('participants-updated', {
        participants: Object.values(roomStates[roomId].participants),
        count: Object.keys(roomStates[roomId].participants).length
      });
      
      // Clean up room if empty
      if (Object.keys(roomStates[roomId].participants).length === 0) {
        delete roomStates[roomId];
        console.log(`Room ${roomId} cleaned up - no participants left`);
      }
      
      delete socketToRoom[socket.id];
    } else {
      console.log('User disconnected:', socket.id);
    }
  });

  // Handle room activity ping
  socket.on('room-activity', () => {
    const roomId = socketToRoom[socket.id];
    if (roomId) {
      socket.to(roomId).emit('user-activity');
    }
  });
});

const PORT = process.env.PORT || 3001; // Changed to match frontend

server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});