/**
 * Archivo: src/components/mobile/MobileStudio.tsx
 * Decisión técnica: Interfaz móvil de edición de audio (tareas rápidas).
 * Contexto: Integra componentes de audio y el panel IA para reducción de ruido.
 * Restricciones: Apilado vertical estricto para encajar en pantallas < 400px.
 * Known issues: N/A
 */
import { useState } from 'react';
import DropZone from '@components/audio/DropZone';
import Waveform from '@components/audio/Waveform';
import PlaybackControls from '@components/audio/PlaybackControls';
import VolumeControl from '@components/audio/VolumeControl';
import ExportPanel from '@components/audio/ExportPanel';
import VideoExtractor from '@components/video/VideoExtractor';
import NoiseReductionPanel from '@components/audio/NoiseReductionPanel';
import NormalizationPanel from '@components/audio/NormalizationPanel';
import PreviewAB from '@components/audio/PreviewAB';
import { useAudioStore } from '@store/audioStore';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { cn } from '@lib/utils';

export default function MobileStudio() {
  const files = useAudioStore((state) => state.files);
  const activeFileId = useAudioStore((state) => state.activeFileId);
  const setActiveFile = useAudioStore((state) => state.setActiveFile);
  const addFile = useAudioStore((state) => state.addFile);
  const processedFile = useAudioStore((state) => state.processedFile);
  const normalizedFile = useAudioStore((state) => state.normalizedFile);

  const [rawFiles, setRawFiles] = useState<Map<string, File>>(new Map());

  const handleFilesSelected = (selectedFiles: File[]) => {
    setRawFiles(prev => {
      const next = new Map(prev);
      selectedFiles.forEach(f => next.set(f.name, f));
      return next;
    });
  };

  const handleAudioExtracted = (audioFile: File) => {
    setRawFiles(prev => {
      const next = new Map(prev);
      next.set(audioFile.name, audioFile);
      return next;
    });
    
    const newFileMeta = {
      id: crypto.randomUUID(),
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      status: 'idle' as const
    };
    addFile(newFileMeta);
    setActiveFile(newFileMeta.id);
  };

  const activeFileMetadata = files.find(f => f.id === activeFileId);
  const activeRawFile = activeFileMetadata ? rawFiles.get(activeFileMetadata.name) || null : null;

  // Para evitar colisiones A/B, el reproductor principal se bloquea o mutea si hay archivo procesado en preview
  // Aunque para mantenerlo simple, permitimos usar ambos, pero PreviewAB maneja su propio Waveform.
  const player = useAudioPlayer({ audioFile: activeRawFile, height: 80 });

  return (
    <div className="w-full flex flex-col p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary text-center">
          TockAudio Studio (Mobile)
        </h1>
      </header>

      <main className="flex flex-col items-center justify-start py-4 w-full">
        {/* Input Zones */}
        <DropZone 
          onFilesSelected={handleFilesSelected} 
          multiple={false} 
          className="max-w-md mx-auto" 
        />
        
        <div className="relative w-full max-w-md my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-semibold">O extrae desde video</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <VideoExtractor onAudioExtracted={handleAudioExtracted} />
        </div>
        
        {/* Editor Central */}
        <div className="mt-8 w-full max-w-md flex flex-col gap-4">
          <Waveform 
            containerRef={player.containerRef} 
            audioFile={activeRawFile} 
            height={80} 
          />
          
          <div className={cn("flex flex-col items-center gap-4 transition-opacity", !activeRawFile && "opacity-50 pointer-events-none")}>
            <PlaybackControls 
              isPlaying={player.isPlaying}
              currentTime={player.currentTime}
              duration={player.duration}
              onPlay={player.play}
              onPause={player.pause}
              onStop={() => { player.pause(); player.seekTo(0); }}
            />
            
            <VolumeControl 
              volume={player.volume}
              isMuted={player.isMuted}
              onVolumeChange={player.setVolume}
              onMuteToggle={player.toggleMute}
            />
          </div>

          <ExportPanel activeFile={activeRawFile} layout="vertical" className="mt-4" />
          
          {/* Herramientas de Audio e IA */}
          <div className="mt-2 space-y-4">
            <NormalizationPanel activeFile={activeRawFile} />
            {normalizedFile && <PreviewAB originalFile={activeRawFile} processedFile={normalizedFile} />}
            <NoiseReductionPanel activeFile={activeRawFile} />
            {processedFile && <PreviewAB originalFile={activeRawFile} processedFile={processedFile} />}
          </div>
        </div>

        {/* Pistas */}
        {files.length > 0 && (
          <div className="mt-8 w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Pistas Cargadas</h3>
            {files.map(file => {
              const isActive = file.id === activeFileId;
              return (
                <div 
                  key={file.id} 
                  onClick={() => setActiveFile(file.id)}
                  className={cn(
                    "p-4 rounded-lg flex justify-between items-center border transition-colors cursor-pointer",
                    isActive ? "bg-primary/5 border-primary" : "bg-secondary border-border hover:border-primary/50"
                  )}
                >
                  <span className="font-medium truncate flex-1">{file.name}</span>
                  {isActive && (
                    <span className="text-primary ml-3 text-xs bg-primary/10 px-2 py-1 rounded font-bold border border-primary/20">
                      Activo
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
