"use client"

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Search, Music, Disc3, TrendingUp, Album, AlertTriangle, Play, Loader2, MoreHorizontal, Plus, Download, SkipForward } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'react-hot-toast';
import { gsap } from 'gsap';

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
  isCompact?: boolean;
  onPlay: (id: string, type?: string) => void;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onDownload?: (track: Track) => void;
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
  duration: number;
}

interface DownloadSongPayload {
  songUrl: string;
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  year: string;
  duration?: number;
  language?: string;
  genre?: string;
  label?: string;
  composer?: string;
  lyricist?: string;
  copyright?: string;
  coverUrl?: string;
}

// Menu component for song actions
const SongMenu = memo<{
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (id: string, type?: string) => void;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onDownload?: (track: Track) => void;
  position: { x: number; y: number };
}>(({ track, isOpen, onClose, onPlay, onPlayNext, onAddToQueue, onDownload, position }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      gsap.fromTo(menuRef.current, 
        { 
          opacity: 0, 
          scale: 0.8,
          y: -10
        },
        { 
          opacity: 1, 
          scale: 1,
          y: 0,
          duration: 0.2,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    {
      icon: Play,
      label: 'Play Now',
      action: async () => {
        onPlay(track.id, track.type);
        onClose();
      },
      actionKey: 'play'
    },
    {
      icon: SkipForward,
      label: 'Play Next',
      action: async () => {
        setLoadingAction('playNext');
        await onPlayNext?.(track);
        setLoadingAction(null);
        onClose();
      },
      actionKey: 'playNext'
    },
    {
      icon: Plus,
      label: 'Add to Queue',
      action: async () => {
        setLoadingAction('addToQueue');
        await onAddToQueue?.(track);
        setLoadingAction(null);
        onClose();
      },
      actionKey: 'addToQueue'
    },
    {
      icon: Download,
      label: 'Download',
      action: async () => {
        setLoadingAction('download');
        await onDownload?.(track);
        setLoadingAction(null);
        onClose();
      },
      actionKey: 'download'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div 
        ref={menuRef}
        className="absolute bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-2 min-w-[160px]"
        style={{
          left: Math.min(position.x, window.innerWidth - 180),
          top: Math.min(position.y, window.innerHeight - 200),
        }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            disabled={loadingAction !== null}
            className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === item.actionKey ? (
              <Loader2 className="w-4 h-4 mr-3 animate-spin" />
            ) : (
              <item.icon className="w-4 h-4 mr-3" />
            )}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
});

SongMenu.displayName = 'SongMenu';

// Skeleton loading component for trending tracks
const TrendingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((item) => (
        <div
          key={item}
          className="bg-zinc-900 rounded-xl overflow-hidden animate-pulse"
        >
          <div className="flex items-center p-2">
            <div className="relative w-10 h-10 flex-shrink-0 mr-3">
              <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden" />
            </div>
            <div className="flex-grow w-2/3">
              <div className="h-5 bg-zinc-800 rounded mb-1" />
              <div className="h-3 bg-zinc-800 rounded " />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Track item component - memoized to prevent unnecessary re-renders
const TrackItem = memo<TrackItemProps>(({ track, trending, isCompact = false, onPlay, onPlayNext, onAddToQueue, onDownload }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const trackRef = useRef<HTMLDivElement>(null);

  const isLoading = playingId === track.id;

  const handlePlayTrack = useCallback(() => {
    onPlay(track.id, track.type);
  }, [onPlay, track.id, track.type]);

  const handleMenuOpen = useCallback((trackId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setMenuPosition({ x: rect.right + 10, y: rect.top });
    setOpenMenuId(trackId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  useEffect(() => {
    if (trackRef.current) {
      gsap.fromTo(trackRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  if (isCompact) {
    return (
      <>
        <div
          ref={trackRef}
          className="flex items-center bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-300 cursor-pointer p-3 gap-3 group"
        >
          <div className="relative flex-shrink-0" onClick={handlePlayTrack}>
            <div className="w-14 h-14 bg-zinc-800 rounded-lg overflow-hidden">
              {track.coverUrl ? (
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Music className="w-7 h-7 text-white opacity-75" />
                </div>
              )}
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-grow overflow-hidden" onClick={handlePlayTrack}>
            <h3 className="font-semibold text-base truncate text-white group-hover:text-purple-300 transition-colors">
              {track.title}
            </h3>
            <p className="text-sm text-zinc-400 truncate mt-1">{track.artist}</p>
          </div>
          <div className="flex items-center gap-2">
            {trending && track.plays && (
              <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                {track.plays}
              </div>
            )}
            <button
              onClick={(e) => handleMenuOpen(track.id, e)}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>
            {!isLoading && (
              <button
                onClick={handlePlayTrack}
                className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </button>
            )}
          </div>
        </div>
        <SongMenu
          track={track}
          isOpen={openMenuId === track.id}
          onClose={handleMenuClose}
          onPlay={onPlay}
          onPlayNext={onPlayNext}
          onAddToQueue={onAddToQueue}
          onDownload={onDownload}
          position={menuPosition}
        />
      </>
    );
  }

  // Improved trending track display with smaller images
  if (trending) {
    return (
      <>
        <div
          ref={trackRef}
          className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center p-3">
            <div className="relative w-12 h-12 flex-shrink-0 mr-4" onClick={handlePlayTrack}>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden">
                {track.coverUrl ? (
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white opacity-75" />
                  </div>
                )}
              </div>
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-grow min-w-0" onClick={handlePlayTrack}>
              <h3 className="font-semibold text-sm truncate text-white group-hover:text-purple-300 transition-colors">
                {track.title}
              </h3>
              <p className="text-xs text-zinc-400 truncate mt-1">{track.artist}</p>
            </div>
            <div className="flex items-center gap-3">
              {track.plays && (
                <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {track.plays}
                </div>
              )}
              <button
                onClick={(e) => handleMenuOpen(track.id, e)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <MoreHorizontal className="w-4 h-4 text-white" />
              </button>
              {isLoading ? (
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              ) : (
                <button
                  onClick={handlePlayTrack}
                  className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>
        <SongMenu
          track={track}
          isOpen={openMenuId === track.id}
          onClose={handleMenuClose}
          onPlay={onPlay}
          onPlayNext={onPlayNext}
          onAddToQueue={onAddToQueue}
          onDownload={onDownload}
          position={menuPosition}
        />
      </>
    );
  }

  return (
    <div
      ref={trackRef}
      className="bg-zinc-900 rounded-xl overflow-hidden hover:bg-zinc-800 transition-all duration-300 cursor-pointer group"
      onClick={handlePlayTrack}
    >
      <div className="relative">
        <div className="aspect-square bg-zinc-800">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Music className="w-12 h-12 text-white opacity-75" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
          {isLoading ? (
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          )}
        </div>
        {trending && track.plays && (
          <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {track.plays}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate text-white group-hover:text-purple-300 transition-colors">
          {track.title}
        </h3>
        <p className="text-sm text-zinc-400 truncate mt-1">{track.artist}</p>
      </div>
    </div>
  );
});

TrackItem.displayName = 'TrackItem';

const SearchP: React.FC = () => {
  const { setQueue, play, addToNext, addToQueue, downloadSong } = usePlayer();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [songs, setSongs] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showAllSongs, setShowAllSongs] = useState<boolean>(false);
  const [showAllAlbums, setShowAllAlbums] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const songsContainerRef = useRef<HTMLDivElement>(null);
  const albumsContainerRef = useRef<HTMLDivElement>(null);

  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Helper function to fetch song data and convert Track to Song
  const fetchSongData = async (trackId: string): Promise<Song | null> => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return null;
      }

      const response = await fetch('/api/dashboard/getSongUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: trackId }),
      });

      if (!response.ok) {
        toast.error('Failed to get song details.');
        return null;
      }

      const data = await response.json();
      if (!data.data || !data.data[0]) {
        toast.error('Song data not found');
        return null;
      }

      const songData = data.data[0];
      let artistName = 'Unknown Artist';
      if (songData.artists && songData.artists.primary && songData.artists.primary.length > 0) {
        artistName = songData.artists.primary[0].name;
      }

      return {
        id: songData.id,
        name: songData.name.replaceAll("&quot;", `"`),
        artist: artistName,
        image: songData.image && songData.image.length > 0 ?
          (songData.image[2].url || '').replace(/^http:/, 'https:') : '',
        url: songData.downloadUrl && songData.downloadUrl.length > 0 ?
          (songData.downloadUrl[4].url || '').replace(/^http:/, 'https:') : '',
        duration: songData.duration || 0,
      };
    } catch (error) {
      console.error('Error fetching song data:', error);
      return null;
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
          "Authorization": `Bearer ${getAuthToken()}`
        }
      })

      const data = await response.json()

      const newArray = [];

      for (let i = 0; i < data.data.count; i++) {
        if (data.data.data[i].type === "song") {
          const realData: Track = {
            id: data.data.data[i].id,
            title: data.data.data[i].title.replaceAll("&quot;", `"`),
            artist: data.data.data[i].subtitle || '',
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
      setError('Failed to fetch trending tracks. Please try again later.');
    } finally {
      setIsTrendingLoading(false);
    }
  }

  useEffect(() => {
    getTrendingTracks();

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
              title: item.title.replaceAll("&quot;", `"`).replaceAll("&quot;", `"`) || item.song.replaceAll("&quot;", `"`) || 'Unknown Title',
              artist: item.more_info?.artistMap?.primary_artists?.[0]?.name || item.primaryArtists || 'Unknown Artist',
              album: item.subtitle || '',
              coverUrl: item.image.replace("150x150", "500x500").replace("http:", 'https:') || item.albumartwork_large || '/api/placeholder/64/64',
              type: 'song'
            });
          }
          // Process albums
          else if (item.type?.toLowerCase() === 'album' || (!item.type && item.more_info?.album_id)) {
            processedAlbums.push({
              id: item.id || item.albumid || `album-${Date.now()}-${Math.random()}`,
              title: item.title.replaceAll("&quot;", `"`).replaceAll("&quot;", `"`) || item.album.replaceAll("&quot;", `"`) || 'Unknown Album',
              artist: item.more_info?.artistMap?.primary_artists?.[0]?.name || item.primaryArtists || 'Unknown Artist',
              album: item.subtitle || item.year || '',
              coverUrl: item.image.replace("150x150", "500x500").replace("http:", 'https:') || item.albumartwork_large || '/api/placeholder/64/64',
              type: 'album'
            });
          }
          // If no type specified, try to determine from available fields
          else if (!item.type) {
            if (item.title.replaceAll("&quot;", `"`) && (item.artist || item.more_info?.singers)) {
              // Likely a song
              processedSongs.push({
                id: item.id || `song-${Date.now()}-${Math.random()}`,
                title: item.title.replaceAll("&quot;", `"`) || 'Unknown Title',
                artist: item.more_info?.artistMap?.primary_artists?.[0]?.name || item.more_info?.singers || item.subtitle,
                album: item.album || '',
                coverUrl: item.image.replace("150x150", "500x500").replace("http:", 'https:') || '/api/placeholder/64/64',
                type: 'song'
              });
            } else if (item.title.replaceAll("&quot;", `"`) && item.year) {
              // Likely an album
              processedAlbums.push({
                id: item.id || `album-${Date.now()}-${Math.random()}`,
                title: item.title.replaceAll("&quot;", `"`) || 'Unknown Album',
                artist: item.artist || item.more_info?.artistMap?.primary_artists?.[0]?.name || item.more_info?.singers || item.subtitle,
                album: item.subtitle || item.year || '',
                coverUrl: item.image.replace("150x150", "500x500").replace("http:", 'https:'),
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
            title: item.title.replaceAll("&quot;", `"`) || item.album || 'Unknown Album',
            artist: item.more_info?.primary_artists || item.artist || item.more_info?.artistMap?.primary_artists?.[0]?.name || item.more_info?.singers || item.subtitle,
            album: item.subtitle || item.year || '',
            coverUrl: item.image.replace("150x150", "500x500").replace("http:", 'https:'),
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
    // Reset show all states when starting a new search
    setShowAllSongs(false);
    setShowAllAlbums(false);
    debouncedSearch(query);
  };

  const getSongUrl = async (id: string) => {
    try {
      setPlayingId(id);
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/dashboard/getSongUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching song details:', errorData);
        toast.error('Failed to get song details. Please try again.');
        return;
      }

      const data = await response.json();

      if (!data.data || !data.data[0]) {
        toast.error('Song data not found');
        return;
      }

      const songData = data.data[0];

      let artistName = 'Unknown Artist';
      if (songData.artists && songData.artists.primary && songData.artists.primary.length > 0) {
        artistName = songData.artists.primary[0].name;
      }

      const song: Song = {
        id: songData.id,
        name: songData.name.replaceAll("&quot;", `"`),
        artist: artistName,
        image: songData.image && songData.image.length > 0 ?
          (songData.image[2].url || '').replace(/^http:/, 'https:') : '',
        url: songData.downloadUrl && songData.downloadUrl.length > 0 ?
          (songData.downloadUrl[4].url || '').replace(/^http:/, 'https:') : '',
        duration: songData.duration || 0,
      };

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
      toast.success(`Now playing: ${song.name}`);
    } catch (error) {
      console.error('Error fetching song URL:', error);
      toast.error('Failed to fetch song URL');
    } finally {
      setPlayingId(null);
    }
  };

  const getAlbumUrl = async (id: string) => {
    try {
      setPlayingId(id);
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/dashboard/getAlbumUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, type: 'album' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching album details:', errorData);
        toast.error('Failed to get album details. Please try again.');
        return;
      }

      const data = await response.json();

      if (!data.data) {
        toast.error('Album data not found');
        return;
      }

      // Get the album data and songs
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
              (song.image[2].url || '').replace(/^http:/, 'https:') :
              (albumData.image && albumData.image.length > 0 ?
                (albumData.image[2].url || '').replace(/^http:/, 'https:') : ''),
            url: song.downloadUrl && song.downloadUrl.length > 0 ?
              (song.downloadUrl[4].url || '').replace(/^http:/, 'https:') : '',
          };
        });

        // Filter out any songs that don't have a valid URL
        const validSongs = albumSongs.filter(song => song.url);

        if (validSongs.length === 0) {
          toast.error('No playable songs found in this album');
          return;
        }

        // Use new context methods to set queue and play
        setQueue(validSongs, 0);
        await play();

        // Update recently played with the first song
        const stored = localStorage.getItem('recentlyPlayed');
        const recentSongs: Song[] = stored ? JSON.parse(stored) : [];
        const filtered = recentSongs.filter((s) => s.id !== validSongs[0].id);
        filtered.unshift(validSongs[0]);
        const limited = filtered.slice(0, 20);
        localStorage.setItem('recentlyPlayed', JSON.stringify(limited));

        toast.success(`Now playing: ${validSongs[0].name} from ${albumData.name}`);
      } else {
        toast.error('No songs found in this album');
      }
    } catch (error) {
      console.error('Error fetching album data:', error);
      toast.error('Failed to fetch album data');
    } finally {
      setIsLoading(false);
      setPlayingId(null);
    }
  }

  const handlePlayItem = useCallback((id: string, type?: string) => {
    if (type === 'album') {
      getAlbumUrl(id);
    } else {
      getSongUrl(id);
    }
  }, []);

  // Menu handlers - memoized to prevent re-renders
  const handlePlayNext = useCallback(async (track: Track) => {
    const song = await fetchSongData(track.id);
    if (song) {
      addToNext(song);
      toast.success(`"${song.name}" will play next`);
    }
  }, [addToNext]);

  const handleAddToQueue = useCallback(async (track: Track) => {
    const song = await fetchSongData(track.id);
    if (song) {
      addToQueue(song);
      toast.success(`"${song.name}" added to queue`);
    }
  }, [addToQueue]);

  const handleDownload = useCallback(async (track: Track) => {
    try {
      // Get full song data including metadata
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/dashboard/getSongUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: track.id }),
      });

      if (!response.ok) {
        toast.error('Failed to get song details.');
        return;
      }

      const data = await response.json();
      if (!data.data || !data.data[0]) {
        toast.error('Song data not found');
        return;
      }

      const songData = data.data[0];
      
      // Extract metadata
      let artistName = 'Unknown Artist';
      if (songData.artists && songData.artists.primary && songData.artists.primary.length > 0) {
        artistName = songData.artists.primary[0].name;
      }

      // Create comprehensive download payload
      const downloadPayload = {
        songUrl: songData.downloadUrl && songData.downloadUrl.length > 0 ?
          (songData.downloadUrl[4].url || '').replace(/^http:/, 'https:') : '',
        title: songData.name.replaceAll("&quot;", `"`),
        artist: artistName,
        album: songData.album?.name || track.album || 'Unknown Album',
        albumArtist: artistName,
        year: songData.year || new Date().getFullYear().toString(),
        duration: songData.duration || 0,
        language: songData.language || 'Unknown',
        genre: songData.primaryArtistsId ? 'Bollywood' : 'Unknown', // You can enhance this
        label: songData.label || 'Unknown Label',
        composer: songData.music || 'Unknown',
        lyricist: songData.lyrics || 'Unknown',
        copyright: songData.copyright_text || '',
        coverUrl: songData.image && songData.image.length > 0 ?
          (songData.image[2].url || '').replace(/^http:/, 'https:') : '',
      };

      if (!downloadPayload.songUrl) {
        toast.error('Song download URL not available');
        return;
      }

      await downloadSong(downloadPayload);
      toast.success(`"${downloadPayload.title}" download started`);
    } catch (error) {
      console.error('Error downloading song:', error);
      toast.error('Failed to download song');
    }
  }, [downloadSong]);

  // Animation effects
  useEffect(() => {
    if (songsContainerRef.current && songs.length > 0) {
      gsap.fromTo(songsContainerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [songs]);

  useEffect(() => {
    if (albumsContainerRef.current && albums.length > 0) {
      gsap.fromTo(albumsContainerRef.current.children,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
      );
    }
  }, [albums]);

  return (
    <div className="h-full overflow-y-auto pb-24 text-white">
      {/* Header area */}
      <div className="bg-gradient-to-b from-indigo-900/20 to-black p-6">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
          Search
        </h1>
        <p className="text-zinc-400 mb-8 text-lg">Find your favorite songs, artists, and albums</p>

        {/* Search input */}
        <div className="relative max-w-3xl">
          <div className="flex items-center bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-2xl px-6 py-4 focus-within:border-purple-500 focus-within:bg-zinc-900 transition-all duration-300 shadow-lg">
            <Search className="w-6 h-6 text-zinc-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="What do you want to listen to?"
              className="bg-transparent border-none outline-none text-white placeholder-zinc-500 w-full text-lg"
            />
            {isLoading && <Loader2 className="w-6 h-6 text-purple-400 animate-spin ml-3" />}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-6">
        {error && (
          <div className="bg-red-400/10 text-red-400 p-4 rounded-lg mb-6">
            <p className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> {error}
            </p>
          </div>
        )}

        {searchQuery.trim() === '' ? (
          /* Trending section when no search */
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 text-purple-400 mr-3" />
                Trending Tracks
                <span className="ml-3 text-sm text-zinc-400 font-normal">Hot right now</span>
              </h2>

              {isTrendingLoading ? (
                <TrendingSkeleton />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trendingTracks.map(track => (
                    <TrackItem 
                      key={track.id} 
                      track={track} 
                      trending={true} 
                      onPlay={handlePlayItem}
                      onPlayNext={handlePlayNext}
                      onAddToQueue={handleAddToQueue}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Search results */
          <div>
            {/* Combined search results in a grid layout */}
            {(songs.length > 0 || albums.length > 0) && (
              <div className="space-y-8">
                {/* Combined view with filtering options */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Search className="w-6 h-6 text-purple-400 mr-3" />
                    Search Results
                  </h2>
                  <div className="flex space-x-2">
                    <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                      {songs.length} songs • {albums.length} albums
                    </span>
                  </div>
                </div>

                {/* Songs section - compact list view */}
                {songs.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Music className="w-5 h-5 text-purple-400 mr-3" />
                      Top Songs
                      <span className="ml-2 text-sm text-zinc-400 font-normal">({Math.min(songs.length, 5)} results)</span>
                    </h3>
                    <div ref={songsContainerRef} className="space-y-2">
                      {songs.slice(0, 5).map(track => (
                        <TrackItem
                          key={track.id}
                          track={track}
                          trending={false}
                          isCompact={true}
                          onPlay={handlePlayItem}
                          onPlayNext={handlePlayNext}
                          onAddToQueue={handleAddToQueue}
                          onDownload={handleDownload}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Albums section - grid view */}
                {albums.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Disc3 className="w-5 h-5 text-purple-400 mr-3" />
                      Albums
                      <span className="ml-2 text-sm text-zinc-400 font-normal">({albums.length} results)</span>
                    </h3>
                    <div ref={albumsContainerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {(showAllAlbums ? albums : albums.slice(0, 12)).map(album => (
                        <div
                          key={album.id}
                          className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-300 cursor-pointer group"
                          onClick={() => handlePlayItem(album.id, 'album')}
                        >
                          <div className="relative">
                            <div className="aspect-square bg-zinc-800">
                              <img
                                src={album.coverUrl}
                                alt={album.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = '';
                                  e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-purple-600', 'to-indigo-600', 'flex', 'items-center', 'justify-center');
                                  e.currentTarget.style.display = 'none';
                                  const div = document.createElement('div');
                                  div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
                                  e.currentTarget.parentElement!.appendChild(div);
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                              {playingId === album.id ? (
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform">
                                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-sm truncate text-white group-hover:text-purple-300 transition-colors">{album.title}</h3>
                            <p className="text-xs text-zinc-400 truncate mt-1">{album.artist}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {albums.length > 12 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setShowAllAlbums(!showAllAlbums)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                        >
                          {showAllAlbums ? "Show less" : `Show more albums (${albums.length - 12} more)`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {songs.length === 0 && albums.length === 0 && !isLoading && (
              <div className="text-center py-10">
                <p className="text-zinc-400 mb-4">No results found for "{searchQuery}"</p>
                <button
                  onClick={() => handleSearch('')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchP;