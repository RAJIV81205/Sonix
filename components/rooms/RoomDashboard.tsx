"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Search, Play, Pause, SkipForward, Volume2, Users, MessageCircle, Music, Clock, User, Loader2 } from 'lucide-react'

// Type definitions
type Participant = {
  id: number
  name: string
  role: "host" | "member"
  avatar: string
  isOnline: boolean
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

const RoomDashboard = () => {
  const params = useParams()
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [songUrlLoading, setSongUrlLoading] = useState<string | null>(null)

  const getRoomDetails = async () => {
    const id = params.id as string
    if (!id) return

    try {
      console.log('🔍 Fetching room details for ID:', id)
      const response = await fetch(`/api/room/getRoom?roomId=${id}`)

      console.log('📡 Room API Response Status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch room details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Room API Response Data:', data)

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
        isActive: true
      }

      console.log('✅ Processed Room Data:', RoomData)
      setRoomDetails(RoomData)

    } catch (error) {
      console.error('❌ Error fetching room details:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        console.log('🚀 Starting room dashboard initialization...')

        const mockParticipants: Participant[] = [
          { id: 1, name: "John Doe", role: "host", avatar: "JD", isOnline: true },
          { id: 2, name: "Jane Smith", role: "member", avatar: "JS", isOnline: true },
          { id: 3, name: "Mike Johnson", role: "member", avatar: "MJ", isOnline: false },
          { id: 4, name: "Sarah Wilson", role: "member", avatar: "SW", isOnline: true }
        ]

        setParticipants(mockParticipants)
        await getRoomDetails()
        setLoading(false)
        console.log('✅ Room dashboard initialized successfully')
      } catch (error) {
        console.error('❌ Error initializing room dashboard:', error)
        setLoading(false)
      }
    }

    if (params.id) {
      fetchRoomDetails()
    }
  }, [params, params.id])

  const searchSongs = async (query: string) => {
    if (!query.trim()) {
      console.log('🔍 Empty search query, clearing results')
      setSearchResults([])
      return
    }

    console.log('🎵 Starting song search for query:', query)
    setSearchLoading(true)

    try {
      const token = localStorage.getItem('token')
      console.log('🔑 Auth token exists:', !!token)

      const requestBody = { query }
      console.log('📤 Search API Request Body:', requestBody)

      const response = await fetch(`/api/dashboard/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📡 Search API Response Status:', response.status)
      console.log('📡 Search API Response Headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('📦 Search API Response Data:', data)

      if (!response.ok) {
        throw new Error(data.error || `Search API failed: ${response.status} ${response.statusText}`)
      }

      // Process the search results based on your API response structure
      let processedResults: Song[] = []

      if (data.songs && Array.isArray(data.songs)) {
        processedResults = data.songs.map((item: any, index: number) => ({
          id: item.id || index,
          title: item.title || item.name || 'Unknown Title',
          artist: item.artist || item.subtitle || 'Unknown Artist',
          duration: item?.more_info?.duration
            ? `${Math.floor(item.more_info.duration / 60)}:${String(item.more_info.duration % 60).padStart(2, '0')}`
            : '0:00',

          album: item.album || 'Unknown Album',
          thumbnail: item.thumbnail || item.image,
          url: item.url // This might be empty initially
        }))
      } else {
        console.warn('⚠️ Unexpected API response structure, using mock data')
        // Fallback to mock data for testing
        processedResults = [
          { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", album: "After Hours" },
          { id: 2, title: "Watermelon Sugar", artist: "Harry Styles", duration: "2:54", album: "Fine Line" },
          { id: 3, title: "Levitating", artist: "Dua Lipa", duration: "3:23", album: "Future Nostalgia" },
          { id: 4, title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58", album: "SOUR" }
        ]
      }

      console.log('✅ Processed search results:', processedResults)
      setSearchResults(processedResults)

    } catch (error) {
      console.error('❌ Error searching songs:', error)

      // Show user-friendly error message
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }

      setSearchResults([]) // Clear results on error

      // You might want to show a toast notification here
      // toast.error('Failed to search songs. Please try again.')

    } finally {
      setSearchLoading(false)
      console.log('🏁 Search operation completed')
    }
  }

  const getSongUrl = async (song: Song) => {
    console.log('🎵 Getting song URL for:', song.title, 'by', song.artist)
    setSongUrlLoading(song.id.toString())

    try {
      const token = localStorage.getItem('token')
      console.log('🔑 Auth token exists for song URL:', !!token)

      const requestBody = {
        songId: song.id,
        title: song.title,
        artist: song.artist
      }
      console.log('📤 Song URL API Request Body:', requestBody)

      const response = await fetch(`/api/dashboard/getSongUrl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📡 Song URL API Response Status:', response.status)

      const data = await response.json()
      console.log('📦 Song URL API Response Data:', data)

      if (!response.ok) {
        throw new Error(data.error || `Song URL API failed: ${response.status} ${response.statusText}`)
      }

      // Update the song with the URL
      const updatedSong = {
        ...song,
        url: data.url || data.songUrl || data.streamUrl
      }

      console.log('✅ Got song URL:', updatedSong.url)

      // Now play the song
      playSong(updatedSong)

    } catch (error) {
      console.error('❌ Error getting song URL:', error)

      // Even if URL fetch fails, we can still "play" the song (UI state)
      console.log('⚠️ Playing song without URL (fallback)')
      playSong(song)

    } finally {
      setSongUrlLoading(null)
      console.log('🏁 Song URL operation completed')
    }
  }

  const playSong = (song: Song) => {
    console.log('▶️ Playing song:', {
      title: song.title,
      artist: song.artist,
      hasUrl: !!song.url
    })

    setCurrentSong(song)
    setIsPlaying(true)

    if (song.url) {
      console.log('🔗 Song has URL, ready to stream:', song.url)
      // Here you would integrate with your audio player
    } else {
      console.log('⚠️ Song has no URL, playing in UI only')
    }
  }

  const handleSongClick = (song: Song) => {
    console.log('🎯 Song clicked:', song.title)

    if (song.url) {
      // Song already has URL, play directly
      playSong(song)
    } else {
      // Need to get URL first
      getSongUrl(song)
    }
  }

  const togglePlayPause = () => {
    const newState = !isPlaying
    console.log('⏯️ Toggle play/pause:', newState ? 'PLAYING' : 'PAUSED')
    setIsPlaying(newState)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          Loading room...
        </div>
      </div>
    )
  }

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
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
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Song Player */}
          {currentSong && (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Music size={24} />
                Now Playing
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {currentSong.thumbnail ? (
                    <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{currentSong.title}</h4>
                  <p className="text-gray-400">{currentSong.artist}</p>
                  <p className="text-sm text-gray-500">{currentSong.album}</p>
                  {currentSong.url && (
                    <p className="text-xs text-green-400 mt-1">🔗 Stream ready</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
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
                onChange={(e) => {
                  const value = e.target.value
                  console.log('🔤 Search input changed:', value)
                  setSearchQuery(value)
                  searchSongs(value)
                }}
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
                Participants
              </h3>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {participant.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${participant.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{participant.role}</p>
                    </div>
                  </div>
                ))}
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
                <div className="text-sm text-gray-400 text-center">Start a conversation...</div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm">
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
                <span className="font-semibold">{participants.filter(p => p.isOnline).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Members</span>
                <span className="font-semibold">{participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Songs Played</span>
                <span className="font-semibold">42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Search Results</span>
                <span className="font-semibold">{searchResults.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDashboard