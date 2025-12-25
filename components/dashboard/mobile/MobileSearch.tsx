"use client"

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Search, Music, Disc3, TrendingUp, Album, AlertTriangle, Play, Loader2, MoreHorizontal, Plus, Download, SkipForward } from 'lucide-react';
import { usePlayerControls } from '@/context/PlayerControlsContext';
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

const MobileSearch = () => {
  const { setQueue, play, addToNext, addToQueue, downloadSong } = usePlayerControls();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [songs, setSongs] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'songs' | 'albums'>('songs');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Get auth token from localStorage
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
        name: songData.name,
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
        setRecentlyPlayed(limited);

        toast.success(`Now playing: ${validSongs[0].name} from ${albumData.name}`);
      } else {
        toast.error('No songs found in this album');
      }
    } catch (error) {
      console.error('Error fetching album data:', error);
      toast.error('Failed to fetch album data');
    } finally {
      setPlayingId(null);
    }
  }

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
      const downloadPayload: DownloadSongPayload = {
        songUrl: songData.downloadUrl && songData.downloadUrl.length > 0 ?
          (songData.downloadUrl[4].url || '').replace(/^http:/, 'https:') : '',
        title: songData.name.replaceAll("&quot;", `"`),
        artist: artistName,
        album: songData.album?.name || track.album || 'Unknown Album',
        albumArtist: artistName,
        year: songData.year || new Date().getFullYear().toString(),
        duration: songData.duration || 0,
        language: songData.language || 'Unknown',
        genre: songData.primaryArtistsId ? 'Bollywood' : 'Unknown',
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

  const handlePlayItem = useCallback((id: string, type?: string) => {
    if (type === 'album') {
      getAlbumUrl(id);
    } else {
      getSongUrl(id);
    }
  }, []);

  const handleMenuOpen = useCallback((trackId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setMenuPosition({ x: rect.right + 10, y: rect.top });
    setOpenMenuId(trackId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  // Helper function to find track by ID
  const findTrackById = useCallback((id: string): Track => {
    return songs.find(s => s.id === id) || 
           albums.find(a => a.id === id) || 
           trendingTracks.find(t => t.id === id) || 
           { id: '', title: '', artist: '', album: '', coverUrl: '' };
  }, [songs, albums, trendingTracks]);

  // Track item component - optimized for mobile with menu functionality
  const TrackItem = memo<{
    track: Track;
    trending: boolean;
    isPlaying: boolean;
    onPlay: (id: string, type?: string) => void;
    onMenuOpen: (trackId: string, event: React.MouseEvent) => void;
    onPlayNext?: (track: Track) => void;
    onAddToQueue?: (track: Track) => void;
    onDownload?: (track: Track) => void;
  }>(({ track, trending, isPlaying, onPlay, onMenuOpen, onPlayNext, onAddToQueue, onDownload }) => {
    
    const handlePlayTrack = useCallback(() => {
      onPlay(track.id, track.type);
    }, [onPlay, track.id, track.type]);

    const handleMenuClick = useCallback((event: React.MouseEvent) => {
      onMenuOpen(track.id, event);
    }, [onMenuOpen, track.id]);

    return (
      <div className="flex items-center p-3 rounded-lg hover:bg-gray-800 active:bg-gray-700 cursor-pointer transition-colors duration-200 ease-in-out group"
        onClick={handlePlayTrack}>
        <div className="relative flex-shrink-0">
          <img 
            src={track.coverUrl} 
            alt={track.title} 
            className="w-10 h-10 rounded" 
            onError={(e) => {
              e.currentTarget.src = '/api/placeholder/40/40';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
            {isPlaying ? (
              <Loader2 className="text-white w-4 h-4 animate-spin" />
            ) : track.type === 'album' ? (
              <Album className="text-white w-4 h-4" />
            ) : (
              <Music className="text-white w-4 h-4" />
            )}
          </div>
        </div>
        <div className="ml-3 flex-grow min-w-0">
          <p className="text-white font-medium text-sm truncate">{track.title}</p>
          <p className="text-gray-400 text-xs truncate">{track.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          {trending && track.plays && (
            <div className="flex items-center text-green-500 text-xs flex-shrink-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>{track.plays}</span>
            </div>
          )}
          <button
            onClick={handleMenuClick}
            className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-lg"
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    );
  });

  TrackItem.displayName = 'TrackItem';

  return (
    <div className="bg-gradient-to-b from-black to-zinc-900 text-white p-3 rounded-lg w-full mx-auto min-h-screen py-20">
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

      <div className="relative mb-4 opacity-100 transform translate-y-0 transition-all duration-300 ">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
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
                    Songs ({Math.min(songs.length, 5)})
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium ${activeTab === 'albums' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('albums')}
                  >
                    Albums ({Math.min(albums.length, 5)})
                  </button>
                </div>

                {/* Songs Tab */}
                {activeTab === 'songs' && (
                  <div className="bg-gray-900/40 rounded-lg p-3 flex flex-col max-h-[calc(100vh-180px)]">
                    <div className="flex items-center mb-3">
                      <Music className="w-4 h-4 text-purple-500 mr-2" />
                      <h2 className="text-base font-semibold flex-grow">Songs</h2>
                      <span className="text-xs text-gray-400">Top {Math.min(songs.length, 5)}</span>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-1 custom-scrollbar flex-1">
                      {songs.length > 0 ? (
                        songs.slice(0, 5).map(track => (
                          <TrackItem 
                            key={track.id} 
                            track={track} 
                            trending={false}
                            isPlaying={playingId === track.id}
                            onPlay={handlePlayItem}
                            onMenuOpen={handleMenuOpen}
                            onPlayNext={handlePlayNext}
                            onAddToQueue={handleAddToQueue}
                            onDownload={handleDownload}
                          />
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
                      <span className="text-xs text-gray-400">Top {Math.min(albums.length, 5)}</span>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-1 custom-scrollbar flex-1">
                      {albums.length > 0 ? (
                        albums.slice(0, 5).map(track => (
                          <TrackItem 
                            key={track.id} 
                            track={track} 
                            trending={false}
                            isPlaying={playingId === track.id}
                            onPlay={handlePlayItem}
                            onMenuOpen={handleMenuOpen}
                            onPlayNext={handlePlayNext}
                            onAddToQueue={handleAddToQueue}
                            onDownload={handleDownload}
                          />
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
                {trendingTracks.slice(0, 10).map((track) => (
                  <TrackItem
                    key={track.id}
                    track={track}
                    trending={true}
                    isPlaying={playingId === track.id}
                    onPlay={handlePlayItem}
                    onMenuOpen={handleMenuOpen}
                    onPlayNext={handlePlayNext}
                    onAddToQueue={handleAddToQueue}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </>
          )
        )}
      </div>
      
      {/* Global Song Menu */}
      <SongMenu
        track={openMenuId ? findTrackById(openMenuId) : { id: '', title: '', artist: '', album: '', coverUrl: '' }}
        isOpen={openMenuId !== null}
        onClose={handleMenuClose}
        onPlay={handlePlayItem}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
        onDownload={handleDownload}
        position={menuPosition}
      />
    </div>
  );
};

export default MobileSearch;