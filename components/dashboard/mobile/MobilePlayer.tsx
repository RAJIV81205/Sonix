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
import React, { useState, useEffect } from "react"
import { usePlayer } from "@/context/PlayerContext"
import { toast } from "react-hot-toast"

interface Playlist {
  id: string;
  name: string;
  songCount?: number;
}

const MobilePlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, audioRef } = usePlayer()
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)

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
        className={`fixed inset-0 bg-gradient-to-b from-zinc-900 to-black z-50 transition-transform duration-300 ${
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

          {/* More Options */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white">
              <div className="bg-zinc-800 p-3 rounded-full">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xs">Like</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white"
              onClick={() => setShowPlaylistModal(true)}
            >
              <div className="bg-zinc-800 p-3 rounded-full">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs">Add to Playlist</span>
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

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-end">
          <div className="w-full bg-zinc-900 rounded-t-xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <h2 className="text-lg font-bold">Add to Playlist</h2>
              <button onClick={() => setShowPlaylistModal(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-2 pb-safe">
              {isLoadingPlaylists ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : playlists.length > 0 ? (
                <div className="space-y-1">
                  {playlists.map((playlist, index) => (
                    <button
                      key={playlist.id}
                      className="w-full flex items-center gap-3 p-4 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors"
                      onClick={() => addSongToPlaylist(playlist.id)}
                      disabled={addingToPlaylist === playlist.id}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${getPlaylistColor(index)} rounded-md flex items-center justify-center`}>
                        {addingToPlaylist === playlist.id ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <Music className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{playlist.name}</p>
                        <p className="text-xs text-zinc-500">{playlist.songCount || 0} songs</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-zinc-400">You don't have any playlists yet.</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-purple-600 rounded-full text-white font-medium"
                    onClick={() => {
                      setShowPlaylistModal(false);
                      setIsExpanded(false);
                    }}
                  >
                    Create a Playlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MobilePlayer 