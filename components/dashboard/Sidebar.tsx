"use client"

import { useState, useEffect } from 'react';
import { Home, Search, Library, Plus, Heart, Music, Mic, Clock, Compass, Headphones, Download } from 'lucide-react';
import Link from 'next/link';
import AddPlaylistPopup from './AddPlaylistPopup';
import SpotifyPopup from './SpotifyPopup';
import { toast } from 'react-hot-toast';

interface Playlist {
  id: string;
  name: string;
  songCount?: number;
  cover?: string;
}

export default function Sidebar() {
  const [showAddPlaylistPopup, setShowAddPlaylistPopup] = useState(false);
  const [showSpotifyPopup, setShowSpotifyPopup] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user playlists on mount
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem('token');
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
        // Don't show error toast on initial load
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handlePlaylistCreated = (playlistId: string, playlistName: string) => {
    // Add the new playlist to the state
    setPlaylists(prev => [
      { id: playlistId, name: playlistName, songCount: 0 },
      ...prev
    ]);
  };

  const handleImportFromSpotify = () => {
    setShowSpotifyPopup(true);
  };

  // Function to get playlist color based on index
  const getPlaylistColor = (index: number) => {
    const colors = [
      "from-teal-500 to-emerald-500",
      "from-amber-500 to-orange-500",
      "from-purple-500 to-indigo-500",
      "from-indigo-500 to-violet-500",
      "from-emerald-500 to-cyan-500"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full bg-black text-white p-5 flex flex-col gap-6 border-r border-zinc-800 shadow-xl min-h-screen">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
          <Headphones className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">Sonix</h1>
          <p className="text-xs text-zinc-400">Music Experience</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50"></div>

      {/* Main Nav Section */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-1">Main</h2>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 hover:bg-zinc-900 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Home className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <Link href="/dashboard/search" className="flex items-center gap-3 hover:bg-zinc-900 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Search className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-sm font-medium">Search</span>
          </Link>
          <Link href="/rooms" className="flex items-center gap-3 hover:bg-zinc-900 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Compass className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-sm font-medium">Rooms</span>
          </Link>
        </nav>
      </div>

      {/* Library Section */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-1">Your Library</h2>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard/library" className="flex items-center gap-3 hover:bg-zinc-900 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Library className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-sm font-medium">Collections</span>
          </Link>
          <Link href="/dashboard/recent" className="flex items-center gap-3 hover:bg-zinc-900 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Clock className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-sm font-medium">Recent Plays</span>
          </Link>
          <Link href="/dashboard/artists" className="flex items-center gap-3 hover:bg-zinc-900 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Mic className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-sm font-medium">Artists</span>
          </Link>
        </nav>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50"></div>

      {/* Playlist Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold px-1">Playlists</h2>
          <div className="flex space-x-1">
            <button
              className="p-1.5 rounded-md hover:bg-zinc-900 transition-colors"
              onClick={() => setShowAddPlaylistPopup(true)}
              title="Create playlist"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Spotify Import Button */}
        <button
          onClick={handleImportFromSpotify}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 mb-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium text-sm transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Import from Spotify
        </button>

        {/* Create Playlist Button - Styled like Spotify button */}


        <div className="space-y-2">
          <div className="flex items-center gap-3 hover:bg-zinc-900 py-2 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-md flex items-center justify-center shadow-md shadow-indigo-500/10">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Liked Songs</p>
              <p className="text-xs text-zinc-500">120 songs</p>
            </div>
          </div>

          {/* User Playlists */}
          {loading ? (
            <div className="py-3 text-center">
              <div className="animate-pulse bg-zinc-900 h-12 rounded-lg w-full"></div>
            </div>
          ) : playlists.length > 0 ? (
            playlists.map((playlist, index) => (
              <Link
                href={`/dashboard/playlist/${playlist.id}`}
                key={playlist.id}
                className="flex items-center gap-3 hover:bg-zinc-900 py-2 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group"
              >
                {playlist.cover ? (
                  <div className="h-full w-1/3 rounded-md flex items-center justify-center shadow-md overflow-hidden">
                    <img
                      src={playlist.cover}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-10 h-10 bg-gradient-to-br ${getPlaylistColor(index)} rounded-md flex items-center justify-center shadow-md`}>
                    <Music className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className='w-2/3'>
                  <p className="text-sm font-medium truncate">{playlist.name}</p>
                  <p className="text-xs text-zinc-500">
                    {playlist.songCount || 0} songs
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <button
              onClick={() => setShowAddPlaylistPopup(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 mb-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Create Playlist
            </button>
          )}
        </div>
      </div>

      {/* Add Playlist Popup */}
      <AddPlaylistPopup
        isOpen={showAddPlaylistPopup}
        onClose={() => setShowAddPlaylistPopup(false)}
        onSuccess={handlePlaylistCreated}
      />

      {/* Spotify Popup */}
      <SpotifyPopup
        isOpen={showSpotifyPopup}
        onClose={() => setShowSpotifyPopup(false)}
      />
    </div >
  );
}