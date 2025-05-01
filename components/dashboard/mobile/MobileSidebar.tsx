"use client"

import { Home, Search, Library, Plus, Heart, X, Menu, Compass, Music, Mic, Clock, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');

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

  const handleItemClick = (item:any) => {
    setActiveItem(item);
    setIsOpen(false);
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
        <div className="p-4 overflow-y-auto h-full pb-32">
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
              <button className="w-full flex items-center gap-4 p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
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
              
              <div className="w-full flex items-center gap-4 p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-md flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-lg">Weekend Vibes</p>
                  <p className="text-xs text-zinc-500">32 songs</p>
                </div>
              </div>
              
              <div className="w-full flex items-center gap-4 p-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-md flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-lg">Focus Flow</p>
                  <p className="text-xs text-zinc-500">45 songs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}