"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Music, PlayCircle, Play } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import { usePlayer } from '@/context/PlayerContext'

interface Song {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
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
  const { setCurrentSong, setPlaylist: setPlayerPlaylist, isPlaying, setIsPlaying } = usePlayer()

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

  const handlePlaySong = (song: Song, index: number) => {
    if (playlist) {
      setCurrentSong(song)
      setPlayerPlaylist(playlist.songs, index)
      setIsPlaying(true)
    }
  }

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      setPlayerPlaylist(playlist.songs, 0)
      setCurrentSong(playlist.songs[0])
      setIsPlaying(true)
    }
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
            {playlist.songs.length} songs • Created on {new Date(playlist.createdAt).toLocaleDateString()}
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
          <div>Title</div>
          <div className="px-4">Duration</div>
        </div>

        {playlist.songs.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <p>No songs in this playlist yet</p>
          </div>
        ) : (
          playlist.songs.map((song, index) => (
            <div 
              key={song.id}
              className="grid grid-cols-[auto_1fr_auto] gap-4 items-center py-2 px-2 hover:bg-zinc-900 rounded-md cursor-pointer group"
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
              <div className="text-zinc-400 px-4">3:45</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PlaylistPage