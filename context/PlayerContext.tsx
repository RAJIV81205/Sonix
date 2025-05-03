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
  playlist: Song[];
  currentSongIndex: number;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaylist: (songs: Song[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [currentSong, setCurrentSongState] = useState<Song | null>(null);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
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
          const parsedPlaylist = JSON.parse(savedPlaylist);
          setPlaylistState(parsedPlaylist);
          
          // Restore current song index if available
          const savedIndex = localStorage.getItem('currentSongIndex');
          if (savedIndex) {
            setCurrentSongIndex(parseInt(savedIndex, 10));
          }
        }

        setIsPlaying(false)

        hasInitializedRef.current = true;
      } catch (error) {
        console.error('Error loading saved player state:', error);
      }
    }
  }, []);

  // Auto-play next song when current one ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playlist, currentSongIndex]); // eslint-disable-line react-hooks/exhaustive-deps

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

    document.title = `${currentSong.name} - ${currentSong.artist}`; 

    return () => {
      clearInterval(interval);
      savePosition(); // Save on unmount too
    };
  }, [currentSong, isPlaying]);

  // Play next song from playlist
  const playNext = () => {
    if (playlist.length === 0) return;
    
    if (currentSongIndex < playlist.length - 1) {
      // Play next song in playlist
      const nextIndex = currentSongIndex + 1;
      const nextSong = playlist[nextIndex];
      
      setCurrentSongIndex(nextIndex);
      setCurrentSongState(nextSong);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentSong', JSON.stringify(nextSong));
        localStorage.setItem('currentSongIndex', nextIndex.toString());
        localStorage.removeItem('currentPosition');
      }
      
      // Ensure we're playing
      setIsPlaying(true);
    } else if (playlist.length > 0) {
      // Loop back to first song
      const nextSong = playlist[0];
      
      setCurrentSongIndex(0);
      setCurrentSongState(nextSong);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentSong', JSON.stringify(nextSong));
        localStorage.setItem('currentSongIndex', '0');
        localStorage.removeItem('currentPosition');
      }
      
      // Ensure we're playing
      setIsPlaying(true);
    }
  };

  // Play previous song from playlist
  const playPrevious = () => {
    if (playlist.length === 0) return;
    
    // If we're more than 3 seconds into a song, restart it instead of going to previous
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    if (currentSongIndex > 0) {
      // Play previous song in playlist
      const prevIndex = currentSongIndex - 1;
      const prevSong = playlist[prevIndex];
      
      setCurrentSongIndex(prevIndex);
      setCurrentSongState(prevSong);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentSong', JSON.stringify(prevSong));
        localStorage.setItem('currentSongIndex', prevIndex.toString());
        localStorage.removeItem('currentPosition');
      }
      
      // Ensure we're playing
      setIsPlaying(true);
    } else if (playlist.length > 0) {
      // Loop back to last song
      const lastIndex = playlist.length - 1;
      const lastSong = playlist[lastIndex];
      
      setCurrentSongIndex(lastIndex);
      setCurrentSongState(lastSong);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentSong', JSON.stringify(lastSong));
        localStorage.setItem('currentSongIndex', lastIndex.toString());
        localStorage.removeItem('currentPosition');
      }
      
      // Ensure we're playing
      setIsPlaying(true);
    }
  };

  // Wrapper functions to update both state and localStorage
  const setCurrentSong = (song: Song) => {
    // Find song in playlist to get the index
    const songIndex = playlist.findIndex(s => s.id === song.id);
    
    // If song exists in playlist, update the current index
    if (songIndex >= 0) {
      setCurrentSongIndex(songIndex);
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentSongIndex', songIndex.toString());
      }
    }
    
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

  const setPlaylist = (songs: Song[], startIndex: number = 0) => {
    setPlaylistState(songs);
    
    // Set current song index if valid
    if (startIndex >= 0 && startIndex < songs.length) {
      setCurrentSongIndex(startIndex);
    } else if (songs.length > 0) {
      setCurrentSongIndex(0);
    } else {
      setCurrentSongIndex(-1);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('playlist', JSON.stringify(songs));
      localStorage.setItem('currentSongIndex', currentSongIndex.toString());
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
    <PlayerContext.Provider value={{ 
      currentSong, 
      isPlaying, 
      playlist, 
      currentSongIndex,
      setCurrentSong, 
      setIsPlaying, 
      setPlaylist, 
      playNext, 
      playPrevious, 
      audioRef 
    }}>
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