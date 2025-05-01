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
} from "lucide-react"
import React, { useState, useEffect } from "react"
import { usePlayer } from "@/context/PlayerContext"

const MobilePlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, audioRef } = usePlayer()
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

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
    }
  }, [volume, audioRef])

  // Calculate progress bar %
  const progress = duration ? (currentTime / duration) * 100 : 0

  if (!currentSong) return null;

  return (
    <>
      {/* Mini Player */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50 transition-transform duration-300 ${
          isExpanded ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex items-center p-3 gap-3">
          <div 
            className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0"
            onClick={() => setIsExpanded(true)}
          >
            {currentSong.image && (
              <img
                src={currentSong.image}
                alt={currentSong.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0" onClick={() => setIsExpanded(true)}>
            <h3 className="text-sm font-medium text-white truncate">{currentSong.name}</h3>
            <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
          </div>
          <button
            className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Player */}
      <div 
        className={`fixed inset-0 bg-zinc-900 z-50 transition-transform duration-300 ${
          isExpanded ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-2 rounded-full hover:bg-zinc-800"
          >
            <ChevronUp className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Now Playing</h2>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Album Art */}
        <div className="px-8 py-6">
          <div className="aspect-square bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            {currentSong.image && (
              <img
                src={currentSong.image}
                alt={currentSong.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Song Info */}
        <div className="px-8 py-4">
          <h3 className="text-xl font-bold text-white">{currentSong.name}</h3>
          <p className="text-zinc-400">{currentSong.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4">
          <div className="w-full h-1 bg-zinc-800 rounded-full">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
            <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Shuffle className="w-5 h-5" />
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              className="bg-white text-black rounded-full p-4 hover:scale-105 transition-transform"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-zinc-400" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 accent-white rounded-full appearance-none cursor-pointer bg-zinc-800"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default MobilePlayer 