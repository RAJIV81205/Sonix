"use client"

import { Home, Search, Library, Plus, Heart, X, Menu, Compass, Music, Mic, Clock, Headphones, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MobileAddPlaylistPopup from './MobileAddPlaylistPopup';
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
      <div className="fixed top-0 left-0 right-0 bg-black/95 z-50 px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full">
              <Headphones className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Sonix</h1>
              <p className="text-xs text-zinc-400">Music Experience</p>
            </div>
          </div>
          <button
            className="p-2 hover:bg-zinc-800/50 rounded-full"
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
        className={`fixed inset-0 bg-gradient-to-b from-zinc-900 to-black z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2.5 rounded-xl">
              <Headphones className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Sonix</h1>
              <p className="text-xs text-zinc-400">Music Experience</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-zinc-800/50 rounded-full"
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
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
                onClick={() => handleItemClick('home')}
              >
                <Home className="w-6 h-6" />
                <span className="font-medium text-lg">Home</span>
              </Link>
              
              <Link 
                href="/dashboard/search"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'search' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
                onClick={() => handleItemClick('search')}
              >
                <Search className="w-6 h-6" />
                <span className="font-medium text-lg">Search</span>
              </Link>
              
              <Link 
                href="/dashboard/explore"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'explore' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
                onClick={() => handleItemClick('explore')}
              >
                <Compass className="w-6 h-6" />
                <span className="font-medium text-lg">Explore</span>
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
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
                onClick={() => handleItemClick('library')}
              >
                <Library className="w-6 h-6" />
                <span className="font-medium text-lg">Collections</span>
              </Link>
              
              <Link 
                href="/dashboard/recent"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'recent' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
                onClick={() => handleItemClick('recent')}
              >
                <Clock className="w-6 h-6" />
                <span className="font-medium text-lg">Recent Plays</span>
              </Link>
              
              <Link 
                href="/dashboard/artists"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  activeItem === 'artists' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
                onClick={() => handleItemClick('artists')}
              >
                <Mic className="w-6 h-6" />
                <span className="font-medium text-lg">Artists</span>
              </Link>
            </nav>
          </div>

          {/* Playlists */}
          <div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-1">Playlists</h2>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center gap-4 p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                onClick={() => setShowAddPlaylistPopup(true)}
              >
                <div className="bg-zinc-400/20 p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-medium text-lg">Create Playlist</span>
              </button>
              
              <div className="w-full flex items-center gap-4 p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-lg">Liked Songs</p>
                  <p className="text-xs text-zinc-500">120 songs</p>
                </div>
              </div>
              
              {/* User Playlists */}
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                </div>
              ) : (
                playlists.map((playlist, index) => (
                  <Link 
                    href={`/dashboard/playlist/${playlist.id}`}
                    key={playlist.id}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${getPlaylistColor(index)} rounded-md flex items-center justify-center`}>
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">{playlist.name}</p>
                      <p className="text-xs text-zinc-500">{playlist.songCount || 0} songs</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Playlist Popup */}
        <MobileAddPlaylistPopup 
          isOpen={showAddPlaylistPopup} 
          onClose={() => setShowAddPlaylistPopup(false)} 
          onSuccess={handlePlaylistCreated}
        />
      </div>
    </>
  );
}