/**
 * Archivo: src/hooks/useMultiTrackEditor.ts
 * Decisión técnica: Controlador central para el Editor Multipista. Integra OfflineAudioContext y sincronización bidireccional.
 * Contexto: Añadimos syncFromAudioStore para portar automáticamente los archivos subidos (DropZone) al DAW multipista.
 * Restricciones: Decodificar audio es pesado, por lo que syncFromAudioStore usa un set local de procesados para no re-decodificar.
 * Known issues: Si el usuario carga 10 archivos a la vez, congelará la pestaña durante la decodificación en serie.
 */
import { useRef, useCallback, useEffect, useState } from 'react';
import { useMultiTrackStore, Track } from '@store/multiTrackStore';
import { useAudioStore } from '@store/audioStore';
import { useLicenseContext } from '@context/LicenseContext';

// Helper WebAudio Export
function exportWAV(audioBuffer: AudioBuffer): Blob {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  writeString(view, pos, 'RIFF'); pos += 4;
  view.setUint32(pos, length - 8, true); pos += 4;
  writeString(view, pos, 'WAVE'); pos += 4;
  writeString(view, pos, 'fmt '); pos += 4;
  view.setUint32(pos, 16, true); pos += 4;
  view.setUint16(pos, 1, true); pos += 2;
  view.setUint16(pos, numOfChan, true); pos += 2;
  view.setUint32(pos, audioBuffer.sampleRate, true); pos += 4;
  view.setUint32(pos, audioBuffer.sampleRate * 2 * numOfChan, true); pos += 4;
  view.setUint16(pos, numOfChan * 2, true); pos += 2;
  view.setUint16(pos, 16, true); pos += 2;
  writeString(view, pos, 'data'); pos += 4;
  view.setUint32(pos, length - pos - 4, true); pos += 4;

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function useMultiTrackEditor() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const store = useMultiTrackStore();
  const audioStore = useAudioStore();
  const { isPro } = useLicenseContext();

  const [processedFileIds, setProcessedFileIds] = useState<Set<string>>(new Set());

  // === SINCRONIZACIÓN AUTOMÁTICA DESDE AUDIO_STORE (DROPZONE) ===
  const syncFromAudioStore = useCallback(async (rawFilesMap: Map<string, File>) => {
    // Si la lista de audioStore cambió y hay archivos nuevos, los portamos al DAW multipista
    for (const audioFile of audioStore.files) {
      if (!processedFileIds.has(audioFile.id)) {
        const rawFile = rawFilesMap.get(audioFile.name);
        if (!rawFile) continue;

        // Validar límite Free vs Pro antes de insertar (fallback de seguridad)
        const currentCount = useMultiTrackStore.getState().tracks.length;
        if (!isPro && currentCount >= 1) {
          // Free tier llegó al límite, marcamos como procesado para no re-intentar pero no lo añadimos al multipista
          setProcessedFileIds(prev => new Set(prev).add(audioFile.id));
          continue;
        }

        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const arrayBuffer = await rawFile.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
          const color = colors[currentCount % colors.length];

          store.addTrack({
            id: audioFile.id, // Sincronizamos IDs
            name: rawFile.name,
            file: rawFile,
            audioBuffer,
            color,
            startTime: currentCount > 0 ? currentCount * 2 : 0 // Escalona ligeramente para que no caigan encima 100%
          });

          setProcessedFileIds(prev => new Set(prev).add(audioFile.id));
        } catch (e) {
          console.error("Error decodificando audio para Multipista:", e);
        }
      }
    }

    // Limpieza inversa: Si se eliminó de audioStore, quitar de multipista
    const activeAudioStoreIds = new Set(audioStore.files.map(f => f.id));
    for (const track of store.tracks) {
      if (!activeAudioStoreIds.has(track.id)) {
        store.removeTrack(track.id);
        setProcessedFileIds(prev => {
          const next = new Set(prev);
          next.delete(track.id);
          return next;
        });
      }
    }
  }, [audioStore.files, store, isPro, processedFileIds]);

  // === SINCRONIZACIÓN HACIA AUDIO_STORE (SELECCIÓN) ===
  const syncToAudioStore = useCallback(() => {
    if (store.selectedTrackId && store.selectedTrackId !== audioStore.activeFileId) {
      audioStore.setActiveFile(store.selectedTrackId);
    }
  }, [store.selectedTrackId, audioStore.activeFileId, audioStore]);

  // Sincronizar selección bidireccional si se requiere
  useEffect(() => {
    syncToAudioStore();
  }, [syncToAudioStore]);

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const pixelsPerSecond = 100 * store.zoom; 
    store.setCurrentTime(Math.max(0, clickX / pixelsPerSecond));
  }, [store]);

  const handleZoom = useCallback((delta: number) => {
    store.setZoom(store.zoom + delta);
  }, [store]);

  const exportMixdown = useCallback(async (): Promise<File | null> => {
    if (store.tracks.length === 0) return null;

    let maxDuration = 0;
    store.tracks.forEach(t => {
      if (t.audioBuffer && !t.isMuted) {
        const end = t.startTime + t.audioBuffer.duration;
        if (end > maxDuration) maxDuration = end;
      }
    });

    if (maxDuration === 0) return null;
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(2, sampleRate * maxDuration, sampleRate);
    const isAnySolo = store.tracks.some(t => t.isSolo);

    for (const track of store.tracks) {
      if (!track.audioBuffer) continue;
      if (track.isMuted && !track.isSolo) continue;
      if (isAnySolo && !track.isSolo) continue;

      const source = offlineCtx.createBufferSource();
      source.buffer = track.audioBuffer;
      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = track.volume / 100;
      const pannerNode = offlineCtx.createStereoPanner();
      pannerNode.pan.value = track.pan / 100;

      source.connect(gainNode);
      gainNode.connect(pannerNode);
      pannerNode.connect(offlineCtx.destination);
      source.start(track.startTime);
    }

    try {
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = exportWAV(renderedBuffer);
      return new File([wavBlob], "TockAudio_Mixdown.wav", { type: 'audio/wav' });
    } catch (e) {
      return null;
    }
  }, [store.tracks]);

  // Motor Reloj UI
  useEffect(() => {
    if (!store.isPlaying) return;
    let lastTick = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const deltaSeconds = (now - lastTick) / 1000;
      lastTick = now;
      const nextTime = store.currentTime + deltaSeconds;
      if (nextTime >= store.duration) {
        store.setCurrentTime(store.duration);
        store.setIsPlaying(false);
      } else {
        store.setCurrentTime(nextTime);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [store.isPlaying, store.currentTime, store.duration]);

  return {
    timelineRef,
    handleTimelineClick,
    handleZoom,
    exportMixdown,
    syncFromAudioStore, // Exponemos para llamar desde DesktopStudio
    isPro
  };
}
