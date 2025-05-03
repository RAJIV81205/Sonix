"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Music, Disc3, TrendingUp, Album, AlertTriangle } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'react-hot-toast';

// Define types
interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  plays?: string;
  type?: string;
}

interface TrackItemProps {
  track: Track;
  trending: boolean;
}

interface SearchResponse {
  songs: any[];
}

interface Song {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
}

const MobileSearch = () => {
  const { setCurrentSong, setIsPlaying, setPlaylist } = usePlayer();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [songs, setSongs] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'songs' | 'albums'>('songs');

  // Mock data for trending tracks
  useEffect(() => {
    const mockTrendingTracks: Track[] = [
      {
        id: '1',
        title: "The Nights",
        artist: "Avicii",
        album: "The Days / Nights",
        coverUrl: "/api/placeholder/64/64",
        plays: "1.2B"
      },
      {
        id: '2',
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        coverUrl: "/api/placeholder/64/64",
        plays: "3.6B"
      },
      {
        id: '3',
        title: "As It Was",
        artist: "Harry Styles",
        album: "Harry's House",
        coverUrl: "/api/placeholder/64/64",
        plays: "2.8B"
      },
      {
        id: '4',
        title: "Heat Waves",
        artist: "Glass Animals",
        album: "Dreamland",
        coverUrl: "/api/placeholder/64/64",
        plays: "2.4B"
      },
      {
        id: '5',
        title: "Starboy",
        artist: "The Weeknd ft. Daft Punk",
        album: "Starboy",
        coverUrl: "/api/placeholder/64/64",
        plays: "2.3B"
      },
      {
        id: '6',
        title: "Dance Monkey",
        artist: "Tones and I",
        album: "The Kids Are Coming",
        coverUrl: "/api/placeholder/64/64",
        plays: "2.1B"
      }
    ];

    setTrendingTracks(mockTrendingTracks);
  }, []);

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Debounce function
  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    wait: number
  ): ((...args: Parameters<F>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<F>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Real search functionality using API
  const performSearch = async (query: string): Promise<void> => {
    if (query.trim() === '') {
      setSongs([]);
      setAlbums([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastSearchTime(Date.now());

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Fetch songs and albums in parallel
      const [songsResponse, albumsResponse] = await Promise.all([
        fetch('/api/dashboard/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ query })
        }),
        fetch('/api/dashboard/searchAlbum', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ query })
        })
      ]);

      if (!songsResponse.ok) {
        const errorData = await songsResponse.json().catch(() => ({ error: 'Failed to search songs' }));
        throw new Error(errorData.error || `Songs search failed: ${songsResponse.status}`);
      }

      if (!albumsResponse.ok) {
        console.warn('Album search failed, but continuing with songs results');
      }

      // Process songs response
      const songsData: SearchResponse = await songsResponse.json();
      const songResults = songsData.songs || [];

      // Process albums response
      const albumsData = albumsResponse.ok ? await albumsResponse.json() : { results: [] };
      const albumResults = albumsData.results || [];

      // Process and categorize results
      const processedSongs: Track[] = [];
      const processedAlbums: Track[] = [];

      if (Array.isArray(songResults)) {
        songResults.forEach((item: any) => {
          // Check if the item has necessary data
          if (!item) return;

          // Process songs
          if (item.type?.toLowerCase() === 'song' || (!item.type && item.more_info?.song_pids)) {
            processedSongs.push({
              id: item.id || `song-${Date.now()}-${Math.random()}`,
              title: item.title || item.song || 'Unknown Title',
              artist: item.more_info?.music || item.more_info?.artistMap?.primary_artists?.[0]?.name || item.primaryArtists || 'Unknown Artist',
              album: item.subtitle || '',
              coverUrl: item.image || item.albumartwork_large || '/api/placeholder/64/64',
              type: 'song'
            });
          }
          // Process albums
          else if (item.type?.toLowerCase() === 'album' || (!item.type && item.more_info?.album_id)) {
            processedAlbums.push({
              id: item.id || item.albumid || `album-${Date.now()}-${Math.random()}`,
              title: item.title || item.album || 'Unknown Album',
              artist: item.more_info?.music || item.more_info?.artistMap?.primary_artists?.[0]?.name || item.primaryArtists || 'Unknown Artist',
              album: item.subtitle || item.year || '',
              coverUrl: item.image || item.albumartwork_large || '/api/placeholder/64/64',
              type: 'album'
            });
          }
          // If no type specified, try to determine from available fields
          else if (!item.type) {
            if (item.title && (item.artist || item.more_info?.singers)) {
              // Likely a song
              processedSongs.push({
                id: item.id || `song-${Date.now()}-${Math.random()}`,
                title: item.title || 'Unknown Title',
                artist: item.artist || item.more_info?.singers || 'Unknown Artist',
                album: item.album || '',
                coverUrl: item.image || '/api/placeholder/64/64',
                type: 'song'
              });
            } else if (item.title && item.year) {
              // Likely an album
              processedAlbums.push({
                id: item.id || `album-${Date.now()}-${Math.random()}`,
                title: item.title || 'Unknown Album',
                artist: item.more_info?.music || item.artist || 'Unknown Artist',
                album: item.subtitle || item.year || '',
                coverUrl: item.image || '/api/placeholder/64/64',
                type: 'album'
              });
            }
          }
        });
      }

      // Process dedicated album results
      if (Array.isArray(albumResults)) {
        albumResults.forEach((item: any) => {
          if (!item) return;

          processedAlbums.push({
            id: item.id || item.albumid || `album-${Date.now()}-${Math.random()}`,
            title: item.title || item.album || 'Unknown Album',
            artist: item.more_info?.music || item.more_info?.primary_artists || item.artist || 'Unknown Artist',
            album: item.subtitle || item.year || '',
            coverUrl: item.image || '/api/placeholder/64/64',
            type: 'album'
          });
        });
      }

      // Log the processed results for debugging
      console.log(`Found ${processedSongs.length} songs and ${processedAlbums.length} albums`);

      setSongs(processedSongs);
      setAlbums(processedAlbums);

    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to search. Please try again later.');
      setSongs([]);
      setAlbums([]);
    } finally {
      // Ensure loading state lasts at least 500ms for better UX
      const elapsed = Date.now() - lastSearchTime;
      const minLoadingTime = 500;

      if (elapsed < minLoadingTime) {
        setTimeout(() => {
          setIsLoading(false);
        }, minLoadingTime - elapsed);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      performSearch(query);
    }, 500),
    []
  );

  // Handle input change
  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const getSongUrl = async (id: string) => {
    try {
      const response = await fetch(`https://saavn.dev/api/songs/${id}`);
      const data = await response.json();
  
      if (!data.success || !data.data || !data.data.length) {
        throw new Error('Invalid song data');
      }
      
      const songData = data.data[0];
      
      let artistName = 'Unknown Artist';
      if (songData.artists && songData.artists.primary && songData.artists.primary.length > 0) {
        artistName = songData.artists.primary[0].name;
      }
      
      const song: Song = {
        id: songData.id,
        name: songData.name,
        artist: artistName,
        image: songData.image && songData.image.length > 0 ? songData.image[2].url : '',
        url: songData.downloadUrl && songData.downloadUrl.length > 0 ? songData.downloadUrl[4].url : '',
      };
      
      const stored = localStorage.getItem('recentlyPlayed');
      const recentSongs: Song[] = stored ? JSON.parse(stored) : [];
      const filtered = recentSongs.filter((s) => s.id !== song.id);
      filtered.unshift(song);
      const limited = filtered.slice(0, 20);
      localStorage.setItem('recentlyPlayed', JSON.stringify(limited));
      setRecentlyPlayed(limited);
  
      setCurrentSong(song);
      setIsPlaying(true);
      toast.success(`Now playing: ${song.name}`);
    } catch (error) {
      console.error('Error fetching song URL:', error);
      toast.error('Failed to fetch song URL');
    }
  };
  
  const getAlbumUrl = async (id:string)=>{
    try {
      const response = await fetch(`https://saavn.dev/api/albums?id=${id}`);
      const data = await response.json();
      
      if (!data.success || !data.data ) {
        throw new Error('Invalid album data');
      }
      
      // Get the album data and songs - data is an array
      const albumData = data.data;
      
      if (albumData.songs && albumData.songs.length > 0) {
        // Create an array of Song objects from all tracks in the album
        const albumSongs: Song[] = albumData.songs.map((song: any) => {
          // Get artist name
          let artistName = 'Unknown Artist';
          if (song.artists && song.artists.primary && song.artists.primary.length > 0) {
            artistName = song.artists.primary[0].name;
          }
          
          // Create the song object
          return {
            id: song.id,
            name: song.name,
            artist: artistName,
            image: song.image && song.image.length > 0 ? 
                  song.image[2].url : 
                  (albumData.image && albumData.image.length > 0 ? albumData.image[2].url : ''),
            url: song.downloadUrl && song.downloadUrl.length > 0 ? song.downloadUrl[4].url : '',
          };
        });
        
        // Filter out any songs that don't have a valid URL
        const validSongs = albumSongs.filter(song => song.url);
        
        if (validSongs.length === 0) {
          toast.error('No playable songs found in this album');
          return;
        }
        
        // Update playlist with all songs from the album
        setPlaylist(validSongs);
        
        // Play the first song
        setCurrentSong(validSongs[0]);
        setIsPlaying(true);
        
        // Update recently played with the first song
        const stored = localStorage.getItem('recentlyPlayed');
        const recentSongs: Song[] = stored ? JSON.parse(stored) : [];
        const filtered = recentSongs.filter((s) => s.id !== validSongs[0].id);
        filtered.unshift(validSongs[0]);
        const limited = filtered.slice(0, 20);
        localStorage.setItem('recentlyPlayed', JSON.stringify(limited));
        setRecentlyPlayed(limited);
        
        toast.success(`Now playing: ${validSongs[0].name} from ${albumData.name}`);
      } else {
        toast.error('No songs found in this album');
      }
    } catch (error) {
      console.error('Error fetching album data:', error);
      toast.error('Failed to fetch album data');
    }
  }

  // Track item component - optimized for mobile
  const TrackItem: React.FC<TrackItemProps> = ({ track, trending }) => {
    return (
      <div className="flex items-center p-3 rounded-lg hover:bg-gray-800 active:bg-gray-700 cursor-pointer transition-colors duration-200 ease-in-out" 
        onClick={() => {
          track.type === 'album' ? (
            getAlbumUrl(track.id)
          ) : (
            getSongUrl(track.id)
          )
        }}>
        <div className="relative flex-shrink-0">
          <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded" />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
            {track.type === 'album' ? (
              <Album className="text-white w-5 h-5" />
            ) : (
              <Music className="text-white w-5 h-5" />
            )}
          </div>
        </div>
        <div className="ml-3 flex-grow min-w-0">
          <p className="text-white font-medium text-sm truncate">{track.title}</p>
          <p className="text-gray-400 text-xs truncate">{track.artist}</p>
        </div>
        {
          trending && track.plays && (
            <div className="flex items-center text-green-500 text-xs flex-shrink-0 ml-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{track.plays}</span>
            </div>
          )
        }
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-black to-zinc-900 text-white p-3 rounded-lg w-full mx-auto min-h-screen">
      <style jsx global>{`
        /* Custom scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(139, 92, 246, 0.8);
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.5) rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="relative mb-4 opacity-100 transform translate-y-0 transition-all duration-300">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-800 text-white w-full pl-9 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start">
          <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-xs">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {isLoading && searchQuery.trim() !== '' && (
          <div className="space-y-4">
            {/* Mobile Loading Skeleton */}
            <div className="bg-gray-900/40 rounded-lg p-3">
              <div className="flex items-center mb-3">
                <div className="w-4 h-4 bg-purple-500/30 rounded-full mr-2 animate-pulse"></div>
                <div className="h-5 bg-gray-700/50 rounded w-16 animate-pulse"></div>
              </div>

              <div className="space-y-2 max-h-[400px]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center p-2 rounded-lg bg-gray-800/30 animate-pulse">
                    <div className="w-10 h-10 bg-gray-700/50 rounded"></div>
                    <div className="ml-3 flex-grow">
                      <div className="h-3 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-gray-700/30 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && searchQuery.trim() !== '' ? (
          <>
            {(songs.length > 0 || albums.length > 0) ? (
              <div className="space-y-4">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-800">
                  <button 
                    className={`flex-1 py-2 text-sm font-medium ${activeTab === 'songs' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('songs')}
                  >
                    Songs ({songs.length})
                  </button>
                  <button 
                    className={`flex-1 py-2 text-sm font-medium ${activeTab === 'albums' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('albums')}
                  >
                    Albums ({albums.length})
                  </button>
                </div>

                {/* Songs Tab */}
                {activeTab === 'songs' && (
                  <div className="bg-gray-900/40 rounded-lg p-3 flex flex-col max-h-[calc(100vh-180px)]">
                    <div className="flex items-center mb-3">
                      <Music className="w-4 h-4 text-purple-500 mr-2" />
                      <h2 className="text-base font-semibold flex-grow">Songs</h2>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-1 custom-scrollbar flex-1">
                      {songs.length > 0 ? (
                        songs.map(track => (
                          <TrackItem key={track.id} track={track} trending={false} />
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          No songs found
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Albums Tab */}
                {activeTab === 'albums' && (
                  <div className="bg-gray-900/40 rounded-lg p-3 flex flex-col max-h-[calc(100vh-180px)]">
                    <div className="flex items-center mb-3">
                      <Album className="w-4 h-4 text-purple-500 mr-2" />
                      <h2 className="text-base font-semibold flex-grow">Albums</h2>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-1 custom-scrollbar flex-1">
                      {albums.length > 0 ? (
                        albums.map(track => (
                          <TrackItem key={track.id} track={track} trending={false} />
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          No albums found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 px-3">
                <div className="inline-block p-3 rounded-full bg-gray-800 mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-white mb-1">No results found</h3>
                <p className="text-gray-400 text-sm">
                  No matches for "{searchQuery}". Try different keywords.
                </p>
              </div>
            )}
          </>
        ) : (
          !isLoading && (
            <>
              <div className="flex items-center mb-3">
                <Disc3 className="w-4 h-4 text-purple-500 mr-2" />
                <h2 className="text-base font-semibold">Trending Now</h2>
              </div>

              <div className="space-y-1">
                {trendingTracks.map((track) => (
                  <TrackItem
                    key={track.id}
                    track={track}
                    trending={true}
                  />
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default MobileSearch;