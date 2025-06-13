"use client"

import { Home, Search, Library, Plus, Heart, X, Menu, Compass, Music, Mic, Clock, Headphones, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MobileAddPlaylistPopup from './MobileAddPlaylistPopup';
import MobileSpotifyPopup from './MobileSpotifyPopup';
import { toast } from 'react-hot-toast';

interface Playlist {
  id: string;
  name: string;
  songCount?: number;
}

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [showAddPlaylistPopup, setShowAddPlaylistPopup] = useState(false);
  const [showSpotifyPopup, setShowSpotifyPopup] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

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
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const handleItemClick = (item:any) => {
    setActiveItem(item);
    setIsOpen(false);
  };

  const handlePlaylistCreated = (playlistId: string, playlistName: string) => {
    // Add the new playlist to the state
    setPlaylists(prev => [
      { id: playlistId, name: playlistName, songCount: 0 },
      ...prev
    ]);
  };

  const handleSpotifyPlaylistImported = (playlist: any) => {
    // Refresh playlists after importing from Spotify
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
          toast.success(`Playlist "${playlist.name}" imported successfully!`);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylists();
  };

  // Function to get playlist color based on index
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

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-black z-50 px-4 py-3 border-b border-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-full shadow-lg shadow-indigo-500/20">
              <Headphones className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">Sonix</h1>
              <p className="text-xs text-zinc-400">Music Experience</p>
            </div>
          </div>
          <button
            className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Menu */}
      <div 
        className={`fixed inset-0 bg-black z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Headphones className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">Sonix</h1>
              <p className="text-xs text-zinc-400">Music Experience</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="p-4 overflow-y-auto h-full pb-40">
          {/* Main Navigation */}
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-1">Main</h2>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/dashboard"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'home' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors'
                }`}
                onClick={() => handleItemClick('home')}
              >
                <Home className={`w-6 h-6 ${activeItem === 'home' ? 'text-purple-400' : ''}`} />
                <span className="font-medium text-lg">Home</span>
              </Link>
              
              <Link 
                href="/dashboard/search"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'search' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors'
                }`}
                onClick={() => handleItemClick('search')}
              >
                <Search className={`w-6 h-6 ${activeItem === 'search' ? 'text-purple-400' : ''}`} />
                <span className="font-medium text-lg">Search</span>
              </Link>
              
              <Link 
                href="/dashboard/room"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'room' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors'
                }`}
                onClick={() => handleItemClick('room')}
              >
                <Compass className={`w-6 h-6 ${activeItem === 'room' ? 'text-purple-400' : ''}`} />
                <span className="font-medium text-lg">Listen Together</span>
              </Link>
            </nav>
          </div>

          {/* Library Section */}
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-1">Your Library</h2>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/dashboard/library"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'library' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors'
                }`}
                onClick={() => handleItemClick('library')}
              >
                <Library className={`w-6 h-6 ${activeItem === 'library' ? 'text-purple-400' : ''}`} />
                <span className="font-medium text-lg">Collections</span>
              </Link>
              
              <Link 
                href="/dashboard/recent"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'recent' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors'
                }`}
                onClick={() => handleItemClick('recent')}
              >
                <Clock className={`w-6 h-6 ${activeItem === 'recent' ? 'text-purple-400' : ''}`} />
                <span className="font-medium text-lg">Recent Plays</span>
              </Link>
              
              <Link 
                href="/dashboard/artists"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'artists' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors'
                }`}
                onClick={() => handleItemClick('artists')}
              >
                <Mic className={`w-6 h-6 ${activeItem === 'artists' ? 'text-purple-400' : ''}`} />
                <span className="font-medium text-lg">Artists</span>
              </Link>
            </nav>
          </div>

          {/* Playlists */}
          <div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-1">Playlists</h2>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center gap-4 p-4 rounded-xl text-purple-400 hover:text-white hover:bg-zinc-900 transition-colors"
                onClick={() => setShowAddPlaylistPopup(true)}
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg shadow-sm shadow-purple-500/10">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-lg">Create Playlist</span>
              </button>
              
              <button 
                className="w-full flex items-center gap-4 p-4 rounded-xl text-green-400 hover:text-white hover:bg-zinc-900 transition-colors"
                onClick={() => setShowSpotifyPopup(true)}
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg shadow-sm shadow-green-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12.5a1 1 0 1 0 0-2" />
                    <path d="M12 12.5a1 1 0 1 0 0-2" />
                    <path d="M16 12.5a1 1 0 1 0 0-2" />
                  </svg>
                </div>
                <span className="font-medium text-lg">Import from Spotify</span>
              </button>
              
              <div className="w-full flex items-center gap-4 p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg w-9 h-9 flex items-center justify-center shadow-md shadow-purple-500/10">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-lg">Liked Songs</span>
              </div>

              {/* User Playlists */}
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-1">
                  {playlists.map((playlist, index) => (
                    <Link 
                      href={`/dashboard/playlist/${playlist.id}`} 
                      key={playlist.id}
                      className="w-full flex items-center gap-4 p-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`w-9 h-9 bg-gradient-to-br ${getPlaylistColor(index)} rounded-lg flex items-center justify-center shadow-md`}>
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{playlist.name}</p>
                        <p className="text-xs text-zinc-500 truncate">
                          {playlist.songCount || 0} songs
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Playlist Popup */}
      <MobileAddPlaylistPopup 
        isOpen={showAddPlaylistPopup} 
        onClose={() => setShowAddPlaylistPopup(false)}
        onSuccess={handlePlaylistCreated}
      />

      {/* Spotify Import Popup */}
      <MobileSpotifyPopup
        isOpen={showSpotifyPopup}
        onClose={() => setShowSpotifyPopup(false)}
        onCreatePlaylist={handleSpotifyPlaylistImported}
      />
    </>
  );
}