"use client";

import { Search, Bell, User, Loader2, Plus, Music, Play, MoreVertical, LogOut, Settings, Heart, Crown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { usePlayerControls } from '@/context/PlayerControlsContext';
import { toast } from 'react-hot-toast';
import AddPlaylistPopup from './AddPlaylistPopup';
import Link from "next/link"
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { gsap } from 'gsap';
import { topArtists } from '@/lib/constant';
import { useGsapStagger } from '@/lib/hooks/useGsapstagger';


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
  songCount: number;
  cover: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  plays?: string;
  type?: string;
}

const Main = () => {
  const router = useRouter();
  const {
    currentSong,
    setQueue,
    addToQueue,
    addToNext,
    playAlbum,
    play
  } = usePlayerControls();

  const [loadingSong, setLoadingSong] = useState<string | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState<string | null>(null);
  const [recentSongForPlaylist, setRecentSongForPlaylist] = useState<string | null>(null);
  const playlistDropdownRef = useRef<HTMLDivElement | null>(null);
  const recentPlaylistDropdownRef = useRef<HTMLDivElement | null>(null);
  const recommendationItemsRef = useRef<HTMLDivElement[]>([]);
  const recentlyPlayedItemsRef = useRef<HTMLDivElement[]>([]);
  const chartsItemsRef = useRef<HTMLAnchorElement[]>([]);
  const artistsItemsRef = useRef<HTMLAnchorElement[]>([]);
  const playlistsItemsRef = useRef<HTMLDivElement[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
  const [showAddPlaylistPopup, setShowAddPlaylistPopup] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(true);
  const [showMenuOptions, setShowMenuOptions] = useState<string | null>(null);
  const [userPopup, setUserPopup] = useState<boolean>(false);

  // Charts data
  const charts = [
    {
      id: '37i9dQZEVXbNG2KDcFcKOF',
      title: 'Top Songs - Global',
      description: 'Your weekly update of the most played tracks right now',
      image: 'https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_global_default.jpg',
      link: `/dashboard/charts/37i9dQZEVXbNG2KDcFcKOF`
    },
    {
      id: '37i9dQZEVXbMWDif5SCBJq',
      title: 'Top Songs - India',
      description: 'Your weekly update of the most played tracks right now',
      image: 'https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_in_default.jpg',
      link: `/dashboard/charts/37i9dQZEVXbMWDif5SCBJq`
    },
    {
      id: '37i9dQZEVXbMDoHDwVN2tF',
      title: 'Top 50 - Global',
      description: 'Your daily update of the most played tracks right now',
      image: 'https://charts-images.scdn.co/assets/locale_en/regional/daily/region_global_default.jpg',
      link: `/dashboard/charts/37i9dQZEVXbMDoHDwVN2tF`
    },
    {
      id: '37i9dQZEVXbLZ52XmnySJg',
      title: 'Top 50 - India',
      description: 'Your daily update of the most played tracks right now',
      image: 'https://charts-images.scdn.co/assets/locale_en/regional/daily/region_in_default.jpg',
      link: `/dashboard/charts/37i9dQZEVXbLZ52XmnySJg`
    }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.username || "User");
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token]);

  useEffect(() => {
    // Load recently played on mount
    const stored = localStorage.getItem('recentlyPlayed');
    if (stored) {
      setRecentlyPlayed(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Load user playlists on mount
    const fetchPlaylists = async () => {
      try {
        if (!token) return;

        const response = await fetch('/api/dashboard/getUserPlaylists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlaylists(data.playlists);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylists();
  }, [token]);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (playlistDropdownRef.current && !playlistDropdownRef.current.contains(event.target as Node)) {
        setShowPlaylistDropdown(null);
      }
      if (recentPlaylistDropdownRef.current && !recentPlaylistDropdownRef.current.contains(event.target as Node)) {
        setRecentSongForPlaylist(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to handle playing a song and updating recently played
  const handlePlaySong = async (song: Song) => {
    try {
      // Play the song using new context
      setQueue([song], 0);
      await play();

      // Update recently played
      const updatedRecent = [song, ...recentlyPlayed.filter(s => s.id !== song.id)].slice(0, 20);
      setRecentlyPlayed(updatedRecent);
      localStorage.setItem('recentlyPlayed', JSON.stringify(updatedRecent));

      toast.success(`Playing "${song.name.replace(/&quot;/g, '"')}"`);
    } catch (error) {
      console.error('Error playing song:', error);
      toast.error('Failed to play song. Please try again.');
    }
  };

  // Function to handle adding recently played songs to playlist
  const handleAddRecentToPlaylist = async (playlistId: string, song: Song) => {
    try {
      setAddingToPlaylist(playlistId);

      const response = await fetch('/api/dashboard/addToPlaylist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playlistId,
          song,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add song to playlist');
      }

      const data = await response.json();

      // Check if song already exists in playlist
      if (data.alreadyExists) {
        toast.error(`"${song.name}" is already in this playlist`);
      } else {
        toast.success(`Added "${song.name}" to playlist`);
      }

      // Close dropdown
      setShowPlaylistDropdown(null);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add song to playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const getTrendingTracks = async () => {
    setIsTrendingLoading(true);
    function formatNumber(num: number) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
      } else {
        return num.toString();
      }
    }

    try {
      const response = await fetch('/api/dashboard/getNewReleases', {
        method: 'POST',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      const newArray = [];

      for (let i = 0; i < data.data.count; i++) {
        if (data.data.data[i].type === "song") {
          const realData: Track = {
            id: data.data.data[i].id,
            title: data.data.data[i].title.replaceAll("&quot;", `"`).replaceAll("&amp;", `-`),
            artist: data.data.data[i].subtitle.replaceAll("&quot;", `"`).replaceAll("&amp;", `-`) || '',
            album: data.data.data[i].more_info.album || '',
            coverUrl: data.data.data[i].image
              .replace('http:', 'https:')
              .replace('150x150', '500x500'),
            plays: formatNumber(data.data.data[i].play_count),
          }
          newArray.push(realData);
        }
      }

      setTrendingTracks(newArray);

    } catch (error) {
      console.error('Error fetching trending tracks:', error);
      toast.error('Failed to fetch trending tracks. Please try again later.');
    } finally {
      setIsTrendingLoading(false);
    }
  }

  const getSongDetails = async (id: string): Promise<Song | null> => {
    try {
      const response = await fetch('/api/dashboard/getSongUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching song details:', errorData);
        toast.error('Failed to get song details. Please try again.');
        return null;
      }

      const data = await response.json();

      if (!data.data || !data.data[0]) {
        toast.error('Song data not found');
        return null;
      }

      const songData = data.data[0];

      return {
        id: songData.id,
        name: songData.name,
        artist: songData.artists?.primary[0]?.name || 'Unknown Artist',
        image: songData.image[2]?.url ? (songData.image[2].url).replace(/^http:/, 'https:') : '',
        url: songData.downloadUrl[4]?.url ? (songData.downloadUrl[4].url).replace(/^http:/, 'https:') : '',
        duration: songData.duration || 0,
      };
    } catch (error) {
      console.error('Error fetching song details:', error);
      toast.error('Failed to get song details. Please try again.');
      return null;
    }
  };

  const handleSongSelect = async (item: Track) => {
    try {
      setLoadingSong(item.id);

      const song = await getSongDetails(item.id);

      if (!song) {
        setLoadingSong(null);
        return;
      }

      // Update recentlyPlayed list in localStorage
      const stored = localStorage.getItem('recentlyPlayed');
      const recentSongs: Song[] = stored ? JSON.parse(stored) : [];
      const filtered = recentSongs.filter((s) => s.id !== song.id);
      filtered.unshift(song);
      const limited = filtered.slice(0, 20);
      localStorage.setItem('recentlyPlayed', JSON.stringify(limited));
      setRecentlyPlayed(limited);

      // Use new context methods
      setQueue([song], 0);
      await play();

      toast.success(`Now playing: ${item.title.replaceAll("&quot;", `"`)}`);
    } catch (error) {
      console.error('Error playing song:', error);
      toast.error('Failed to play song. Please try again.');
    } finally {
      setLoadingSong(null);
    }
  };

  useEffect(() => {
    getTrendingTracks()
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  const { ref: recentRef, inView: recentInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: chartsRef, inView: chartsInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: artistRef, inView: artistInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: playlistRef, inView: playlistInView } = useInView({ triggerOnce: true, threshold: 0.15 });

  useGsapStagger(recommendationItemsRef, {
    trigger: trendingTracks.length && !isTrendingLoading,
    inView: true, // Recommendations are always visible at the top
    stagger: 1.2,
  });

  useGsapStagger(recentlyPlayedItemsRef, {
    trigger: recentlyPlayed.length,
    inView: recentInView,
  });

  useGsapStagger(chartsItemsRef, {
    trigger: 4,
    inView: chartsInView,
    stagger: 0.8,
  });

  useGsapStagger(artistsItemsRef, {
    trigger: topArtists.length,
    inView: artistInView,
    stagger: 0.6,
  });

  useGsapStagger(playlistsItemsRef, {
    trigger: playlists.length,
    inView: playlistInView,
  });


  // Function to handle playlist creation success
  const handlePlaylistCreated = (playlistId: string, playlistName: string) => {
    // Add the new playlist to the state
    setPlaylists(prev => [
      { id: playlistId, name: playlistName, songCount: 0, cover: '' },
      ...prev
    ]);
  };

  // Function to get playlist color based on index (copied from Sidebar)
  const getPlaylistColor = (index: number) => {
    const colors = [
      "from-teal-500 to-emerald-500",
      "from-amber-500 to-orange-500",
      "from-blue-500 to-indigo-500",
      "from-cyan-500 to-blue-500",
      "from-emerald-500 to-cyan-500"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="h-full overflow-y-auto pb-24 text-white relative ">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-b from-indigo-900/20 to-black p-6">
        <div className="flex items-center justify-between mb-8">
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 w-80">
              <Search className="w-4 h-4 text-zinc-400 mr-2" />
              <input
                type="text"
                placeholder="Search for songs, artists..."
                className="bg-transparent border-none outline-none text-white placeholder-zinc-500 w-full text-sm cursor-pointer"
                onClick={() => router.push("/dashboard/search")}
                readOnly
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-zinc-400" />
            </button>
            <div
              className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => setUserPopup(!userPopup)}
            >
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold">Welcome Back, {userName}</h1>
        <p className="text-zinc-400 mt-1">Pick up where you left off</p>
      </div>

      {/* Recommendation Section */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Recommendations</h2>
        {isTrendingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-8 gap-3">
            {[...Array(16)].map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-zinc-900 rounded-xl p-4 animate-pulse">
                <div className="w-full aspect-square bg-zinc-800 rounded-lg mb-3"></div>
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
            {trendingTracks.map((track, index) => (
              <div
                key={track.id}
                ref={(el) => {
                  if (el) recommendationItemsRef.current[index] = el;
                }}
                className="recommendation-item bg-zinc-900 rounded-xl p-3 hover:bg-zinc-800 transition-colors cursor-pointer relative group"
              >
                {/* Loading overlay for trending tracks */}
                {loadingSong === track.id && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}

                <div onClick={() => handleSongSelect(track)}>
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                    onClick={(e) => {
                      // Add click animation
                      const target = e.currentTarget.closest('.recommendation-item');
                      if (target) {
                        gsap.to(target, {
                          scale: 0.95,
                          duration: 0.1,
                          ease: "power2.out",
                          yoyo: true,
                          repeat: 1
                        });
                      }
                    }}
                  />
                  <h3 className="font-medium text-sm truncate">{track.title.replaceAll("&quot;", `"`)}</h3>
                  <p className="text-xs text-zinc-400 truncate">{track.artist.replaceAll("&quot;", `"`)}</p>
                </div>

                {/* Play button overlay for trending tracks */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSongSelect(track);
                    }}
                    disabled={loadingSong === track.id}
                    className="bg-green-500 hover:bg-green-400 text-white rounded-full p-3 shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
                  >
                    {loadingSong === track.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" fill="white" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Played Section */}
      <motion.div
        ref={recentRef}
        variants={fadeInUp}
        initial="hidden"
        animate={recentInView ? 'visible' : 'hidden'}
        className="p-4"
      >
        <h2 className="text-xl font-bold mb-4">Recently Played</h2>
        {recentlyPlayed.length === 0 ? (
          <div className="text-center py-10 bg-zinc-900 rounded-xl">
            <p className="text-zinc-400">Your recently played songs will appear here</p>
            <button
              onClick={() => router.push('/dashboard/search')}
              className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              Discover Music
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-8 gap-3">
            {recentlyPlayed.slice(0, 8).map((song, index) => (
              <div
                key={song.id}
                ref={(el) => {
                  if (el) recentlyPlayedItemsRef.current[index] = el;
                }}
                className="bg-zinc-900 rounded-xl p-3 hover:bg-zinc-800 transition-colors cursor-pointer relative group"
              >
                <img
                  src={song.image}
                  alt={song.name}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                  onClick={(e) => {
                    // Add click animation
                    const target = e.currentTarget.closest('.group');
                    if (target) {
                      gsap.to(target, {
                        scale: 0.95,
                        duration: 0.1,
                        ease: "power2.out",
                        yoyo: true,
                        repeat: 1
                      });
                    }
                  }}
                />
                <h3 className="font-medium text-sm truncate">{song.name.replaceAll("&quot;", `"`)}</h3>
                <p className="text-xs text-zinc-400 truncate">{song.artist.replaceAll("&quot;", `"`)}</p>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySong(song);
                    }}
                    className="bg-green-500 hover:bg-green-400 text-white rounded-full p-3 shadow-lg transition-all transform hover:scale-105"
                  >
                    <Play className="w-5 h-5" fill="white" />
                  </button>
                </div>

                {/* Menu options */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuOptions(showMenuOptions === song.id ? null : song.id);
                      }}
                      className="bg-black/50 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/70 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown menu */}
                    {showMenuOptions === song.id && (
                      <div
                        className="absolute right-0 mt-1 w-48 bg-zinc-800 rounded-md shadow-lg z-10 border border-zinc-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handlePlaySong(song);
                              setShowMenuOptions(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play Now
                          </button>

                          <button
                            onClick={() => {
                              addToNext(song);
                              setShowMenuOptions(null);
                              toast.success(`"${song.name.replace(/&quot;/g, '"')}" will play next`);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Play Next
                          </button>

                          <button
                            onClick={() => {
                              addToQueue(song);
                              setShowMenuOptions(null);
                              toast.success(`"${song.name.replace(/&quot;/g, '"')}" added to queue`);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Queue
                          </button>

                          <button
                            onClick={() => {
                              setShowPlaylistDropdown(song.id);
                              setShowMenuOptions(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                          >
                            <Music className="w-4 h-4 mr-2" />
                            Add to Playlist
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Playlist Dropdown */}
                {showPlaylistDropdown === song.id && (
                  <div
                    ref={playlistDropdownRef}
                    className="absolute right-0 top-8 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-3 min-w-64 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                      <p className="text-sm text-white font-medium">Add to playlist</p>
                      <button
                        onClick={() => setShowPlaylistDropdown(null)}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {playlists.length === 0 ? (
                      <div className="py-2">
                        <p className="text-xs text-zinc-500 mb-2">No playlists available</p>
                        <button
                          onClick={() => {
                            setShowPlaylistDropdown(null);
                            setShowAddPlaylistPopup(true);
                          }}
                          className="w-full text-center text-sm bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md transition-colors"
                        >
                          Create Playlist
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {playlists.map(playlist => (
                          <button
                            key={playlist.id}
                            onClick={() => handleAddRecentToPlaylist(playlist.id, song)}
                            disabled={addingToPlaylist === playlist.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {addingToPlaylist === playlist.id ? (
                              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            ) : (
                              playlist.cover ? (
                                <img
                                  src={playlist.cover.replace('150x150', '500x500').replace('http:', 'https:')}
                                  alt={playlist.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <Music className="w-4 h-4 text-indigo-400" />
                              )
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="truncate block">{playlist.name}</span>
                              <span className="text-xs text-zinc-500">{playlist.songCount} songs</span>
                            </div>
                          </button>
                        ))}

                        <div className="mt-2 pt-2 border-t border-zinc-800">
                          <button
                            onClick={() => {
                              setShowPlaylistDropdown(null);
                              setShowAddPlaylistPopup(true);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create New Playlist</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        ref={chartsRef}
        variants={fadeInUp}
        initial="hidden"
        animate={chartsInView ? 'visible' : 'hidden'}
        className="p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Charts</h2>
          <Link href="/dashboard/charts" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {charts.map((chart, index) => (
            <Link
              key={chart.id}
              href={chart.link}
              className="group cursor-pointer"
              ref={(el) => {
                if (el) chartsItemsRef.current[index] = el;
              }}
            >
              <div className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-all duration-300 group-hover:scale-105">
                <div className="w-full aspect-square mb-3 rounded-lg shadow-lg overflow-hidden relative">
                  {/* Chart background image */}
                  <img
                    src={chart.image}
                    alt={chart.title}
                    className="w-full h-full object-cover"
                    onClick={(e) => {
                      // Add click animation
                      const target = e.currentTarget.closest('.group');
                      if (target) {
                        gsap.to(target, {
                          scale: 0.95,
                          duration: 0.1,
                          ease: "power2.out",
                          yoyo: true,
                          repeat: 1
                        });
                      }
                    }}
                  />


                </div>

                <h3 className="font-medium text-sm truncate mb-1">{chart.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2">{chart.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Artists Section */}
      <motion.div
        ref={artistRef}
        variants={fadeInUp}
        initial="hidden"
        animate={artistInView ? 'visible' : 'hidden'}
        className="p-4 px-5"
      >
        <div className="flex flex-row items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold">Top Artists</h2>
          <Link href="/dashboard/artist" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-6 gap-6 px-4 py-10">
          {topArtists.slice(0, 6).map((artist, index) => (
            <Link 
              key={artist.id} 
              href={`dashboard/artist/${artist.id}`} 
              className="flex flex-col"
              ref={(el) => {
                if (el) artistsItemsRef.current[index] = el;
              }}
            >
              <div className="aspect-square bg-zinc-800 rounded-full mb-4 overflow-hidden border border-gray-400/40 hover:border-gray-400/60 transition-colors">
                <img 
                  src={artist.img} 
                  alt={artist.name} 
                  loading="lazy"
                  onClick={(e) => {
                    // Add click animation
                    const target = e.currentTarget.closest('a');
                    if (target) {
                      gsap.to(target, {
                        scale: 0.95,
                        duration: 0.1,
                        ease: "power2.out",
                        yoyo: true,
                        repeat: 1
                      });
                    }
                  }}
                />
              </div>
              <h3 className="font-medium text-sm text-center mb-1 truncate">{artist.name}</h3>
              <p className="text-xs text-zinc-400 text-center truncate">{artist.genre}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Your Playlists Section */}
      <motion.div
        ref={playlistRef}
        variants={fadeInUp}
        initial="hidden"
        animate={playlistInView ? 'visible' : 'hidden'}
        className="p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Your Playlists</h2>
          <button
            onClick={() => setShowAddPlaylistPopup(true)}
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-10 bg-zinc-900 rounded-xl">
            <p className="text-zinc-400">Create your first playlist to start organizing your music</p>
            <button
              onClick={() => setShowAddPlaylistPopup(true)}
              className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map((playlist, index) => (
              <div
                key={playlist.id}
                ref={(el) => {
                  if (el) playlistsItemsRef.current[index] = el;
                }}
                className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-colors cursor-pointer"
                onClick={(e) => {
                  // Add click animation
                  gsap.to(e.currentTarget, {
                    scale: 0.95,
                    duration: 0.1,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                      router.push(`/dashboard/playlist/${playlist.id}`);
                    }
                  });
                }}
              >
                <div className={`w-full aspect-square mb-3 bg-gradient-to-br ${getPlaylistColor(index)} rounded-lg flex items-center justify-center shadow-lg overflow-hidden`}>
                  {playlist.cover ? (
                    <img
                      src={playlist.cover.replace('150x150', '500x500').replace('http:', 'https:')}
                      alt={playlist.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="font-medium truncate">{playlist.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{playlist.songCount} songs</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Playlist Popup */}
      {showAddPlaylistPopup && (
        <AddPlaylistPopup
          isOpen={showAddPlaylistPopup}
          onClose={() => setShowAddPlaylistPopup(false)}
          onSuccess={handlePlaylistCreated}
        />
      )}

      {/* User Popup */}
      {userPopup && (
        <div className="absolute w-64 z-50 flex flex-col bg-zinc-900 top-16 right-6 rounded-lg border border-zinc-800 shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-4 bg-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                <User className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <h3 className="font-medium text-white">{userName}</h3>
                <p className="text-xs text-zinc-400">Free Account</p>
              </div>
            </div>
          </div>

          {/* Menu Options */}
          <div className="p-2">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 rounded-md transition-colors"
              onClick={() => {
                router.push('/dashboard/profile');
                setUserPopup(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
              <span>Profile</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 rounded-md transition-colors"
              onClick={() => {
                router.push('/dashboard/favorites');
                setUserPopup(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Heart className="w-4 h-4 text-zinc-400" />
              </div>
              <span>Favorites</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 rounded-md transition-colors"
              onClick={() => {
                router.push('/dashboard/settings');
                setUserPopup(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Settings className="w-4 h-4 text-zinc-400" />
              </div>
              <span>Settings</span>
            </button>

            <div className="my-2 border-b border-zinc-800"></div>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('recentlyPlayed');
                router.push('/auth/login');
              }}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center ">
                <LogOut className="w-4 h-4 text-red-400" />
              </div>
              <span>Logout</span>
            </button>
          </div>

          {/* Upgrade */}
          <div className="p-4 bg-zinc-800 mt-2">
            <p className="text-sm font-medium text-white mb-2">Upgrade to Premium</p>
            <p className="text-xs text-zinc-400 mb-3">Unlock all features and enjoy ad-free music!</p>
            <button
              className="w-full bg-white text-zinc-900 rounded-md py-2 text-sm font-medium hover:bg-zinc-100 transition-colors"
              onClick={() => {
                router.push('/dashboard/upgrade');
                setUserPopup(false);
              }}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
