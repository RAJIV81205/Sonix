import { Home, Search, Library } from 'lucide-react';
import React from 'react';

export default function Sidebar() {
  return (
    <div className="w-full h-full  bg-black text-white p-4 flex flex-col gap-6">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="bg-purple-600 p-2 rounded-full">
          <Search className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold">Sonix</h1>
      </div>

      {/* Nav Section */}
      <nav className="flex flex-col justify-evenly mt-4 text-sm font-medium h-full">
        <div className="flex items-center gap-3 hover:text-white text-zinc-400 transition-colors cursor-pointer">
          <Home className="w-5 h-5" />
          <span>Home</span>
        </div>
        <div className="flex items-center gap-3 hover:text-white text-zinc-400 transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
          <span>Search</span>
        </div>
        <div className="flex items-center gap-3 bg-zinc-200 text-black rounded-md px-3 py-2 cursor-not-allowed">
          <Library className="w-5 h-5" />
          <span>Your Library</span>
        </div>
      </nav>
    </div>
  );
}
