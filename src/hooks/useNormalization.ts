/**
 * Archivo: src/hooks/useNormalization.ts
 * Decisión técnica: Hook de orquestación reactiva para el medidor y normalizador matemático.
 * Contexto: Abstrae la instanciación del AudioContext y Blob Parsing para la UI de React.
 * Restricciones: Archivos muy pesados (>1h) podrían trabar la pestaña principal por unos milisegundos.
 * Known issues: N/A
 */
import { useState, useCallback } from 'react';
import { measureAudioLevels, normalizePeak, normalizeLUFS, audioBufferToWav, LoudnessMeasurements } from '@lib/audio-normalizer';

export interface NormalizeOptions {
  targetPeakDb?: number;
  targetLUFS?: number;
}

export function useNormalization() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<LoudnessMeasurements | null>(null);

  // Infiere los dB de un File leyendo su Buffer
  const measureFile = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Instanciación explícita para evitar bloqueos de WebKit Safari sin User Gesture
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const levels = await measureAudioLevels(audioBuffer);
      setMeasurements(levels);
      return levels;
    } catch (e: any) {
      console.error(e);
      setError("Error decodificando archivo de audio o DRM bloqueado.");
      return null;
    }
  }, []);

  // Aplica la ganancia matemática destructiva
  const normalize = useCallback(async (file: File, mode: 'peak' | 'lufs', options?: NormalizeOptions): Promise<File | null> => {
    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      setProgress(50);

      let processedBuffer: AudioBuffer;

      // Despachar modo elegido
      if (mode === 'peak') {
        processedBuffer = await normalizePeak(audioBuffer, options?.targetPeakDb ?? -1);
      } else {
        processedBuffer = await normalizeLUFS(audioBuffer, options?.targetLUFS ?? -16);
      }
      setProgress(85);

      // Renderizar el nuevo archivo PCM
      const wavBlob = audioBufferToWav(processedBuffer);
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const newFile = new File([wavBlob], `${baseName}_norm.wav`, { type: 'audio/wav' });
      
      setProgress(100);
      setIsProcessing(false);
      return newFile;
      
    } catch (e: any) {
      console.error(e);
      setError(`Crash matemático: ${e.message}`);
      setIsProcessing(false);
      return null;
    }
  }, []);

  return {
    normalize,
    measureFile,
    isProcessing,
    progress,
    error,
    measurements
  };
}
