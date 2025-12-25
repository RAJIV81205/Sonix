"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Music, MoreVertical, ArrowLeft, Play } from 'lucide-react'
import LoadingSpinner from '../../LoadingSpinner'
import { usePlayerControls } from '@/context/PlayerControlsContext'
import Link from 'next/link'

interface Song {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
  duration:number
}

interface Playlist {
  id: string;
  name: string;
  createdAt: string;
  songs: Song[];
  cover?: string;
}

const MobilePlaylistPage = () => {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { setQueue, play, addToQueue, addToNext } = usePlayerControls()

  const [contextMenuVisible, setContextMenuVisible] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState({ songIndex: -1 })
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

  const handlePlayAll = async () => {
    if (playlist && playlist.songs.length > 0) {
      setQueue(playlist.songs, 0)
      await play()
    }
  }

  const openMenu = (e: React.MouseEvent, song: Song, index: number) => {
    e.stopPropagation()
    e.preventDefault()
    
    setSelectedSong(song)
    setContextMenuPosition({ songIndex: index })
    setContextMenuVisible(true)
  }

  const handleMenuAction = async (action: string) => {
    if (!selectedSong) return

    switch (action) {
      case 'play':
        const songIndex = playlist?.songs.findIndex(s => s.id === selectedSong.id) || 0
        setQueue(playlist?.songs || [], songIndex)
        await play()
    
        break
      case 'play-next':
        addToNext(selectedSong)

        break
      case 'add-to-queue':
        addToQueue(selectedSong)
        break
      case 'remove':
        if (playlist) {
          const updatedSongs = playlist.songs.filter(s => s.id !== selectedSong.id)
          setPlaylist({ ...playlist, songs: updatedSongs })
        }
        break
    }

    setContextMenuVisible(false)
  }

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenuVisible(false)
      }
    }
    
    const handleScroll = () => {
      setContextMenuVisible(false)
    }
    
    if (contextMenuVisible) {
      document.addEventListener('click', closeMenu)
      document.addEventListener('scroll', handleScroll, true)
    }
    
    return () => {
      document.removeEventListener('click', closeMenu)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [contextMenuVisible])

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
    <div className="h-full overflow-y-auto relative">
      {/* Back Button */}
      <div className="p-4 sticky top-0 bg-black/90 backdrop-blur-sm z-10">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white">
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </Link>
      </div>

      {/* Playlist Header */}
      <div className="px-4 pb-4 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6 py-10">
          <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
            {playlist.cover ? (
              <img 
                src={playlist.cover} 
                alt={playlist.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-20 h-20 text-white opacity-75" />
            )}
          </div>
          <h1 className="text-2xl font-bold mt-4 text-center">{playlist.name}</h1>
          <p className="text-zinc-400 text-sm mt-1 text-center">
            {playlist.songs.length} songs • Created on {new Date(playlist.createdAt).toLocaleDateString()}
          </p>
          {playlist.songs.length > 0 && (
            <button 
              onClick={handlePlayAll}
              className="mt-4 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-colors mx-auto"
            >
              <Play size={18} />
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
              className="flex items-center gap-3 py-3 border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors cursor-pointer rounded-md px-2 relative"
              onClick={async () => {
                setQueue(playlist.songs, index)
                await play()
              }}
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
              <button 
                onClick={(e) => openMenu(e, song, index)}
                className="relative"
              >
                <MoreVertical size={20} className="text-zinc-400 hover:text-white" />
                
                {/* Inline Context Menu */}
                {contextMenuVisible && contextMenuPosition.songIndex === index && (
                  <div
                    ref={menuRef}
                    className="absolute z-50 bg-zinc-800 text-white rounded-md shadow-lg p-2 space-y-2 w-40 right-0 top-0"
                    style={{ transform: 'translateX(-10%) translateY(10%)' }}
                  >
                    <button 
                      onClick={() => handleMenuAction('play')}
                      className="block w-full text-left hover:bg-zinc-700 px-3 py-1 rounded"
                    >
                      Play
                    </button>
                    <button 
                      onClick={() => handleMenuAction('play-next')}
                      className="block w-full text-left hover:bg-zinc-700 px-3 py-1 rounded"
                    >
                      Play Next
                    </button>
                    <button 
                      onClick={() => handleMenuAction('add-to-queue')}
                      className="block w-full text-left hover:bg-zinc-700 px-3 py-1 rounded"
                    >
                      Add to Queue
                    </button>
                    <button 
                      onClick={() => handleMenuAction('remove')}
                      className="block w-full text-left text-red-400 hover:bg-zinc-700 px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MobilePlaylistPage