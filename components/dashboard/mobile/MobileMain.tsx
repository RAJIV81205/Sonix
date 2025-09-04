"use client";

import { Search, Bell, User, Loader2, Plus, Music, X, MoreVertical, Play, SkipForward, ListPlus, Heart, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'react-hot-toast';
import MobileAddPlaylistPopup from './MobileAddPlaylistPopup';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {topArtists} from '@/lib/constant'

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
  songCount?: number;
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

interface MenuPosition {
  x: number;
  y: number;
}

const MobileMain = () => {
  const router = useRouter();
  const { 
    setQueue, 
    play,
    addToQueue, 
    addToNext, 
    queue = [], 
    currentSong 
  } = usePlayer();
  
  const [loadingSong, setLoadingSong] = useState<string | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState<Song | null>(null);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [showAddPlaylistPopup, setShowAddPlaylistPopup] = useState(false);
  const [showSongMenu, setShowSongMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(true);
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -10,
      transition: { duration: 0.15 }
    }
  };

  const { ref: recRef, inView: recInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: recentRef, inView: recentInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: artistRef, inView: artistInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: madeRef, inView: madeInView } = useInView({ triggerOnce: true, threshold: 0.15 });

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSongMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSongMenu]);

  // Handle menu button click
  const handleMenuClick = (event: React.MouseEvent, song: Song) => {
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const menuWidth = 200; // Approximate menu width
    
    // Position menu to the left if it would overflow on the right
    const x = rect.left + menuWidth > viewportWidth ? rect.left - menuWidth : rect.left;
    const y = rect.bottom + 5;
    
    setMenuPosition({ x: Math.max(10, x), y });
    setSelectedSong(song);
    setShowSongMenu(song.id);
  };

  const handleMenuAction = async (action: string) => {
    if (!selectedSong) return;
    
    try {
      switch (action) {
        case 'play':
          const songDetails = await getSongDetails(selectedSong.id);
          if (songDetails) {
            updateRecentlyPlayed(songDetails);
            setQueue([songDetails], 0);
            await play();
            toast.success(`Now playing: ${songDetails.name}`);
          }
          break;
          
        case 'playNext':
          const nextSongDetails = await getSongDetails(selectedSong.id);
          if (nextSongDetails) {
            addToNext(nextSongDetails);
            toast.success(`Added to play next: ${nextSongDetails.name}`);
          } else {
            toast.error('Play next feature not available');
          }
          break;
          
        case 'addToQueue':
          const queueSongDetails = await getSongDetails(selectedSong.id);
          if (queueSongDetails && addToQueue) {
            addToQueue(queueSongDetails);
            toast.success(`Added to queue: ${queueSongDetails.name}`);
          } else {
            toast.error('Queue feature not available');
          }
          break;
          
        case 'addToPlaylist':
          await handleAddToPlaylist(selectedSong);
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling menu action:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setShowSongMenu(null);
      setSelectedSong(null);
    }
  };

  const updateRecentlyPlayed = (song: Song) => {
    const stored = localStorage.getItem('recentlyPlayed');
    const recentSongs: Song[] = stored ? JSON.parse(stored) : [];
    const filtered = recentSongs.filter((s) => s.id !== song.id);
    filtered.unshift(song);
    const limited = filtered.slice(0, 20);
    localStorage.setItem('recentlyPlayed', JSON.stringify(limited));
    setRecentlyPlayed(limited);
  };

  // Fetch playlists when needed
  const fetchPlaylists = async () => {
    if (!token) return;

    try {
      setIsLoadingPlaylists(true);
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
      toast.error("Couldn't load your playlists");
    } finally {
      setIsLoadingPlaylists(false);
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

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
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

      if (data.alreadyExists) {
        toast.error(`"${song.name}" is already in this playlist`);
      } else {
        toast.success(`Added "${song.name}" to playlist`);
      }

      setShowAddToPlaylistModal(null);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add song to playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const handleAddToPlaylist = async (song: Song) => {
    try {
      const songDetails = await getSongDetails(song.id);
      if (!songDetails) {
        toast.error('Failed to get song details');
        return;
      }
      setShowAddToPlaylistModal(songDetails);
      await fetchPlaylists();
    } catch (error) {
      console.error('Error getting song details:', error);
      toast.error('Failed to get song details');
    }
  };

  const getPlaylistColor = (index: number) => {
    const colors = [
      "from-teal-500 to-emerald-500",
      "from-amber-500 to-orange-500",
      "from-blue-500 to-indigo-500",
      "from-pink-500 to-rose-500",
      "from-emerald-500 to-cyan-500"
    ];
    return colors[index % colors.length];
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

  const handlePlaylistCreated = (playlistId: string, playlistName: string) => {
    setPlaylists(prev => [
      { id: playlistId, name: playlistName, songCount: 0 },
      ...prev
    ]);
    setShowAddPlaylistPopup(false);
  };

  // Recently played item component with menu
  const RecentPlayItem = ({ song }: { song: Song }) => (
    <div className="flex flex-col">
      <div
        className="relative aspect-square bg-zinc-800 rounded-lg mb-2 overflow-hidden cursor-pointer group"
        onClick={async () => {
          setQueue([song], 0);
          await play();
        }}
      >
        <img src={song.image.replace('150x150', '500x500').replace('http:', 'https:')} alt={song.name.replaceAll("&quot;", `"`)} className="w-full h-full object-cover" />
        
        {/* Menu button */}
        <button
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => handleMenuClick(e, song)}
        >
          <MoreVertical size={16} />
        </button>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="p-3 rounded-full bg-purple-600 text-white">
            <Play size={20} fill="currentColor" />
          </div>
        </div>
      </div>
      <h3 className="font-medium text-sm truncate">{song.name.replaceAll("&quot;", `"`)}</h3>
      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
    </div>
  );

  // Song menu component
  const SongMenu = () => {
    if (!showSongMenu || !selectedSong) return null;

    return (
      <div 
        className="fixed inset-0 z-50"
        style={{ pointerEvents: 'none' }}
      >
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bg-zinc-800 rounded-lg shadow-xl py-2 min-w-[180px] border border-zinc-700"
            style={{ 
              left: menuPosition.x, 
              top: menuPosition.y,
              pointerEvents: 'auto'
            }}
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-3 text-white"
              onClick={() => handleMenuAction('play')}
            >
              <Play size={18} />
              Play
            </button>
            
            <button
              className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-3 text-white"
              onClick={() => handleMenuAction('playNext')}
            >
              <SkipForward size={18} />
              Play next
            </button>
            
            <button
              className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-3 text-white"
              onClick={() => handleMenuAction('addToQueue')}
            >
              <Clock size={18} />
              Add to queue
            </button>
            
            <button
              className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-3 text-white"
              onClick={() => handleMenuAction('addToPlaylist')}
            >
              <ListPlus size={18} />
              Add to playlist
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  // Add to playlist modal
  const AddToPlaylistModal = () => {
    if (!showAddToPlaylistModal) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
        <div className="w-full bg-zinc-900 rounded-t-xl max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900">
            <h2 className="text-lg font-bold">Add to Playlist</h2>
            <button onClick={() => setShowAddToPlaylistModal(null)} className="p-2">
              <X size={24} />
            </button>
          </div>

          <div className="p-2 pb-safe">
            {isLoadingPlaylists ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : playlists.length > 0 ? (
              <div className="space-y-1">
                {playlists.map((playlist, index) => (
                  <button
                    key={playlist.id}
                    className="w-full flex items-center gap-3 p-4 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors"
                    onClick={() => addSongToPlaylist(playlist.id, showAddToPlaylistModal)}
                    disabled={addingToPlaylist === playlist.id}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${getPlaylistColor(index)} rounded-md flex items-center justify-center`}>
                      {addingToPlaylist === playlist.id ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Music className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{playlist.name}</p>
                      <p className="text-xs text-zinc-500">{playlist.songCount || 0} songs</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-zinc-400">You don't have any playlists yet.</p>
                <button
                  className="mt-4 px-4 py-2 bg-purple-600 rounded-full text-white font-medium"
                  onClick={() => {
                    setShowAddToPlaylistModal(null);
                    setShowAddPlaylistPopup(true);
                  }}
                >
                  Create a Playlist
                </button>
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
      <div className="flex items-center justify-between p-4 pt-20">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input 
            ref={searchInputRef} 
            type="text" 
            placeholder="What do you want to listen to?" 
            className="w-full bg-zinc-800/50 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none cursor-pointer" 
            onClick={() => router.push('/dashboard/search')} 
            readOnly/>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto pb-20">
        <motion.div
          ref={recRef}
          variants={fadeInUp}
          initial="hidden"
          animate={recInView ? 'visible' : 'hidden'}
          className="py-4 pb-10"
        >
          <h2 className="text-xl font-bold mb-4">Recommendations</h2>
          {isTrendingLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(12)].map((_, index) => (
                <div key={`skeleton-${index}`} className="flex flex-col">
                  <div className="aspect-square bg-zinc-800 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {trendingTracks.slice(0, 12).map((track) => (
                <div key={track.id} className="flex flex-col">
                  <div
                    className="relative aspect-square bg-zinc-800 rounded-lg mb-2 overflow-hidden cursor-pointer group"
                    onClick={() => router.push('/dashboard/search')}
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Menu button */}
                    <button
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(e, {
                          id: track.id,
                          name: track.title,
                          artist: track.artist,
                          image: track.coverUrl,
                          url: '',
                          duration: 0
                        });
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="p-3 rounded-full bg-purple-600 text-white">
                        <Play size={20} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-sm truncate">{track.title.replaceAll("&quot;", `"`)}</h3>
                  <p className="text-xs text-zinc-400 truncate">{track.artist.replaceAll("&quot;", `"`)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recently Played Section */}
        <motion.div
          ref={recentRef}
          variants={fadeInUp}
          initial="hidden"
          animate={recentInView ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Recently Played</h2>

          {recentlyPlayed.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {recentlyPlayed.slice(0, 6).map((song) => (
                <RecentPlayItem key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-zinc-400">No recently played songs</p>
              <p className="text-xs text-zinc-500 mt-1">Your recently played tracks will appear here</p>
            </div>
          )}
        </motion.div>

        {/* Artists Section */}
        <motion.div
          ref={artistRef}
          variants={fadeInUp}
          initial="hidden"
          animate={artistInView ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Top Artists</h2>
          <div className="grid grid-cols-3 gap-5">
            {topArtists.slice(0,6).map((artist) => (
              <Link key={artist.id} href={`dashboard/artist/${artist.id}`} className="flex flex-col">
                <div className="aspect-square bg-zinc-800 rounded-full mb-4 overflow-hidden border border-gray-400/40">
                  <img src={artist.img} alt={artist.name} loading="lazy" />
                </div>
                <h3 className="font-medium text-sm text-center mb-1 truncate">{artist.name}</h3>
                <p className="text-xs text-zinc-400 text-center truncate">{artist.genre}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Made For You Section */}
        <motion.div
          ref={madeRef}
          variants={fadeInUp}
          initial="hidden"
          animate={madeInView ? 'visible' : 'hidden'}
        >
          <h2 className="text-xl font-bold mb-4">Made For You</h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex flex-col">
                <div className="aspect-square bg-zinc-800 rounded-lg mb-2"></div>
                <h3 className="font-medium text-sm">Album Title {item}</h3>
                <p className="text-xs text-zinc-400">Artist Name</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Song Menu */}
      <SongMenu />

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal />

      {/* Add Playlist Popup */}
      <MobileAddPlaylistPopup
        isOpen={showAddPlaylistPopup}
        onClose={() => setShowAddPlaylistPopup(false)}
        onSuccess={handlePlaylistCreated}
      />
    </div>
  );
};

export default MobileMain;
