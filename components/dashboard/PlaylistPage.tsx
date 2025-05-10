"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Music, PlayCircle, Play, EllipsisVertical, X, Plus, ListPlus, Trash2 } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import { usePlayer } from '@/context/PlayerContext'
import toast from 'react-hot-toast'

interface Song {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
  duration: number;
}

interface Playlist {
  id: string;
  name: string;
  createdAt: string;
  songs: Song[];
  cover?: string;
}

const PlaylistPage = () => {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalDuration, setTotalDuration] = useState(0)
  const { setCurrentSong, setPlaylist: setPlayerPlaylist, isPlaying, setIsPlaying, addToQueue, playNextInQueue } = usePlayer()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
          setError('Authentication token not found')
          setLoading(false)
          return
        }

        const response = await fetch('/api/dashboard/getPlaylist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ playlistId: id })
        })

        if (!response.ok) {
          throw new Error('Failed to load playlist')
        }

        const data = await response.json()
        setPlaylist(data.playlist)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching playlist:', error)
        setError('Failed to load playlist')
        setLoading(false)
      }
    }

    if (id) {
      fetchPlaylist()
    }
  }, [id])

  // Calculate total duration whenever playlist changes
  useEffect(() => {
    if (playlist && playlist.songs) {
      let total = 0;
      playlist.songs.forEach(song => {
        total += song.duration;
      });
      setTotalDuration(total);
    }
  }, [playlist]);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handlePlaySong = (song: Song, index: number) => {
    if (playlist) {
      setCurrentSong(song)
      setPlayerPlaylist(playlist.songs, index)
      setIsPlaying(true)
    }
  }

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      // Add all songs to queue
      playlist.songs.forEach(song => {
        addToQueue(song);
      });
      // Play the first song
      setCurrentSong(playlist.songs[0]);
      setIsPlaying(true);
    }
  }

  const showMenu = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the parent onClick
    setActiveMenu(activeMenu === song.id ? null : song.id)
  }

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!playlist) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard/deleteSong', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          playlistId: playlist.id,
          songId: songId 
        })
      })

      if (!response.ok) {
        toast.error('Failed to remove song')
      }

      const data = await response.json()
      console.log('Song removed:', data)
      toast.success(data.message)

      // Update local state
      setPlaylist({
        ...playlist,
        songs: playlist.songs.filter(song => song.id !== songId)
      })
      
      setActiveMenu(null)
    } catch (error) {
      console.error('Error removing song:', error)
      toast.error('Failed to remove song')
    }
  }

  const handlePlayNext = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation()
    if (playNextInQueue) {
      playNextInQueue(song)
    }
    setActiveMenu(null)
  }

  const handleAddToQueue = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation()
    if (addToQueue) {
      addToQueue(song)
    }
    setActiveMenu(null)
  }

  // Format duration from seconds to mm:ss format
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Playlist not found</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      {/* Playlist Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
          {playlist.cover ? (
            <img
              src={playlist.cover}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-24 h-24 text-white opacity-75" />
          )}
        </div>
        <div className="flex-1 pt-4">
          <p className="text-sm text-zinc-400 uppercase font-medium">Playlist</p>
          <h1 className="text-4xl font-bold mt-2 mb-4">{playlist.name}</h1>
          <p className="text-zinc-400">
            {playlist.songs.length} songs • {Math.floor(totalDuration/3600)}:{Math.floor((totalDuration%3600)/60)}:{totalDuration%60} • Created on {new Date(playlist.createdAt).toLocaleDateString()}
          </p>
          {playlist.songs.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="mt-4 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              <Play size={20} />
              <span className="font-medium">Play All</span>
            </button>
          )}
        </div>
      </div>

      {/* Song List */}
      <div className="mt-6">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 text-zinc-400 text-sm border-b border-zinc-800 pb-2 mb-2">
          <div className="px-4">#</div>
          <div>TITLE</div>
          <div className="px-4">DURATION</div>
        </div>

        {playlist.songs.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <p>No songs in this playlist yet</p>
          </div>
        ) : (
          playlist.songs.map((song, index) => (
            <div
              key={song.id}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-2 px-2 hover:bg-zinc-900 rounded-md cursor-pointer group relative"
              onClick={() => handlePlaySong(song, index)}
            >
              <div className="w-8 text-center text-zinc-400 group-hover:hidden">{index + 1}</div>
              <div className="hidden group-hover:block pl-1">
                <PlayCircle size={20} className="text-indigo-400" />
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={song.image}
                  alt={song.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <div>
                  <p className="font-medium text-white">{song.name}</p>
                  <p className="text-sm text-zinc-400">{song.artist}</p>
                </div>
              </div>
              <div className="text-zinc-400 px-4">{formatDuration(song.duration)}</div>
              <div 
                className="flex items-center justify-center hover:bg-gray-600/20 rounded-full h-6 w-6"
                onClick={(e) => showMenu(song, e)}
              >
                <EllipsisVertical size={16} />
              </div>
              
              {/* Song Options Menu */}
              {activeMenu === song.id && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-0 -mt-2 mr-10 bg-zinc-800/90 backdrop-blur-sm rounded-lg shadow-lg z-50 py-1 border border-zinc-700/50"
                >
                  <div className="flex space-x-1 px-2">
                    <button
                      onClick={(e) => handlePlayNext(song, e)}
                      className="px-2 py-1.5 hover:bg-zinc-700/70 rounded-md flex items-center gap-1.5 transition-colors text-xs"
                    >
                      <Plus size={14} className="text-zinc-400" />
                      <span>Play Next</span>
                    </button>
                    <button
                      onClick={(e) => handleAddToQueue(song, e)}
                      className="px-2 py-1.5 hover:bg-zinc-700/70 rounded-md flex items-center gap-1.5 transition-colors text-xs"
                    >
                      <ListPlus size={14} className="text-zinc-400" />
                      <span>Add to Queue</span>
                    </button>
                    <button
                      onClick={(e) => handleRemoveSong(song.id, e)}
                      className="px-2 py-1.5 hover:bg-zinc-700/70 rounded-md flex items-center gap-1.5 transition-colors text-xs text-red-400"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PlaylistPage