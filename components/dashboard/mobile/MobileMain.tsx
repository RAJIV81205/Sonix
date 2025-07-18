"use client";

import { Search, Bell, User, Loader2, Plus, Music, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'react-hot-toast';
import MobileAddPlaylistPopup from './MobileAddPlaylistPopup';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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

const MobileMain = () => {
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
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState<Song | null>(null);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [showAddPlaylistPopup, setShowAddPlaylistPopup] = useState(false);
  const suggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(true);
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
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

  // Add event listener to close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node) &&
        showSuggestions
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);


    return () => {
      document.removeEventListener('mousedown', handleClickOutside);

    };
  }, [showSuggestions]);

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
      setSearchQuery(""); // Clear the input box after playing a song
      toast.success(`Now playing: ${item.title.replaceAll("&quot;", `"`)}`);
    } catch (error) {
      console.error('Error playing song:', error);
      toast.error('Failed to play song. Please try again.');
    } finally {
      setLoadingSong(null);
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

      // Check if song already exists in playlist
      if (data.alreadyExists) {
        toast.error(`"${song.name}" is already in this playlist`);
      } else {
        toast.success(`Added "${song.name}" to playlist`);
      }

      // Close modal
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
      // Get full song details first
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

  // Handle new playlist creation
  const handlePlaylistCreated = (playlistId: string, playlistName: string) => {
    // Add the new playlist to the state
    setPlaylists(prev => [
      { id: playlistId, name: playlistName, songCount: 0 },
      ...prev
    ]);
    // Close the popup
    setShowAddPlaylistPopup(false);
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

  // Recently played item component
  const RecentPlayItem = ({ song }: { song: Song }) => (
    <div className="flex flex-col">
      <div
        className="relative aspect-square bg-zinc-800 rounded-lg mb-2 overflow-hidden cursor-pointer"
        onClick={() => {
          setCurrentSong(song);
          setIsPlaying(true);
        }}
      >
        <img src={song.image.replace('150x150', '500x500').replace('http:', 'https:')} alt={song.name.replaceAll("&quot;", `"`)} className="w-full h-full object-cover" />

        {/* Add to playlist button */}
        <button
          className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 text-white"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToPlaylist(song);
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      <h3 className="font-medium text-sm truncate">{song.name.replaceAll("&quot;", `"`)}</h3>
      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
    </div>
  );

  // Add to playlist modal
  const AddToPlaylistModal = () => {
    if (!showAddToPlaylistModal) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-100 flex items-end">
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
        <div className="relative w-full" ref={suggestionBoxRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            className="w-full bg-zinc-800/50 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />

          {showSuggestions && (
            <div className="absolute w-full mt-2 bg-zinc-800 rounded-md shadow-lg max-h-[50vh] overflow-y-auto z-50">
              <div className="p-3">
                <h3 className="text-sm font-semibold mb-2 flex items-center justify-between">
                  <span>Search Results</span>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="p-1 rounded-full hover:bg-zinc-700"
                  >
                    <X size={16} />
                  </button>
                </h3>

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
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2 hover:bg-zinc-700/50 rounded"
                    >
                      <div
                        className="flex items-center gap-3 flex-grow cursor-pointer"
                        onClick={() => handleSongSelect(item)}
                      >
                        <div className="w-10 h-10 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                          <img src={item.image.replace("150x150", "500x500")} alt={item.title.replaceAll("&quot;", `"`)} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{item.title.replaceAll("&quot;", `"`)}</p>
                          <p className="text-xs text-zinc-400 truncate">
                            {item.more_info?.artistMap?.primary_artists?.[0]?.name || 'Unknown Artist'}
                          </p>
                        </div>
                      </div>

                      {loadingSong === item.id ? (
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin mr-2" />
                      ) : (
                        <button
                          className="p-2 text-zinc-400 hover:text-purple-500"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const songDetails = await getSongDetails(item.id);
                              if (songDetails) {
                                handleAddToPlaylist(songDetails);
                              }
                            } catch (error) {
                              console.error("Error adding song to playlist:", error);
                              toast.error("Failed to add song to playlist");
                            }
                          }}
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400 text-sm p-2">No results found</p>
                )}

              </div>
            </div>
          )}
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
            <div className="grid grid-cols-4 gap-4">
              {[...Array(12)].map((_, index) => (
                <div key={`skeleton-${index}`} className="flex flex-col">
                  <div className="aspect-square bg-zinc-800 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {trendingTracks.slice(0, 12).map((track) => (
                <div
                  key={track.id}
                  className="flex flex-col"
                >
                  <div
                    className="relative aspect-square bg-zinc-800 rounded-lg mb-2 overflow-hidden cursor-pointer"
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
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToPlaylist({
                          id: track.id,
                          name: track.title,
                          artist: track.artist,
                          image: track.coverUrl,
                          url: '',
                          duration: 0
                        });
                      }}
                    >
                      <Plus size={18} />
                    </button>
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
            <div className="grid grid-cols-4 gap-4">
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
            {topArtists.map((artist) => (
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

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal />

      {/* Add Playlist Popup */}
      <MobileAddPlaylistPopup
        isOpen={showAddPlaylistPopup}
        onClose={() => setShowAddPlaylistPopup(false)}
        onSuccess={handlePlaylistCreated}
      />
    </div >
  );
};

export default MobileMain;