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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 px-6 py-12">
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topArtists.map((artist: Artist) => (
            <Link key={artist.id} href={`/artist/${artist.id}`} className="no-underline">
              <div
                className="group relative bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
              >
                {/* Artist Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={artist.img}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
                    </div>
                  </div>
                </div>

                {/* Artist Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors duration-200">
                    {artist.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                      {artist.genre}
                    </span>
                  </div>
                </div>

                {/* Subtle Border Glow */}
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-purple-500/30 transition-colors duration-300 pointer-events-none" />
              </div>
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
    </div>
  );
};

export default Artist;