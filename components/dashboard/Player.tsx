"use client"

import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';
import React, { useState } from 'react';

const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  return (
    <div className="w-full h-24 bg-zinc-900 border-t border-zinc-800 flex items-center px-4">
      {/* Current Song Info */}
      <div className="flex items-center gap-4 w-1/4">
        <div className="w-14 h-14 bg-zinc-800 rounded"></div>
        <div>
          <h3 className="font-medium">Song Title</h3>
          <p className="text-sm text-zinc-400">Artist Name</p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Shuffle className="w-5 h-5" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button 
            className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Repeat className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full max-w-xl flex items-center gap-2">
          <span className="text-xs text-zinc-400">0:00</span>
          <div className="flex-1 h-1 bg-zinc-700 rounded-full">
            <div className="w-1/3 h-full bg-white rounded-full"></div>
          </div>
          <span className="text-xs text-zinc-400">3:45</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="w-1/4 flex items-center justify-end gap-2">
        <Volume2 className="w-5 h-5 text-zinc-400" />
        <div className="w-24 h-1 bg-zinc-700 rounded-full">
          <div 
            className="h-full bg-white rounded-full" 
            style={{ width: `${volume}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Player;