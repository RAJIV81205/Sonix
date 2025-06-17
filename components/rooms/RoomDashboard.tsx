"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Search, Play, Pause, SkipForward, Volume2, Users, MessageCircle, Music, Clock, User } from 'lucide-react'

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
  createdAt: string
  isActive: boolean
}

type Song = {
  id: number
  title: string
  artist: string
  duration: string
  album: string
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

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        // Mock data
        const mockRoomData: RoomDetails = {
          id: params.id,
          name: "Chill Vibes Room",
          description: "A place for relaxing music and good conversations",
          host: "John Doe",
          createdAt: "2024-06-17T10:30:00Z",
          isActive: true
        }

        const mockParticipants: Participant[] = [
          { id: 1, name: "John Doe", role: "host", avatar: "JD", isOnline: true },
          { id: 2, name: "Jane Smith", role: "member", avatar: "JS", isOnline: true },
          { id: 3, name: "Mike Johnson", role: "member", avatar: "MJ", isOnline: false },
          { id: 4, name: "Sarah Wilson", role: "member", avatar: "SW", isOnline: true }
        ]

        setRoomDetails(mockRoomData)
        setParticipants(mockParticipants)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching room details:', error)
        setLoading(false)
      }
    }

    if (params.id) {
      fetchRoomDetails()
    }
  }, [params, params.id])

  const searchSongs = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Mock search results
    const mockResults: Song[] = [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", album: "After Hours" },
      { id: 2, title: "Watermelon Sugar", artist: "Harry Styles", duration: "2:54", album: "Fine Line" },
      { id: 3, title: "Levitating", artist: "Dua Lipa", duration: "3:23", album: "Future Nostalgia" },
      { id: 4, title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58", album: "SOUR" }
    ]

    setSearchResults(mockResults)
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    console.log('Playing song:', song)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading room...</div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black  text-white">
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
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Music size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{currentSong.title}</h4>
                  <p className="text-gray-400">{currentSong.artist}</p>
                  <p className="text-sm text-gray-500">{currentSong.album}</p>
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
            </h3>
            <div className="relative mb-4">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchSongs(e.target.value)
                }}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    onClick={() => playSong(song)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Music size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium">{song.title}</h4>
                        <p className="text-sm text-gray-400">{song.artist} • {song.album}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{song.duration}</span>
                      <button className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                ))}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDashboard