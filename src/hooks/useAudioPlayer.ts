/**
 * Archivo: src/hooks/useAudioPlayer.ts
 * Decisión técnica: Encapsula WaveSurfer.js y maneja volumen/mute.
 * Contexto: Renderiza y controla la reproducción del audio, exponiendo métodos y estado.
 * Restricciones: Inicializa el volumen en 80%. Mute guarda el volumen previo.
 * Known issues: Crear múltiples instancias consecutivas muy rápido puede causar un leve flickering.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudioStore } from '@store/audioStore';

interface UseAudioPlayerProps {
  audioFile: File | null;
  height?: number;
}

export function useAudioPlayer({ audioFile, height = 80 }: UseAudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Estados de volumen
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(80);
  
  const setPlaybackState = useAudioStore(state => state.setPlaybackState);

  useEffect(() => {
    if (!audioFile || !containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(161, 161, 170, 0.4)',
      progressColor: '#0EA5E9',
      cursorColor: '#0EA5E9',
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height,
      normalize: true,
    });

    wavesurferRef.current = ws;
    
    // Inicializar volumen
    ws.setVolume((isMuted ? 0 : volume) / 100);

    const blob = new Blob([audioFile], { type: audioFile.type });
    ws.loadBlob(blob);

    ws.on('ready', () => {
      setDuration(ws.getDuration());
    });

    ws.on('timeupdate', (time) => {
      setCurrentTime(time);
    });

    ws.on('play', () => {
      setIsPlaying(true);
      setPlaybackState('playing');
    });

    ws.on('pause', () => {
      setIsPlaying(false);
      setPlaybackState('paused');
    });

    ws.on('finish', () => {
      setIsPlaying(false);
      setPlaybackState('idle');
    });

    return () => {
      ws.destroy();
      setPlaybackState('idle');
    };
  }, [audioFile, height, setPlaybackState]); // Omitimos volume/isMuted como dep para no recrear la instancia de ws

  const play = useCallback(() => wavesurferRef.current?.play(), []);
  const pause = useCallback(() => wavesurferRef.current?.pause(), []);
  const seekTo = useCallback((progress: number) => wavesurferRef.current?.seekTo(progress), []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
      previousVolumeRef.current = volume > 0 ? volume : 80;
    }
    wavesurferRef.current?.setVolume(newVolume / 100);
  }, [isMuted, volume]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      // Desmutear: Restaurar volumen anterior
      const restoreVol = previousVolumeRef.current > 0 ? previousVolumeRef.current : 80;
      setIsMuted(false);
      setVolumeState(restoreVol);
      wavesurferRef.current?.setVolume(restoreVol / 100);
    } else {
      // Mutear: Guardar volumen actual y poner a 0
      previousVolumeRef.current = volume;
      setIsMuted(true);
      setVolumeState(0);
      wavesurferRef.current?.setVolume(0);
    }
  }, [isMuted, volume]);

  return {
    containerRef,
    isPlaying,
    duration,
    currentTime,
    play,
    pause,
    seekTo,
    volume,
    isMuted,
    setVolume,
    toggleMute,
  };
}
