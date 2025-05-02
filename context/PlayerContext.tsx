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
  // Initialize state from localStorage if available
  const [currentSong, setCurrentSongState] = useState<Song | null>(null);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const hasInitializedRef = useRef(false);

  // Load saved state from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasInitializedRef.current) {
      try {
        const savedSong = localStorage.getItem('currentSong');
        if (savedSong) {
          const parsedSong = JSON.parse(savedSong);
          setCurrentSongState(parsedSong);

          // Set up audio source if we have audio element and song data
          if (audioRef.current && parsedSong?.url) {
            audioRef.current.src = parsedSong.url;

            // Try to restore playback position if available
            const savedPosition = localStorage.getItem('currentPosition');
            if (savedPosition) {
              const position = parseFloat(savedPosition);
              if (!isNaN(position)) {
                audioRef.current.currentTime = position;
              }
            }
          }
        }

        const savedPlaylist = localStorage.getItem('playlist');
        if (savedPlaylist) {
          setPlaylistState(JSON.parse(savedPlaylist));
        }

        setIsPlaying(false)

        hasInitializedRef.current = true;
      } catch (error) {
        console.error('Error loading saved player state:', error);
      }
    }
  }, []);

  // Save playback position periodically
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const savePosition = () => {
      if (typeof window !== 'undefined' && audioRef.current) {
        localStorage.setItem('currentPosition', audioRef.current.currentTime.toString());
      }
    };

    // Save position every 5 seconds and when component unmounts
    const interval = setInterval(savePosition, 5000);

    return () => {
      clearInterval(interval);
      savePosition(); // Save on unmount too
    };
  }, [currentSong, isPlaying]);

  // Wrapper functions to update both state and localStorage
  const setCurrentSong = (song: Song) => {
    // Check if this is the same song that's currently playing
    if (currentSong && song.id === currentSong.id && audioRef.current) {
      // Reset playback to beginning
      audioRef.current.currentTime = 0;
      
      // If song was paused, start playing it again
      if (!isPlaying) {
        setIsPlaying(true);
      }
      
      // No need to change the currentSong state, just ensure it's stored in localStorage
      localStorage.setItem('currentSong', JSON.stringify(song));
      return;
    }

    // Handle new song selection
    setCurrentSongState(song);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSong', JSON.stringify(song));
      // Reset the saved position when changing songs
      localStorage.removeItem('currentPosition');
    }
  };

  const setIsPlaying = (playing: boolean) => {
    setIsPlayingState(playing);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isPlaying', playing.toString());
    }
  };

  const setPlaylist = (songs: Song[]) => {
    setPlaylistState(songs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('playlist', JSON.stringify(songs));
    }
  };

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

    // Skip if this is just the initial load and URL is already set
    if (audioRef.current.src === currentSong.url) return;

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
  }, [currentSong, isPlaying]);

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