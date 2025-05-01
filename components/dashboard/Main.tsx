"use client";

import { Search, Bell, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'react-hot-toast'; // Assuming you have toast installed

// Updated interface to match the provided data structure
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

const Main = () => {
  const router = useRouter();
  const { setCurrentSong, setIsPlaying } = usePlayer();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [loadingSong, setLoadingSong] = useState<string | null>(null);
  const suggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token]);

  // Handle clicks outside suggestion box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
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
      console.log('Search results:', data);

      // Handle the search results
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
      // Set loading state for this specific song
      setLoadingSong(item.id);
      
      const encryptedUrl = item.more_info.encrypted_media_url;
      if (!encryptedUrl) {
        toast.error('Song URL not available');
        return;
      }
      
      // Fetch the download URL when the song is selected
      const downloadUrl = await fetchSongUrl(encryptedUrl);
      
      if (!downloadUrl) {
        toast.error('Could not get song URL');
        return;
      }
      
      const primaryArtist = item.more_info.artistMap.primary_artists[0];
      const song = {
        id: item.id,
        name: item.title,
        artist: primaryArtist?.name || 'Unknown Artist',
        image: item.image,
        url: downloadUrl,
      };

      setCurrentSong(song);
      setIsPlaying(true);
      setShowSuggestions(false);
      toast.success(`Now playing: ${item.title}`);
    } catch (error) {
      console.error('Error selecting song:', error);
      toast.error('Failed to play song. Please try again.');
    } finally {
      setLoadingSong(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
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

          {/* Suggestion Box */}
          {showSuggestions && (
            <div className="absolute w-full mt-2 bg-zinc-800 rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
              <div className="p-3">
                <h3 className="text-sm font-semibold mb-2">Search Results</h3>

                {searching ? (
                  // Skeleton loader
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
                  // Search results
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 hover:bg-zinc-700/50 rounded cursor-pointer"
                      onClick={() => handleSongSelect(item)}
                    >
                      <div className="w-10 h-10 bg-zinc-700 rounded overflow-hidden">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-zinc-400">
                          {item.more_info?.artistMap?.primary_artists?.[0]?.name || 'Unknown Artist'}
                        </p>
                      </div>
                      {loadingSong === item.id && (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  ))
                ) : searchQuery.trim() ? (
                  <p className="text-zinc-400 text-sm p-2">No results found</p>
                ) : null}
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
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Recently Played Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer">
                <div className="aspect-square bg-zinc-700 rounded-lg mb-3"></div>
                <h3 className="font-medium">Song Title {item}</h3>
                <p className="text-sm text-zinc-400">Artist Name</p>
              </div>
            ))}
          </div>
        </div>

        {/* Made For You Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Made For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer">
                <div className="aspect-square bg-zinc-700 rounded-lg mb-3"></div>
                <h3 className="font-medium">Album Title {item}</h3>
                <p className="text-sm text-zinc-400">Artist Name</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;