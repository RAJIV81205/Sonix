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
  Loader2
} from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import { usePlayer } from "@/context/PlayerContext"
import { toast } from "react-hot-toast"

interface Playlist {
  id: string;
  name: string;
  songCount?: number;
}

const MobilePlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, audioRef, playNext, playPrevious, playlist } = usePlayer()
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

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
    }
  }, [volume, audioRef])

  // Handle seeking in the timeline
  const handleSeek = (e: React.TouchEvent | React.MouseEvent) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return;

    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    
    // Get the x position based on whether it's a touch or mouse event
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

  // Mouse event handlers (for completeness)
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

  // Call fetch playlists when modal opens
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

  // Add current song to playlist
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
      
      // Check if song already exists in playlist
      if (data.alreadyExists) {
        toast.error(`"${currentSong.name}" is already in this playlist`);
      } else {
        toast.success(`Added "${currentSong.name}" to playlist`);
      }
      
      // Close modal
      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add song to playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  // Calculate progress bar %
  const progress = duration ? (currentTime / duration) * 100 : 0

  // Function to get playlist color based on index
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

  if (!currentSong) return null;

  return (
    <>
      {/* Mini Player (when not expanded) */}
      {!isExpanded && (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 h-16 flex items-center px-3 z-40"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center w-full">
            <div className="w-10 h-10 bg-zinc-900 rounded overflow-hidden mr-3">
              {currentSong?.image && (
                <img
                  src={currentSong.image}
                  alt={currentSong.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-sm font-medium text-white truncate">{currentSong.name}</p>
              <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
            </div>
            <div className="flex items-center">
              <button 
                className="p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Full Player (when expanded) */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 flex items-center border-b border-zinc-900">
            <button 
              className="p-2 -ml-2"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronUp className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 text-center text-sm font-medium text-zinc-400">
              Now Playing
            </div>
            <button 
              className="p-2 -mr-2 text-purple-400"
              onClick={() => setShowPlaylistModal(true)}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Album Art and Info */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-2xl mb-8 bg-zinc-900">
              {currentSong.image ? (
                <img
                  src={currentSong.image}
                  alt={currentSong.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Music className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            <div className="w-full max-w-xs">
              <h2 className="text-xl font-bold text-white mb-1 truncate">{currentSong.name}</h2>
              <p className="text-zinc-400 truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="p-8 pb-12">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-zinc-400 w-8 text-right">{formatTime(currentTime)}</span>
              <div 
                ref={progressBarRef}
                className="flex-1 h-1.5 bg-zinc-800 rounded-full cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-zinc-400 w-8">{formatTime(duration)}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <button className="text-zinc-400 hover:text-white transition-colors">
                <Shuffle className="w-5 h-5" />
              </button>
              <button 
                className="text-zinc-400 hover:text-white transition-colors"
                onClick={playPrevious}
                disabled={!playlist || playlist.length === 0}
              >
                <SkipBack className="w-7 h-7" />
              </button>
              <button
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button 
                className="text-zinc-400 hover:text-white transition-colors"
                onClick={playNext}
                disabled={!playlist || playlist.length === 0}
              >
                <SkipForward className="w-7 h-7" />
              </button>
              <button className="text-zinc-400 hover:text-white transition-colors">
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Slider (only on larger devices) */}
            <div className="hidden md:flex items-center gap-2 justify-center">
              <Volume2 className="w-5 h-5 text-zinc-400" />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-32 h-1.5 accent-purple-500 rounded-full appearance-none cursor-pointer bg-zinc-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
            <h2 className="text-xl font-bold">Add to Playlist</h2>
            <button 
              onClick={() => setShowPlaylistModal(false)}
              className="p-1.5 rounded-full hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {isLoadingPlaylists ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-4">You don't have any playlists yet</p>
                <p className="text-sm text-zinc-500">Create a playlist to add songs to it</p>
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist, index) => (
                  <button
                    key={playlist.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900 transition-colors ${
                      addingToPlaylist === playlist.id ? 'bg-zinc-900' : ''
                    }`}
                    onClick={() => addSongToPlaylist(playlist.id)}
                    disabled={addingToPlaylist !== null}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${getPlaylistColor(index)} rounded-lg flex items-center justify-center shadow-md`}>
                      {addingToPlaylist === playlist.id ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Music className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-white">{playlist.name}</p>
                      <p className="text-xs text-zinc-400">{playlist.songCount || 0} songs</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default MobilePlayer