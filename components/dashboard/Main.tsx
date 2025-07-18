"use client";

import { Search, Bell, User, Loader2, Plus, Music, Play, MoreVertical, LogOut, Settings, Heart, Crown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'react-hot-toast';
import AddPlaylistPopup from './AddPlaylistPopup';
import Link from "next/link"


interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  image: string;
  perma_url: string;
  more_info: {
    duration: string;
    album_id: string;
    album: string;
    label: string;
    encrypted_media_url: string;
    artistMap: {
      primary_artists: Array<{
        id: string;
        name: string;
        image: string;
        perma_url: string;
      }>;
    };
  };
}

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
  const { setCurrentSong, setIsPlaying, addToQueue, playNextInQueue } = usePlayer();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [loadingSong, setLoadingSong] = useState<string | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState<string | null>(null);
  const [recentSongForPlaylist, setRecentSongForPlaylist] = useState<string | null>(null);
  const suggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const playlistDropdownRef = useRef<HTMLDivElement | null>(null);
  const recentPlaylistDropdownRef = useRef<HTMLDivElement | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
  const [showAddPlaylistPopup, setShowAddPlaylistPopup] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(true);
  const [showMenuOptions, setShowMenuOptions] = useState<string | null>(null);
  const [userPopup, setUserPopup] = useState<boolean>(false)

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
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      setSearchResults([]);
      return;
    }

    setShowSuggestions(true);
    setSearching(true);

    debounceTimer = setTimeout(() => handleSearch(searchQuery), 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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
    // Close playlist dropdown when clicking outside
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

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch('/api/dashboard/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching search results:', errorData);
        toast.error('Failed to search. Please try again.');
        setSearching(false);
        return;
      }

      const data = await response.json();
      setSearchResults(data.songs || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSearching(false);
    }
  };


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

  const handleSongSelect = async (item: SearchResultItem) => {
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

      setCurrentSong(song);
      setIsPlaying(true);
      setShowSuggestions(false);
      toast.success(`Now playing: ${item.title.replaceAll("&quot;", `"`)}`);
    } catch (error) {
      console.error('Error playing song:', error);
      toast.error('Failed to play song. Please try again.');
    } finally {
      setLoadingSong(null);
    }
  };

  // Function to handle adding songs to playlists
  const handleAddToPlaylist = async (playlistId: string, songId: string, songName: string) => {
    try {
      setAddingToPlaylist(playlistId);

      // First get the full song details including URL
      const song = await getSongDetails(songId);

      if (!song) {
        setAddingToPlaylist(null);
        return;
      }

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
        toast.error(`"${songName}" is already in this playlist`);
      } else {
        toast.success(`Added "${songName}" to playlist`);
      }

      // Close dropdown
      setShowPlaylistDropdown(null);
      setRecentSongForPlaylist(null);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add song to playlist');
    } finally {
      setAddingToPlaylist(null);
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
      setRecentSongForPlaylist(null);
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

  useEffect(() => {
    getTrendingTracks()
  }, []);

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


  /// Top Artists
  const topArtists = [
    { id: '468245', name: 'Diljit Dosanjh', genre: 'Punjabi Pop', img: "https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg" },
    { id: '459320', name: 'Arijit Singh', genre: 'Bollywood', img: "https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg" },
    { id: '464932', name: 'Neha Kakkar', genre: 'Pop', img: "https://c.saavncdn.com/artists/Neha_Kakkar_007_20241212115832_500x500.jpg" },
    { id: '456863', name: 'Badshah', genre: 'Hip-Hop', img: "https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg" },
    { id: '455130', name: 'Shreya Ghoshal', genre: 'Classical/Bollywood', img: "https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg" },
    { id: '881158', name: 'Jubin Nautiyal', genre: 'Romantic', img: "https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20231130204020_500x500.jpg" },
  ];

  // Search result item component with updated styling
  const SearchResultItem = ({ item }: { item: SearchResultItem }) => {
    return (
      <div
        className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-md cursor-pointer transition-colors"
        onClick={() => handleSongSelect(item)}
      >
        <div className="relative w-10 h-10 flex-shrink-0 bg-zinc-900 rounded overflow-hidden">
          {item.image.replace("150x150", "500x500") ? (
            <img
              src={item.image.replace("150x150", "500x500")}
              alt={item.title.replaceAll("&quot;", `"`)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
          )}
          {loadingSong === item.id && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.title.replaceAll("&quot;", `"`)}</p>
          <p className="text-xs text-zinc-400 truncate">{item.more_info?.artistMap?.primary_artists?.[0]?.name || item.subtitle || "Unknown artist"}</p>
        </div>
        <button
          className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowPlaylistDropdown(item.id);
          }}
        >
          <Plus className="w-4 h-4 text-white" />
        </button>

        {/* Dropdown for playlists */}
        {showPlaylistDropdown === item.id && (
          <div
            ref={playlistDropdownRef}
            className="absolute right-12 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-3 min-w-56 z-10"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
              <p className="text-sm text-white font-medium">Add to playlist</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistDropdown(null);
                }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            {playlists.length === 0 ? (
              <div className="py-2">
                <p className="text-xs text-zinc-500 mb-2">No playlists available</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistDropdown(null);
                    setShowAddPlaylistPopup(true);
                  }}
                  className="w-full text-center text-sm bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md transition-colors"
                >
                  Create Playlist
                </button>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(playlist.id, item.id, item.title.replaceAll("&quot;", `"`));
                    }}
                    disabled={addingToPlaylist === playlist.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2"
                  >
                    {addingToPlaylist === playlist.id ? (
                      <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                    ) : (
                      playlist.cover ? (
                        <img
                          src={playlist.cover.replace('150x150', '500x500').replace('http:', 'https:')}
                          alt={playlist.name}
                          className="w-6 h-6 rounded-md object-cover"
                        />
                      ) : (
                        <Music className="w-3 h-3 text-indigo-400" />
                      )
                    )}
                    <span>{playlist.name}</span>
                    <span className="text-xs text-zinc-500 ml-auto">{playlist.songCount} songs</span>
                  </button>
                ))}
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlaylistDropdown(null);
                      setShowAddPlaylistPopup(true);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create New Playlist</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto pb-24 text-white relative">
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
                className="bg-transparent border-none outline-none text-white placeholder-zinc-500 w-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {showSuggestions && (
              <div ref={suggestionBoxRef} className="absolute mt-2 w-full bg-black border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-10">
                <div className="p-2">
                  {searching ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.slice(0, 8).map((item) => (
                        <SearchResultItem key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    searchQuery.trim() !== '' && (
                      <div className="py-3 text-center text-zinc-400 text-sm">
                        No results found for "{searchQuery}"
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-zinc-400" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer" onClick={() =>
              userPopup ? (
                setUserPopup(false)
              ) : (
                setUserPopup(true)
              )
            }
            >
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold">Welcome Back , {userName}</h1>
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
                className={`bg-zinc-900 rounded-xl p-3 hover:bg-zinc-800 transition-colors cursor-pointer ${getPlaylistColor(index)}`}
                onClick={() => handleSongSelect({
                  id: track.id,
                  title: track.title,
                  subtitle: track.artist,
                  type: 'song',
                  image: track.coverUrl,
                  perma_url: '',
                  more_info: {
                    duration: '',
                    album_id: '',
                    album: '',
                    label: '',
                    encrypted_media_url: '',
                    artistMap: {
                      primary_artists: [{
                        id: '',
                        name: '',
                        image: '',
                        perma_url: ''
                      }]
                    }
                  }
                })}
              >
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                />
                <h3 className="font-medium text-sm truncate">{track.title.replaceAll("&quot;", `"`)}</h3>
                <p className="text-xs text-zinc-400 truncate">{track.artist.replaceAll("&quot;", `"`)}</p>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Recently Played Section */}
      <div className="p-4">
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
                onClick={() => {
                  setCurrentSong(song);
                  setIsPlaying(true);
                }}
                className={`bg-zinc-900 rounded-xl p-3 hover:bg-zinc-800 transition-colors cursor-pointer relative group ${getPlaylistColor(index)}`}
              >
                <img
                  src={song.image}
                  alt={song.name}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                />
                <h3 className="font-medium text-sm truncate">{song.name.replaceAll("&quot;", `"`)}</h3>
                <p className="text-xs text-zinc-400 truncate">{song.artist.replaceAll("&quot;", `"`)}</p>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSong(song);
                      setIsPlaying(true);
                    }}
                    className="bg-transparent text-white rounded-full p-3 shadow-lg transition-colors"
                  >
                    <Play className="w-5 h-5" fill="white" />
                  </button>
                </div>

                {/* Menu options */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuOptions(showMenuOptions === song.id ? null : song.id);
                      }}
                      className="bg-black/20 bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {showMenuOptions === song.id && (
                      <div
                        className="absolute right-0 mt-1 w-56 bg-zinc-800 rounded-md shadow-lg z-10 border border-zinc-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setCurrentSong(song);
                              setIsPlaying(true);
                              setShowMenuOptions(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700"
                          >
                            <span className="mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                              </svg>
                            </span>
                            Play
                          </button>

                          <button
                            onClick={() => {
                              playNextInQueue(song);
                              setShowMenuOptions(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700"
                          >
                            <span className="mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            </span>
                            Play Next
                          </button>

                          <button
                            onClick={() => {
                              addToQueue(song);
                              setShowMenuOptions(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700"
                          >
                            <span className="mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </span>
                            Add to Queue
                          </button>

                          <button
                            onClick={() => {
                              setShowPlaylistDropdown(song.id);
                              setShowMenuOptions(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700"
                          >
                            <span className="mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                              </svg>
                            </span>
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
                    className="absolute right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-3 min-w-100 z-10"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                      <p className="text-sm text-white font-medium">Add to playlist</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPlaylistDropdown(null);
                        }}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    {playlists.length === 0 ? (
                      <div className="py-2">
                        <p className="text-xs text-zinc-500 mb-2">No playlists available</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPlaylistDropdown(null);
                            setShowAddPlaylistPopup(true);
                          }}
                          className="w-full text-center text-sm bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md transition-colors"
                        >
                          Create Playlist
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        {playlists.map(playlist => (
                          <button
                            key={playlist.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddRecentToPlaylist(playlist.id, song);
                            }}
                            disabled={addingToPlaylist === playlist.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2"
                          >
                            {addingToPlaylist === playlist.id ? (
                              <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                            ) : (
                              playlist.cover ? (
                                <img
                                  src={playlist.cover.replace('150x150', '500x500').replace('http:', 'https:')}
                                  alt={playlist.name}
                                  className="w-10 h-10 rounded-md object-cover"
                                />
                              ) : (
                                <Music className="w-3 h-3 text-indigo-400" />
                              )
                            )}
                            <span className='truncate w-2/3'>{playlist.name}</span>
                            <span className="text-xs text-zinc-500 ml-auto">{playlist.songCount} songs</span>
                          </button>
                        ))}
                        <div className="mt-2 pt-2 border-t border-zinc-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPlaylistDropdown(null);
                              setShowAddPlaylistPopup(true);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3" />
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
      </div>

      {/* Artists Section */}
      <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Top Artists</h2>
          <div className="grid grid-cols-6 gap-5">
            {topArtists.map((artist) => (
              <Link key={artist.id} href={`dashboard/artist/${artist.id}`} className="flex flex-col">
                <div className="aspect-square bg-zinc-800 rounded-full mb-4 overflow-hidden border border-gray-400/40 hover:border-gray-400/60 transition-colors">
                <img src={artist.img} alt={artist.name} loading="lazy" />
                </div>
                <h3 className="font-medium text-sm text-center mb-1 truncate">{artist.name}</h3>
                <p className="text-xs text-zinc-400 text-center truncate">{artist.genre}</p>
              </Link>
            ))}
          </div>
        </div>

      {/* Your Playlists Section */}
      <div className="p-6">
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
                className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/playlist/${playlist.id}`)}
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
                  <img src={playlist.cover} alt={playlist.name} />
                </div>
                <h3 className="font-medium truncate">{playlist.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{playlist.songCount} songs</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Playlist Popup */}
      {
        showAddPlaylistPopup && (
          <AddPlaylistPopup
            isOpen={showAddPlaylistPopup}
            onClose={() => setShowAddPlaylistPopup(false)}
            onSuccess={handlePlaylistCreated}
          />
        )
      }

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
              onClick={() => router.push('/dashboard/profile')}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
              <span>Profile</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 rounded-md transition-colors"
              onClick={() => router.push('/dashboard/favorites')}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Heart className="w-4 h-4 text-zinc-400" />
              </div>
              <span>Favorites</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 rounded-md transition-colors"
              onClick={() => router.push('/dashboard/settings')}
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
              onClick={() => router.push('/dashboard/upgrade')}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div >
  );
};

export default Main;