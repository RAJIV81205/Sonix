"use client"

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

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
}

export const useSocket = (serverUrl: string = 'http://localhost:3001'): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    participants: []
  });
  const [messages, setMessages] = useState<Message[]>([]);

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
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Room state handlers
    socket.on('room-state', (state: RoomState) => {
      console.log('Received room state:', state);
      setRoomState(state);
    });

    socket.on('song-changed', (data: { song: Song; isPlaying: boolean; currentTime: number; timestamp: number }) => {
      console.log('Song changed:', data.song.title);
      setRoomState(prev => ({
        ...prev,
        currentSong: data.song,
        isPlaying: data.isPlaying,
        currentTime: data.currentTime
      }));
    });

    socket.on('playback-state-changed', (data: { isPlaying: boolean; currentTime: number; timestamp: number }) => {
      console.log('Playback state changed:', data.isPlaying ? 'playing' : 'paused');
      setRoomState(prev => ({
        ...prev,
        isPlaying: data.isPlaying,
        currentTime: data.currentTime
      }));
    });

    socket.on('time-synced', (data: { currentTime: number; timestamp: number }) => {
      setRoomState(prev => ({
        ...prev,
        currentTime: data.currentTime
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
    });

    // Chat handlers
    socket.on('new-message', (message: Message) => {
      console.log('New message:', message);
      setMessages(prev => [...prev, message]);
    });

    // Activity handlers
    socket.on('user-activity', () => {
      console.log('User activity detected');
      // You can trigger any UI updates here
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('room-state');
      socket.off('song-changed');
      socket.off('playback-state-changed');
      socket.off('time-synced');
      socket.off('participants-updated');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('new-message');
      socket.off('user-activity');
      socket.disconnect();
    };
  }, [serverUrl]);

  const joinRoom = useCallback((roomId: string, user?: User) => {
    if (!socketRef.current) return;
    
    console.log('Joining room:', roomId);
    socketRef.current.emit('join-room', {
      roomId,
      user: user || { id: socketRef.current.id, name: `User ${Date.now()}` }
    });
  }, []);

  const playSong = useCallback((song: Song, currentTime: number = 0) => {
    if (!socketRef.current) return;
    
    console.log('Playing song:', song.title);
    socketRef.current.emit('play-song', {
      song,
      isPlaying: true,
      currentTime
    });
  }, []);

  const togglePlayPause = useCallback((isPlaying: boolean, currentTime: number = 0) => {
    if (!socketRef.current) return;
    
    console.log('Toggle play/pause:', isPlaying);
    socketRef.current.emit('toggle-play-pause', {
      isPlaying,
      currentTime
    });
  }, []);

  const syncTime = useCallback((currentTime: number) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('sync-time', { currentTime });
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || !message.trim()) return;
    
    console.log('Sending message:', message);
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
    disconnect
  };
};