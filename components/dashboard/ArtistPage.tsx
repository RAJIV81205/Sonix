"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Play,
    Pause,
    Heart,
    Share2,
    ExternalLink,
    Users,
    Music,
    MoreVertical,
    PlayCircle,
    Shuffle,
    ListPlus,
    ArrowUp,
    Download
} from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'

// Animation variants - COMPLETELY UNCHANGED
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

// SkeletonLoader - COMPLETELY UNCHANGED from your original
const SkeletonLoader = () => (
    <motion.div
        className="min-h-screen bg-black py-20 lg:py-0 text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
            {/* Header Skeleton - Mobile Optimized */}
            <div className="flex flex-col items-center lg:flex-row lg:items-start  gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
                {/* Artist Image Skeleton */}
                <motion.div
                    className="w-40 h-40 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-gray-700 rounded-2xl animate-pulse mx-auto lg:mx-0 flex-shrink-0"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                />

                {/* Artist Info Skeleton */}
                <div className="flex-1 space-y-3 sm:space-y-4 w-full text-center lg:text-left">
                    {/* Verified Badge */}
                    <motion.div
                        className="h-6 sm:h-7 bg-gray-700 rounded-full animate-pulse w-20 sm:w-24 mx-auto lg:mx-0"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    />

                    {/* Artist Name */}
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
                        {/* Play Button */}
                        <motion.div
                            className="h-9 sm:h-10 md:h-12 bg-gray-700 rounded-full animate-pulse w-20 xs:w-24 sm:w-28 md:w-32"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        />
                        {/* Shuffle Button */}
                        <motion.div
                            className="h-9 sm:h-10 md:h-12 bg-gray-700 rounded-full animate-pulse w-16 xs:w-18 sm:w-20 md:w-24"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                        />
                        {/* Icon Buttons */}
                        {[1, 2, 3].map((_, index) => (
                            <motion.div
                                key={index}
                                className="h-9 sm:h-10 md:h-12 w-9 sm:w-10 md:w-12 bg-gray-700 rounded-full animate-pulse"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1 + (index * 0.1) }}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Songs Section Skeleton - Mobile Optimized */}
            <motion.div
                className="space-y-3 sm:space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                {/* Section Title */}
                <motion.div
                    className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-600 rounded animate-pulse" />
                    <div className="h-5 sm:h-6 md:h-8 bg-gray-700 rounded animate-pulse w-24 sm:w-32 md:w-48" />
                </motion.div>

                {/* Song Items */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="flex items-center gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg animate-pulse transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.2 + (i * 0.1) }}
                    >
                        {/* Song Image */}
                        <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-700 rounded-lg flex-shrink-0" />
                        {/* Song Info */}
                        <div className="flex-1 space-y-1 xs:space-y-1.5 sm:space-y-2 min-w-0">
                            <div className="h-3 xs:h-3.5 sm:h-4 bg-gray-700 rounded w-full max-w-[200px] sm:max-w-[300px]" />
                            <div className="h-2 xs:h-2.5 sm:h-3 bg-gray-700 rounded w-3/4 max-w-[150px] sm:max-w-[200px]" />
                        </div>

                        {/* Duration & Menu */}
                        <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 flex-shrink-0">
                            {/* Duration (hidden on very small screens) */}
                            <div className="h-2.5 xs:h-3 sm:h-3.5 bg-gray-700 rounded w-8 xs:w-10 sm:w-12 hidden xs:block" />
                            {/* Menu Button */}
                            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gray-700 rounded-full" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Genres Skeleton - Mobile Optimized */}
            <motion.div
                className="mt-6 sm:mt-8 lg:mt-12 space-y-3 sm:space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.6 }}
            >
                {/* Genres Title */}
                <motion.div
                    className="h-4 sm:h-5 md:h-6 bg-gray-700 rounded animate-pulse w-16 sm:w-20 md:w-24 mx-auto sm:mx-0"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.2 }}
                />

                {/* Genre Tags */}
                <motion.div
                    className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-3 justify-center sm:justify-start"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <motion.div
                            key={index}
                            className="h-6 xs:h-7 sm:h-8 bg-gray-700 rounded-full animate-pulse"
                            style={{
                                width: `${60 + Math.random() * 40}px` // Random widths for variety
                            }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 2.4 + (index * 0.1) }}
                        />
                    ))}
                </motion.div>
            </motion.div>

            {/* External Link Skeleton - Mobile Optimized */}
            <motion.div
                className="flex gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 lg:pt-8 mt-4 sm:mt-6 lg:mt-8 border-t border-gray-800"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.8, duration: 0.6 }}
            >
                <div className="h-3 sm:h-4 bg-gray-700 rounded animate-pulse w-20 sm:w-24 md:w-32" />
            </motion.div>

            {/* Mobile Bottom Spacing */}
            <div className="h-20 sm:h-0" /> {/* Extra space for mobile navigation */}
        </div>
    </motion.div>
)

// All interfaces - UNCHANGED
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
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set())
    const [backgroundLoadingToast, setBackgroundLoadingToast] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // ONLY FIX: Isolate context values to prevent re-renders
    const [currentSongId, setCurrentSongId] = useState<string | null>(null)
    const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState<boolean>(false)

    const param = useParams().id
    const {
        currentSong,
        isPlaying,
        setQueue,
        addToQueue,
        addToNext,
        playAlbum,
        shufflePlay: contextShufflePlay,
        play
    } = usePlayer()

    // ONLY FIX: Update isolated state when context changes
    useEffect(() => {
        setCurrentSongId(currentSong?.id || null)
        setIsCurrentlyPlaying(isPlaying)
    }, [currentSong?.id, isPlaying])

    // Rest of useEffects - UNCHANGED
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

    // All utility functions - UNCHANGED
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
            throw new Error("Error getting song ID: " + errMsg)
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
            throw new Error("Error getting song: " + errMsg)
        }
    }

    const convertTrackToSong = async (track: SpotifyTrack) => {
        if (!artistData?.artist) throw new Error("Artist data not available")

        const name = `${track.name} - ${artistData.artist.name}`
        const id = await getSongId(name)
        const songData = await getSong(id)

        return {
            id: songData.id,
            name: songData.name,
            artist: songData.artists?.primary[0]?.name || 'Unknown Artist',
            image: songData.image[2]?.url ? (songData.image[2].url).replace(/^http:/, 'https:') : '',
            url: songData.downloadUrl[4]?.url ? (songData.downloadUrl[4].url).replace(/^http:/, 'https:') : '',
            duration: songData.duration || 0,
        }
    }

    // All handler functions - UNCHANGED
    const PlaySong = async (track: SpotifyTrack, index?: number) => {
        try {
            setLoadingStates(prev => new Set(prev).add(track.id))
            const song = await convertTrackToSong(track)
            console.log(song)
            
            setQueue([song], 0)
            await play()
            
        } catch (error) {
            toast.error("Failed to play song")
        } finally {
            setLoadingStates(prev => {
                const newSet = new Set(prev)
                newSet.delete(track.id)
                return newSet
            })
        }
    }

    const handleAddToQueue = async (track: SpotifyTrack) => {
        try {
            const song = await convertTrackToSong(track)
            addToQueue(song)
            toast.success(`Added "${track.name}" to queue`)
            setOpenMenuId(null)
        } catch (error) {
            toast.error("Failed to add to queue")
        }
    }

    const handlePlayNext = async (track: SpotifyTrack) => {
        try {
            const song = await convertTrackToSong(track)
            addToNext(song)
            toast.success(`"${track.name}" will play next`)
            setOpenMenuId(null)
        } catch (error) {
            toast.error("Failed to add to play next")
        }
    }

    const handlePlayAll = async () => {
        if (!topTracks || topTracks.length === 0) return

        try {
            const loadingToast = toast.loading("Loading playlist...", { duration: 2000 })

            const songsToConvert = topTracks.slice(0, 3)
            const convertedSongs = []

            for (const track of songsToConvert) {
                try {
                    const song = await convertTrackToSong(track)
                    convertedSongs.push(song)
                } catch (error) {
                    console.warn(`Failed to convert track: ${track.name}`)
                }
            }

            if (convertedSongs.length > 0) {
                toast.dismiss(loadingToast)
                playAlbum(convertedSongs, 0)
                
                if (topTracks.length > 3) {
                    convertRemainingTracksInBackground(topTracks.slice(3), convertedSongs, false)
                }
            } else {
                toast.dismiss(loadingToast)
                toast.error("Failed to load songs")
            }

        } catch (error) {
            toast.error("Failed to play songs")
            console.error("Play all error:", error)
        }
    }

    const handleShufflePlay = async () => {
        if (!topTracks || topTracks.length === 0) return

        try {
            const shuffledTracks = [...topTracks].sort(() => Math.random() - 0.5)
            const loadingToast = toast.loading("Loading shuffled playlist...", { duration: 2000 })

            const songsToConvert = shuffledTracks.slice(0, 3)
            const convertedSongs = []

            for (const track of songsToConvert) {
                try {
                    const song = await convertTrackToSong(track)
                    convertedSongs.push(song)
                } catch (error) {
                    console.warn(`Failed to convert track: ${track.name}`)
                }
            }

            if (convertedSongs.length > 0) {
                toast.dismiss(loadingToast)
                contextShufflePlay(convertedSongs)
                
                if (shuffledTracks.length > 3) {
                    convertRemainingTracksInBackground(shuffledTracks.slice(3), convertedSongs, true)
                }
            } else {
                toast.dismiss(loadingToast)
                toast.error("Failed to load songs")
            }

        } catch (error) {
            toast.error("Failed to shuffle play")
            console.error("Shuffle play error:", error)
        }
    }

    const convertRemainingTracksInBackground = async (remainingTracks: SpotifyTrack[], initialSongs: any[], isShuffled: boolean = false) => {
        const batchSize = 2
        const allSongs = [...initialSongs]

        const progressToast = toast.loading("Loading more songs...", {
            duration: Infinity,
            style: {
                background: '#1f2937',
                color: '#ffffff',
                fontSize: '12px'
            }
        })

        setBackgroundLoadingToast(progressToast)

        try {
            for (let i = 0; i < remainingTracks.length; i += batchSize) {
                const batch = remainingTracks.slice(i, i + batchSize)

                for (const track of batch) {
                    try {
                        const song = await convertTrackToSong(track)
                        allSongs.push(song)
                        addToQueue(song)
                    } catch (error) {
                        console.warn(`Failed to convert track: ${track.name}`)
                    }
                }

                if (i + batchSize < remainingTracks.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            }

            toast.dismiss(progressToast)
            toast.success(`Loaded ${allSongs.length} songs`, { duration: 2000 })

        } catch (error) {
            toast.dismiss(progressToast)
            console.error("Background conversion error:", error)
        } finally {
            setBackgroundLoadingToast(null)
        }
    }

    const downloadSong = async (track: SpotifyTrack) => {
        if (!track) {
            toast.error("No song selected to download")
            return
        }

        try {
            toast.loading("Starting download...")
            const song = await convertTrackToSong(track)

            const downloadUrl = song.url

            if (!downloadUrl) {
                toast.error("Download URL not available for this song")
                return
            }

            const response = await fetch(downloadUrl)
            if (!response.ok) {
                throw new Error('Failed to fetch audio file')
            }

            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            
            const filename = `${song.name.replaceAll("&quot;", "").replace(/[^\w\s-]/g, "").trim()} - ${song.artist.replace(/[^\w\s-]/g, "").trim()}.mp3`
            
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = filename
            link.style.display = 'none'
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl)
            }, 1000)

            toast.dismiss()
            toast.success(`"${song.name.replaceAll("&quot;", `"`)}" downloaded successfully`)
        } catch (error) {
            console.error('Download error:', error)
            toast.dismiss()
            toast.error("Failed to download song")
        } finally {
            setOpenMenuId(null)
        }
    }

    // ContextMenu component - UNCHANGED except using isolated state
    const ContextMenu = ({ track, isOpen }: { track: SpotifyTrack, isOpen: boolean }) => {
        const isTrackLoading = loadingStates.has(track.id)

        return (
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
                                    label: isTrackLoading ? "Loading..." : "Play Now",
                                    action: () => {
                                        if (!isTrackLoading) {
                                            PlaySong(track)
                                            setOpenMenuId(null)
                                        }
                                    },
                                    disabled: isTrackLoading
                                },
                                { icon: ArrowUp, label: "Play Next", action: () => handlePlayNext(track), disabled: false },
                                {
                                    icon: ListPlus, label: "Add to Queue", action: () => handleAddToQueue(track),
                                    disabled: false
                                },
                                {
                                    icon: Download, label: "Download",
                                    action: () => {
                                        downloadSong(track)
                                    }
                                }
                            ].map((item, index) => (
                                <motion.button
                                    key={item.label}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        if (!item.disabled) {
                                            item.action()
                                        }
                                    }}
                                    disabled={item.disabled}
                                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-white transition-colors focus:outline-none ${item.disabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-700 focus:bg-gray-700'
                                        }`}
                                    variants={fadeInLeft}
                                    custom={index}
                                    whileHover={item.disabled ? {} : { x: 4 }}
                                    whileTap={item.disabled ? {} : { scale: 0.95 }}
                                >
                                    {isTrackLoading && item.label.includes("Loading") ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <item.icon className="w-4 h-4" />
                                    )}
                                    {item.label}
                                </motion.button>
                            ))}

                            <motion.div
                                className="border-t border-gray-700 my-1"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.3 }}
                            />

                            {[
                                {
                                    icon: Heart,
                                    label: "Add to Favorites",
                                    action: () => {
                                        toast.success("Added to favorites")
                                        setOpenMenuId(null)
                                    }
                                },
                                {
                                    icon: Share2,
                                    label: "Share",
                                    action: () => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: track.name,
                                                text: `Check out "${track.name}" by ${track.artists[0].name}`,
                                                url: track.external_urls.spotify
                                            })
                                        } else {
                                            navigator.clipboard.writeText(track.external_urls.spotify)
                                        }
                                        toast.success("Link copied to clipboard")
                                        setOpenMenuId(null)
                                    }
                                }
                            ].map((item, index) => (
                                <motion.button
                                    key={item.label}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        item.action()
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-700"
                                    variants={fadeInLeft}
                                    custom={index + 3}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        )
    }

    if (isLoading) {
        return <SkeletonLoader />
    }

    if (!artistData || !artistData.artist) {
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
                    <h1 className="text-xl sm:text-2xl font-bold mb-4">Artist not found</h1>
                    <p className="text-gray-300 text-sm sm:text-base">The artist you're looking for doesn't exist or has been removed.</p>
                </motion.div>
            </motion.div>
        )
    }

    const { artist, topTracks } = artistData

    return (
        <motion.div
            className="min-h-screen bg-black py-20 lg:py-0 text-white overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                {/* Artist Header - COMPLETELY UNCHANGED */}
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
                        <motion.img
                            src={artist.images[0]?.url || artist.images[1]?.url || '/placeholder-artist.jpg'}
                            alt={artist.name}
                            className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-2xl shadow-2xl object-cover transition-transform duration-500 group-hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
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
                                Verified Artist
                            </motion.span>
                            <motion.h1
                                className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                            >
                                {artist.name}
                            </motion.h1>
                            {artist.genres.length > 0 && (
                                <motion.p
                                    className="text-base sm:text-xl text-gray-300 capitalize mb-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.6 }}
                                >
                                    {artist.genres.slice(0, 3).join(' • ')}
                                </motion.p>
                            )}
                        </div>

                        <motion.div
                            className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 text-sm text-gray-300 mb-6 justify-center lg:justify-start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.6 }}
                        >
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Users className="w-4 h-4" />
                                <span>{formatFollowers(artist.followers.total)} followers</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Music className="w-4 h-4" />
                                <span>Popularity: {artist.popularity}/100</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center lg:justify-start"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {[
                                {
                                    icon: Play,
                                    label: "Play",
                                    action: handlePlayAll,
                                    variant: "primary",
                                    className: "bg-green-600 hover:bg-green-700 px-6 sm:px-8"
                                },
                                {
                                    icon: Shuffle,
                                    label: "Shuffle",
                                    action: handleShufflePlay,
                                    variant: "secondary",
                                    className: "bg-purple-600 hover:bg-purple-700 px-4 sm:px-6"
                                }
                            ].map((button, index) => (
                                <motion.button
                                    key={button.label}
                                    onClick={button.action}
                                    className={`flex items-center gap-2 ${button.className} py-2.5 sm:py-3 rounded-full font-semibold transition-all text-sm sm:text-base`}
                                    variants={scaleIn}
                                    custom={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <button.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">{button.label}</span>
                                </motion.button>
                            ))}

                            {[
                                { icon: Heart, action: () => { } },
                                { icon: Share2, action: () => { } },
                                { icon: ExternalLink, href: artist.external_urls.spotify }
                            ].map((item, index) => (
                                <motion.div key={index} variants={scaleIn} custom={index + 2}>
                                    {item.href ? (
                                        <motion.a
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 sm:p-3 border border-gray-600 hover:border-gray-400 rounded-full transition-colors block"
                                            whileHover={{ scale: 1.1, borderColor: '#9CA3AF' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </motion.a>
                                    ) : (
                                        <motion.button
                                            onClick={item.action}
                                            className="p-2.5 sm:p-3 border border-gray-600 hover:border-gray-400 rounded-full transition-colors"
                                            whileHover={{ scale: 1.1, borderColor: '#9CA3AF' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Top Songs Section - ONLY ONE CHANGE: using isolated state */}
                {topTracks && topTracks.length > 0 && (
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
                            <h2 className="text-xl sm:text-2xl font-bold">Top Songs</h2>
                        </motion.div>

                        <motion.div
                            className="space-y-2"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {topTracks.map((track: SpotifyTrack, index: number) => {
                                const isTrackLoading = loadingStates.has(track.id)
                                // ONLY CHANGE: Use isolated state instead of direct context
                                const isCurrentlyPlayingTrack = currentSongId === track.id && isCurrentlyPlaying

                                return (
                                    <motion.div
                                        key={track.id}
                                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors group cursor-pointer relative ${openMenuId === track.id ? 'bg-white/5' : 'hover:bg-white/5'
                                            } ${isTrackLoading ? 'opacity-75' : ''}`}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{ x: openMenuId === track.id ? 0 : 4 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div
                                            className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0"
                                            onClick={() => !isTrackLoading && PlaySong(track)}
                                        >
                                            <motion.div
                                                className="relative shrink-0"
                                                whileHover={{ scale: isTrackLoading ? 1 : 1.05 }}
                                                whileTap={{ scale: isTrackLoading ? 1 : 0.95 }}
                                            >
                                                <img
                                                    src={track.album.images[2]?.url || track.album.images[1]?.url || track.album.images[0]?.url || '/placeholder-song.jpg'}
                                                    alt={track.name}
                                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg"
                                                />
                                                <motion.div
                                                    className={`absolute inset-0 bg-black/50 rounded-lg transition-opacity flex items-center justify-center ${isTrackLoading ? 'opacity-100' :
                                                        openMenuId === track.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                                                        }`}
                                                >
                                                    {isTrackLoading ? (
                                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : isCurrentlyPlayingTrack ? (
                                                        <Pause className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                                    ) : (
                                                        <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                                    )}
                                                </motion.div>
                                            </motion.div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate text-sm sm:text-base">
                                                    {track.name}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-400 truncate">
                                                    {track.artists.map((artist: SpotifyTrackArtist) => artist.name).join(', ')} • {track.album.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                            <div className="text-xs sm:text-sm text-gray-400 hidden xs:block">
                                                {formatDuration(track.duration_ms)}
                                            </div>

                                            <div className="relative">
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                        setOpenMenuId(openMenuId === track.id ? null : track.id)
                                                    }}
                                                    className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full transition-all focus:outline-none relative z-10"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </motion.button>

                                                <ContextMenu
                                                    track={track}
                                                    isOpen={openMenuId === track.id}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </motion.div>
                )}

                {/* All remaining sections (Genres, External Links) - COMPLETELY UNCHANGED */}
                {artist.genres && artist.genres.length > 0 && (
                    <motion.div
                        className="mb-6 sm:mb-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8, duration: 0.6 }}
                    >
                        <motion.h3
                            className="text-lg sm:text-xl font-bold mb-4 text-center sm:text-left"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 2, duration: 0.5 }}
                        >
                            Genres
                        </motion.h3>
                        <motion.div
                            className="flex flex-wrap gap-2 justify-center sm:justify-start"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {artist.genres.map((genre: string, index: number) => (
                                <motion.span
                                    key={genre}
                                    className="px-3 py-1.5 bg-gray-800 rounded-full text-xs sm:text-sm capitalize hover:bg-gray-700 transition-colors"
                                    variants={scaleIn}
                                    custom={index}
                                    whileHover={{ scale: 1.05, backgroundColor: '#374151' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {genre}
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                <motion.div
                    className="flex gap-4 justify-center pt-6 sm:pt-8 border-t border-gray-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.6 }}
                >
                    <motion.a
                        href={artist.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                        whileHover={{ scale: 1.05, color: '#ffffff' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Open in Spotify
                    </motion.a>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default ArtistPage
