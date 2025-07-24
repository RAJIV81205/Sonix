"use client"

import React, { useState } from 'react';
import { Play, Download, RefreshCw } from 'lucide-react';
import { topArtists } from '@/lib/constant';

interface Artist {
  id: string;
  name: string;
  genre: string;
  img: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

const SpotifyArtistUpdater: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([
    ...topArtists // Import artists from the constant file
  ]); // Initial artists data from the constant file
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [updatedArtists, setUpdatedArtists] = useState<Artist[]>([]);

  const SPOTIFY_TOKEN = "BQDJClXXHXE47KXpIi7b61T1yu452dFcR-faZ-GlMQPIdj0lEXlDybWRbAPyEwpBZ1nbPk77QXlOUdzOj1pj9taVfO0l1LWz92hDPfaO9JSCqB8n_ap0D7ig0eHid-5nbGOXqYYzYpaxAq4pW6KnTSkhfamsylXD5p51Y_Q0gmQMHLop6eG5F5cM8VwRQa1Uq5MkSYZRErqyvSA9YUJtcrRvm42Lmchm3gruedvqLCwGGC0wDNOghgZhXSyz05vpu9sECbFldYhFdxzT8ia0pKxtdJZ9U6gjdM3qo9KXYxxjTFi1zxAhhp26nwoLSwLw4FfB_6Zh0Puw7xwLdY8Kysn8a68v1xpFw9lgJwbNJf7oY6tgbU1x";

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fetchSpotifyArtist = async (artistName: string): Promise<SpotifyArtist | null> => {
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
        headers: {
          'Authorization': `Bearer ${SPOTIFY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.artists.items && data.artists.items.length > 0) {
        return data.artists.items[0];
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching ${artistName}:`, error);
      addLog(`❌ Error fetching ${artistName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const updateArtistData = async () => {
    setIsUpdating(true);
    setProgress(0);
    setLogs([]);
    setUpdatedArtists([]);
    
    addLog("🚀 Starting Spotify artist data update...");
    
    const updated: Artist[] = [];
    
    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];
      addLog(`🔍 Fetching data for: ${artist.name}`);
      
      const spotifyData = await fetchSpotifyArtist(artist.name);
      
      if (spotifyData) {
        const imageUrl = spotifyData.images && spotifyData.images.length > 0 
          ? spotifyData.images[0].url 
          : artist.img;
          
        const updatedArtist: Artist = {
          ...artist,
          id: spotifyData.id,
          img: imageUrl
        };
        
        updated.push(updatedArtist);
        addLog(`✅ Updated ${artist.name} - ID: ${spotifyData.id}`);
      } else {
        updated.push(artist);
        addLog(`⚠️ No data found for ${artist.name}, keeping original`);
      }
      
      setProgress(((i + 1) / artists.length) * 100);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setUpdatedArtists(updated);
    addLog("🎉 Update complete!");
    setIsUpdating(false);
  };

  const exportUpdatedData = () => {
    const exportData = `export const topArtists = ${JSON.stringify(updatedArtists, null, 2)};`;
    
    const blob = new Blob([exportData], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'updated-artists.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog("📁 Exported updated artist data to file");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Spotify Artist Data Updater
          </h1>
          <p className="text-gray-300">Update artist IDs and image URLs from Spotify API</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <div className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Control Panel
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={updateArtistData}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Update All Artists
                    </>
                  )}
                </button>
                
                <button
                  onClick={exportUpdatedData}
                  disabled={updatedArtists.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              {isUpdating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-400">
                <p><strong>Total Artists:</strong> {artists.length}</p>
                <p><strong>Updated:</strong> {updatedArtists.length}</p>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
            <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">Click "Update All Artists" to start...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Artist Preview */}
        {updatedArtists.length > 0 && (
          <div className="mt-8 bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Updated Artists Preview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
              {updatedArtists.slice(0, 24).map((artist, index) => (
                <div key={index} className="text-center">
                  <img
                    src={artist.img}
                    alt={artist.name}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300/333/fff?text=No+Image';
                    }}
                  />
                  <p className="text-xs font-medium truncate">{artist.name}</p>
                  <p className="text-xs text-gray-400 truncate">{artist.genre}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Code Preview */}
        {updatedArtists.length > 0 && (
          <div className="mt-6 bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Updated Code Preview</h2>
            <div className="bg-black rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-green-400 text-xs">
                {`export const topArtists = [\n  ${updatedArtists.map(artist => 
                  `{ id: '${artist.id}', name: '${artist.name}', genre: '${artist.genre}', img: "${artist.img}" }`
                ).join(',\n  ')}\n  // ... ${updatedArtists.length - 3} more artists\n];`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyArtistUpdater;