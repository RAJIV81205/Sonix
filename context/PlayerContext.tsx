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
  queue: Song[];
  currentSongIndex: number;
  currentQueueIndex: number;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaylist: (songs: Song[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  playNextInQueue: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [currentSong, setCurrentSongState] = useState<Song | null>(null);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(-1);
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

        const savedQueue = localStorage.getItem('queue');
        if (savedQueue) {
          setQueue(JSON.parse(savedQueue));
        }

        setIsPlaying(false)

        hasInitializedRef.current = true;
      } catch (error) {
        console.error('Error loading saved player state:', error);
      }
    }
  }, []);

  useEffect(() => {
    const changeFavicon = (url: string) => {
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = url;
      document.getElementsByTagName('head')[0].appendChild(link);
    };

    try {
      changeFavicon('/my-icon.png'); // Path to your custom icon
    } catch (error) {
      console.error('Failed to change favicon:', error);
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

    document.title = `${currentSong.name.replaceAll("&quot;", `"`)} - ${currentSong.artist}`; 

    return () => {
      clearInterval(interval);
      savePosition(); // Save on unmount too
    };
  }, [currentSong, isPlaying]);

  // Setup Media Session API for notification controls
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    
    // Set up media session handlers
    navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    
    // Clean up
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, []);  // Empty dependency array ensures this runs once

  // Update media session metadata when current song changes
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentSong) return;
    
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.name.replaceAll("&quot;", `"`),
        artist: currentSong.artist,
        album: '',  // Could be added to Song interface if needed
        artwork: [
          { src: currentSong.image, sizes: '96x96', type: 'image/png' },
          { src: currentSong.image, sizes: '128x128', type: 'image/png' },
          { src: currentSong.image, sizes: '192x192', type: 'image/png' },
          { src: currentSong.image, sizes: '256x256', type: 'image/png' },
          { src: currentSong.image, sizes: '384x384', type: 'image/png' },
          { src: currentSong.image, sizes: '512x512', type: 'image/png' }
        ]
      });
      
      // Update playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (error) {
      console.error('Error setting media session metadata:', error);
    }
    
  }, [currentSong, isPlaying]);

  // Update media session playback state when playing state changes
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    
    try {
      // TypeScript may not recognize this property on some definitions
      (navigator.mediaSession as any).playbackState = isPlaying ? 'playing' : 'paused';
    } catch (error) {
      console.warn('Error updating media session playback state:', error);
    }
  }, [isPlaying]);

  // Play next song from playlist or queue
  const playNext = () => {
    if (playlist.length === 0 && queue.length === 0) return;
    
    // If there are songs in queue, play the next one
    if (queue.length > 0) {
      const nextQueueIndex = currentQueueIndex + 1;
      if (nextQueueIndex < queue.length) {
        const nextSong = queue[nextQueueIndex];
        setCurrentQueueIndex(nextQueueIndex);
        setCurrentSongState(nextSong);
        setCurrentSongIndex(-1); // Reset playlist index since we're playing from queue
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentSong', JSON.stringify(nextSong));
          localStorage.setItem('currentQueueIndex', nextQueueIndex.toString());
          localStorage.removeItem('currentPosition');
        }
        
        setIsPlaying(true);
        return;
      }
    }
    
    // If no queue or at end of queue, stop playing
    setIsPlaying(false);
  };

  // Play previous song from playlist or queue
  const playPrevious = () => {
    if (playlist.length === 0 && queue.length === 0) return;
    
    // If we're more than 3 seconds into a song, restart it instead of going to previous
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    // If there are songs in queue, play the previous one
    if (queue.length > 0 && currentQueueIndex > 0) {
      const prevQueueIndex = currentQueueIndex - 1;
      const previousSong = queue[prevQueueIndex];
      
      setCurrentQueueIndex(prevQueueIndex);
      setCurrentSongState(previousSong);
      setCurrentSongIndex(-1); // Reset playlist index since we're playing from queue
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentSong', JSON.stringify(previousSong));
        localStorage.setItem('currentQueueIndex', prevQueueIndex.toString());
        localStorage.removeItem('currentPosition');
      }
      
      setIsPlaying(true);
      return;
    }
    
    // If no queue or at start of queue, stop playing
    setIsPlaying(false);
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
    setCurrentQueueIndex(-1); // Reset queue index when manually selecting a song
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSong', JSON.stringify(song));
      localStorage.setItem('currentQueueIndex', '-1');
      // Reset the saved position when changing songs
      localStorage.removeItem('currentPosition');
    }
  };

  const setIsPlaying = (playing: boolean) => {
    setIsPlayingState(playing);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isPlaying', playing.toString());
      
      // Update media session playback state
      if ('mediaSession' in navigator) {
        try {
          // TypeScript may not recognize this property on some definitions
          (navigator.mediaSession as any).playbackState = playing ? 'playing' : 'paused';
        } catch (error) {
          console.warn('Error updating media session playback state:', error);
        }
      }
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

  // Add position state handling for more accurate media controls
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !audioRef.current) return;
    
    // Update position state periodically
    const updatePositionState = () => {
      if (audioRef.current && navigator.mediaSession && 'setPositionState' in navigator.mediaSession) {
        try {
          // Use type assertion to handle the TypeScript definition issue
          (navigator.mediaSession as any).setPositionState({
            duration: audioRef.current.duration || 0,
            playbackRate: audioRef.current.playbackRate,
            position: audioRef.current.currentTime
          });
        } catch (e) {
          console.warn('Error updating media session position state:', e);
        }
      }
    };
    
    const timeUpdateHandler = () => {
      if (isPlaying) {
        updatePositionState();
      }
    };
    
    audioRef.current.addEventListener('timeupdate', timeUpdateHandler);
    audioRef.current.addEventListener('durationchange', updatePositionState);
    
    return () => {
      audioRef.current?.removeEventListener('timeupdate', timeUpdateHandler);
      audioRef.current?.removeEventListener('durationchange', updatePositionState);
    };
  }, [isPlaying]);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('queue', JSON.stringify(queue));
    }
  }, [queue]);

  // Add to queue function
  const addToQueue = (song: Song) => {
    setQueue(prevQueue => [...prevQueue, song]);
  };

  // Insert a song to play next (at the front of the queue)
  const playNextInQueue = (song: Song) => {
    setQueue(prevQueue => {
      // Remove if already in queue
      const filteredQueue = prevQueue.filter(s => s.id !== song.id);
      return [song, ...filteredQueue];
    });
  };

  // Remove from queue function
  const removeFromQueue = (songId: string) => {
    setQueue(prevQueue => {
      const newQueue = prevQueue.filter(song => song.id !== songId);
      // If we removed the current song, adjust the queue index
      if (currentQueueIndex >= newQueue.length) {
        setCurrentQueueIndex(Math.max(0, newQueue.length - 1));
      }
      return newQueue;
    });
  };

  // Clear queue function
  const clearQueue = () => {
    setQueue([]);
    setCurrentQueueIndex(-1);
    setIsPlaying(false); // Stop playback when queue is cleared
  };

  return (
    <PlayerContext.Provider value={{ 
      currentSong, 
      isPlaying, 
      playlist, 
      queue,
      currentSongIndex,
      currentQueueIndex,
      setCurrentSong, 
      setIsPlaying, 
      setPlaylist, 
      playNext, 
      playPrevious, 
      audioRef,
      addToQueue,
      removeFromQueue,
      clearQueue,
      playNextInQueue
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