"use client";

import { Search, Bell, User, Loader2, Plus, Music } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'react-hot-toast';


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
  const suggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const playlistDropdownRef = useRef<HTMLDivElement | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;

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

  const fetchSongUrl = async (encryptedUrl: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/dashboard/getSongUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ encryptedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching song URL:', errorData);
        toast.error('Failed to get song URL. Please try again.');
        return null;
      }

      const data = await response.json();
      return data.downloadUrl || null;
    } catch (error) {
      console.error('Error fetching song URL:', error);
      toast.error('Failed to get song URL. Please try again.');
      return null;
    }
  };

  const handleSongSelect = async (item: SearchResultItem) => {
    try {
      setLoadingSong(item.id);
      const encryptedUrl = item.more_info.encrypted_media_url;
      if (!encryptedUrl) {
        toast.error('Song URL not available');
        return;
      }

      const downloadUrl = await fetchSongUrl(encryptedUrl);
      if (!downloadUrl) {
        toast.error('Could not get song URL');
        return;
      }

      const primaryArtist = item.more_info.artistMap.primary_artists[0];
      const song: Song = {
        id: item.id,
        name: item.title,
        artist: primaryArtist?.name || 'Unknown Artist',
        image: item.image,
        url: downloadUrl,
      };



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
      toast.success(`Now playing: ${item.title}`);
      setLoadingSong(null);
   
    } catch (error) {
      console.error('Error selecting song:', error);
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    try {
      setAddingToPlaylist(song.id);

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

  // Search result item component with add to playlist
  const SearchResultItem = ({ item }: { item: SearchResultItem }) => {
    return (
      <div className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg group">
        <div
          className="flex items-center gap-3 cursor-pointer flex-grow"
          onClick={() => handleSongSelect(item)}
        >
          <div className="w-10 h-10 min-w-[40px] bg-zinc-800 rounded-md overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-medium truncate">{item.title}</h3>
            <p className="text-xs text-zinc-400 truncate">
              {item.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {loadingSong === item.id ? (
            <div className="mr-2">
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistDropdown(showPlaylistDropdown === item.id ? null : item.id);
                }}
                className="p-1.5 opacity-0 group-hover:opacity-100 rounded-full hover:bg-purple-500/20 text-purple-500 focus:opacity-100 transition-opacity"
              >
                <Plus className="w-5 h-5" />
              </button>
              
              {showPlaylistDropdown === item.id && (
                <div 
                  ref={playlistDropdownRef}
                  className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 w-40"
                >
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {playlists.length > 0 ? (
                      playlists.map(playlist => (
                        <button
                          key={playlist.id}
                          onClick={() => {
                            // Convert SearchResultItem to Song
                            const primaryArtist = item.more_info.artistMap.primary_artists[0];
                            const song: Song = {
                              id: item.id,
                              name: item.title,
                              artist: primaryArtist?.name || 'Unknown Artist',
                              image: item.image,
                              url: '', // Will be fetched in the API
                            };
                            addSongToPlaylist(playlist.id, song);
                          }}
                          disabled={addingToPlaylist === item.id}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-800 text-zinc-300 hover:text-white truncate flex items-center"
                        >
                          {addingToPlaylist === item.id ? (
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          ) : (
                            <Music className="w-3 h-3 mr-2" />
                          )}
                          {playlist.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 px-3 py-2">No playlists found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Recently played item component with add to playlist
  const RecentPlayItem = ({ song }: { song: Song }) => {
    return (
      <div className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg group">
        <div
          className="flex items-center gap-3 cursor-pointer flex-grow"
          onClick={() => {
            setCurrentSong(song);
            setIsPlaying(true);
          }}
        >
          <div className="w-10 h-10 min-w-[40px] bg-zinc-800 rounded-md overflow-hidden">
            <img
              src={song.image}
              alt={song.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-medium truncate">{song.name}</h3>
            <p className="text-xs text-zinc-400 truncate">
              {song.artist}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistDropdown(showPlaylistDropdown === song.id ? null : song.id);
              }}
              className="p-1.5 opacity-0 group-hover:opacity-100 rounded-full hover:bg-purple-500/20 text-purple-500 focus:opacity-100 transition-opacity"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            {showPlaylistDropdown === song.id && (
              <div 
                ref={playlistDropdownRef}
                className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 w-40"
              >
                <div className="py-1 max-h-48 overflow-y-auto">
                  {playlists.length > 0 ? (
                    playlists.map(playlist => (
                      <button
                        key={playlist.id}
                        onClick={() => addSongToPlaylist(playlist.id, song)}
                        disabled={addingToPlaylist === song.id}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-800 text-zinc-300 hover:text-white truncate flex items-center"
                      >
                        {addingToPlaylist === song.id ? (
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        ) : (
                          <Music className="w-3 h-3 mr-2" />
                        )}
                        {playlist.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 px-3 py-2">No playlists found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-black to-zinc-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="relative w-1/3" ref={suggestionBoxRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            className="w-full bg-zinc-800/50 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />

          {showSuggestions && (
            <div className="absolute w-full mt-2 bg-zinc-800 rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
              <div className="p-3">
                <h3 className="text-sm font-semibold mb-2">Search Results</h3>

                {searching ? (
                  <>
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-2 hover:bg-zinc-700/50 rounded">
                        <div className="w-10 h-10 bg-zinc-700 rounded animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="h-3 bg-zinc-700 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <SearchResultItem key={item.id} item={item} />
                  ))
                ) : (
                  <p className="text-zinc-400 text-sm p-2">No results found</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-zinc-800/50 transition-colors">
            <Bell className="w-5 h-5 text-zinc-400" />
          </button>
          <button className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-full hover:bg-zinc-700/50 transition-colors">
            <User className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-medium">Account</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-2 md:p-4 overflow-y-auto">
        {/* Recently Played Section */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Recently Played</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
            {recentlyPlayed.length > 0 ? (
              recentlyPlayed.map((song) => (
                <RecentPlayItem key={song.id} song={song} />
              ))
            ) : (
              <p className="text-zinc-400">No recently played songs yet.</p>
            )}
          </div>
        </div>

        {/* Made For You Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Made For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-zinc-800/50 p-2 md:p-4 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer">
                <div className="aspect-square bg-zinc-700 rounded-lg mb-2 md:mb-3"></div>
                <h3 className="font-medium text-sm md:text-base">Album Title {item}</h3>
                <p className="text-xs md:text-sm text-zinc-400">Artist Name</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
