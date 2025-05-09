"use client"

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  List,
  X,
  Trash2
} from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import { usePlayer } from "@/context/PlayerContext"

const Player = () => {
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
    setCurrentSong
  } = usePlayer()
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const queueRef = useRef<HTMLDivElement>(null)

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Initialize volume from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasInitialized) {
      const savedVolume = localStorage.getItem('playerVolume');
      if (savedVolume) {
        setVolume(Number(savedVolume));
      }
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // Handle time updates
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      // Only update time if not currently dragging the slider
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
      
      // Save volume setting to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('playerVolume', volume.toString());
      }
    }
  }, [volume, audioRef])

  // Handle seeking in the timeline
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return;

    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newPosition = (offsetX / rect.width) * duration;
    
    setCurrentTime(newPosition);
    audioRef.current.currentTime = newPosition;
  };

  // Handle mouse down on the progress bar
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleSeek(e);
  };

  // Handle mouse move while dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleSeek(e);
    }
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Calculate progress bar %
  const progress = duration ? (currentTime / duration) * 100 : 0

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

  return (
    <div className="w-full h-16 md:h-20 bg-black border-t border-zinc-900 flex items-center px-2 md:px-4 relative">
      {/* Current Song Info */}
      <div className="flex items-center gap-2 md:gap-4 w-1/3 md:w-1/4">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-zinc-900 rounded overflow-hidden">
          {currentSong?.image && (
            <img
              src={currentSong.image.replace("150x150", "500x500").replace("http:","https:")}
              alt={currentSong.name.replaceAll("&quot;", `"`)}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="hidden sm:block">
          <h3 className="font-medium text-sm md:text-base">{currentSong?.name.replaceAll("&quot;", `"`) || "No song playing"}</h3>
          <p className="text-xs md:text-sm text-zinc-400">{currentSong?.artist || "Select a song"}</p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 md:gap-6 mb-1 md:mb-2">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            className="text-zinc-400 hover:text-white transition-colors"
            onClick={playPrevious}
            disabled={!currentSong || playlist.length === 0}
          >
            <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-1.5 md:p-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!currentSong}
          >
            {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button 
            className="text-zinc-400 hover:text-white transition-colors"
            onClick={playNext}
            disabled={!currentSong || playlist.length === 0}
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Repeat className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        <div className="w-full max-w-xl flex items-center gap-1 md:gap-2">
          <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
          <div 
            ref={progressBarRef}
            className="flex-1 h-1 bg-zinc-800 rounded-full cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume and Queue Controls */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
        <button
          onClick={() => setShowQueue(!showQueue)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <List className="w-5 h-5" />
        </button>
        <Volume2 className="w-5 h-5 text-zinc-400"/>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-28 h-1.5 accent-indigo-500 rounded-full appearance-none cursor-pointer bg-zinc-800"
        />
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div 
          ref={queueRef}
          className="absolute bottom-full right-0 mb-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-medium">Queue</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearQueue}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Clear Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowQueue(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {queue.length === 0 ? (
              <div className="p-4 text-center text-zinc-400 text-sm">
                Queue is empty
              </div>
            ) : (
              queue.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={song.image.replace("150x150", "500x500").replace("http:","https:")}
                      alt={song.name.replaceAll("&quot;", `"`)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.name.replaceAll("&quot;", `"`)}</p>
                    <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentSong(song)}
                      className="text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromQueue(song.id)}
                      className="text-zinc-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Player