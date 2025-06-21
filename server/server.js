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
    lastUpdateTime: 0, // Server timestamp when last updated
    participants: {
      socketId: {
        id: "userId",
        name: "userName"
      }
    }
  }
};

// Helper function to get current synced time
const getSyncedTime = (roomState) => {
  if (!roomState.isPlaying) return roomState.currentTime;
  
  const now = Date.now();
  const elapsed = (now - roomState.lastUpdateTime) / 1000; // Convert to seconds
  return roomState.currentTime + elapsed;
};

// Helper function to update room time and broadcast
const updateRoomTime = (roomId, currentTime, isPlaying = null) => {
  if (!roomStates[roomId]) return;
  
  const now = Date.now();
  roomStates[roomId].currentTime = currentTime;
  roomStates[roomId].lastUpdateTime = now;
  
  if (isPlaying !== null) {
    roomStates[roomId].isPlaying = isPlaying;
  }
  
  return now;
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
        lastUpdateTime: Date.now(),
        participants: {}
      };
    }
    
    // Add user to room participants
    roomStates[roomId].participants[socket.id] = {
      id: socket.id,
      name: user?.name || `User ${socket.id.slice(0, 4)}`
    };
    
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Send current room state to the new user with synced time
    const syncedTime = getSyncedTime(roomStates[roomId]);
    const currentRoomState = {
      ...roomStates[roomId],
      currentTime: syncedTime,
      participants: Object.values(roomStates[roomId].participants)
    };
    
    socket.emit('room-state', currentRoomState);
    
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

    const { song, isPlaying = true, currentTime = 0, timestamp: clientTimestamp } = data;
    
    // Update room state with server timestamp
    roomStates[roomId].currentSong = song;
    const serverTimestamp = updateRoomTime(roomId, currentTime, isPlaying);
    
    // Calculate network latency compensation (optional)
    const networkDelay = clientTimestamp ? (Date.now() - clientTimestamp) / 2 : 0;
    const compensatedTime = currentTime + (networkDelay / 1000);
    
    // Update with compensated time
    updateRoomTime(roomId, compensatedTime, isPlaying);
    
    // Broadcast to all users in the room
    io.to(roomId).emit('song-changed', {
      song,
      isPlaying,
      currentTime: compensatedTime,
      timestamp: roomStates[roomId].lastUpdateTime
    });
    
    console.log(`Song played in room ${roomId}:`, song.title, `at ${compensatedTime}s`);
  });

  // Handle play/pause toggle
  socket.on('toggle-play-pause', (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { isPlaying, currentTime, timestamp: clientTimestamp } = data;
    
    // If we have current time, use it; otherwise calculate synced time
    const timeToUse = currentTime !== undefined ? currentTime : getSyncedTime(roomStates[roomId]);
    
    // Calculate network latency compensation
    const networkDelay = clientTimestamp ? (Date.now() - clientTimestamp) / 2 : 0;
    const compensatedTime = timeToUse + (networkDelay / 1000);
    
    const serverTimestamp = updateRoomTime(roomId, compensatedTime, isPlaying);
    
    // Broadcast to all users in the room
    io.to(roomId).emit('playback-state-changed', {
      isPlaying,
      currentTime: compensatedTime,
      timestamp: serverTimestamp
    });
    
    console.log(`Playback ${isPlaying ? 'resumed' : 'paused'} in room ${roomId} at ${compensatedTime}s`);
  });

  // Handle seek/time sync
  socket.on('sync-time', (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { currentTime, timestamp: clientTimestamp } = data;
    
    // Calculate network latency compensation
    const networkDelay = clientTimestamp ? (Date.now() - clientTimestamp) / 2 : 0;
    const compensatedTime = currentTime + (networkDelay / 1000);
    
    const serverTimestamp = updateRoomTime(roomId, compensatedTime);
    
    // Broadcast to other users in the room (not the sender)
    socket.to(roomId).emit('time-synced', {
      currentTime: compensatedTime,
      timestamp: serverTimestamp,
      isPlaying: roomStates[roomId].isPlaying
    });
    
    console.log(`Time synced in room ${roomId} to ${compensatedTime}s`);
  });

  // Handle time sync requests
  socket.on('request-time-sync', (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { timestamp: clientTimestamp } = data;
    const syncedTime = getSyncedTime(roomStates[roomId]);
    
    // Calculate network latency
    const networkDelay = clientTimestamp ? (Date.now() - clientTimestamp) / 2 : 0;
    
    // Send back current synced time
    socket.emit('time-sync-response', {
      currentTime: syncedTime,
      isPlaying: roomStates[roomId].isPlaying,
      timestamp: Date.now(),
      networkDelay: networkDelay
    });
    
    console.log(`Time sync requested for room ${roomId}, current time: ${syncedTime}s`);
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

  // Handle room activity ping
  socket.on('room-activity', () => {
    const roomId = socketToRoom[socket.id];
    if (roomId) {
      socket.to(roomId).emit('user-activity');
    }
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

  // Periodic time sync broadcast (every 10 seconds for active rooms)
  setInterval(() => {
    Object.keys(roomStates).forEach(roomId => {
      const roomState = roomStates[roomId];
      if (roomState.isPlaying && Object.keys(roomState.participants).length > 1) {
        const syncedTime = getSyncedTime(roomState);
        
        // Update room state
        updateRoomTime(roomId, syncedTime);
        
        // Broadcast to all users in room
        io.to(roomId).emit('time-synced', {
          currentTime: syncedTime,
          timestamp: roomState.lastUpdateTime,
          isPlaying: roomState.isPlaying
        });
        
        console.log(`Auto-sync broadcast for room ${roomId}: ${syncedTime}s`);
      }
    });
  }, 10000); // Every 10 seconds
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

app.get("/", (req, res) => {
  res.send("Socket server is running");
});