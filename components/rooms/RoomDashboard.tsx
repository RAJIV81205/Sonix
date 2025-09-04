"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Search, Play, Pause, SkipForward, Volume2, Users, MessageCircle, Music, Clock, User, Loader2, Send, LogOut } from 'lucide-react'
import { useSocket } from '@/lib/hooks/useSocket'
import { usePlayer } from '@/context/PlayerContext'
import { toast } from 'react-hot-toast'

// Type definitions
type Participant = {
  id: string
  name: string
  role?: 'host' | 'member'
  avatar?: string
  isOnline?: boolean
}

type RoomDetails = {
  id: string | string[]
  name: string
  description: string
  host: string
  createdAt: Date | string
  isActive: boolean
}

type Song = {
  id: number | string
  title: string
  artist: string
  duration: string
  album: string
  thumbnail?: string
  url?: string
}

// Convert function to match PlayerContext Song interface
const convertToPlayerSong = (song: Song) => ({
  id: song.id.toString(),
  name: song.title,
  artist: song.artist,
  image: song.thumbnail || '/default-album.png',
  url: song.url || '',
  duration: parseDuration(song.duration) // Convert duration string to seconds
})

// Helper function to parse duration string (e.g., "3:20" -> 200 seconds)
const parseDuration = (durationStr: string): number => {
  const parts = durationStr.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }
  return 0
}

const RoomDashboard = () => {
  const params = useParams()
  const roomId = params.id as string

  // Socket hook
  const {
    isConnected,
    roomState,
    messages,
    joinRoom,
    playSong: socketPlaySong,
    togglePlayPause: socketTogglePlayPause,
    sendMessage: socketSendMessage,
    syncTime: socketSyncTime
  } = useSocket()

  // Player context hook
  const {
    currentSong: playerCurrentSong,
    isPlaying: playerIsPlaying,
    setQueue,
    play,
    pause,
    audioRef
  } = usePlayer()

  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [songUrlLoading, setSongUrlLoading] = useState<string | null>(null)
  const [chatMessage, setChatMessage] = useState('')

  // Refs for tracking sync state
  const syncingRef = useRef(false)
  const lastSyncTimeRef = useRef(0)
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isUserInteractionRef = useRef(false)

  // Get current song and playing state from socket
  const currentSong = roomState.currentSong
  const isPlaying = roomState.isPlaying
  const participants = roomState.participants
  const socketCurrentTime = roomState.currentTime

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // Sync socket song changes with player context (only when socket changes)
  useEffect(() => {
    if (syncingRef.current) return

    if (currentSong && currentSong.url) {
      const playerSong = convertToPlayerSong(currentSong)

      // Only update if it's a different song
      if (!playerCurrentSong || playerCurrentSong.id !== playerSong.id) {
        syncingRef.current = true
        setQueue([playerSong], 0)

        // Set audio source and sync time
        if (audioRef.current) {
          audioRef.current.src = currentSong.url
          audioRef.current.load()

          // Wait for audio to load then sync time
          const handleCanPlay = () => {
            if (audioRef.current && socketCurrentTime > 0) {
              audioRef.current.currentTime = socketCurrentTime
            }
            audioRef.current?.removeEventListener('canplay', handleCanPlay)
            syncingRef.current = false
          }

          audioRef.current.addEventListener('canplay', handleCanPlay)
        } else {
          syncingRef.current = false
        }
      }

      // Sync playing state
      if (playerIsPlaying !== isPlaying && !isUserInteractionRef.current) {
        if (isPlaying && !playerIsPlaying) {
          play()
        } else if (!isPlaying && playerIsPlaying) {
          pause()
        }

        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.play().catch(console.error)
          } else {
            audioRef.current.pause()
          }
        }
      }

      // Sync time if difference is significant (more than 2 seconds)
      if (audioRef.current && Math.abs(audioRef.current.currentTime - socketCurrentTime) > 2 && !syncingRef.current) {
        syncingRef.current = true
        audioRef.current.currentTime = socketCurrentTime
        setTimeout(() => {
          syncingRef.current = false
        }, 500)
      }
    }
  }, [currentSong, isPlaying, socketCurrentTime, playerCurrentSong, playerIsPlaying, setQueue, play, pause, audioRef])

  // Handle audio element events for better sync
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    const handlePlay = () => {
      if (!isUserInteractionRef.current) return
      isUserInteractionRef.current = false

      if (!playerIsPlaying) {
        play()
        socketTogglePlayPause(true, audio.currentTime)
      }
    }

    const handlePause = () => {
      if (!isUserInteractionRef.current) return
      isUserInteractionRef.current = false

      if (playerIsPlaying) {
        pause()
        socketTogglePlayPause(false, audio.currentTime)
      }
    }

    const handleSeeked = () => {
      if (!isUserInteractionRef.current) return

      const currentTime = audio.currentTime
      socketSyncTime(currentTime)

      setTimeout(() => {
        isUserInteractionRef.current = false
      }, 1000)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('seeked', handleSeeked)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('seeked', handleSeeked)
    }
  }, [audioRef, socketCurrentTime, playerIsPlaying, socketTogglePlayPause, socketSyncTime])

  const getRoomDetails = useCallback(async () => {
    if (!roomId) return

    try {
      const response = await fetch(`/api/room/getRoom?roomId=${roomId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch room details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      const dateString = data.room.createdAt as string;
      // Convert it to a format Date understands (MM/DD/YYYY hh:mm:ss am/pm)
      const parts = dateString.split(", ");
      const [day, month, year] = parts[0].split("/").map(Number);
      const time = parts[1];
      // Create a valid date string in MM/DD/YYYY format
      const formattedDate = `${month}/${day}/${year}, ${time}`;

      const RoomData: RoomDetails = {
        id: data.room.id as string,
        name: data.room.roomName,
        description: "A place for relaxing music and good conversations",
        host: data.room.hostId,
        createdAt: formattedDate,
        isActive: true,
      }

      setRoomDetails(RoomData)

    } catch (error) {
      console.error('Error fetching room details:', error)
      setLoading(false)
    }
  }, [roomId])

  const searchSongs = async (query: string) => {
    if (!query.trim() || query.length === 0) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)

    try {
      const token = localStorage.getItem('token')
      const requestBody = { query }

      const response = await fetch(`/api/dashboard/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Search API failed: ${response.status} ${response.statusText}`)
      }

      let processedResults: Song[] = []

      if (data.songs && Array.isArray(data.songs)) {
        processedResults = data.songs.slice(0, 5).map((item: any, index: number) => ({
          id: item.id,
          title:
            item.title?.replaceAll("&quot;", `"`) ||
            item.name?.replaceAll("&quot;", `"`) ||
            'Unknown Title',
          artist: item.artist || item.subtitle || 'Unknown Artist',
          duration: item?.more_info?.duration
            ? `${Math.floor(item.more_info.duration / 60)}:${String(item.more_info.duration % 60).padStart(2, '0')}`
            : '0:00',
          album: item.more_info?.album || '',
          thumbnail: (item.thumbnail || item.image || '')
            .replace('http://', 'https://')
            .replace('150x150', '500x500'),
        }));
      }

      setSearchResults(processedResults)

    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchSongs(query)
    }, 500),
    []
  )

  const getSongUrl = async (song: Song) => {
    setSongUrlLoading(song.id.toString())

    try {
      const token = localStorage.getItem('token')
      const requestBody = { id: song.id }

      const response = await fetch(`/api/dashboard/getSongUrl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Song URL API failed: ${response.status} ${response.statusText}`)
      }

      const updatedSong = {
        ...song,
        url: data.data[0].downloadUrl[4].url.replaceAll("http://", "https://")
      }

      // Mark as user interaction to prevent circular updates
      isUserInteractionRef.current = true

      // Convert to player song format and set in player context
      const playerSong = convertToPlayerSong(updatedSong)
      setQueue([playerSong], 0)
      await play()

      // Use socket to sync with other users
      socketPlaySong(updatedSong)

    } catch (error) {
      console.error('Error getting song URL:', error)
      // Even if URL fetch fails, we can still "play" the song (UI state)
      isUserInteractionRef.current = true
      socketPlaySong(song)
    } finally {
      setSongUrlLoading(null)
    }
  }

  const handleSongClick = async (song: Song) => {
    if (song.url) {
      // Mark as user interaction
      isUserInteractionRef.current = true

      // Convert to player song format and set in player context
      const playerSong = convertToPlayerSong(song)
      setQueue([playerSong], 0)
      await play()

      // Also sync with socket
      socketPlaySong(song)
    } else {
      getSongUrl(song)
    }
  }

  const togglePlayPause = async () => {
    // Mark as user interaction
    isUserInteractionRef.current = true

    const newPlayingState = !isPlaying
    const currentTime = audioRef.current?.currentTime || 0

    // Update player context
    if (newPlayingState && !playerIsPlaying) {
      await play()
    } else if (!newPlayingState && playerIsPlaying) {
      pause()
    }

    // Sync with socket
    socketTogglePlayPause(newPlayingState, currentTime)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim()) {
      debouncedSearch(value)
    } else {
      setSearchResults([])
      setSearchLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      socketSendMessage(chatMessage)
      setChatMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    getRoomDetails().finally(() => setLoading(false));

    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    // Join the socket room
    const user = {
      id: userData.id,
      name: userData.name || `User ${Date.now()}`,
    }
    joinRoom(roomId, user);

  }, [roomId, getRoomDetails, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
      syncingRef.current = false
      isUserInteractionRef.current = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          Loading room...
        </div>
      </div>
    )
  }

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Room not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{roomDetails.name}</h1>
              <p className="text-gray-300 mb-1">{roomDetails.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <User size={16} />
                  Host: {roomDetails.host}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  Created: {new Date(roomDetails.createdAt).toLocaleDateString()}
                </span>
                <span className={`flex items-center gap-1 ${roomDetails.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${roomDetails.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  {roomDetails.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <Users size={20} />
                Participants ({participants.length})
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <MessageCircle size={20} />
                Group Chat
                {messages.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {messages.length}
                  </span>
                )}
              </button>
              <button onClick={() => { window.location.pathname = `/dashboard/room` }} className='flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors'>
                <LogOut size={20} />
                Leave Room

              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Song Player */}
          {(currentSong || playerCurrentSong) && (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Music size={24} />
                Now Playing (Synced)
                {(isPlaying || playerIsPlaying) && (
                  <span className="text-green-400 text-sm">● Live</span>
                )}
                {syncingRef.current && (
                  <span className="text-yellow-400 text-sm">⟳ Syncing</span>
                )}
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {(currentSong?.thumbnail || playerCurrentSong?.image) ? (
                    <img
                      src={currentSong?.thumbnail || playerCurrentSong?.image}
                      alt={currentSong?.title || playerCurrentSong?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">
                    {currentSong?.title || playerCurrentSong?.name}
                  </h4>
                  <p className="text-gray-400">
                    {currentSong?.artist || playerCurrentSong?.artist}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentSong?.album}
                  </p>
                  {(currentSong?.url || playerCurrentSong?.url) && (
                    <p className="text-xs text-green-400 mt-1">🔗 Stream ready</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Sync time: {Math.floor(socketCurrentTime)}s
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    {(isPlaying || playerIsPlaying) ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <SkipForward size={20} />
                  </button>
                  <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <Volume2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Song Search */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search size={24} />
              Search Songs
              {searchLoading && <Loader2 className="animate-spin" size={20} />}
            </h3>
            <div className="relative mb-4">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for songs, artists, or albums..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={searchLoading}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" size={20} />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm text-gray-400 mb-3">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </h4>
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer group"
                    onClick={() => handleSongClick(song)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                        {song.thumbnail ? (
                          <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium group-hover:text-purple-300 transition-colors">{song.title}</h4>
                        <p className="text-sm text-gray-400">{song.artist} • {song.album}</p>
                        {song.url && (
                          <p className="text-xs text-green-400">Ready to play</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{song.duration}</span>
                      <button className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors group-hover:scale-110">
                        {songUrlLoading === song.id.toString() ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {searchQuery.trim() && !searchLoading && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Music size={48} className="mx-auto mb-4 opacity-50" />
                <p>No songs found for "{searchQuery}"</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}

            {/* Search Loading State */}
            {searchLoading && (
              <div className="text-center py-8 text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                <p>Searching for songs...</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants Panel */}
          {showParticipants && (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={24} />
                Participants ({participants.length})
              </h3>
              <div className="space-y-3">
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 bg-green-400"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-xs text-gray-400">Online</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No participants yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={24} />
                Group Chat
              </h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className="p-2 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-purple-300">{message.user.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200">{message.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400 text-center py-4">Start a conversation...</div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm flex items-center gap-1"
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Room Stats */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Room Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Online Members</span>
                <span className="font-semibold">{participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Members</span>
                <span className="font-semibold">{participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Messages</span>
                <span className="font-semibold">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Search Results</span>
                <span className="font-semibold">{searchResults.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connection</span>
                <span className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Player Status</span>
                <span className={`font-semibold ${playerIsPlaying ? 'text-green-400' : 'text-gray-400'}`}>
                  {playerIsPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDashboard
