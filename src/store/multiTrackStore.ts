/**
 * Archivo: src/store/multiTrackStore.ts
 * Decisión técnica: Store de Zustand dedicado y aislado para el motor Multipista.
 * Contexto: A diferencia de la edición rápida en Móvil, Desktop necesita coordenadas X, volúmenes independientes y un AudioBuffer por pista.
 * Restricciones: Cargar muchos AudioBuffer grandes a la vez puede saturar la memoria RAM.
 * Known issues: Faltaría implementar undo/redo (historial de comandos) para una suite DAW real.
 */
import { create } from 'zustand';

export interface Track {
  id: string;
  name: string;
  file: File;
  audioBuffer: AudioBuffer | null;
  startTime: number;
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  color: string;
  waveformData?: number[]; 
}

interface MultiTrackStore {
  tracks: Track[];
  selectedTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number; // en segundos
  zoom: number; // Nivel de zoom (ej: 1 = 100px/s)
  
  // Modificadores de Estado Global
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  clearAllTracks: () => void;

  // Acciones de Pista
  addTrack: (trackProps: Omit<Track, 'isMuted' | 'isSolo' | 'volume' | 'pan' | 'startTime'> & { startTime?: number }) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  selectTrack: (trackId: string | null) => void;
  moveTrack: (trackId: string, newStartTime: number) => void;
  
  // Mixers
  setVolume: (trackId: string, volume: number) => void;
  setPan: (trackId: string, pan: number) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
}

export const useMultiTrackStore = create<MultiTrackStore>((set) => ({
  tracks: [],
  selectedTrackId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 60, // Duración canvas por defecto (60s)
  zoom: 1,

  addTrack: (trackProps) => set((state) => {
    const newTrack: Track = {
      ...trackProps,
      startTime: trackProps.startTime ?? 0,
      volume: 100,
      pan: 0,
      isMuted: false,
      isSolo: false,
    };
    
    const newTracks = [...state.tracks, newTrack];
    
    let newDuration = state.duration;
    if (newTrack.audioBuffer) {
      const trackEnd = newTrack.startTime + newTrack.audioBuffer.duration;
      // Expande el timeline si la pista se sale de los bordes + 10s padding
      if (trackEnd > newDuration) newDuration = trackEnd + 10; 
    }

    return { 
      tracks: newTracks, 
      selectedTrackId: newTrack.id,
      duration: newDuration
    };
  }),

  removeTrack: (trackId) => set((state) => ({
    tracks: state.tracks.filter(t => t.id !== trackId),
    selectedTrackId: state.selectedTrackId === trackId ? null : state.selectedTrackId
  })),

  updateTrack: (trackId, updates) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, ...updates } : t)
  })),

  selectTrack: (trackId) => set({ selectedTrackId: trackId }),
  
  moveTrack: (trackId, newStartTime) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, startTime: Math.max(0, newStartTime) } : t)
  })),

  setVolume: (trackId, volume) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, volume } : t)
  })),

  setPan: (trackId, pan) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, pan } : t)
  })),

  toggleMute: (trackId) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, isMuted: !t.isMuted } : t)
  })),

  toggleSolo: (trackId) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, isSolo: !t.isSolo } : t)
  })),

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(10, zoom)) }),
  
  clearAllTracks: () => set({
    tracks: [],
    selectedTrackId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 60
  })
}));
