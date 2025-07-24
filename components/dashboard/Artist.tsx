import React from 'react';
import { Music, Users } from 'lucide-react';
import { topArtists } from '@/lib/constant'
import Link from 'next/link';




interface Artist {
  name: string;
  img: string;
  genre: string;
  id: string;
}

const Artist = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-950 to-gray-950 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <Music className="w-8 h-8 text-purple-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              Top Artists
            </h1>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-5 h-5" />
            <p className="text-lg">Discover {topArtists.length} amazing artists</p>
          </div>
        </div>
      </div>

      {/* Artists Grid */}
      
      <div className="grid grid-cols-6 gap-5 p-4 my-5">
        {topArtists.map((artist) => (
          <Link key={artist.id} href={`/dashboard/artist/${artist.id}`} className="flex flex-col">
            <div className="aspect-square bg-zinc-800 rounded-full mb-4 overflow-hidden border border-gray-400/40 hover:border-gray-400/60 transition-colors">
              <img src={artist.img} alt={artist.name} loading="lazy" />
            </div>
            <h3 className="font-medium text-sm text-center mb-1 truncate">{artist.name}</h3>
            <p className="text-xs text-zinc-400 text-center truncate">{artist.genre}</p>
          </Link>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-6 px-8 py-4 bg-gray-800/50 rounded-full backdrop-blur-sm border border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-300">{topArtists.length}</div>
            <div className="text-sm text-gray-400">Artists</div>
          </div>
          <div className="w-px h-8 bg-gray-600" />
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-300">
              {[...new Set(topArtists.map(artist => artist.genre))].length}
            </div>
            <div className="text-sm text-gray-400">Genres</div>
          </div>
        </div>
      </div>
    </div>
   
  );
};

export default Artist;