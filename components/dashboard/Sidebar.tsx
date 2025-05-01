"use client"

import { Home, Search, Library, Plus, Heart, Music, Mic, Clock, Compass, Headphones } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-full bg-gradient-to-b from-black to-zinc-900 text-white p-5 flex flex-col gap-6 border-r border-zinc-800 shadow-xl h-full">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20">
          <Headphones className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Sonix</h1>
          <p className="text-xs text-zinc-400">Music Experience</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50"></div>

      {/* Main Nav Section */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-1">Main</h2>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 hover:bg-zinc-800/50 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Home className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <Link href="/dashboard/search" className="flex items-center gap-3 hover:bg-zinc-800/50 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Search className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium">Search</span>
          </Link>
          <Link href="/dashboard/explore" className="flex items-center gap-3 hover:bg-zinc-800/50 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Compass className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium">Explore</span>
          </Link>
        </nav>
      </div>

      {/* Library Section */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-1">Your Library</h2>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard/library" className="flex items-center gap-3 hover:bg-zinc-800/50 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Library className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium">Collections</span>
          </Link>
          <Link href="/dashboard/recent" className="flex items-center gap-3 hover:bg-zinc-800/50 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Clock className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium">Recent Plays</span>
          </Link>
          <Link href="/dashboard/artists" className="flex items-center gap-3 hover:bg-zinc-800/50 py-2.5 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <Mic className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
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
          <button className="p-1.5 rounded-md hover:bg-zinc-800/70 transition-colors">
            <Plus className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 hover:bg-zinc-800/50 py-2 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center shadow-md shadow-purple-500/10">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Liked Songs</p>
              <p className="text-xs text-zinc-500">120 songs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 hover:bg-zinc-800/50 py-2 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-md flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Weekend Vibes</p>
              <p className="text-xs text-zinc-500">32 songs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 hover:bg-zinc-800/50 py-2 px-3 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-md flex items-center justify-center shadow-md shadow-orange-500/10">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Focus Flow</p>
              <p className="text-xs text-zinc-500">45 songs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}