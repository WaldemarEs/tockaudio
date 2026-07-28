/**
 * Archivo: src/components/desktop/DesktopStudio.tsx
 * Decisión técnica: Interfaz desktop dual. Combina edición simple (0-1 pista) y muta a DAW completo si hay múltiples pistas.
 * Contexto: Inyecta el MultiTrackEditor al vuelo basándose en la longitud del array de pistas o si el usuario quiere mezclar.
 * Restricciones: Requiere pasarle el mapa crudo de archivos (`rawFiles`) al hook para decodificar PCM.
 * Known issues: Oculta visualmente el editor simple cuando entramos en multipista para forzar enfoque, pero conserva el estado por debajo.
 */
import { useState, useEffect } from 'react';
import DropZone from '@components/audio/DropZone';
import Waveform from '@components/audio/Waveform';
import PlaybackControls from '@components/audio/PlaybackControls';
import VolumeControl from '@components/audio/VolumeControl';
import ExportPanel from '@components/audio/ExportPanel';
import VideoExtractor from '@components/video/VideoExtractor';
import NoiseReductionPanel from '@components/audio/NoiseReductionPanel';
import NormalizationPanel from '@components/audio/NormalizationPanel';
import EQGraph from '@components/desktop/EQGraph';
import PreviewAB from '@components/audio/PreviewAB';
import GlobalPreviewAB from '@components/audio/GlobalPreviewAB';
import MultiTrackEditor from '@components/desktop/MultiTrackEditor';
import { useAudioStore } from '@store/audioStore';
import { useMultiTrackStore } from '@store/multiTrackStore';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { useLicenseContext } from '@context/LicenseContext';
import { useMultiTrackEditor } from '@hooks/useMultiTrackEditor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import OnboardingTour from '@components/layout/OnboardingTour';
import { cn } from '@lib/utils';
import { AudioLines } from 'lucide-react';

export default function DesktopStudio() {
  const { isPro } = useLicenseContext();
  const { syncFromAudioStore } = useMultiTrackEditor();

  const files = useAudioStore((state) => state.files);
  const activeFileId = useAudioStore((state) => state.activeFileId);
  const setActiveFile = useAudioStore((state) => state.setActiveFile);
  const addFile = useAudioStore((state) => state.addFile);
  const processedFile = useAudioStore((state) => state.processedFile);
  const normalizedFile = useAudioStore((state) => state.normalizedFile);
  const equalizedFile = useAudioStore((state) => state.equalizedFile);
  
  const multiTracksCount = useMultiTrackStore(state => state.tracks.length);
  
  const [rawFiles, setRawFiles] = useState<Map<string, File>>(new Map());
  const [showOnboarding, setShowOnboarding] = useState(false);

  // === ONBOARDING ===
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasSeenOnboarding) {
      // Pequeño delay para no abrumar en la carga inicial
      const timer = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // === SINCRONIZACIÓN AUTOMÁTICA AL DAW ===
  useEffect(() => {
    if (files.length > 0) {
      // Disparamos la sincronización pasándole los blobs binarios reales (rawFiles)
      syncFromAudioStore(rawFiles);
    }
  }, [files, rawFiles, syncFromAudioStore]);

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

  const player = useAudioPlayer({ audioFile: activeRawFile, height: 120 });

  // Modo Multipista Activo (si hay más de 1 pista, colapsa/atenúa el editor simple)
  const isMultiTrackMode = multiTracksCount > 1;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full flex flex-col p-8 pb-24 bg-background selection:bg-primary/20">
        
        <OnboardingTour isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

        <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-primary">TockAudio Studio (Desktop)</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start py-4 w-full">
        
        {/* === SECCIÓN SUPERIOR: INPUTS === */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground/80 pl-1">A. Inyectar Audios ({isPro ? 'Multi' : 'Mono'})</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full h-full cursor-pointer">
                  <DropZone onFilesSelected={handleFilesSelected} multiple={isPro} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Arrastra archivos de audio aquí. Formatos soportados: WAV, MP3, OGG, FLAC.</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground/80 pl-1">B. Extraer desde Video MP4/WebM</h2>
            <VideoExtractor onAudioExtracted={handleAudioExtracted} />
          </div>
        </div>

        {/* === SECCIÓN MEDIA: EDITOR TRADICIONAL (Simple Track) === */}
        <div className={cn(
          "w-full max-w-7xl flex flex-col gap-8 transition-all duration-500",
          isMultiTrackMode ? "opacity-40 grayscale pointer-events-none scale-[0.99] blur-[1px]" : "opacity-100"
        )}>
          {/* Reproductor Central */}
          <div className="w-full flex flex-col gap-4">
            <Waveform containerRef={player.containerRef} audioFile={activeRawFile} height={120} />
            
            <div className={cn(
              "flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border shadow-sm transition-opacity",
              !activeRawFile && "opacity-50 pointer-events-none"
            )}>
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
          </div>

          {/* FX y Exportación Simple */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground">Herramientas de Audio e IA</h3>
              
              <Tooltip><TooltipTrigger asChild><div><NormalizationPanel activeFile={activeRawFile} /></div></TooltipTrigger>
              <TooltipContent side="left">Normaliza el volumen automáticamente según estándares de streaming.</TooltipContent></Tooltip>
              {normalizedFile && <PreviewAB originalFile={activeRawFile} processedFile={normalizedFile} />}
              
              <Tooltip><TooltipTrigger asChild><div><EQGraph activeFile={activeRawFile} isProUser={isPro} /></div></TooltipTrigger>
              <TooltipContent side="left">Ecualizador paramétrico. Ajusta frecuencias específicas de tu master.</TooltipContent></Tooltip>
              {equalizedFile && <PreviewAB originalFile={activeRawFile} processedFile={equalizedFile} />}
              
              <Tooltip><TooltipTrigger asChild><div><NoiseReductionPanel activeFile={activeRawFile} /></div></TooltipTrigger>
              <TooltipContent side="left">IA local que elimina estática y ruido de fondo como magia.</TooltipContent></Tooltip>
              {processedFile && <PreviewAB originalFile={activeRawFile} processedFile={processedFile} />}
            </div>
            <div className="flex flex-col gap-4">
               <h3 className="text-lg font-bold text-foreground">Exportación Individual</h3>
               <Tooltip><TooltipTrigger asChild><div className="h-full"><ExportPanel activeFile={activeRawFile} layout="vertical" className="h-full" /></div></TooltipTrigger>
               <TooltipContent side="right">Descarga instantáneamente tu archivo procesado offline.</TooltipContent></Tooltip>
            </div>
          </div>
          
          {/* COMPARATIVA GLOBAL MASTERING */}
          <GlobalPreviewAB activeFile={activeRawFile} />
        </div>

        {/* === SECCIÓN INFERIOR: EDITOR MULTI-PISTA (DAW) === */}
        <div className="w-full max-w-7xl mt-16 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <AudioLines className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground">Estación Multi-Pista</h3>
            <span className="h-px bg-border flex-1 ml-4 opacity-50"></span>
          </div>
          
          <MultiTrackEditor isProUser={isPro} />
        </div>

      </main>
    </div>
    </TooltipProvider>
  );
}
