/**
 * Archivo: src/components/desktop/TrackControls.tsx
 * Decisión técnica: Inspector lateral de Track. Modifica el store directamente (volume, pan, m/s).
 * Contexto: Funciona en conjunción con el Timeline, proporcionando controles precisos que serían incómodos en el canvas.
 * Restricciones: Requiere que store.selectedTrackId no sea null.
 * Known issues: N/A
 */
import { Track, useMultiTrackStore } from '@store/multiTrackStore';
import { Slider } from '@components/ui/slider';
import { Button } from '@components/ui/button';
import { Trash2, Volume2, Headphones } from 'lucide-react';
import { cn } from '@lib/utils';

export default function TrackControls({ track }: { track: Track | null }) {
  const store = useMultiTrackStore();

  if (!track) {
    return (
      <div className="w-full h-full min-h-[300px] bg-card border border-border rounded-xl flex items-center justify-center p-6 text-center shadow-inner animate-fast-fade">
        <div className="flex flex-col items-center gap-2">
          <Headphones className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm font-medium">Selecciona un bloque en el Timeline para editar su ecualización</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-xl p-5 flex flex-col gap-6 shadow-sm animate-fast-fade sticky top-20">
      
      {/* Header Inspector */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2 flex-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: track.color }} />
          <input 
            type="text"
            value={track.name}
            onChange={(e) => store.updateTrack(track.id, { name: e.target.value })}
            className="font-bold text-lg bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 -ml-1 text-foreground w-full"
            aria-label="Nombre de pista"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => store.removeTrack(track.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
          aria-label="Eliminar pista"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Mute / Solo */}
      <div className="flex gap-3">
        <Button 
          variant={track.isMuted ? "default" : "outline"}
          onClick={() => store.toggleMute(track.id)}
          className={cn(
            "flex-1 h-10 text-xs font-bold transition-all border-border", 
            track.isMuted ? "bg-red-500 hover:bg-red-600 text-white border-transparent" : "hover:bg-secondary"
          )}
          aria-pressed={track.isMuted}
        >
          MUTE
        </Button>
        <Button 
          variant={track.isSolo ? "default" : "outline"}
          onClick={() => store.toggleSolo(track.id)}
          className={cn(
            "flex-1 h-10 text-xs font-bold transition-all border-border", 
            track.isSolo ? "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent shadow-sm" : "hover:bg-secondary"
          )}
          aria-pressed={track.isSolo}
        >
          SOLO
        </Button>
      </div>

      {/* Volume Slider */}
      <div className="space-y-4 bg-secondary/30 p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-foreground/80" /> Ganancia</div>
          <span className="text-foreground">{track.volume}%</span>
        </div>
        <Slider 
          value={[track.volume]} 
          onValueChange={(val) => store.setVolume(track.id, val[0])} 
          max={100} 
          step={1}
          aria-label="Ganancia de volumen"
        />
      </div>

      {/* Pan Slider */}
      <div className="space-y-4 bg-secondary/30 p-4 rounded-lg border border-border/50">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-2"><Headphones className="w-4 h-4 text-foreground/80" /> Paneo Estéreo</div>
          <span className="text-foreground">{track.pan === 0 ? 'Centro' : track.pan < 0 ? `L ${Math.abs(track.pan)}` : `R ${track.pan}`}</span>
        </div>
        <Slider 
          value={[track.pan]} 
          onValueChange={(val) => store.setPan(track.id, val[0])} 
          min={-100}
          max={100} 
          step={1}
          aria-label="Paneo estéreo"
        />
        <div className="flex justify-between text-[10px] font-black text-muted-foreground/60 px-1 mt-1">
          <span>L</span><span>C</span><span>R</span>
        </div>
      </div>

      {/* Data Context */}
      <div className="mt-auto pt-4 flex flex-col gap-2 text-xs text-muted-foreground font-mono bg-secondary/10 p-3 rounded-lg border border-border/20">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Inicio Absoluto:</span>
          <span className="bg-background px-2 py-0.5 rounded border border-border">{track.startTime.toFixed(2)}s</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Longitud PCM:</span>
          <span className="bg-background px-2 py-0.5 rounded border border-border">{track.audioBuffer ? track.audioBuffer.duration.toFixed(2) : '0.00'}s</span>
        </div>
      </div>

    </div>
  );
}
