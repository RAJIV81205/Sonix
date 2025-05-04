"use client";

import { Search, Bell, User, Loader2, Plus, Music, Play, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'react-hot-toast';
import AddPlaylistPopup from './AddPlaylistPopup';


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
}

interface Playlist {
  id: string;
  name: string;
  songCount: number;
}

const Main = () => {
  const router = useRouter();
  const { setCurrentSong, setIsPlaying } = usePlayer();
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

  // Function to handle playlist creation success
  const handlePlaylistCreated = (playlistId: string, playlistName: string) => {
    // Add the new playlist to the state
    setPlaylists(prev => [
      { id: playlistId, name: playlistName, songCount: 0 },
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

  // Search result item component with updated styling
  const SearchResultItem = ({ item }: { item: SearchResultItem }) => {
    return (
      <div 
        className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-md cursor-pointer transition-colors"
        onClick={() => handleSongSelect(item)}
      >
        <div className="relative w-10 h-10 flex-shrink-0 bg-zinc-900 rounded overflow-hidden">
          {item.image.replace("150x150" , "500x500") ? (
            <img 
              src={item.image.replace("150x150" , "500x500")}
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
                      <Music className="w-3 h-3 text-indigo-400" />
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

  // RecentPlayItem component with updated styling
  const RecentPlayItem = ({ song }: { song: Song }) => {
    return (
      <div className="group relative flex items-center gap-4 p-2 hover:bg-zinc-900 rounded-md cursor-pointer transition-colors">
        <div 
          className="relative w-16 h-16 rounded overflow-hidden bg-zinc-900"
          onClick={() => {
            setCurrentSong(song);
            setIsPlaying(true);
          }}
        >
          {song.image ? (
            <img 
              src={song.image.replace('150x150' ,'500x500').replace('http:' , 'https:')}
              alt={song.name.replaceAll("&quot;", `"`)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>
        <div 
          className="flex-1 min-w-0"
          onClick={() => {
            setCurrentSong(song);
            setIsPlaying(true);
          }}
        >
          <p className="text-sm font-medium text-white truncate">{song.name.replaceAll("&quot;", `"`)}</p>
          <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setRecentSongForPlaylist(song.id);
          }}
        >
          <MoreVertical className="w-4 h-4 text-zinc-400" />
        </button>
        
        {/* Dropdown for adding recently played song to playlist */}
        {recentSongForPlaylist === song.id && (
          <div 
            ref={recentPlaylistDropdownRef}
            className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-3 min-w-56 z-10"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
              <p className="text-sm text-white font-medium">Add to playlist</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setRecentSongForPlaylist(null);
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
                    setRecentSongForPlaylist(null);
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
                      <Music className="w-3 h-3 text-indigo-400" />
                    )}
                    <span>{playlist.name}</span>
                    <span className="text-xs text-zinc-500 ml-auto">{playlist.songCount} songs</span>
                  </button>
                ))}
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecentSongForPlaylist(null);
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
    <div className="h-full overflow-y-auto pb-24 text-white">
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
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold">Welcome Back , {userName}</h1>
        <p className="text-zinc-400 mt-1">Pick up where you left off</p>
      </div>
      
      {/* Recently Played Section */}
      <div className="p-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {recentlyPlayed.slice(0, 8).map((song) => (
              <RecentPlayItem key={song.id} song={song} />
            ))}
          </div>
        )}
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
                <div className={`w-full aspect-square mb-3 bg-gradient-to-br ${getPlaylistColor(index)} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Music className="w-12 h-12 text-white opacity-80" />
                </div>
                <h3 className="font-medium truncate">{playlist.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{playlist.songCount} songs</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Playlist Popup */}
      {showAddPlaylistPopup && (
        <AddPlaylistPopup 
          isOpen={showAddPlaylistPopup} 
          onClose={() => setShowAddPlaylistPopup(false)}
          onSuccess={handlePlaylistCreated}
        />
      )}
    </div>
  );
};

export default Main;