"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
  useCallback,
} from "react";

interface Song {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
  duration: number;
}

interface DownloadSongPayload {
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

// Queue Management System - Similar to Spotify's architecture
class QueueManager {
  private currentQueue: Song[] = [];
  private originalQueue: Song[] = [];
  private currentIndex: number = -1;
  private isShuffled: boolean = false;
  private repeatMode: "off" | "all" | "one" = "off";

  constructor() {
    this.loadFromStorage();
  }

  // Core queue operations
  setQueue(songs: Song[], startIndex: number = 0): void {
    this.currentQueue = [...songs];
    this.originalQueue = [...songs];
    this.currentIndex = Math.max(0, Math.min(startIndex, songs.length - 1));
    this.saveToStorage();
  }

  addToQueue(songs: Song | Song[]): void {
    const songsArray = Array.isArray(songs) ? songs : [songs];
    this.currentQueue.push(...songsArray);
    this.originalQueue.push(...songsArray);
    this.saveToStorage();
  }

  addToNext(song: Song): void {
    if (this.currentIndex >= 0) {
      this.currentQueue.splice(this.currentIndex + 1, 0, song);
      this.originalQueue.splice(this.currentIndex + 1, 0, song);
    } else {
      this.currentQueue.unshift(song);
      this.originalQueue.unshift(song);
      this.currentIndex = 0;
    }
    this.saveToStorage();
  }

  removeFromQueue(songId: string): void {
    const indexInCurrent = this.currentQueue.findIndex((s) => s.id === songId);
    const indexInOriginal = this.originalQueue.findIndex(
      (s) => s.id === songId
    );

    if (indexInCurrent >= 0) {
      this.currentQueue.splice(indexInCurrent, 1);
      if (indexInCurrent <= this.currentIndex) {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
      }
    }

    if (indexInOriginal >= 0) {
      this.originalQueue.splice(indexInOriginal, 1);
    }

    this.saveToStorage();
  }

  clearQueue(): void {
    this.currentQueue = [];
    this.originalQueue = [];
    this.currentIndex = -1;
    this.saveToStorage();
  }

  // Navigation
  getCurrentSong(): Song | null {
    return this.currentQueue[this.currentIndex] || null;
  }

  getNextSong(): Song | null {
    if (this.repeatMode === "one") {
      return this.getCurrentSong();
    }

    const nextIndex = this.currentIndex + 1;
    if (nextIndex < this.currentQueue.length) {
      return this.currentQueue[nextIndex];
    }

    if (this.repeatMode === "all" && this.currentQueue.length > 0) {
      return this.currentQueue[0];
    }

    return null;
  }

  getPreviousSong(): Song | null {
    const prevIndex = this.currentIndex - 1;
    if (prevIndex >= 0) {
      return this.currentQueue[prevIndex];
    }

    if (this.repeatMode === "all" && this.currentQueue.length > 0) {
      return this.currentQueue[this.currentQueue.length - 1];
    }

    return null;
  }

  next(): Song | null {
    if (this.repeatMode === "one") {
      return this.getCurrentSong();
    }

    const nextIndex = this.currentIndex + 1;
    if (nextIndex < this.currentQueue.length) {
      this.currentIndex = nextIndex;
    } else if (this.repeatMode === "all" && this.currentQueue.length > 0) {
      this.currentIndex = 0;
    } else {
      return null; // End of queue
    }

    this.saveToStorage();
    return this.getCurrentSong();
  }

  previous(): Song | null {
    const prevIndex = this.currentIndex - 1;
    if (prevIndex >= 0) {
      this.currentIndex = prevIndex;
    } else if (this.repeatMode === "all" && this.currentQueue.length > 0) {
      this.currentIndex = this.currentQueue.length - 1;
    } else {
      return null;
    }

    this.saveToStorage();
    return this.getCurrentSong();
  }

  jumpToSong(songId: string): Song | null {
    const index = this.currentQueue.findIndex((s) => s.id === songId);
    if (index >= 0) {
      this.currentIndex = index;
      this.saveToStorage();
      return this.getCurrentSong();
    }
    return null;
  }

  // Shuffle and Repeat
  toggleShuffle(): boolean {
    this.isShuffled = !this.isShuffled;

    if (this.isShuffled) {
      // Create shuffled version while preserving current song position
      const currentSong = this.getCurrentSong();
      const shuffled = [...this.originalQueue].sort(() => Math.random() - 0.5);

      if (currentSong) {
        // Move current song to first position
        const currentIndex = shuffled.findIndex((s) => s.id === currentSong.id);
        if (currentIndex > 0) {
          shuffled.splice(currentIndex, 1);
          shuffled.unshift(currentSong);
        }
        this.currentIndex = 0;
      }

      this.currentQueue = shuffled;
    } else {
      // Restore original order
      const currentSong = this.getCurrentSong();
      this.currentQueue = [...this.originalQueue];

      if (currentSong) {
        this.currentIndex = this.currentQueue.findIndex(
          (s) => s.id === currentSong.id
        );
      }
    }

    this.saveToStorage();
    return this.isShuffled;
  }

  toggleRepeat(): "off" | "all" | "one" {
    switch (this.repeatMode) {
      case "off":
        this.repeatMode = "all";
        break;
      case "all":
        this.repeatMode = "one";
        break;
      case "one":
        this.repeatMode = "off";
        break;
    }
    this.saveToStorage();
    return this.repeatMode;
  }

  // Getters
  getQueue(): Song[] {
    return [...this.currentQueue];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getShuffleState(): boolean {
    return this.isShuffled;
  }

  getRepeatMode(): "off" | "all" | "one" {
    return this.repeatMode;
  }

  getUpNext(): Song[] {
    return this.currentQueue.slice(this.currentIndex + 1);
  }

  // Storage
  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    localStorage.setItem("queue", JSON.stringify(this.currentQueue));
    localStorage.setItem("originalQueue", JSON.stringify(this.originalQueue));
    localStorage.setItem("queueIndex", this.currentIndex.toString());
    localStorage.setItem("isShuffled", JSON.stringify(this.isShuffled));
    localStorage.setItem("repeatMode", this.repeatMode);
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const queue = localStorage.getItem("queue");
      const originalQueue = localStorage.getItem("originalQueue");
      const index = localStorage.getItem("queueIndex");
      const shuffled = localStorage.getItem("isShuffled");
      const repeat = localStorage.getItem("repeatMode");

      if (queue) this.currentQueue = JSON.parse(queue);
      if (originalQueue) this.originalQueue = JSON.parse(originalQueue);
      if (index) this.currentIndex = parseInt(index, 10);
      if (shuffled) this.isShuffled = JSON.parse(shuffled);
      if (repeat) this.repeatMode = repeat as "off" | "all" | "one";
    } catch (error) {
      console.error("Error loading queue from storage:", error);
      this.clearQueue();
    }
  }
}

// Audio Manager for handling playback
class AudioManager {
  private audioElement: HTMLAudioElement;
  private currentSong: Song | null = null;
  private isPlaying: boolean = false;
  private isLoading: boolean = false;
  private playPromise: Promise<void> | null = null;

  constructor(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.audioElement.addEventListener("loadstart", () => {
      this.isLoading = true;
    });

    this.audioElement.addEventListener("canplay", () => {
      this.isLoading = false;
      if (this.isPlaying) {
        this.play();
      }
    });

    this.audioElement.addEventListener("error", (e) => {
      console.error("Audio error:", e);
      this.isLoading = false;
      this.isPlaying = false;
    });
  }

  async loadSong(song: Song): Promise<void> {
    if (this.currentSong?.id === song.id) return;

    this.currentSong = song;
    this.audioElement.src = song.url;
    this.audioElement.load();

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("currentSong", JSON.stringify(song));
    }
  }

  async play(): Promise<boolean> {
    if (!this.currentSong || this.isLoading) return false;

    try {
      this.playPromise = this.audioElement.play();
      await this.playPromise;
      this.isPlaying = true;
      return true;
    } catch (error) {
      console.error("Play error:", error);
      this.isPlaying = false;
      return false;
    } finally {
      this.playPromise = null;
    }
  }

  pause(): void {
    this.audioElement.pause();
    this.isPlaying = false;
  }

  getCurrentTime(): number {
    return this.audioElement.currentTime;
  }

  getDuration(): number {
    return this.audioElement.duration || 0;
  }

  setCurrentTime(time: number): void {
    this.audioElement.currentTime = time;
  }

  setVolume(volume: number): void {
    this.audioElement.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.audioElement.volume;
  }

  getPlayingState(): boolean {
    return this.isPlaying;
  }

  getLoadingState(): boolean {
    return this.isLoading;
  }

  getCurrentSong(): Song | null {
    return this.currentSong;
  }
}

interface PlayerControlsContextType {
  // Current state (stable - doesn't change frequently)
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

  // Audio controls (stable)
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

const PlayerControlsContext = createContext<PlayerControlsContextType | undefined>(undefined);

export function PlayerControlsProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const queueManagerRef = useRef<QueueManager | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);

  // State (stable - doesn't change frequently)
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [upNext, setUpNext] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [volume, setVolumeState] = useState(1);

  // Initialize managers
  useEffect(() => {
    if (!audioRef.current) return;

    queueManagerRef.current = new QueueManager();
    audioManagerRef.current = new AudioManager(audioRef.current);

    // Load initial state
    const initialSong = queueManagerRef.current.getCurrentSong();
    if (initialSong) {
      setCurrentSong(initialSong);
      audioManagerRef.current.loadSong(initialSong);
    }

    // Sync state
    syncStateFromManagers();
  }, []);

  // Sync state from managers
  const syncStateFromManagers = useCallback(() => {
    if (!queueManagerRef.current || !audioManagerRef.current) return;

    setQueue(queueManagerRef.current.getQueue());
    setUpNext(queueManagerRef.current.getUpNext());
    setCurrentIndex(queueManagerRef.current.getCurrentIndex());
    setIsShuffled(queueManagerRef.current.getShuffleState());
    setRepeatMode(queueManagerRef.current.getRepeatMode());
    setCurrentSong(audioManagerRef.current.getCurrentSong());
    setIsPlaying(audioManagerRef.current.getPlayingState());
    setIsLoading(audioManagerRef.current.getLoadingState());
  }, []);

  // Auto-play next song when current ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !queueManagerRef.current) return;

    const handleEnded = async () => {
      const nextSong = queueManagerRef.current!.next();
      if (nextSong) {
        await audioManagerRef.current!.loadSong(nextSong);
        await audioManagerRef.current!.play();
        syncStateFromManagers();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [syncStateFromManagers]);

  // Media Session API setup
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => play());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => previous());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    };
  }, []);

  // Update media session metadata
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("mediaSession" in navigator) ||
      !currentSong
    )
      return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.name.replace(/&quot;/g, '"'),
      artist: currentSong.artist,
      artwork: [
        { src: currentSong.image, sizes: "512x512", type: "image/png" },
      ],
    });
  }, [currentSong]);

  // Context methods
  const play = async (): Promise<boolean> => {
    if (!audioManagerRef.current) return false;
    const success = await audioManagerRef.current.play();
    setIsPlaying(success);
    return success;
  };

  const pause = (): void => {
    audioManagerRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = async (): Promise<void> => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  };

  const next = async (): Promise<Song | null> => {
    if (!queueManagerRef.current || !audioManagerRef.current) return null;

    const nextSong = queueManagerRef.current.next();
    if (nextSong) {
      await audioManagerRef.current.loadSong(nextSong);
      await audioManagerRef.current.play();
      syncStateFromManagers();
    }
    return nextSong;
  };

  const previous = async (): Promise<Song | null> => {
    if (!queueManagerRef.current || !audioManagerRef.current) return null;

    // If more than 3 seconds played, restart current song
    if (audioManagerRef.current.getCurrentTime() > 3) {
      audioManagerRef.current.setCurrentTime(0);
      return currentSong;
    }

    const prevSong = queueManagerRef.current.previous();
    if (prevSong) {
      await audioManagerRef.current.loadSong(prevSong);
      await audioManagerRef.current.play();
      syncStateFromManagers();
    }
    return prevSong;
  };

  const jumpToSong = async (songId: string): Promise<Song | null> => {
    if (!queueManagerRef.current || !audioManagerRef.current) return null;

    const song = queueManagerRef.current.jumpToSong(songId);
    if (song) {
      await audioManagerRef.current.loadSong(song);
      if (isPlaying) await audioManagerRef.current.play();
      syncStateFromManagers();
    }
    return song;
  };

  const setQueueMethod = (songs: Song[], startIndex: number = 0): void => {
    if (!queueManagerRef.current || !audioManagerRef.current) return;

    queueManagerRef.current.setQueue(songs, startIndex);
    const currentSong = queueManagerRef.current.getCurrentSong();
    if (currentSong) {
      audioManagerRef.current.loadSong(currentSong);
    }
    syncStateFromManagers();
  };

  const addToQueue = (songs: Song | Song[]): void => {
    queueManagerRef.current?.addToQueue(songs);
    syncStateFromManagers();
  };

  const addToNext = (song: Song): void => {
    queueManagerRef.current?.addToNext(song);
    syncStateFromManagers();
  };

  const removeFromQueue = (songId: string): void => {
    queueManagerRef.current?.removeFromQueue(songId);
    syncStateFromManagers();
  };

  const clearQueue = (): void => {
    queueManagerRef.current?.clearQueue();
    pause();
    syncStateFromManagers();
  };

  const toggleShuffle = (): boolean => {
    if (!queueManagerRef.current) return false;
    const shuffled = queueManagerRef.current.toggleShuffle();
    syncStateFromManagers();
    return shuffled;
  };

  const toggleRepeat = (): "off" | "all" | "one" => {
    if (!queueManagerRef.current) return "off";
    const repeat = queueManagerRef.current.toggleRepeat();
    syncStateFromManagers();
    return repeat;
  };

  const seek = (time: number): void => {
    audioManagerRef.current?.setCurrentTime(time);
  };

  const setVolume = (vol: number): void => {
    audioManagerRef.current?.setVolume(vol);
    setVolumeState(vol);
  };

  // Quick actions
  const playAlbum = (songs: Song[], startIndex: number = 0): void => {
    setQueueMethod(songs, startIndex);
    play();
  };

  const playPlaylist = (songs: Song[], startIndex: number = 0): void => {
    setQueueMethod(songs, startIndex);
    play();
  };

  const shufflePlay = (songs: Song[]): void => {
    setQueueMethod(songs, 0);
    toggleShuffle();
    play();
  };

  const downloadSong = async (payload: DownloadSongPayload) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/api/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Download failed");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${payload.title} - ${payload.artist}.m4a`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <PlayerControlsContext.Provider
      value={{
        // Current state
        currentSong,
        isPlaying,
        isLoading,

        // Queue management
        queue,
        upNext,
        currentIndex,

        // Playback controls
        play,
        pause,
        togglePlayPause,
        next,
        previous,
        jumpToSong,

        // Queue operations
        setQueue: setQueueMethod,
        addToQueue,
        addToNext,
        removeFromQueue,
        clearQueue,

        // Shuffle and repeat
        isShuffled,
        repeatMode,
        toggleShuffle,
        toggleRepeat,

        // Audio controls
        volume,
        seek,
        setVolume,

        // Quick actions
        playAlbum,
        playPlaylist,
        shufflePlay,

        // Download Song
        downloadSong,

        // Audio element ref
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </PlayerControlsContext.Provider>
  );
}

export function usePlayerControls() {
  const context = useContext(PlayerControlsContext);
  if (context === undefined) {
    throw new Error("usePlayerControls must be used within a PlayerControlsProvider");
  }
  return context;
}