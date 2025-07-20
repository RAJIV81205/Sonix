"use client"

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  ChevronUp,
  Heart,
  Plus,
  Music,
  X,
  Loader2,
  List,
  Trash2,
  Timer,
  Clock
} from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import { usePlayer } from "@/context/PlayerContext"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Playlist {
  id: string;
  name: string;
  songCount?: number;
  cover:string;
}

const MobilePlayer = () => {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    audioRef,
    playNext,
    playPrevious,
    playlist,
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setCurrentSong,
    currentQueueIndex
  } = usePlayer()
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [showSleepTimer, setShowSleepTimer] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)
  const [sleepTimer, setSleepTimer] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const queueRef = useRef<HTMLDivElement>(null)
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Sleep timer options in minutes
  const timerOptions = [
    { label: "5 min", value: 5 },
    { label: "10 min", value: 10 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "60 min", value: 60 }
  ]

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Format remaining timer time
  const formatTimerTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = time % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (isExpanded || showQueue || showPlaylistModal || showSleepTimer) {
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.height = '100%'
      
      // For iOS Safari
      document.documentElement.style.overflow = 'hidden'
      
      // Prevent touch events on the body from scrolling
      const preventScroll = (e: TouchEvent) => {
        if (e.target !== e.currentTarget) return
        e.preventDefault()
      }
      
      document.body.addEventListener('touchmove', preventScroll, { passive: false })
      
      return () => {
        document.body.removeEventListener('touchmove', preventScroll)
      }
    } else {
      // Restore scrolling
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
      document.documentElement.style.overflow = ''
    }
  }, [isExpanded, showQueue, showPlaylistModal, showSleepTimer])

  useEffect(() => {
    const handlePopState = () => {
      if (showSleepTimer) {
        setShowSleepTimer(false);
      } else if (showPlaylistModal) {
        setShowPlaylistModal(false);
      } else if (showQueue) {
        setShowQueue(false);
      } else if (isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showSleepTimer, showPlaylistModal, showQueue, isExpanded]);

  // Add history state when expanding player
  useEffect(() => {
    if (isExpanded) {
      window.history.pushState({ playerModal: "expanded" }, "");
    }
  }, [isExpanded]);

  // Add history state when showing queue
  useEffect(() => {
    if (showQueue) {
      window.history.pushState({ playerModal: "queue" }, "");
    }
  }, [showQueue]);

  // Add history state when showing playlist modal
  useEffect(() => {
    if (showPlaylistModal) {
      window.history.pushState({ playerModal: "playlist" }, "");
    }
  }, [showPlaylistModal]);

  // Add history state when showing sleep timer
  useEffect(() => {
    if (showSleepTimer) {
      window.history.pushState({ playerModal: "sleepTimer" }, "");
    }
  }, [showSleepTimer]);

  // Handle time updates
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
      }
      setDuration(audio.duration || 0)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateTime)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateTime)
    }
  }, [audioRef, isDragging])

  // Apply volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume, audioRef])

  // Sleep timer countdown effect
  useEffect(() => {
    if (remainingTime !== null && remainingTime > 0) {
      countdownRef.current = setTimeout(() => {
        setRemainingTime(prev => prev ? prev - 1 : null)
      }, 1000)
    } else if (remainingTime === 0) {
      // Timer finished - stop music
      setIsPlaying(false)
      setSleepTimer(null)
      setRemainingTime(null)
      toast.success("Sleep timer finished - music stopped")
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current)
      }
    }
  }, [remainingTime, setIsPlaying])

  // Set sleep timer
  const setSleepTimerMinutes = (minutes: number) => {
    const seconds = minutes * 60
    setSleepTimer(minutes)
    setRemainingTime(seconds)
    setShowSleepTimer(false)
    toast.success(`Sleep timer set for ${minutes} minutes`)
  }

  // Cancel sleep timer
  const cancelSleepTimer = () => {
    setSleepTimer(null)
    setRemainingTime(null)
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
    }
    if (countdownRef.current) {
      clearTimeout(countdownRef.current)
    }
    toast.success("Sleep timer cancelled")
  }

  // Handle seeking in the timeline
  const handleSeek = (e: React.TouchEvent | React.MouseEvent) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return;

    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();

    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const offsetX = clientX - rect.left;
    const newPosition = Math.max(0, Math.min((offsetX / rect.width) * duration, duration));

    setCurrentTime(newPosition);
    audioRef.current.currentTime = newPosition;
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSeek(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleSeek(e);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleSeek(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Fetch playlists when modal opens
  const fetchPlaylists = async () => {
    if (!showPlaylistModal) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoadingPlaylists(true);
      const response = await fetch('/api/dashboard/getUserPlaylists', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast.error("Couldn't load your playlists");
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  useEffect(() => {
    if (showPlaylistModal) {
      fetchPlaylists();
    }
  }, [showPlaylistModal]);

  // Add global event listeners for mouse/touch events
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchend', handleGlobalUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging]);

  // Add song to playlist
  const addSongToPlaylist = async (playlistId: string) => {
    if (!currentSong) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setAddingToPlaylist(playlistId);

      const response = await fetch('/api/dashboard/addToPlaylist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playlistId,
          song: currentSong,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add song to playlist');
      }

      const data = await response.json();

      if (data.alreadyExists) {
        toast.error(`"${currentSong.name.replaceAll("&quot;", `"`)}" is already in this playlist`);
      } else {
        toast.success(`Added "${currentSong.name.replaceAll("&quot;", `"`)}" to playlist`);
      }

      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add song to playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const progress = duration ? (currentTime / duration) * 100 : 0

  const getPlaylistColor = (index: number) => {
    const colors = [
      "from-teal-500 to-emerald-500",
      "from-amber-500 to-orange-500",
      "from-blue-500 to-indigo-500",
      "from-pink-500 to-rose-500",
      "from-emerald-500 to-cyan-500"
    ];
    return colors[index % colors.length];
  };

  // Handle click outside queue panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (queueRef.current && !queueRef.current.contains(event.target as Node)) {
        setShowQueue(false)
      }
    }

    if (showQueue) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showQueue])

  // Prevent propagation of click events
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <AnimatePresence>
        {/* Collapsed Player */}
        {!isExpanded && (
          <motion.div
            className="bg-gradient-to-r from-zinc-900 to-black border-t border-zinc-800 shadow-lg"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="h-1 w-full bg-zinc-800"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                style={{ width: `${progress}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              />
            </motion.div>
            <div
              className="flex items-center justify-between p-3 pr-4"
              onClick={() => setIsExpanded(true)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  className={`w-12 h-12 rounded-md overflow-hidden flex-shrink-0 ${isPlaying ? 'shadow-glow' : ''}`}
                  animate={isPlaying ? { scale: [1, 1.02, 1], opacity: [0.9, 1, 0.9] } : {}}
                  transition={isPlaying ? {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  } : {}}
                >
                  {currentSong?.image && (
                    <img
                      src={currentSong.image.replace("150x150", "500x500").replace("http:", "https:")}
                      alt={currentSong.name.replaceAll("&quot;", `"`)}
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <motion.h3
                    className="font-medium text-sm truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentSong?.name?.replaceAll("&quot;", `"`) || "No song playing"}
                  </motion.h3>
                  <motion.p
                    className="text-xs text-zinc-400 truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentSong?.artist || "Select a song"}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden hidden sm:block"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 48 }}
                  transition={{ delay: 0.4 }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </motion.div>
                <motion.button
                  onClick={handlePlayClick}
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full p-2.5 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentSong}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expanded Player */}
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black flex flex-col overflow-hidden touch-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            onTouchMove={(e) => e.preventDefault()} // Prevent scrolling
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-5 border-b border-zinc-800/50 sticky top-0 bg-gradient-to-b from-zinc-900 to-zinc-900/95 backdrop-blur-sm z-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => setIsExpanded(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronUp className="w-6 h-6 rotate-180" />
              </button>
              <h2 className="text-lg font-medium bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text">
                Now Playing
              </h2>
              <button
                onClick={() => setShowQueue(!showQueue)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <List className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex flex-col justify-between">
              {/* Album Art */}
              <div className="flex items-center justify-center p-4 sm:p-8 my-auto">
                <motion.div
                  className="w-full aspect-square max-w-md bg-zinc-900 rounded-xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    boxShadow: isPlaying ?
                      "0 0 30px rgba(139, 92, 246, 0.3)" :
                      "0 0 20px rgba(0, 0, 0, 0.7)"
                  }}
                  transition={{
                    delay: 0.3,
                    boxShadow: {
                      repeat: isPlaying ? Infinity : 0,
                      repeatType: "reverse",
                      duration: 2
                    }
                  }}
                >
                  {currentSong?.image && (
                    <img
                      src={currentSong.image.replace("150x150", "500x500").replace("http:", "https:")}
                      alt={currentSong.name?.replaceAll("&quot;", `"`)}
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              </div>

              {/* Song Info and Controls */}
              <motion.div
                className="px-4 sm:px-8 pb-4 sm:pb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.h3
                  className="text-xl font-medium text-center mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentSong?.name?.replaceAll("&quot;", `"`) || "No song playing"}
                </motion.h3>
                <motion.p
                  className="text-zinc-400 text-center mb-6 sm:mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {currentSong?.artist || "Select a song"}
                </motion.p>

                {/* Progress Bar */}
                <motion.div
                  className="mb-4 sm:mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div
                    ref={progressBarRef}
                    className="w-full h-1.5 bg-zinc-800 rounded-full cursor-pointer mb-2 overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      style={{ width: `${progress}%` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                  className="flex items-center justify-between mb-6 sm:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.button
                    className="text-zinc-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Shuffle className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="text-zinc-400 hover:text-white transition-colors"
                    onClick={playPrevious}
                    disabled={!currentSong || (playlist.length === 0 && queue.length === 0)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SkipBack className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full p-4 sm:p-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={!currentSong}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </motion.button>
                  <motion.button
                    className="text-zinc-400 hover:text-white transition-colors"
                    onClick={playNext}
                    disabled={!currentSong || (playlist.length === 0 && queue.length === 0)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SkipForward className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    className="text-zinc-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Repeat className="w-5 h-5" />
                  </motion.button>
                </motion.div>

                {/* Additional Controls */}
                <motion.div
                  className="flex items-center justify-center gap-8 sm:gap-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.button
                    onClick={() => setShowPlaylistModal(true)}
                    className="text-zinc-400 hover:text-white transition-colors flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-xs">Playlist</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setShowSleepTimer(true)}
                    className={`${sleepTimer ? 'text-violet-400' : 'text-zinc-400 hover:text-white'} transition-colors flex flex-col items-center`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Timer className="w-5 h-5 mb-1" />
                    <span className="text-xs">
                      {sleepTimer ? `${formatTimerTime(remainingTime || 0)}` : 'Timer'}
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Queue Panel */}
        {showQueue && (
          <motion.div
            ref={queueRef}
            className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black z-50 flex flex-col touch-none"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 150 }}
            onTouchMove={(e) => e.preventDefault()} // Prevent background scrolling
          >
            <motion.div
              className="p-4 border-b border-zinc-800 flex items-center justify-between"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-medium bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text">
                Play Queue
              </h3>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={clearQueue}
                  className="text-zinc-400 hover:text-red-400 transition-colors"
                  title="Clear Queue"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={queue.length === 0}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => setShowQueue(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              className="flex-1 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {queue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <List className="w-16 h-16 text-zinc-700 mb-4" />
                  <p className="text-zinc-400 text-lg mb-2">Your queue is empty</p>
                  <p className="text-sm text-zinc-500">Add songs to your queue to see them here</p>
                </div>
              ) : (
                queue.map((song, index) => (
                  <motion.div
                    key={song.id}
                    className="flex items-center gap-3 p-4 hover:bg-zinc-800/50 transition-colors group border-b border-zinc-800/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={song.image.replace("150x150", "500x500").replace("http:", "https:")}
                        alt={song.name.replaceAll("&quot;", `"`)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{song.name.replaceAll("&quot;", `"`)}</p>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => setCurrentSong(song)}
                        className="text-zinc-400 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => removeFromQueue(song.id)}
                        className="text-zinc-400 hover:text-red-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Sleep Timer Modal */}
        {showSleepTimer && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 p-4 flex flex-col touch-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTouchMove={(e) => e.preventDefault()} // Prevent background scrolling
          >
            <motion.div
              className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text">
                Sleep Timer
              </h2>
              <motion.button
                onClick={() => setShowSleepTimer(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {sleepTimer && (
              <motion.div
                className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Active Timer</p>
                    <p className="text-lg font-medium text-violet-400">
                      {formatTimerTime(remainingTime || 0)} remaining
                    </p>
                  </div>
                  <motion.button
                    onClick={cancelSleepTimer}
                    className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}

            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {timerOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => setSleepTimerMinutes(option.value)}
                  className="p-4 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg flex flex-col items-center justify-center hover:from-zinc-700 hover:to-zinc-600 transition-all duration-200 border border-zinc-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="w-6 h-6 text-violet-400 mb-2" />
                  <span className="text-lg font-medium">{option.label}</span>
                </motion.button>
              ))}
            </motion.div>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm text-zinc-500">
                Music will automatically stop when the timer expires
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Playlist Modal */}
        {showPlaylistModal && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 p-4 flex flex-col touch-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTouchMove={(e) => e.preventDefault()} // Prevent background scrolling
          >
            <motion.div
              className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text">
                Add to Playlist
              </h2>
              <motion.button
                onClick={() => setShowPlaylistModal(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <motion.div
              className="overflow-y-auto flex-1 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isLoadingPlaylists ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-4" />
                  <p className="text-zinc-400">Loading playlists...</p>
                </div>
              ) : playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Music className="w-16 h-16 text-zinc-700 mb-4" />
                  <p className="text-zinc-400 text-lg mb-2">No playlists found</p>
                  <p className="text-sm text-zinc-500">Create a playlist to add songs to it</p>
                </div>
              ) : (
                playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    className="mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <motion.button
                      onClick={() => addSongToPlaylist(playlist.id)}
                      disabled={!!addingToPlaylist}
                      className={`w-full p-4 rounded-lg flex items-center gap-4 overflow-hidden bg-gradient-to-r ${getPlaylistColor(index)} disabled:opacity-70`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="w-12 h-12 bg-black/20 rounded flex items-center justify-center flex-shrink-0">
                        {playlist.cover ? (
                          <img
                            src={playlist.cover.replace("150x150", "500x500").replace("http:", "https:")}
                            alt={playlist.name.replaceAll("&quot;", `"`)}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <List className="w-6 h-6 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 text-left w-2/3">
                        <p className="font-medium truncate">{playlist.name}</p>
                        <p className="text-xs text-black/70">
                          {playlist.songCount !== undefined
                            ? `${playlist.songCount} songs`
                            : "0 songs"}
                        </p>
                      </div>
                      {addingToPlaylist === playlist.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-black/70" />
                      ) : (
                        <Plus className="w-5 h-5 text-black/70" />
                      )}
                    </motion.button>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MobilePlayer
