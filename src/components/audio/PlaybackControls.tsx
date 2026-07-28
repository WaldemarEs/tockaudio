/**
 * Archivo: src/components/audio/PlaybackControls.tsx
 * Decisión técnica: Componente dedicado para los controles de reproducción.
 * Contexto: Aísla la lógica visual de play/pause/stop para reusabilidad y limpieza.
 * Restricciones: N/A
 * Known issues: N/A
 */
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onStop?: () => void;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onStop,
  className
}: PlaybackControlsProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          className="w-10 h-10 rounded-full"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </Button>

        {onStop && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            aria-label="Detener"
            className="w-10 h-10 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        )}
      </div>

      <div className="text-sm font-medium text-muted-foreground font-mono bg-secondary/50 px-3 py-1 rounded-md border border-border/50">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}
