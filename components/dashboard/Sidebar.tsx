import { Home, Search, Library, Plus, Heart } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function Sidebar() {
  return (
    <div className="w-full h-full bg-black/90 text-white p-4 flex flex-col gap-6 ">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full">
          <Search className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold">Sonix</h1>
      </div>

      {/* Nav Section */}
      <nav className="flex flex-col gap-4 mt-4 text-sm font-medium h-full">
        <Link href="/dashboard" className="flex items-center gap-3 hover:text-white text-zinc-400 transition-colors cursor-pointer group">
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Home</span>
        </Link>
        <Link href="/dashboard/search" className="flex items-center gap-3 hover:text-white text-zinc-400 transition-colors cursor-pointer group">
          <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Search</span>
        </Link>
        <Link href="/dashboard/library" className="flex items-center gap-3 hover:text-white text-zinc-400 transition-colors cursor-pointer group">
          <Library className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Your Library</span>
        </Link>
      </nav>

      {/* Playlist Section */}
      <div className="mt-6">
        <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors cursor-pointer group">
          <div className="bg-zinc-400/20 p-1 rounded group-hover:bg-zinc-400/30">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-sm">Create Playlist</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors cursor-pointer group mt-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-1 rounded">
            <Heart className="w-4 h-4" />
          </div>
          <span className="text-sm">Liked Songs</span>
        </div>
      </div>
    </div>
  );
}
