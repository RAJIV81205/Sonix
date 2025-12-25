"use client";

import React, { ReactNode } from "react";
import { PlayerControlsProvider, usePlayerControls } from "./PlayerControlsContext";
import { PlayerProgressProvider, usePlayerProgress } from "./PlayerProgressContext";

// Re-export types for backward compatibility
export interface Song {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
  duration: number;
}

export interface DownloadSongPayload {
  songUrl: string; // 320kbps AAC / M4A URL
  title: string; // Song name
  artist: string; // Primary artist
  album: string; // Album name
  albumArtist: string; // Usually same as artist
  year: string; // Release year
  duration?: number; // In seconds (optional)
  language?: string; // ISO-ish code (hin, eng)
  genre?: string; // Optional
  label?: string; // Music label
  composer?: string; // Music director
  lyricist?: string; // Lyricist
  copyright?: string; // © line
  coverUrl?: string; // 500x500 image
}

// Combined interface for backward compatibility
interface PlayerContextType {
  // Current state
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;

  // Queue management
  queue: Song[];
  upNext: Song[];
  currentIndex: number;

  // Playback controls
  play: () => Promise<boolean>;
  pause: () => void;
  togglePlayPause: () => Promise<void>;
  next: () => Promise<Song | null>;
  previous: () => Promise<Song | null>;
  jumpToSong: (songId: string) => Promise<Song | null>;

  // Queue operations
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (songs: Song | Song[]) => void;
  addToNext: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;

  // Shuffle and repeat
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  toggleShuffle: () => boolean;
  toggleRepeat: () => "off" | "all" | "one";

  // Audio controls
  currentTime: number;
  duration: number;
  volume: number;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;

  // Quick actions
  playAlbum: (songs: Song[], startIndex?: number) => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void;
  shufflePlay: (songs: Song[]) => void;

  // Download functionality
  downloadSong: (payload: DownloadSongPayload) => Promise<void>;

  // Audio element ref
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

// Combined provider that wraps both contexts
export function PlayerProvider({ children }: { children: ReactNode }) {
  return (
    <PlayerControlsProvider>
      <PlayerProgressProvider>
        {children}
      </PlayerProgressProvider>
    </PlayerControlsProvider>
  );
}

// Combined hook that merges both contexts for backward compatibility
export function usePlayer(): PlayerContextType {
  const controls = usePlayerControls();
  const progress = usePlayerProgress();

  return {
    ...controls,
    ...progress,
  };
}
