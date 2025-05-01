"use client";

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

interface Song {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaylist: (songs: Song[]) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Handle play/pause when isPlaying changes
  useEffect(() => {
    if (!audioRef.current || !currentSong || isLoading) return;

    if (isPlaying) {
      // Abort any existing play promise first
      if (playPromiseRef.current) {
        // We can't actually abort the promise, but we can track it
        playPromiseRef.current = null;
      }
      
      // Start a new play request
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromiseRef.current = playPromise;
        
        playPromise
          .then(() => {
            playPromiseRef.current = null;
          })
          .catch(error => {
            // Only handle errors if this is still the active play request
            if (playPromiseRef.current === playPromise) {
              playPromiseRef.current = null;
              
              // Ignore AbortError as it's expected when changing tracks quickly
              if (error.name !== 'AbortError') {
                console.error('Error playing audio:', error);
                setIsPlaying(false);
              }
            }
          });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, isLoading]);

  // Handle song changes
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    
    // Stop any current playback and mark as loading
    if (audioRef.current.played.length > 0) {
      audioRef.current.pause();
    }
    setIsLoading(true);
    
    // Set the new audio source
    audioRef.current.src = currentSong.url;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      
      // Only auto-play if isPlaying was true
      if (isPlaying && audioRef.current) {
        const newPlayPromise = audioRef.current.play();
        if (newPlayPromise) {
          playPromiseRef.current = newPlayPromise;
          newPlayPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Error playing audio after load:', error);
              setIsPlaying(false);
            }
          });
        }
      }
    };
    
    // Clean up existing listeners
    audioRef.current.removeEventListener('canplay', handleCanPlay);
    
    // Add the new listener and load
    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.load();
    
    return () => {
      audioRef.current?.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentSong]);

  return (
    <PlayerContext.Provider value={{ currentSong, isPlaying, setCurrentSong, setIsPlaying, setPlaylist, audioRef }}>
      {children}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}