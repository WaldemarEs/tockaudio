/**
 * Archivo: src/store/audioStore.ts
 * Decisión técnica: Estado global en Zustand extendido para soportar la comparación A/B de IA.
 * Contexto: Añadimos soporte para retener el archivo procesado por IA sin mutar destructivamente el original.
 * Restricciones: El store solo maneja 1 archivo procesado a la vez en memoria.
 * Known issues: Si el usuario borra la pista original, el archivo procesado queda huérfano.
 */
import { create } from 'zustand';

export type FileStatus = 'idle' | 'processing' | 'done' | 'error';
export type PlaybackState = 'idle' | 'playing' | 'paused';

export interface AudioFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
}

interface AudioStore {
  // Estado original
  files: AudioFile[];
  activeFileId: string | null;
  isProcessing: boolean;
  playbackState: PlaybackState;
  
  // Nuevo Estado IA
  processedFile: File | null;
  isShowingProcessed: boolean;

  // Nuevo Estado Normalización
  normalizedFile: File | null;
  isShowingNormalized: boolean;

  // Nuevo Estado Ecualización
  equalizedFile: File | null;
  isShowingEqualized: boolean;

  // Acciones originales
  addFile: (file: AudioFile) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  setProcessing: (isProcessing: boolean) => void;
  setPlaybackState: (state: PlaybackState) => void;
  clearAll: () => void;

  // Nuevas Acciones IA
  setProcessedFile: (file: File | null) => void;
  toggleProcessedView: () => void;
  clearProcessedFile: () => void;

  // Nuevas Acciones Normalización
  setNormalizedFile: (file: File | null) => void;
  toggleNormalizedView: () => void;
  clearNormalizedFile: () => void;

  // Nuevas Acciones Ecualización
  setEqualizedFile: (file: File | null) => void;
  toggleEqualizedView: () => void;
  clearEqualizedFile: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  files: [],
  activeFileId: null,
  isProcessing: false,
  playbackState: 'idle',
  
  processedFile: null,
  isShowingProcessed: false,

  normalizedFile: null,
  isShowingNormalized: false,

  equalizedFile: null,
  isShowingEqualized: false,

  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
      activeFileId: state.files.length === 0 ? file.id : state.activeFileId,
    })),
    
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      activeFileId: state.activeFileId === id ? null : state.activeFileId,
    })),
    
  setActiveFile: (id) => set({ 
    activeFileId: id,
    // Limpiamos la caché procesada si cambiamos de archivo para evitar cruces
    processedFile: null,
    isShowingProcessed: false,
    normalizedFile: null,
    isShowingNormalized: false,
    equalizedFile: null,
    isShowingEqualized: false
  }),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
  setPlaybackState: (playbackState) => set({ playbackState }),
  
  clearAll: () =>
    set({
      files: [],
      activeFileId: null,
      isProcessing: false,
      playbackState: 'idle',
      processedFile: null,
      isShowingProcessed: false,
      normalizedFile: null,
      isShowingNormalized: false,
      equalizedFile: null,
      isShowingEqualized: false
    }),

  setProcessedFile: (file) => set({ 
    processedFile: file,
    isShowingProcessed: file !== null // Automáticamente mostrarlo al setear
  }),
  
  toggleProcessedView: () => set((state) => ({ 
    isShowingProcessed: !state.isShowingProcessed 
  })),
  
  clearProcessedFile: () => set({ 
    processedFile: null,
    isShowingProcessed: false
  }),

  setNormalizedFile: (file) => set({ 
    normalizedFile: file,
    isShowingNormalized: file !== null
  }),
  
  toggleNormalizedView: () => set((state) => ({ 
    isShowingNormalized: !state.isShowingNormalized 
  })),
  
  clearNormalizedFile: () => set({ 
    normalizedFile: null,
    isShowingNormalized: false
  }),

  setEqualizedFile: (file) => set({ 
    equalizedFile: file,
    isShowingEqualized: file !== null
  }),
  
  toggleEqualizedView: () => set((state) => ({ 
    isShowingEqualized: !state.isShowingEqualized 
  })),
  
  clearEqualizedFile: () => set({ 
    equalizedFile: null,
    isShowingEqualized: false
  }),
}));
