"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Play,
    Pause,
    Heart,
    Share2,
    Music,
    MoreVertical,
    Shuffle,
    ListPlus,
    ArrowUp,
    Download,
    Trash2,
    Users,
    Clock
} from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'

// Animation variants - matching ArtistPage
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
}

const fadeInLeft = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
}

const fadeInRight = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5 }
}

// Skeleton Loader matching ArtistPage style
const SkeletonLoader = () => (
    <motion.div
        className="min-h-screen bg-black py-20 lg:py-0 text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
            {/* Header Skeleton */}
            <div className="flex flex-col items-center lg:flex-row lg:items-start gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
                {/* Playlist Image Skeleton */}
                <motion.div
                    className="w-40 h-40 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-gray-700 rounded-2xl animate-pulse mx-auto lg:mx-0 flex-shrink-0"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                />

                {/* Playlist Info Skeleton */}
                <div className="flex-1 space-y-3 sm:space-y-4 w-full text-center lg:text-left">
                    {/* Type Badge */}
                    <motion.div
                        className="h-6 sm:h-7 bg-gray-700 rounded-full animate-pulse w-20 sm:w-24 mx-auto lg:mx-0"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    />

                    {/* Playlist Name */}
                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="h-6 xs:h-7 sm:h-8 md:h-10 lg:h-12 bg-gray-700 rounded-lg animate-pulse w-full max-w-xs mx-auto lg:mx-0" />
                        <div className="h-4 xs:h-5 sm:h-6 bg-gray-700 rounded animate-pulse w-3/4 max-w-sm mx-auto lg:mx-0" />
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 md:gap-6 justify-center lg:justify-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded animate-pulse" />
                            <div className="h-3 sm:h-4 bg-gray-700 rounded animate-pulse w-16 sm:w-20" />
                        </div>
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded animate-pulse" />
                            <div className="h-3 sm:h-4 bg-gray-700 rounded animate-pulse w-16 sm:w-20" />
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 items-center justify-center lg:justify-start pt-2 sm:pt-4"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div
                            className="h-9 sm:h-10 md:h-12 bg-gray-700 rounded-full animate-pulse w-20 xs:w-24 sm:w-28 md:w-32"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        />
                        <motion.div
                            className="h-9 sm:h-10 md:h-12 bg-gray-700 rounded-full animate-pulse w-16 xs:w-18 sm:w-20 md:w-24"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Songs Section Skeleton */}
            <motion.div
                className="space-y-3 sm:space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                <motion.div
                    className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-600 rounded animate-pulse" />
                    <div className="h-5 sm:h-6 md:h-8 bg-gray-700 rounded animate-pulse w-24 sm:w-32 md:w-48" />
                </motion.div>

                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="flex items-center gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg animate-pulse transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.2 + (i * 0.1) }}
                    >
                        <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-700 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-1 xs:space-y-1.5 sm:space-y-2 min-w-0">
                            <div className="h-3 xs:h-3.5 sm:h-4 bg-gray-700 rounded w-full max-w-[200px] sm:max-w-[300px]" />
                            <div className="h-2 xs:h-2.5 sm:h-3 bg-gray-700 rounded w-3/4 max-w-[150px] sm:max-w-[200px]" />
                        </div>
                        <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 flex-shrink-0">
                            <div className="h-2.5 xs:h-3 sm:h-3.5 bg-gray-700 rounded w-8 xs:w-10 sm:w-12 hidden xs:block" />
                            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gray-700 rounded-full" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="h-20 sm:h-0" />
        </div>
    </motion.div>
)

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
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Isolated context state to prevent re-renders
    const [currentSongId, setCurrentSongId] = useState<string | null>(null)
    const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState<boolean>(false)

    const {
        currentSong,
        isPlaying,
        setQueue,
        addToQueue,
        addToNext,
        playAlbum,
        shufflePlay,
        play
    } = usePlayer()

    // Update isolated state when context changes
    useEffect(() => {
        setCurrentSongId(currentSong?.id || null)
        setIsCurrentlyPlaying(isPlaying)
    }, [currentSong?.id, isPlaying])

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

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                openMenuId !== null
            ) {
                setOpenMenuId(null)
            }
        }

        if (openMenuId) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('touchstart', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
        }
    }, [openMenuId])

    // Memoized handlers
    const handlePlaySong = useCallback(async (song: Song, index: number) => {
        if (playlist) {
            setQueue(playlist.songs, index)
            await play()
        }
    }, [playlist, setQueue, play])

    const handlePlayAll = useCallback(async () => {
        if (playlist && playlist.songs.length > 0) {
            playAlbum(playlist.songs, 0)
        }
    }, [playlist, playAlbum])

    const handleShufflePlay = useCallback(async () => {
        if (playlist && playlist.songs.length > 0) {
            shufflePlay(playlist.songs)
        }
    }, [playlist, shufflePlay])

    const handleAddToQueue = useCallback((song: Song, e: React.MouseEvent) => {
        e.stopPropagation()
        addToQueue(song)
        toast.success(`"${song.name}" added to queue`)
        setOpenMenuId(null)
    }, [addToQueue])

    const handlePlayNext = useCallback((song: Song, e: React.MouseEvent) => {
        e.stopPropagation()
        addToNext(song)
        toast.success(`"${song.name}" will play next`)
        setOpenMenuId(null)
    }, [addToNext])

    const handleRemoveSong = useCallback(async (songId: string, e: React.MouseEvent) => {
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
                return
            }

            const data = await response.json()
            toast.success(data.message)

            setPlaylist({
                ...playlist,
                songs: playlist.songs.filter(song => song.id !== songId)
            })

            setOpenMenuId(null)
        } catch (error) {
            console.error('Error removing song:', error)
            toast.error('Failed to remove song')
        }
    }, [playlist])

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }, [])

    const formatTotalDuration = useCallback((totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }, [])

    // Context Menu Component
    const ContextMenu = useCallback(({ song, isOpen }: { song: Song, isOpen: boolean }) => (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl min-w-[180px] sm:min-w-[200px] overflow-hidden"
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                    }}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ zIndex: 9999 }}
                >
                    <motion.div
                        className="py-2"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {[
                            {
                                icon: Play,
                                label: "Play Now",
                                action: (e: React.MouseEvent) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    const index = playlist?.songs.findIndex(s => s.id === song.id) || 0
                                    handlePlaySong(song, index)
                                    setOpenMenuId(null)
                                }
                            },
                            {
                                icon: ArrowUp,
                                label: "Play Next",
                                action: (e: React.MouseEvent) => handlePlayNext(song, e)
                            },
                            {
                                icon: ListPlus,
                                label: "Add to Queue",
                                action: (e: React.MouseEvent) => handleAddToQueue(song, e)
                            },
                            {
                                icon: Trash2,
                                label: "Remove from Playlist",
                                action: (e: React.MouseEvent) => handleRemoveSong(song.id, e)
                            }
                        ].map((item, index) => (
                            <motion.button
                                key={item.label}
                                onClick={item.action}
                                className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-white transition-colors focus:outline-none hover:bg-gray-700 focus:bg-gray-700 ${item.label.includes('Remove') ? 'text-red-400' : ''
                                    }`}
                                variants={fadeInLeft}
                                custom={index}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </motion.button>
                        ))}

                        <motion.div
                            className="border-t border-gray-700 my-1"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3 }}
                        />

                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                toast.success("Added to favorites")
                                setOpenMenuId(null)
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-700"
                            variants={fadeInLeft}
                            custom={4}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Heart className="w-4 h-4" />
                            Add to Favorites
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    ), [playlist, handlePlaySong, handlePlayNext, handleAddToQueue, handleRemoveSong])

    if (loading) {
        return <SkeletonLoader />
    }

    if (error) {
        return (
            <motion.div
                className="min-h-screen bg-black text-white flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="text-center"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                >
                    <h1 className="text-xl sm:text-2xl font-bold mb-4">Error Loading Playlist</h1>
                    <p className="text-gray-300 text-sm sm:text-base">{error}</p>
                </motion.div>
            </motion.div>
        )
    }

    if (!playlist) {
        return (
            <motion.div
                className="min-h-screen bg-black text-white flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="text-center"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                >
                    <h1 className="text-xl sm:text-2xl font-bold mb-4">Playlist not found</h1>
                    <p className="text-gray-300 text-sm sm:text-base">The playlist you're looking for doesn't exist or has been removed.</p>
                </motion.div>
            </motion.div>
        )
    }

    const totalDuration = playlist.songs.reduce((total, song) => total + song.duration, 0)

    return (
        <motion.div
            className="min-h-screen bg-black py-20 lg:py-0 text-white overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                {/* Playlist Header - matching ArtistPage design */}
                <motion.div
                    className="flex flex-col lg:flex-row items-start lg:items-end gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div
                        className="relative group mx-auto lg:mx-0"
                        variants={scaleIn}
                    >
                        <motion.div
                            className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-2xl shadow-2xl overflow-hidden transition-transform duration-500 group-hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {playlist.cover ? (
                                <img
                                    src={playlist.cover}
                                    alt={playlist.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                                    <Music className="w-24 h-24 text-white opacity-75" />
                                </div>
                            )}
                        </motion.div>
                        <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </motion.div>

                    <motion.div
                        className="flex-1 w-full text-center lg:text-left"
                        variants={fadeInRight}
                    >
                        <div className="mb-4">
                            <motion.span
                                className="inline-block px-3 py-1 bg-purple-600 rounded-full text-xs sm:text-sm font-medium mb-4"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                            >
                                Playlist
                            </motion.span>
                            <motion.h1
                                className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                            >
                                {playlist.name}
                            </motion.h1>
                        </div>

                        <motion.div
                            className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 text-sm text-gray-300 mb-6 justify-center lg:justify-start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.6 }}
                        >
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Music className="w-4 h-4" />
                                <span>{playlist.songs.length} songs</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Clock className="w-4 h-4" />
                                <span>{formatTotalDuration(totalDuration)}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Users className="w-4 h-4" />
                                <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center lg:justify-start"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {playlist.songs.length > 0 && (
                                <>
                                    <motion.button
                                        onClick={handlePlayAll}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all text-sm sm:text-base"
                                        variants={scaleIn}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">Play All</span>
                                    </motion.button>

                                    <motion.button
                                        onClick={handleShufflePlay}
                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-all text-sm sm:text-base"
                                        variants={scaleIn}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">Shuffle</span>
                                    </motion.button>
                                </>
                            )}

                            <motion.button
                                onClick={() => toast.success("Added to favorites")}
                                className="p-2.5 sm:p-3 border border-gray-600 hover:border-gray-400 rounded-full transition-colors"
                                variants={scaleIn}
                                whileHover={{ scale: 1.1, borderColor: '#9CA3AF' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>

                            <motion.button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: playlist.name,
                                            text: `Check out this playlist: ${playlist.name}`
                                        })
                                    } else {
                                        navigator.clipboard.writeText(window.location.href)
                                        toast.success("Link copied to clipboard")
                                    }
                                }}
                                className="p-2.5 sm:p-3 border border-gray-600 hover:border-gray-400 rounded-full transition-colors"
                                variants={scaleIn}
                                whileHover={{ scale: 1.1, borderColor: '#9CA3AF' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Songs Section - matching ArtistPage design */}
                {playlist.songs.length > 0 ? (
                    <motion.div
                        className="mb-8 sm:mb-12"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.8 }}
                    >
                        <motion.div
                            className="flex items-center gap-3 mb-4 sm:mb-6"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.5, duration: 0.6 }}
                        >
                            <h2 className="text-xl sm:text-2xl font-bold">Songs</h2>
                        </motion.div>

                        <motion.div
                            className="space-y-2"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {playlist.songs.map((song: Song, index: number) => {
                                const isCurrentlyPlayingTrack = currentSongId === song.id && isCurrentlyPlaying

                                return (
                                    <motion.div
                                        key={song.id}
                                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors group cursor-pointer relative ${openMenuId === song.id ? 'bg-white/5' : 'hover:bg-white/5'
                                            }`}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{ x: openMenuId === song.id ? 0 : 4 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div
                                            className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0"
                                            onClick={() => handlePlaySong(song, index)}
                                        >
                                            <motion.div
                                                className="relative shrink-0"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <img
                                                    src={song.image}
                                                    alt={song.name}
                                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                                                />
                                                <motion.div
                                                    className={`absolute inset-0 bg-black/50 rounded-lg transition-opacity flex items-center justify-center ${openMenuId === song.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                                                        }`}
                                                >
                                                    {isCurrentlyPlayingTrack ? (
                                                        <Pause className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                                    ) : (
                                                        <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                                    )}
                                                </motion.div>
                                            </motion.div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate text-sm sm:text-base">
                                                    {song.name.replaceAll("&quot;", `"`)}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-400 truncate">
                                                    {song.artist.replaceAll("&quot;", `"`)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                            <div className="text-xs sm:text-sm text-gray-400 hidden xs:block">
                                                {formatDuration(song.duration)}
                                            </div>

                                            <div className="relative">
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                        setOpenMenuId(openMenuId === song.id ? null : song.id)
                                                    }}
                                                    className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full transition-all focus:outline-none relative z-10"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </motion.button>

                                                <ContextMenu
                                                    song={song}
                                                    isOpen={openMenuId === song.id}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.8 }}
                    >
                        <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No songs yet</h3>
                        <p className="text-gray-500">Your playlist is empty. Add some songs to get started!</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

export default PlaylistPage
