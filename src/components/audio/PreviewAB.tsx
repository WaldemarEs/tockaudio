/**
 * Archivo: src/components/audio/PreviewAB.tsx
 * Decisión técnica: Interfaz de comparación directa (A/B testing) de dos archivos de audio.
 * Contexto: Permite al usuario conmutar entre el Original y el Procesado con IA en tiempo real.
 * Restricciones: Depende de un hook useAudioPlayer efímero embebido, ajeno al editor principal para no causar colisiones.
 * Known issues: Si el usuario alterna muy rápido puede haber clics de audio, dependemos de WaveSurfer para el smooth fade.
 */
import { useEffect } from 'react';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { Button } from '@components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@lib/utils';
import { useAudioStore } from '@store/audioStore';
import Waveform from './Waveform';

interface PreviewABProps {
  originalFile: File | null;
  processedFile: File | null;
}

export default function PreviewAB({ originalFile, processedFile }: PreviewABProps) {
  const isShowingProcessed = useAudioStore(state => state.isShowingProcessed);
  const toggleProcessedView = useAudioStore(state => state.toggleProcessedView);
  const setProcessedFile = useAudioStore(state => state.setProcessedFile);

  // Instancia de reproductor local y exclusivo para la comparativa
  const activeComparisonFile = isShowingProcessed ? processedFile : originalFile;
  const player = useAudioPlayer({ audioFile: activeComparisonFile, height: 60 });

  // Sincronizar el toggle visual con la UI si alguien más lo cambia (raro pero posible)
  useEffect(() => {
    // Si se activa el procesado desde fuera, y no lo estábamos tocando, el player se auto-reinicia.
  }, [isShowingProcessed]);

  if (!originalFile || !processedFile) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-card border-2 border-primary/20 rounded-xl p-4 shadow-lg animate-fast-fade flex flex-col gap-4">
      
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
          Comparativa A/B (IA)
        </h4>
        <div className="text-xs font-mono font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">
          {formatTime(player.currentTime)} / {formatTime(player.duration)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Toggle A/B */}
        <div className="flex bg-secondary p-1 rounded-lg border border-border">
          <button
            onClick={() => {
              if (isShowingProcessed) toggleProcessedView();
            }}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
              !isShowingProcessed 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={!isShowingProcessed}
          >
            A. Original
          </button>
          <button
            onClick={() => {
              if (!isShowingProcessed) toggleProcessedView();
            }}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5",
              isShowingProcessed 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={isShowingProcessed}
          >
            B. Procesado
          </button>
        </div>

        {/* Controles Playback Independientes */}
        <Button 
          variant="default"
          size="icon"
          onClick={player.isPlaying ? player.pause : player.play}
          className="ml-auto h-9 w-9 rounded-full shadow-md"
          aria-label={player.isPlaying ? 'Pausar comparativa' : 'Reproducir comparativa'}
        >
          {player.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </Button>
      </div>

      {/* Visor Miniatura */}
      <div className="rounded-lg overflow-hidden border border-border bg-background">
        <Waveform 
          containerRef={player.containerRef} 
          audioFile={activeComparisonFile} 
          height={60} 
        />
      </div>

    </div>
  );
}
