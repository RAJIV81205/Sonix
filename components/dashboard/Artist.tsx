"use client"

import React, { useState, useEffect } from 'react';
import { Music, Users } from 'lucide-react';
import { topArtists } from '@/lib/constant';
import Link from 'next/link';

interface Artist {
  name: string;
  img: string;
  genre: string;
  id: string;
}

// Lazy Image Component with loading states
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-pulse rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />
      {isError && (
        <div className="absolute inset-0 bg-gray-800 rounded-full flex items-center justify-center">
          <Music className="w-8 h-8 text-gray-500" />
        </div>
      )}
    </div>
  );
};

// Artist Card Component
const ArtistCard = ({ artist, index }: { artist: Artist; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // Staggered animation

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link 
      href={`/dashboard/artist/${artist.id}`} 
      className={`group flex flex-col transform transition-all duration-700 hover:scale-105 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="aspect-square bg-zinc-800 rounded-full mb-4 overflow-hidden border border-gray-400/40 hover:border-purple-400/60 transition-all duration-300 relative group-hover:shadow-lg group-hover:shadow-purple-500/25">
        <LazyImage 
          src={artist.img} 
          alt={artist.name}
          className="transform transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="font-medium text-sm text-center mb-1 truncate group-hover:text-purple-300 transition-colors duration-300">
        {artist.name}
      </h3>
      <p className="text-xs text-zinc-400 text-center truncate group-hover:text-zinc-300 transition-colors duration-300">
        {artist.genre}
      </p>
    </Link>
  );
};

const Artist = () => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    // Header animation
    const headerTimer = setTimeout(() => {
      setHeaderVisible(true);
    }, 200);

    // Stats animation
    const statsTimer = setTimeout(() => {
      setStatsVisible(true);
    }, 1000 + topArtists.length * 100);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(statsTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-950 to-gray-950 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className={`flex items-center gap-4 mb-4 transform transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}>
            <div className="p-2 sm:p-3 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors duration-300">
              <Music className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              Top Artists
            </h1>
          </div>
          <div className={`flex items-center gap-2 text-gray-300 transform transition-all duration-1000 delay-300 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <p className="text-base sm:text-lg">Discover amazing artists</p>
          </div>
        </div>
      </div>

      {/* Artists Grid */}
      <div className="px-4 my-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {topArtists.map((artist, index) => (
              <ArtistCard key={artist.id} artist={artist} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-12 sm:mt-16 pb-8 text-center px-4">
        <div className={`inline-flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-3 sm:py-4 bg-gray-800/50 rounded-full backdrop-blur-sm border border-gray-700 hover:border-gray-600 transition-all duration-500 transform ${
          statsVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-95'
        }`}>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-300 hover:text-purple-200 transition-colors duration-300">
              {topArtists.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Artists</div>
          </div>
          <div className="w-px h-6 sm:h-8 bg-gray-600" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-300 hover:text-blue-200 transition-colors duration-300">
              {[...new Set(topArtists.map(artist => artist.genre))].length}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Genres</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artist;