"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Music, PlayCircle, ArrowLeft, Play } from 'lucide-react'
import LoadingSpinner from '../../LoadingSpinner'
import { usePlayer } from '@/context/PlayerContext'
import Link from 'next/link'

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
}

const MobilePlaylistPage = () => {
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
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
        <p>{error}</p>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p>Playlist not found</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Back Button */}
      <div className="p-4 sticky top-0 bg-black/90 backdrop-blur-sm z-10">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white">
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </Link>
      </div>

      {/* Playlist Header */}
      <div className="px-4 pb-4 flex flex-col items-center">
        <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
          <Music className="w-20 h-20 text-white opacity-75" />
        </div>
        <div className="w-full text-center mt-4">
          <h1 className="text-2xl font-bold mb-1">{playlist.name}</h1>
          <p className="text-zinc-400 text-sm">
            {playlist.songs.length} songs • Created on {new Date(playlist.createdAt).toLocaleDateString()}
          </p>
          {playlist.songs.length > 0 && (
            <button 
              onClick={handlePlayAll}
              className="mt-4 flex items-center gap-2 bg-white text-black py-2 px-6 rounded-full hover:bg-opacity-90 transition-colors mx-auto"
            >
              <Play size={18} className="fill-black" />
              <span className="font-medium">Play All</span>
            </button>
          )}
        </div>
      </div>

      {/* Song List */}
      <div className="mt-4 px-4 pb-24">
        {playlist.songs.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>No songs in this playlist yet</p>
          </div>
        ) : (
          playlist.songs.map((song, index) => (
            <div 
              key={song.id}
              className="flex items-center gap-3 py-3 border-b border-zinc-800 active:bg-zinc-800/30 cursor-pointer"
              onClick={() => handlePlaySong(song, index)}
            >
              <img 
                src={song.image} 
                alt={song.name} 
                className="w-12 h-12 rounded object-cover" 
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{song.name}</p>
                <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
              </div>
              <PlayCircle size={24} className="text-zinc-400" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MobilePlaylistPage