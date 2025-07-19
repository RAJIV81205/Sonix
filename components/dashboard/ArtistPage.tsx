"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Play, Pause, Heart, Share2, ExternalLink, Calendar, Users, Music } from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'

// Skeleton Components
const SkeletonLoader = () => (
    <div className="min-h-screen bg-black/50 text-white">
        <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 mb-12">
                <div className="w-72 h-72 bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="flex-1 space-y-4">
                    <div className="h-12 bg-gray-700 rounded-lg animate-pulse w-3/4"></div>
                    <div className="h-6 bg-gray-700 rounded animate-pulse w-1/2"></div>
                    <div className="flex gap-6">
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <div className="h-12 bg-gray-700 rounded-full animate-pulse w-32"></div>
                        <div className="h-12 bg-gray-700 rounded-full animate-pulse w-12"></div>
                        <div className="h-12 bg-gray-700 rounded-full animate-pulse w-12"></div>
                    </div>
                </div>
            </div>

            {/* Songs Skeleton */}
            <div className="space-y-4">
                <div className="h-8 bg-gray-700 rounded animate-pulse w-48 mb-6"></div>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg animate-pulse">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

// Interfaces matching the actual Spotify API response
interface SpotifyImage {
    url: string
    height: number
    width: number
}

interface SpotifyArtist {
    external_urls: {
        spotify: string
    }
    followers: {
        href: string | null
        total: number
    }
    genres: string[]
    href: string
    id: string
    images: SpotifyImage[]
    name: string
    popularity: number
    type: string
    uri: string
}

interface SpotifyTrackArtist {
    external_urls: {
        spotify: string
    }
    href: string
    id: string
    name: string
    type: string
    uri: string
}

interface SpotifyAlbum {
    album_type: string
    artists: SpotifyTrackArtist[]
    available_markets: string[]
    external_urls: {
        spotify: string
    }
    href: string
    id: string
    images: SpotifyImage[]
    name: string
    release_date: string
    release_date_precision: string
    total_tracks: number
    type: string
    uri: string
}

interface SpotifyTrack {
    album: SpotifyAlbum
    artists: SpotifyTrackArtist[]
    available_markets: string[]
    disc_number: number
    duration_ms: number
    explicit: boolean
    external_ids: {
        isrc: string
    }
    external_urls: {
        spotify: string
    }
    href: string
    id: string
    is_local: boolean
    is_playable: boolean
    name: string
    popularity: number
    preview_url: string | null
    track_number: number
    type: string
    uri: string
}

interface ApiResponse {
    artist: SpotifyArtist
    topTracks: SpotifyTrack[]
}

const ArtistPage = () => {
    const [artistData, setArtistData] = useState<ApiResponse | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
    const param = useParams().id
    const { setCurrentSong, setIsPlaying, isPlaying } = usePlayer()

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                setIsLoading(true)
                const token = localStorage.getItem('token')
                const response = await fetch(`/api/spotify/artist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ artistId: param })
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch artist data")
                }

                const data = await response.json()
                console.log("Fetched artist data:", data)
                setArtistData(data)

            } catch (error: unknown) {
                const errMsg = error instanceof Error ? error.message : String(error)
                console.error("Error fetching artist:", errMsg)
                toast.error("Error fetching artist: " + errMsg)
            } finally {
                setIsLoading(false)
            }
        }

        fetchArtist()
    }, [param])

    const formatFollowers = (count: number | undefined) => {
        if (!count) return '0'
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M'
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K'
        }
        return count?.toString()
    }

    const formatDuration = (durationMs: number) => {
        const totalSeconds = Math.floor(durationMs / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }


    const getSongId = async (name: string) => {
        try {
            const response = await fetch(`/api/dashboard/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ query: name })
            })

            if (!response.ok) {
                throw new Error("Failed to get song ID")
            }

            const data = await response.json()
            return data.songs[0].id

        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error)
            console.error("Error getting song ID:", errMsg)
            toast.error("Error getting song ID: " + errMsg)
        }
    }


    const getSong = async (id: string) => {
        try {
            const response = await fetch(`/api/dashboard/getSongUrl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id })
            })

            if (!response.ok) {
                throw new Error("Failed to get song data")
            }

            const data = await response.json()
            return data.data[0]

        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error)
            console.error("Error getting song:", errMsg)
            toast.error("Error getting song: " + errMsg)
        }
    }



    const PlaySong = async (track: SpotifyTrack) => {
        const name = `${track.name} - ${artist.name}`
        const id = await getSongId(name)
        const songData = await getSong(id)
        const song = {
            id: songData.id,
            name: songData.name,
            artist: songData.artists?.primary[0]?.name || 'Unknown Artist',
            image: songData.image[2]?.url ? (songData.image[2].url).replace(/^http:/, 'https:') : '',
            url: songData.downloadUrl[4]?.url ? (songData.downloadUrl[4].url).replace(/^http:/, 'https:') : '',
            duration: songData.duration || 0,

        }
        console.log(song)
        setCurrentSong(song);
        setIsPlaying(true);



    }

    if (isLoading) {
        return <SkeletonLoader />
    }

    if (!artistData || !artistData.artist) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Artist not found</h1>
                    <p className="text-gray-300">The artist you're looking for doesn't exist or has been removed.</p>
                </div>
            </div>
        )
    }

    const { artist, topTracks } = artistData

    return (
        <div className="min-h-screen bg-black/50 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Artist Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 mb-12">
                    <div className="relative group">
                        <img
                            src={artist.images[0]?.url || artist.images[1]?.url || '/placeholder-artist.jpg'}
                            alt={artist.name}
                            className="w-72 h-72 rounded-2xl shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="flex-1">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-purple-600 rounded-full text-sm font-medium mb-4">
                                Verified Artist
                            </span>
                            <h1 className="text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                {artist.name}
                            </h1>
                            {artist.genres.length > 0 && (
                                <p className="text-xl text-gray-300 capitalize mb-4">
                                    {artist.genres.slice(0, 3).join(' • ')}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-gray-300 mb-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{formatFollowers(artist.followers.total)} followers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Music className="w-4 h-4" />
                                <span>Popularity: {artist.popularity}/100</span>
                            </div>
                        </div>

                        <div className="flex gap-4 items-center">
                            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-8 py-3 rounded-full font-semibold transition-colors">
                                <Play className="w-5 h-5" />
                                Play
                            </button>
                            <button className="p-3 border border-gray-600 hover:border-gray-400 rounded-full transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-3 border border-gray-600 hover:border-gray-400 rounded-full transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <a
                                href={artist.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 border border-gray-600 hover:border-gray-400 rounded-full transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Top Songs Section */}
                {topTracks && topTracks.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Music className="w-6 h-6 text-purple-400" />
                            <h2 className="text-2xl font-bold">Top Songs</h2>
                        </div>

                        <div className="space-y-2">
                            {topTracks.map((track: SpotifyTrack, index: number) => (
                                <div
                                    key={track.id}
                                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                                    onClick={() => PlaySong(track)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="relative">
                                            <img
                                                src={track.album.images[2]?.url || track.album.images[1]?.url || track.album.images[0]?.url || '/placeholder-song.jpg'}
                                                alt={track.name}
                                                className="w-16 h-16 rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                {currentPlaying === track.id && isPlaying ? (
                                                    <Pause className="w-6 h-6 text-white" />
                                                ) : (
                                                    <Play className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                                {track.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {track.artists.map((artist: SpotifyTrackArtist) => artist.name).join(', ')} • {track.album.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-400">
                                        {formatDuration(track.duration_ms)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Genres */}
                {artist.genres && artist.genres.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                            {artist.genres.map((genre: string) => (
                                <span
                                    key={genre}
                                    className="px-3 py-1 bg-gray-800 rounded-full text-sm capitalize"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* External Links */}
                <div className="flex gap-4 justify-center pt-8 border-t border-gray-800">
                    <a
                        href={artist.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Open in Spotify
                    </a>
                </div>
            </div>
        </div>
    )
}

export default ArtistPage