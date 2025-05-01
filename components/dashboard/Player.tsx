"use client"

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
} from "lucide-react"
import React, { useState, useEffect } from "react"
import { usePlayer } from "@/context/PlayerContext"

const Player = () => {
  const { currentSong, isPlaying, setIsPlaying, audioRef } = usePlayer()
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasInitialized, setHasInitialized] = useState(false)

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
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateTime)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateTime)
    }
  }, [audioRef])

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

  // Calculate progress bar %
  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="w-full h-16 md:h-20 bg-zinc-900 border-t border-zinc-800 flex items-center px-2 md:px-4">
      {/* Current Song Info */}
      <div className="flex items-center gap-2 md:gap-4 w-1/3 md:w-1/4">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-zinc-800 rounded overflow-hidden">
          {currentSong?.image && (
            <img
              src={currentSong.image}
              alt={currentSong.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="hidden sm:block">
          <h3 className="font-medium text-sm md:text-base">{currentSong?.name || "No song playing"}</h3>
          <p className="text-xs md:text-sm text-zinc-400">{currentSong?.artist || "Select a song"}</p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 md:gap-6 mb-1 md:mb-2">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            className="bg-white text-black rounded-full p-1.5 md:p-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!currentSong}
          >
            {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Repeat className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        <div className="w-full max-w-xl flex items-center gap-1 md:gap-2">
          <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-zinc-700 rounded-full">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="hidden md:flex items-center justify-end gap-2 w-1/4">
        <Volume2 className="w-5 h-5 text-zinc-400" />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-28 h-1.5 accent-white rounded-full appearance-none cursor-pointer bg-zinc-700"
        />
      </div>
    </div>
  )
}

export default Player
