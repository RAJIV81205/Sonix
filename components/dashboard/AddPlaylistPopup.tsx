"use client";

import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddPlaylistPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (playlistId: string, playlistName: string) => void;
}

export default function AddPlaylistPopup({ isOpen, onClose, onSuccess }: AddPlaylistPopupProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/makePlaylist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: playlistName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create playlist');
      }

      const data = await response.json();
      toast.success(`Playlist "${playlistName}" created successfully!`);
      
      // Call the success callback with the playlist ID and name
      if (onSuccess) {
        onSuccess(data.playlist.id, playlistName);
      }
      
      // Reset form and close popup
      setPlaylistName('');
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create playlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-black border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-xl shadow-indigo-500/5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Create New Playlist</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="playlistName" className="block text-sm font-medium text-zinc-300 mb-2">
              Playlist Name
            </label>
            <input
              type="text"
              id="playlistName"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="My Awesome Playlist"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
