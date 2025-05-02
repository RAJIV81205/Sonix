"use client"

import React, { useState, useEffect } from 'react';
import { Search, Music, Disc3, TrendingUp } from 'lucide-react';

// Define types
interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  plays?: string;
}

interface TrackItemProps {
  track: Track;
  trending: boolean;
}

const MusicSearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock data for trending tracks
  useEffect(() => {
    const mockTrendingTracks: Track[] = [
      {
        id: 1,
        title: "The Nights",
        artist: "Avicii",
        album: "The Days / Nights",
        coverUrl: "/api/placeholder/64/64",
        plays: "1.2B"
      },
      {
        id: 2,
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        coverUrl: "/api/placeholder/64/64",
        plays: "3.6B"
      },
      {
        id: 3,
        title: "As It Was",
        artist: "Harry Styles",
        album: "Harry's House",
        coverUrl: "/api/placeholder/64/64",
        plays: "2.8B"
      },
      {
        id: 4,
        title: "Heat Waves",
        artist: "Glass Animals",
        album: "Dreamland",
        coverUrl: "/api/placeholder/64/64",
        plays: "2.4B"
      },
      {
        id: 5,
        title: "Starboy",
        artist: "The Weeknd ft. Daft Punk",
        album: "Starboy",
        coverUrl: "/api/placeholder/64/64",
        plays: "2.3B"
      },
      {
        id: 6,
        title: "Dance Monkey",
        artist: "Tones and I",
        album: "The Kids Are Coming",
        coverUrl: "/api/placeholder/64/64",
        plays: "2.1B"
      }
    ];
    
    setTrendingTracks(mockTrendingTracks);
  }, []);

  // Simulate search functionality
  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const filteredResults: Track[] = [
        {
          id: 101,
          title: `${query} Dreams`,
          artist: "Arctic Flow",
          album: "Winter Tales",
          coverUrl: "/api/placeholder/64/64"
        },
        {
          id: 102,
          title: `The ${query} Experience`,
          artist: "Luna Wave",
          album: "Cosmic Journey",
          coverUrl: "/api/placeholder/64/64"
        },
        {
          id: 103,
          title: `${query} Nights`,
          artist: "Electric Beat",
          album: "Urban Pulse",
          coverUrl: "/api/placeholder/64/64"
        },
        {
          id: 104,
          title: `Summer ${query}`,
          artist: "Sunny Horizon",
          album: "Beach Days",
          coverUrl: "/api/placeholder/64/64"
        }
      ];
      
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 500);
  };

  // Track item component
  const TrackItem: React.FC<TrackItemProps> = ({ track, trending }) => {
    return (
      <div className="flex items-center p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 ease-in-out ">
        <div className="relative">
          <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded" />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
            <Music className="text-white w-6 h-6" />
          </div>
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-white font-medium text-sm">{track.title}</p>
          <p className="text-gray-400 text-xs">{track.artist}</p>
        </div>
        {trending && track.plays && (
          <div className="flex items-center text-green-500 text-xs">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{track.plays}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-black to-zinc-900 text-white p-6 rounded-lg w-full mx-auto min-h-screen">
      <div className="relative mb-6 opacity-100 transform translate-y-0 transition-all duration-300">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-800 text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {searchQuery.trim() !== '' ? (
          <>
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-semibold flex-grow">Search Results</h2>
              <span className="text-gray-400 text-sm">{searchResults.length} results</span>
            </div>
            
            <div className="space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map(track => (
                  <TrackItem key={track.id} track={track} trending={false} />
                ))
              ) : (
                !isLoading && (
                  <div className="text-center py-8 text-gray-400">
                    No results found for "{searchQuery}"
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <Disc3 className="w-5 h-5 text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold">Global Music Charts</h2>
            </div>
            
            <div className="space-y-1">
              {trendingTracks.map((track, index) => (
                <TrackItem 
                  key={track.id} 
                  track={track} 
                  trending={true} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MusicSearchBar;