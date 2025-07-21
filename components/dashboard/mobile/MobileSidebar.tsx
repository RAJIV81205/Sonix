"use client"

import { Home, Search, Library, Plus, Heart, X, Menu, Compass, Music, Mic, Clock, Headphones, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const [showAddPlaylistPopup, setShowAddPlaylistPopup] = useState(false);
  const [showSpotifyPopup, setShowSpotifyPopup] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Check if current route matches the navigation item
  const isActiveRoute = (route: string) => {
    if (route === '/dashboard' && pathname === '/dashboard') return true;
    if (route !== '/dashboard' && pathname.startsWith(route)) return true;
    return false;
  };

  // Handle back button - close menu instead of navigating back
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isOpen) {
        event.preventDefault();
        setIsOpen(false);
        // Push current state back to prevent actual navigation
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    if (isOpen) {
      // Push a new state when menu opens
      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen]);

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

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handlePlaylistCreated = (playlistId: string, playlistName: string) => {
    setPlaylists(prev => [
      { id: playlistId, name: playlistName, songCount: 0 },
      ...prev
    ]);
  };

  const handleSpotifyPlaylistImported = (playlist: any) => {
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

  // Get current page title
  const getCurrentPageTitle = () => {
    if (pathname === '/dashboard') return 'Home';
    if (pathname.startsWith('/dashboard/search')) return 'Search';
    if (pathname.startsWith('/dashboard/room')) return 'Listen Together';
    if (pathname.startsWith('/dashboard/library')) return 'Collections';
    if (pathname.startsWith('/dashboard/recent')) return 'Recent Plays';
    if (pathname.startsWith('/dashboard/artist')) return 'Artists';
    if (pathname.startsWith('/dashboard/playlist/')) return 'Playlist';
    return 'Sonix';
  };

  // Only show on small devices
  return (
    <div className="block md:hidden">
      {/* Redesigned Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 backdrop-blur-lg border-b border-zinc-800/50 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and current page */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative">
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-2.5 rounded-2xl shadow-lg shadow-purple-500/25 ring-1 ring-purple-400/20">
                  <Headphones className="text-white w-6 h-6" />
                </div>
                
              </div>
              
              <div className="flex-1 min-w-0">  
                <h1 className="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  Sonix
                </h1>
                <p className="text-sm text-zinc-400 font-medium truncate">
                  {getCurrentPageTitle()}
                </p>
              </div>
            </div>

            {/* Right side - Menu button */}
            <button
              className="relative p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-2xl transition-all duration-200 active:scale-95 ring-1 ring-zinc-700/50"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-indigo-600/10 opacity-0 hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
        
        {/* Subtle gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Menu */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="relative">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-3 rounded-2xl shadow-xl shadow-purple-500/30 ring-1 ring-purple-400/30">
                  <Headphones className="text-white w-7 h-7" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-black animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  Sonix
                </h1>
                <p className="text-sm text-zinc-400 font-medium">Your Music Universe</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-2xl transition-all duration-200 active:scale-95 ring-1 ring-zinc-700/50"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>

        {/* Menu Content */}
        <div className="p-6 overflow-y-auto h-full pb-50">
          {/* Main Navigation */}
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4 px-2">Discover</h2>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/dashboard"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                  isActiveRoute('/dashboard')
                    ? 'bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 text-white ring-1 ring-purple-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:scale-95'
                }`}
                onClick={handleLinkClick}
              >
                <Home className={`w-6 h-6 ${isActiveRoute('/dashboard') ? 'text-purple-400' : ''}`} />
                <span className="font-semibold text-lg">Home</span>
                {isActiveRoute('/dashboard') && <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto animate-pulse"></div>}
              </Link>
              
              <Link 
                href="/dashboard/search"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                  isActiveRoute('/dashboard/search')
                    ? 'bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 text-white ring-1 ring-purple-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:scale-95'
                }`}
                onClick={handleLinkClick}
              >
                <Search className={`w-6 h-6 ${isActiveRoute('/dashboard/search') ? 'text-purple-400' : ''}`} />
                <span className="font-semibold text-lg">Search</span>
                {isActiveRoute('/dashboard/search') && <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto animate-pulse"></div>}
              </Link>

              <Link 
                href="/dashboard/artist"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                  isActiveRoute('/dashboard/artist')
                    ? 'bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 text-white ring-1 ring-purple-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:scale-95'
                }`}
                onClick={handleLinkClick}
              >
                <Mic className={`w-6 h-6 ${isActiveRoute('/dashboard/artist') ? 'text-purple-400' : ''}`} />
                <span className="font-semibold text-lg">Artists</span>
                {isActiveRoute('/dashboard/artist') && <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto animate-pulse"></div>}
              </Link>
              
              <Link 
                href="/dashboard/room"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                  isActiveRoute('/dashboard/room')
                    ? 'bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 text-white ring-1 ring-purple-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:scale-95'
                }`}
                onClick={handleLinkClick}
              >
                <Compass className={`w-6 h-6 ${isActiveRoute('/dashboard/room') ? 'text-purple-400' : ''}`} />
                <span className="font-semibold text-lg">Listen Together</span>
                {isActiveRoute('/dashboard/room') && <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto animate-pulse"></div>}
              </Link>
            </nav>
          </div>

          {/* Library Section */}
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4 px-2">Your Library</h2>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/dashboard/library"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                  isActiveRoute('/dashboard/library')
                    ? 'bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 text-white ring-1 ring-purple-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:scale-95'
                }`}
                onClick={handleLinkClick}
              >
                <Library className={`w-6 h-6 ${isActiveRoute('/dashboard/library') ? 'text-purple-400' : ''}`} />
                <span className="font-semibold text-lg">Collections</span>
                {isActiveRoute('/dashboard/library') && <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto animate-pulse"></div>}
              </Link>
              
              <Link 
                href="/dashboard/recent"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                  isActiveRoute('/dashboard/recent')
                    ? 'bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 text-white ring-1 ring-purple-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:scale-95'
                }`}
                onClick={handleLinkClick}
              >
                <Clock className={`w-6 h-6 ${isActiveRoute('/dashboard/recent') ? 'text-purple-400' : ''}`} />
                <span className="font-semibold text-lg">Recent Plays</span>
                {isActiveRoute('/dashboard/recent') && <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto animate-pulse"></div>}
              </Link>
              
              
            </nav>
          </div>

          {/* Playlists */}
          <div>
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4 px-2">Playlists</h2>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-purple-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200 active:scale-95"
                onClick={() => setShowAddPlaylistPopup(true)}
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Create Playlist</span>
              </button>
              
              <button 
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-green-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200 active:scale-95"
                onClick={() => setShowSpotifyPopup(true)}
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-green-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <span className="font-semibold text-lg">Import from Spotify</span>
              </button>
              
              <div className="w-full flex items-center gap-4 p-4 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200 active:scale-95">
                <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl w-11 h-11 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Liked Songs</span>
              </div>

              {/* User Playlists */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-1 mt-4">
                  {playlists.map((playlist, index) => (
                    <Link 
                      href={`/dashboard/playlist/${playlist.id}`} 
                      key={playlist.id}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-95 ${
                        pathname === `/dashboard/playlist/${playlist.id}`
                          ? 'bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 text-white ring-1 ring-purple-500/30'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                      onClick={handleLinkClick}
                    >
                      <div className={`w-11 h-11 bg-gradient-to-br ${getPlaylistColor(index)} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Music className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-base">{playlist.name}</p>
                        <p className="text-sm text-zinc-500 truncate">
                          {playlist.songCount || 0} songs
                        </p>
                      </div>
                      {pathname === `/dashboard/playlist/${playlist.id}` && (
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      )}
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
    </div>
  );
}
