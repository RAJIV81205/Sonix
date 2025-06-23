"use client"

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
}

interface Song {
  id: number | string;
  title: string;
  artist: string;
  duration: string;
  album: string;
  thumbnail?: string;
  url?: string;
}

interface Message {
  id: string;
  user: User;
  message: string;
  timestamp: string;
}

interface RoomState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  participants: User[];
  lastUpdateTime: number; // Server timestamp when last updated
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  roomState: RoomState;
  messages: Message[];
  joinRoom: (roomId: string, user?: User) => void;
  playSong: (song: Song, currentTime?: number) => void;
  togglePlayPause: (isPlaying: boolean, currentTime?: number) => void;
  syncTime: (currentTime: number) => void;
  sendMessage: (message: string) => void;
  disconnect: () => void;
  requestTimeSync: () => void;
}

export const useSocket = (serverUrl: any = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    participants: [],
    lastUpdateTime: 0
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate synced time based on server timestamp and elapsed time
  const calculateSyncedTime = useCallback((serverTime: number, serverTimestamp: number, isPlaying: boolean) => {
    if (!isPlaying) return serverTime;

    const now = Date.now();
    const elapsed = (now - serverTimestamp) / 1000; // Convert to seconds
    return serverTime + elapsed;
  }, []);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to socket server:', socket.id);
      toast.success('Connected to the server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
      // Clear sync interval on disconnect
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to the server. Please try again later.');
      setIsConnected(false);
    });

    // Room state handlers
    socket.on('room-state', (state: RoomState) => {
      console.log('Received room state:', state);
      const syncedTime = calculateSyncedTime(state.currentTime, state.lastUpdateTime, state.isPlaying);
      setRoomState({
        ...state,
        currentTime: syncedTime
      });
    });

    socket.on('song-changed', (data: { song: Song; isPlaying: boolean; currentTime: number; timestamp: number }) => {
      console.log('Song changed:', data.song.title);
      const syncedTime = calculateSyncedTime(data.currentTime, data.timestamp, data.isPlaying);
      setRoomState(prev => ({
        ...prev,
        currentSong: data.song,
        isPlaying: data.isPlaying,
        currentTime: syncedTime,
        lastUpdateTime: data.timestamp
      }));
    });

    socket.on('playback-state-changed', (data: { isPlaying: boolean; currentTime: number; timestamp: number }) => {
      console.log('Playback state changed:', data.isPlaying ? 'playing' : 'paused');
      const syncedTime = calculateSyncedTime(data.currentTime, data.timestamp, data.isPlaying);
      setRoomState(prev => ({
        ...prev,
        isPlaying: data.isPlaying,
        currentTime: syncedTime,
        lastUpdateTime: data.timestamp
      }));
    });

    socket.on('time-synced', (data: { currentTime: number; timestamp: number; isPlaying: boolean }) => {
      const syncedTime = calculateSyncedTime(data.currentTime, data.timestamp, data.isPlaying);
      setRoomState(prev => ({
        ...prev,
        currentTime: syncedTime,
        lastUpdateTime: data.timestamp
      }));
    });

    // Time sync response handler
    socket.on('time-sync-response', (data: { currentTime: number; isPlaying: boolean; timestamp: number }) => {
      const syncedTime = calculateSyncedTime(data.currentTime, data.timestamp, data.isPlaying);
      setRoomState(prev => ({
        ...prev,
        currentTime: syncedTime,
        isPlaying: data.isPlaying,
        lastUpdateTime: data.timestamp
      }));
    });

    // Participant handlers
    socket.on('participants-updated', (data: { participants: User[]; count: number }) => {
      console.log('Participants updated:', data.participants);
      setRoomState(prev => ({
        ...prev,
        participants: data.participants
      }));
    });

    socket.on('user-joined', (data: { user: User; participantCount: number }) => {
      console.log('User joined:', data.user.name);
    });

    socket.on('user-left', (data: { user: User; participantCount: number }) => {
      console.log('User left:', data.user?.name || 'Unknown user');
      toast.error(`${data.user?.name || 'A user'} has left the room`);
    });

    // Chat handlers
    socket.on('new-message', (message: Message) => {
      console.log('New message:', message);
      setMessages(prev => [...prev, message]);
    });

    // Activity handlers
    socket.on('user-activity', () => {
      console.log('User activity detected');
    });

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('room-state');
      socket.off('song-changed');
      socket.off('playback-state-changed');
      socket.off('time-synced');
      socket.off('time-sync-response');
      socket.off('participants-updated');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('new-message');
      socket.off('user-activity');
      socket.disconnect();
    };
  }, [serverUrl, calculateSyncedTime]);

  // Start periodic time sync when playing
  /* This is now handled by server-side broadcasts
  useEffect(() => {
    if (roomState.isPlaying && isConnected) {
      // Request time sync every 5 seconds when playing
      syncIntervalRef.current = setInterval(() => {
        requestTimeSync();
      }, 5000);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [roomState.isPlaying, isConnected]);
  */

  const joinRoom = useCallback((roomId: string, user?: User) => {
    if (!socketRef.current) return;

    console.log('Joining room:', roomId);
    toast.loading(`Joining room... ` + roomId );
    socketRef.current.emit('join-room', {
      roomId,
      user: user || { id: socketRef.current.id, name: `User ${Date.now()}` }
    });
  }, []);

  const playSong = useCallback((song: Song, currentTime: number = 0) => {
    if (!socketRef.current) return;

    console.log('Playing song:', song.title);
    toast.success(`Now playing: ${song.title}`);
    socketRef.current.emit('play-song', {
      song,
      isPlaying: true,
      currentTime,
      timestamp: Date.now() // Client timestamp
    });
  }, []);

  const togglePlayPause = useCallback((isPlaying: boolean, currentTime: number = 0) => {
    if (!socketRef.current) return;

    console.log('Toggle play/pause:', isPlaying);
    toast(isPlaying ? 'Playing' : 'Paused', {
      duration: 2000,
      icon: isPlaying ? '▶️' : '⏸️',
    });
    socketRef.current.emit('toggle-play-pause', {
      isPlaying,
      currentTime,
      timestamp: Date.now() // Client timestamp
    });
  }, []);

  const syncTime = useCallback((currentTime: number) => {
    if (!socketRef.current) return;

    socketRef.current.emit('sync-time', {
      currentTime,
      timestamp: Date.now() // Client timestamp
    });
  }, []);

  const requestTimeSync = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('request-time-sync', {
      timestamp: Date.now()
    });
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || !message.trim()) return;

    socketRef.current.emit('send-message', { message });
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    roomState,
    messages,
    joinRoom,
    playSong,
    togglePlayPause,
    syncTime,
    sendMessage,
    disconnect,
    requestTimeSync
  };
};