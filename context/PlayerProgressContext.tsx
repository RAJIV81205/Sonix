"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { usePlayerControls } from "./PlayerControlsContext";

interface PlayerProgressContextType {
  // Frequently updating values
  currentTime: number;
  duration: number;
}

const PlayerProgressContext = createContext<PlayerProgressContextType | undefined>(undefined);

export function PlayerProgressProvider({ children }: { children: ReactNode }) {
  const { audioRef } = usePlayerControls();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Time and duration updates - isolated to prevent re-renders in other components
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("durationchange", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("durationchange", updateDuration);
    };
  }, [audioRef]);

  return (
    <PlayerProgressContext.Provider
      value={{
        currentTime,
        duration,
      }}
    >
      {children}
    </PlayerProgressContext.Provider>
  );
}

export function usePlayerProgress() {
  const context = useContext(PlayerProgressContext);
  if (context === undefined) {
    throw new Error("usePlayerProgress must be used within a PlayerProgressProvider");
  }
  return context;
}