import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import fs from "fs";
import path from "path";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

console.log("Using FFmpeg binary:", ffmpegPath);

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://sonix.rajivdubey.tech/",
    process.env.FRONTEND_URL,
  ].filter(Boolean), // Remove any undefined values
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
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
        name: "userName",
      },
    },
  },
};

// Helper function to delete room from database
const deleteRoomFromDB = async (roomCode) => {
  try {
    const apiUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/api/room/deleteRoom`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomCode }),
    });

    if (!response.ok) {
      console.error(
        `Failed to delete room ${roomCode} from database:`,
        response.statusText
      );
      return false;
    }

    const result = await response.json();
    console.log(
      `Successfully deleted room ${roomCode} from database:`,
      result.message
    );
    return true;
  } catch (error) {
    console.error(`Error deleting room ${roomCode} from database:`, error);
    return false;
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

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle joining a room
  socket.on("join-room", (data) => {
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
        participants: {},
      };
    }

    // Add user to room participants
    roomStates[roomId].participants[socket.id] = {
      id: socket.id,
      name: user?.name || `User ${socket.id.slice(0, 4)}`,
    };

    console.log(`Socket ${socket.id} joined room ${roomId}`);

    // Send current room state to the new user with synced time
    const syncedTime = getSyncedTime(roomStates[roomId]);
    const currentRoomState = {
      ...roomStates[roomId],
      currentTime: syncedTime,
      participants: Object.values(roomStates[roomId].participants),
    };

    socket.emit("room-state", currentRoomState);

    // Notify other users in the room
    socket.to(roomId).emit("user-joined", {
      user: roomStates[roomId].participants[socket.id],
      participantCount: Object.keys(roomStates[roomId].participants).length,
    });

    // Emit updated participant list to all users in room
    io.to(roomId).emit("participants-updated", {
      participants: Object.values(roomStates[roomId].participants),
      count: Object.keys(roomStates[roomId].participants).length,
    });
  });

  // Handle song play/pause
  socket.on("play-song", (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { song } = data; // We don't need other props from client here

    // Update room state: set new song, but as paused at the beginning
    roomStates[roomId].currentSong = song;
    const serverTimestamp = updateRoomTime(roomId, 0, false);

    // Broadcast to all users that a new song is being prepared
    io.to(roomId).emit("song-changed", {
      song,
      isPlaying: false,
      currentTime: 0,
      timestamp: serverTimestamp,
    });

    console.log(`Preparing to play in room ${roomId}: ${song.title}`);

    // Wait for 2 seconds to allow clients to buffer
    setTimeout(() => {
      // Check if room still exists and song hasn't changed
      if (
        !roomStates[roomId] ||
        roomStates[roomId].currentSong?.id !== song.id
      ) {
        console.log(`Playback aborted for ${song.title}, song changed again.`);
        return;
      }

      // Now, update state to playing
      const playTimestamp = updateRoomTime(roomId, 0, true);

      // Broadcast to all clients to start playing
      io.to(roomId).emit("playback-state-changed", {
        isPlaying: true,
        currentTime: 0,
        timestamp: playTimestamp,
      });

      console.log(`Playback started in room ${roomId}: ${song.title}`);
    }, 2000);
  });

  // Handle play/pause toggle
  socket.on("toggle-play-pause", (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { isPlaying, currentTime, timestamp: clientTimestamp } = data;

    // If we have current time, use it; otherwise calculate synced time
    const timeToUse =
      currentTime !== undefined
        ? currentTime
        : getSyncedTime(roomStates[roomId]);

    // Calculate network latency compensation
    const networkDelay = clientTimestamp
      ? (Date.now() - clientTimestamp) / 2
      : 0;
    const compensatedTime = timeToUse + networkDelay / 1000;

    const serverTimestamp = updateRoomTime(roomId, compensatedTime, isPlaying);

    // Broadcast to all users in the room
    io.to(roomId).emit("playback-state-changed", {
      isPlaying,
      currentTime: compensatedTime,
      timestamp: serverTimestamp,
    });

    console.log(
      `Playback ${
        isPlaying ? "resumed" : "paused"
      } in room ${roomId} at ${compensatedTime}s`
    );
  });

  // Handle seek/time sync
  socket.on("sync-time", (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { currentTime, timestamp: clientTimestamp } = data;

    // Calculate network latency compensation
    const networkDelay = clientTimestamp
      ? (Date.now() - clientTimestamp) / 2
      : 0;
    const compensatedTime = currentTime + networkDelay / 1000;

    const serverTimestamp = updateRoomTime(roomId, compensatedTime);

    // Broadcast to other users in the room (not the sender)
    socket.to(roomId).emit("time-synced", {
      currentTime: compensatedTime,
      timestamp: serverTimestamp,
      isPlaying: roomStates[roomId].isPlaying,
    });

    console.log(`Time synced in room ${roomId} to ${compensatedTime}s`);
  });

  // Handle time sync requests
  socket.on("request-time-sync", (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { timestamp: clientTimestamp } = data;
    const syncedTime = getSyncedTime(roomStates[roomId]);

    // Calculate network latency
    const networkDelay = clientTimestamp
      ? (Date.now() - clientTimestamp) / 2
      : 0;

    // Send back current synced time
    socket.emit("time-sync-response", {
      currentTime: syncedTime,
      isPlaying: roomStates[roomId].isPlaying,
      timestamp: Date.now(),
      networkDelay: networkDelay,
    });

    console.log(
      `Time sync requested for room ${roomId}, current time: ${syncedTime}s`
    );
  });

  // Handle chat messages
  socket.on("send-message", (data) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId || !roomStates[roomId]) return;

    const { message } = data;
    const user = roomStates[roomId].participants[socket.id];

    const messageData = {
      id: Date.now().toString(),
      user: user,
      message: message,
      timestamp: new Date().toISOString(),
    };

    // Broadcast message to all users in the room
    io.to(roomId).emit("new-message", messageData);

    console.log(`Message sent in room ${roomId} by ${user.name}: ${message}`);
  });

  // Handle room activity ping
  socket.on("room-activity", () => {
    const roomId = socketToRoom[socket.id];
    if (roomId) {
      socket.to(roomId).emit("user-activity");
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const roomId = socketToRoom[socket.id];

    if (roomId && roomStates[roomId]) {
      // Remove user from room participants
      const user = roomStates[roomId].participants[socket.id];
      delete roomStates[roomId].participants[socket.id];

      console.log(`Socket ${socket.id} disconnected from room ${roomId}`);

      // Notify other users in the room
      socket.to(roomId).emit("user-left", {
        user: user,
        participantCount: Object.keys(roomStates[roomId].participants).length,
      });

      // Emit updated participant list
      io.to(roomId).emit("participants-updated", {
        participants: Object.values(roomStates[roomId].participants),
        count: Object.keys(roomStates[roomId].participants).length,
      });

      // Clean up room if empty and delete from database
      if (Object.keys(roomStates[roomId].participants).length === 0) {
        console.log(
          `Room ${roomId} is now empty, cleaning up and deleting from database...`
        );

        // Delete from database
        deleteRoomFromDB(roomId).then((success) => {
          if (success) {
            console.log(`Room ${roomId} successfully deleted from database`);
          } else {
            console.log(
              `Failed to delete room ${roomId} from database, but local state cleaned up`
            );
          }
        });

        // Clean up local state
        delete roomStates[roomId];
        console.log(`Room ${roomId} cleaned up - no participants left`);
      }

      delete socketToRoom[socket.id];
    } else {
      console.log("User disconnected:", socket.id);
    }
  });

  // Periodic time sync broadcast (every 3 seconds for active rooms)
  setInterval(() => {
    Object.keys(roomStates).forEach((roomId) => {
      const roomState = roomStates[roomId];
      if (
        roomState.isPlaying &&
        Object.keys(roomState.participants).length > 1
      ) {
        const syncedTime = getSyncedTime(roomState);

        // Update room state
        updateRoomTime(roomId, syncedTime);

        // Broadcast to all users in room
        io.to(roomId).emit("time-synced", {
          currentTime: syncedTime,
          timestamp: roomState.lastUpdateTime,
          isPlaying: roomState.isPlaying,
        });

        console.log(`Auto-sync broadcast for room ${roomId}: ${syncedTime}s`);
      }
    });
  }, 3000); // Every 3 seconds
});

app.post("/api/download", async (req, res) => {
  try {
    const {
      songUrl,
      title,
      artist,
      album,
      albumArtist,
      year,
      language,
      label,
      composer,
      lyricist,
      copyright,
      coverUrl,
    } = req.body;

    if (!songUrl || !title || !artist) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tmpDir = "/tmp";
    const safeName = title.replace(/[^\w\s-]/g, "").trim();

    const inputAudio = path.join(tmpDir, `${Date.now()}_input.m4a`);
    const coverPath = path.join(tmpDir, `${Date.now()}_cover.jpg`);
    const metadataPath = path.join(tmpDir, `${Date.now()}_meta.txt`);
    const outputAudio = path.join(tmpDir, `${safeName}.m4a`);

    /* 1️⃣ Download audio */
    const audioRes = await axios.get(songUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(inputAudio, audioRes.data);

    /* 2️⃣ Download cover image */
    if (coverUrl) {
      const coverRes = await axios.get(coverUrl, {
        responseType: "arraybuffer",
      });
      fs.writeFileSync(coverPath, coverRes.data);
    }

    /* 3️⃣ Create FFmetadata file (KEY FIX) */
    const ffmetadata = `
;FFMETADATA1
title=${title}
artist=${artist}
album=${album}
album_artist=${albumArtist}
date=${year}
composer=${composer}
lyricist=${lyricist}
language=${language}
publisher=${label}
copyright=${copyright}
`.trim();

    fs.writeFileSync(metadataPath, ffmetadata);

    /* 4️⃣ Run FFmpeg with metadata file */
    await new Promise((resolve, reject) => {
      const command = ffmpeg()
        .input(inputAudio)
        .input(metadataPath)
        .inputOptions(["-f ffmetadata"]);

      if (coverUrl) {
        command.input(coverPath);
      }

      command
        .outputOptions([
          "-map", "0:a",
          "-map_metadata", "1",
          ...(coverUrl
            ? ["-map", "2:v", "-disposition:v", "attached_pic"]
            : []),
          "-c", "copy",
        ])
        .save(outputAudio)
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    /* 5️⃣ Send file to client */
    res.setHeader("Content-Type", "audio/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}.m4a"`
    );

    const stream = fs.createReadStream(outputAudio);
    stream.pipe(res);

    /* 6️⃣ Cleanup after response */
    stream.on("close", () => {
      fs.unlinkSync(inputAudio);
      if (coverUrl) fs.unlinkSync(coverPath);
      fs.unlinkSync(metadataPath);
      fs.unlinkSync(outputAudio);
    });
  } catch (error) {
    console.error("Download with metadata failed:", error);
    res.status(500).json({ error: "Failed to generate file" });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
  console.log(
    `CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
  console.log(
    "Additional allowed origins: http://localhost:3000, https://localhost:3000"
  );
});

app.get("/", (req, res) => {
  res.send("Socket server is running");
});

// Test endpoint to verify CORS
app.get("/api/test", (req, res) => {
  res.json({
    message: "CORS is working!",
    origin: req.get("Origin"),
    timestamp: new Date().toISOString(),
  });
});
