import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface SpotifyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist?: (playlist: any) => void;
}

const SpotifyPopup = ({ isOpen, onClose, onCreatePlaylist }: SpotifyPopupProps) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedPlaylist, setImportedPlaylist] = useState<any>(null);
  const [importMethod, setImportMethod] = useState<'none' | 'spotify' | 'url'>('none');
  const [progress, setProgress] = useState(0);
  const [currentSong, setCurrentSong] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);

  const handleSpotifyLogin = async () => {
    // Show loading toast
    const loadingToast = toast.loading('Connecting to Spotify...');
    setIsLoading(true);

    try {
      // This would be replaced with your actual Spotify OAuth flow
      const response = await fetch('/api/spotify/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to Spotify');
      }

      // Success handling
      toast.success('Successfully connected to Spotify');

      // Here you would typically handle the authenticated user's playlists
      // For this example, we'll simulate loading a playlist
      const playlistResponse = await fetch('/api/spotify/my-playlists', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const playlistData = await playlistResponse.json();

      if (!playlistResponse.ok) {
        throw new Error(playlistData.error || 'Failed to load playlists');
      }

      // For this example, we'll just pick the first playlist
      if (playlistData.playlists && playlistData.playlists.length > 0) {
        setImportedPlaylist(playlistData.playlists[0]);
      }
    }
    catch (error: any) {
      console.error('Error connecting to Spotify:', error);
      toast.error(error.message || 'Failed to connect to Spotify');
    }
    finally {
      // Hide loading toast and reset loading state
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  const handleLinkSubmit = async () => {
    if (!playlistUrl.trim()) {
      toast.error('Please enter a Spotify playlist URL');
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading('Importing playlist...');
    setIsLoading(true);

    try {
      const response = await fetch('/api/spotify/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: playlistUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import playlist');
      }

      // Success handling
      toast.success(`Successfully imported "${data.playlist.name}"`);
      console.log('Playlist imported successfully:', data.playlist);

      // Store the imported playlist data
      setImportedPlaylist(data.playlist);

      // Clear input
      setPlaylistUrl('');
    }
    catch (error: any) {
      console.error('Error importing playlist:', error);
      toast.error(error.message || 'Failed to import playlist');
    }
    finally {
      // Hide loading toast and reset loading state
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLinkSubmit();
    }
  }

  const createPlaylist = async (playlist: any) => {
    if (!playlist) {
      toast.error('No playlist data available');
      return null;
    }

    try {
      const response = await fetch('/api/dashboard/makePlaylist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: playlist.name , cover : playlist.images[0]?.url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create playlist');
      }

      const data = await response.json();
      toast.success(`Playlist "${playlist.name}" created successfully!`);
      
      // Return the playlist ID - this was missing in the original code
      return data.playlist.id;
    }
    catch (error: any) {
      console.error('Error creating playlist:', error);
      toast.error(error.message || 'Failed to create playlist');
      return null;
    }
  }

  const addSong = async (item: any, playlistId: string) => {
    if (!item || !playlistId) {
      toast.error('No song or playlist ID available');
      return false;
    }
    
    try {
      const response = await fetch('/api/spotify/addSong', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ song: item, playlistId: playlistId })
      });

      const data = await response.json();
      
      if (data.skipped) {
        console.log(`Skipped song: ${item.track.name} - ${data.error}`);
        return true; // Return true to continue with next song
      }

      if (!data.success) {
        console.error(`Failed to add song: ${item.track.name} - ${data.error}`);
        return false;
      }

      console.log('Song added successfully:', item.track.name);
      return true;
    } catch (error: any) {
      console.error('Error adding song:', error);
      return false;
    }
  }

  const handleCreatePlaylist = async () => {
    if (!importedPlaylist) {
      toast.error('No playlist data available');
      return;
    }
  
    try {
      const loadingToast = toast.loading('Creating playlist...');
      setIsLoading(true);
  
      // Reset progress and set total songs
      setProgress(0);
      setCurrentSong(0);
      setTotalSongs(importedPlaylist.tracks.items.length);
  
      // Create the playlist and get its ID
      const playlistId = await createPlaylist(importedPlaylist);
      
      if (!playlistId) {
        throw new Error('Failed to create playlist');
      }
  
      // Update loading toast to show we're now adding songs
      toast.dismiss(loadingToast);
      const addingSongsToast = toast.loading('Adding songs to playlist: 0%');
  
      // Process songs in smaller batches with increased delays to prevent API blocking
      const batchSize = 5; // Reduced batch size
      const delay = 2000; // Increased delay to 2 seconds between songs
      const batchDelay = 5000; // 5 seconds delay between batches
      let successCount = 0;
      
      // Process songs in batches
      for (let i = 0; i < importedPlaylist.tracks.items.length; i += batchSize) {
        // Calculate the end index for current batch
        const endIndex = Math.min(i + batchSize, importedPlaylist.tracks.items.length);
        
        // Process each song in the current batch sequentially
        for (let j = i; j < endIndex; j++) {
          const item = importedPlaylist.tracks.items[j];
          
          // Update current song and progress
          setCurrentSong(j + 1);
          const newProgress = Math.round(((j + 1) / importedPlaylist.tracks.items.length) * 100);
          setProgress(newProgress);
          
          // Update toast message with current progress
          toast.loading(
            `Adding songs: ${j + 1}/${importedPlaylist.tracks.items.length} (${newProgress}%)`,
            { id: addingSongsToast }
          );
          
          // Add song with retry logic and increased delays
          let retries = 3;
          let success = false;
          
          while (retries > 0 && !success) {
            try {
              success = await addSong(item, playlistId);
              if (success) {
                successCount++;
                break;
              }
            } catch (error) {
              retries--;
              console.error(`Error adding song (${retries} retries left):`, error);
              // Increased delay on error
              await new Promise(resolve => setTimeout(resolve, delay * 3));
            }
          }
          
          // Add increased delay between song additions
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Add longer pause between batches
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
  
      // Final toast message
      toast.dismiss(addingSongsToast);
      toast.success(`Playlist created with ${successCount} of ${importedPlaylist.tracks.items.length} songs added!`);
      
      // Call the onCreatePlaylist callback if provided
      if (onCreatePlaylist) {
        onCreatePlaylist(importedPlaylist);
      }
  
      // Close popup on success after a short delay to show completion
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      toast.error(error.message || 'Failed to create playlist');
    } finally {
      setIsLoading(false);
      toast.dismiss(); // Dismiss any remaining loading toasts
    }
  };

  const resetFlow = () => {
    setImportedPlaylist(null);
    setImportMethod('none');
    setPlaylistUrl('');
  };

  if (!isOpen) return null;

  // Format duration from ms to mm:ss
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-4/5 h-4/5 bg-gradient-to-b from-gray-900 to-black rounded-xl shadow-2xl border border-zinc-800 overflow-hidden">
        <div className="p-6 flex flex-col h-full font-inter">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <img src="/spotify-green.png"  alt="" className='h-10 w-10' />
            
              <h2 className="text-2xl font-bold text-white">
                {importedPlaylist ? 'Imported Playlist' : 'Import from Spotify'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {importedPlaylist && (
                <button
                  onClick={resetFlow}
                  className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                  aria-label="Back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hover:text-white">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content */}
          {!importedPlaylist ? (
            // Import Methods
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-semibold text-white text-center mb-8">Choose how to import your playlist</h3>

              <div className="flex-1 flex gap-6">
                {/* Left Side - Spotify Login */}
                <div className="flex-1 border border-zinc-800 rounded-xl p-6 flex flex-col items-center hover:bg-zinc-900/50 hover:border-zinc-700 transition-colors">
                  <div className="bg-zinc-800 p-6 rounded-full mb-6">
                  <img src="/spotify-green.png"  alt="spotify-logo" className='h-15 w-15' />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Connect with Spotify</h3>
                  <p className="text-zinc-400 text-center mb-8">Use your Spotify account to import playlists directly.</p>

                  <button
                    onClick={handleSpotifyLogin}
                    disabled={isLoading}
                    className="py-3 px-8 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium flex items-center gap-2 transition-colors"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 12v.01" />
                      </svg>
                    )}
                    Login with Spotify
                  </button>
                </div>

                {/* Right Side - URL Import */}
                <div className="flex-1 border border-zinc-800 rounded-xl p-6 flex flex-col items-center hover:bg-zinc-900/50 hover:border-zinc-700 transition-colors">
                  <div className="bg-zinc-800 p-6 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <path d="M9 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                      <polygon points="12 15 17 21 7 21 12 15" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Import from URL</h3>
                  <p className="text-zinc-400 text-center mb-8">Paste a Spotify playlist URL to import it directly.</p>

                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="text"
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="https://open.spotify.com/playlist/..."
                        className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-green-500 pr-12"
                        disabled={isLoading}
                      />
                      <button
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isLoading ? 'text-gray-500' : 'text-green-500 hover:text-green-400'}`}
                        onClick={handleLinkSubmit}
                        disabled={isLoading}
                        aria-label="Import playlist"
                      >
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      Example: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Playlist Display
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Playlist Header */}
              <div className="flex items-start gap-6 mb-6">
                {importedPlaylist.images && importedPlaylist.images.length > 0 ? (
                  <img
                    src={importedPlaylist.images[0].url}
                    alt={importedPlaylist.name}
                    className="w-32 h-32 object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                      <path d="M9 18V5l12-2v13"></path>
                      <circle cx="6" cy="18" r="3"></circle>
                      <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                  </div>
                )}

                <div className="flex-1">
                  <div className="text-xs font-medium text-green-500 uppercase tracking-wider mb-1">Playlist</div>
                  <h1 className="text-3xl font-bold text-white mb-2">{importedPlaylist.name}</h1>
                  <p className="text-zinc-400 text-sm mb-1">{importedPlaylist.description}</p>
                  <div className="flex items-center text-zinc-500 text-sm">
                    <span className="font-medium text-zinc-300">{importedPlaylist.owner.display_name}</span>
                    <span className="mx-1">•</span>
                    <span>{importedPlaylist.tracks.total} songs</span>
                    <span className="mx-1">•</span>
                    <span>{importedPlaylist.followers.total.toLocaleString()} followers</span>
                  </div>
                </div>
              </div>

              {/* Track List */}
              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-zinc-900 z-10">
                    <tr className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
                      <th className="py-3 text-center w-10">#</th>
                      <th className="py-3 text-left">Title</th>
                      <th className="py-3 text-left">Album</th>
                      <th className="py-3 flex justify-end pr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    {importedPlaylist.tracks.items.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-zinc-800/50 group">
                        <td className="py-2 text-zinc-400">{index + 1}</td>
                        <td className="py-2">
                          <div className="flex items-center">
                            {item.track.album.images && item.track.album.images.length > 0 ? (
                              <img
                                src={item.track.album.images[item.track.album.images.length - 1].url}
                                alt={item.track.name}
                                className="w-10 h-10 object-cover rounded mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-zinc-800 rounded mr-3" />
                            )}
                            <div>
                              <div className="font-medium text-white truncate max-w-xs">{item.track.name}</div>
                              <div className="text-sm text-zinc-400 truncate max-w-xs">
                                {item.track.artists.map((artist: any) => artist.name).join(', ')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-sm text-zinc-400 truncate max-w-xs">{item.track.album.name}</td>
                        <td className="py-2 text-zinc-400 text-right pr-4">{formatDuration(item.track.duration_ms)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Create Playlist Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleCreatePlaylist}
                  disabled={isLoading}
                  className={`py-3 px-8 ${isLoading ? 'bg-zinc-600' : 'bg-green-600 hover:bg-green-700'} text-white rounded-full font-medium flex items-center gap-2 transition-colors`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {progress > 0 ? `Creating... ${progress}%` : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                      Create Playlist
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotifyPopup;