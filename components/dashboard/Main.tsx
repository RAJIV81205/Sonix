"use client"


import { Search, Bell, User } from 'lucide-react';
import React, { useState } from 'react';

const Main = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/50 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-zinc-800/50 transition-colors">
            <Bell className="w-5 h-5 text-zinc-400" />
          </button>
          <button className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-full hover:bg-zinc-700/50 transition-colors">
            <User className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-medium">Account</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Recently Played Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Placeholder for recently played items */}
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer">
                <div className="aspect-square bg-zinc-700 rounded-lg mb-3"></div>
                <h3 className="font-medium">Song Title {item}</h3>
                <p className="text-sm text-zinc-400">Artist Name</p>
              </div>
            ))}
          </div>
        </div>

        {/* Made For You Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Made For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Placeholder for made for you items */}
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer">
                <div className="aspect-square bg-zinc-700 rounded-lg mb-3"></div>
                <h3 className="font-medium">Album Title {item}</h3>
                <p className="text-sm text-zinc-400">Artist Name</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;