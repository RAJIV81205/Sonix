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

// Interfaces for Artist and Song
interface ArtistImage {
    url: string;
}

interface Artist {
    image: ArtistImage[];
    name: string;
    isVerified: boolean;
    dominantType: string;
    dominantLanguage: string;
    followerCount: number;
    fanCount: number;
    dob?: string;
    wiki?: string;
    topSongs?: Song[];
    availableLanguages?: string[];
    fb?: string;
    twitter?: string;
}

interface SongArtist {
    name: string;
}

interface Song {
    id: string;
    name: string;
    image: ArtistImage[];
    duration: number;
    artists?: {
        primary?: SongArtist[];
    };
    year?: string;
    url:string;
}

const ArtistPage = () => {
    const [artist, setArtist] = useState<Artist | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const param = useParams().id
    const { setCurrentSong } = usePlayer()

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                setIsLoading(true)
                const response = await fetch(`https://saavn.dev/api/artists/${param}?songCount=100`)

                if (!response.ok) {
                    throw new Error("Failed to fetch artist data")
                }

                const data = await response.json()
                setArtist(data.data)

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

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const handlePlayPause = (song: Song) => {
        if (currentPlaying === song.id) {
            setIsPlaying(!isPlaying)
        } else {
            setCurrentPlaying(song.id)
            setIsPlaying(true)
        }
    }

    if (isLoading) {
        return <SkeletonLoader />
    }

    if (!artist) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Artist not found</h1>
                    <p className="text-gray-300">The artist you're looking for doesn't exist or has been removed.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black/50 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Artist Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 mb-12">
                    <div className="relative group">
                        <img
                            src={artist.image[2]?.url || artist.image[1]?.url}
                            alt={artist.name}
                            className="w-72 h-72 rounded-2xl shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="flex-1">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-purple-600 rounded-full text-sm font-medium mb-4">
                                {artist.isVerified ? 'Verified Artist' : 'Artist'}
                            </span>
                            <h1 className="text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                {artist.name}
                            </h1>
                            <p className="text-xl text-gray-300 capitalize mb-4">
                                {artist.dominantType} • {artist.dominantLanguage}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-gray-300 mb-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{formatFollowers(artist.followerCount)} followers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                <span>{formatFollowers(artist.fanCount)} fans</span>
                            </div>
                            {artist.dob && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Born {artist.dob}</span>
                                </div>
                            )}
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
                            {artist.wiki && (
                                <a
                                    href={artist.wiki}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 border border-gray-600 hover:border-gray-400 rounded-full transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Songs Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Music className="w-6 h-6 text-purple-400" />
                        <h2 className="text-2xl font-bold">Top Songs</h2>
                    </div>

                    <div className="space-y-2">
                        {artist.topSongs?.map((song: Song, index: number) => (
                            <div
                                key={song.id}
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                                onClick={() => handlePlayPause(song)}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="relative">
                                        <img
                                            src={song.image[1]?.url || song.image[0]?.url}
                                            alt={song.name}
                                            className="w-16 h-16 rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            {currentPlaying === song.id && isPlaying ? (
                                                <Pause className="w-6 h-6 text-white" />
                                            ) : (
                                                <Play className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            {song.name}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {song.artists?.primary?.map((artist: SongArtist) => artist.name).join(', ')} • {song.year}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-400">
                                    {formatDuration(song.duration)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available Languages */}
                {artist.availableLanguages && artist.availableLanguages.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4">Available Languages</h3>
                        <div className="flex flex-wrap gap-2">
                            {artist.availableLanguages.map((lang: string) => (
                                <span
                                    key={lang}
                                    className="px-3 py-1 bg-gray-800 rounded-full text-sm capitalize"
                                >
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Social Links */}
                <div className="flex gap-4 justify-center pt-8 border-t border-gray-800">
                    {artist.fb && (
                        <a
                            href={artist.fb}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Facebook
                        </a>
                    )}
                    {artist.twitter && (
                        <a
                            href={artist.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Twitter
                        </a>
                    )}
                    {artist.wiki && (
                        <a
                            href={artist.wiki}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Wikipedia
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ArtistPage