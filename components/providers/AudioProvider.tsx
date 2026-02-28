"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AudioContextType {
  isAudioEnabled: boolean;
  toggleAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Load initial state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("roaster-audio-enabled");
    if (saved !== null) {
      setIsAudioEnabled(saved === "true");
    }
  }, []);

  const toggleAudio = () => {
    const newVal = !isAudioEnabled;
    setIsAudioEnabled(newVal);
    localStorage.setItem("roaster-audio-enabled", String(newVal));
  };

  return (
    <AudioContext.Provider value={{ isAudioEnabled, toggleAudio }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
