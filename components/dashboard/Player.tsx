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
  Trash2,
  Loader2,
  Download,
  Repeat1
} from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import { usePlayer } from "@/context/PlayerContext"
import toast from "react-hot-toast"

const Player = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    queue,
    upNext,
    currentTime,
    duration,
    volume,
    isShuffled,
    repeatMode,
    togglePlayPause,
    next,
    previous,
    jumpToSong,
    removeFromQueue,
    clearQueue,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    audioRef
  } = usePlayer()

  const [isDragging, setIsDragging] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [localCurrentTime, setLocalCurrentTime] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const queueRef = useRef<HTMLDivElement>(null)

  // Format time in MM:SS
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Use local current time when dragging, otherwise use context current time
  const displayTime = isDragging ? localCurrentTime : currentTime

  // Handle seeking in the timeline
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return

    const progressBar = progressBarRef.current
    const rect = progressBar.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const newPosition = Math.max(0, Math.min((offsetX / rect.width) * duration, duration))

    if (isDragging) {
      setLocalCurrentTime(newPosition)
    } else {
      seek(newPosition)
    }
  }

  // Handle mouse down on the progress bar
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setLocalCurrentTime(currentTime)
    handleSeek(e)
  }

  // Handle mouse move while dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleSeek(e)
    }
  }

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (isDragging) {
      seek(localCurrentTime)
      setIsDragging(false)
    }
  }

  // Add global mouse up and move handlers
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        seek(localCurrentTime)
        setIsDragging(false)
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect()
        const offsetX = e.clientX - rect.left
        const newPosition = Math.max(0, Math.min((offsetX / rect.width) * duration, duration))
        setLocalCurrentTime(newPosition)
      }
    }

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp)
      window.addEventListener('mousemove', handleGlobalMouseMove)
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, duration, localCurrentTime, seek])

  // Calculate progress bar %
  const progress = duration ? (displayTime / duration) * 100 : 0

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

  const downloadSong = async () => {
    if (!currentSong) {
      toast.error("No song selected to download")
      return
    }

    try {
      setIsDownloading(true)
      toast.loading("Starting download...")

      const downloadUrl = currentSong.url

      if (!downloadUrl) {
        toast.error("Download URL not available for this song")
        return
      }

      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch audio file')
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const filename = `${currentSong.name.replaceAll("&quot;", "").replace(/[^\w\s-]/g, "").trim()} - ${currentSong.artist.replace(/[^\w\s-]/g, "").trim()}.mp3`

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl)
      }, 1000)

      toast.dismiss()
      toast.success(`"${currentSong.name.replaceAll("&quot;", `"`)}" downloaded successfully`)
    } catch (error) {
      console.error('Download error:', error)
      toast.dismiss()
      toast.error("Failed to download song")
    } finally {
      setIsDownloading(false)
    }
  }

  // Get shuffle button classes
  const getShuffleClasses = () => {
    return isShuffled
      ? "text-green-400 hover:text-green-300 transition-colors"
      : "text-zinc-400 hover:text-white transition-colors"
  }

  // Get repeat button classes and icon
  const getRepeatClasses = () => {
    switch (repeatMode) {
      case 'all':
        return "text-green-400 hover:text-green-300 transition-colors"
      case 'one':
        return "text-green-400 hover:text-green-300 transition-colors"
      default:
        return "text-zinc-400 hover:text-white transition-colors"
    }
  }

  const getRepeatIcon = () => {
    return repeatMode === 'one' ? Repeat1 : Repeat
  }

  const RepeatIcon = getRepeatIcon()

  return (
    <div className="w-full h-16 md:h-20 bg-black border-t border-zinc-900 flex items-center px-2 md:px-4 relative">
      {/* Current Song Info */}
      <div className="flex items-center gap-2 md:gap-4 w-1/3 md:w-1/4">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-zinc-900 rounded overflow-hidden">
          {currentSong?.image && (
            <img
              src={currentSong.image.replace("150x150", "500x500").replace("http:", "https:")}
              alt={currentSong.name.replaceAll("&quot;", `"`)}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="hidden sm:block max-w-[16vw]">
          <h3 className="font-medium text-sm md:text-base truncate">
            {currentSong?.name.replaceAll("&quot;", `"`) || "No song playing"}
          </h3>
          <p className="text-xs md:text-sm text-zinc-400 truncate">
            {currentSong?.artist || "Select a song"}
          </p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 md:gap-6 mb-1 md:mb-2">
          <button
            className={getShuffleClasses()}
            onClick={toggleShuffle}
            title={`Shuffle: ${isShuffled ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            onClick={previous}
            disabled={!currentSong}
          >
            <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-1.5 md:p-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={togglePlayPause}
            disabled={!currentSong || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>

          <button
            className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            onClick={next}
            disabled={!currentSong}
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            className={getRepeatClasses()}
            onClick={toggleRepeat}
            title={`Repeat: ${repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One'}`}
          >
            <RepeatIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="w-full max-w-xl flex items-center gap-1 md:gap-2">
          <span className="text-xs text-zinc-400">{formatTime(displayTime)}</span>
          <div
            ref={progressBarRef}
            className="flex-1 h-1 bg-zinc-800 rounded-full cursor-pointer relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume and Queue Controls */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
        <button
          onClick={downloadSong}
          disabled={isDownloading || !currentSong}
          className={`${isDownloading ? 'text-violet-400' : 'text-zinc-400 hover:text-white'
            } transition-colors flex flex-col items-center disabled:opacity-70`}
          title="Download Song"
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 mb-1 animate-spin" />
          ) : (
            <Download className="w-5 h-5 mb-1" />
          )}
        </button>

        <button
          onClick={() => setShowQueue(!showQueue)}
          className={`${showQueue ? 'text-green-400' : 'text-zinc-400 hover:text-white'
            } transition-colors relative`}
          title="Show Queue"
        >
          <List className="w-5 h-5" />
          {upNext.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {upNext.length}
            </span>
          )}
        </button>

        <Volume2 className="w-5 h-5 text-zinc-400" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-28 h-1.5 accent-indigo-500 rounded-full appearance-none cursor-pointer bg-zinc-800"
        />
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div
          ref={queueRef}
          className="absolute bottom-full right-0 mb-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-medium">Queue ({upNext.length} songs)</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearQueue}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Clear Queue"
                disabled={upNext.length === 0}
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
            {/* Currently Playing */}
            {currentSong && (
              <div className="p-2 bg-zinc-800/30 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={currentSong.image.replace("150x150", "500x500").replace("http:", "https:")}
                      alt={currentSong.name.replaceAll("&quot;", `"`)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-green-400">
                      {currentSong.name.replaceAll("&quot;", `"`)}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
                    <p className="text-xs text-green-400">Now Playing</p>
                  </div>
                </div>
              </div>
            )}

            {/* Up Next */}
            {upNext.length === 0 ? (
              <div className="p-4 text-center text-zinc-400 text-sm">
                Queue is empty
              </div>
            ) : (
              <>
                <div className="p-2 text-xs text-zinc-400 font-medium">
                  Up Next
                </div>
                {upNext.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={song.image.replace("150x150", "500x500").replace("http:", "https:")}
                        alt={song.name.replaceAll("&quot;", `"`)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {song.name.replaceAll("&quot;", `"`)}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => jumpToSong(song.id)}
                        className="text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        title="Play Now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromQueue(song.id)}
                        className="text-zinc-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from Queue"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Player
