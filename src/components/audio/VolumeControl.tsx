/**
 * Archivo: src/components/audio/VolumeControl.tsx
 * Decisión técnica: Componente unificado de control de volumen con Mute toggle.
 * Contexto: Accesorio esencial para el editor de audio en el Studio.
 * Restricciones: El volumen real (0 a 100) debe manejarse y sincronizarse externamente en el store o en el motor de audio.
 * Known issues: N/A
 */
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Slider } from '@components/ui/slider';
import { cn } from '@lib/utils';

interface VolumeControlProps {
  volume: number; // 0 a 100
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

export default function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  className
}: VolumeControlProps) {
  
  // Determinamos el icono de volumen adecuado
  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 50 
      ? Volume1 
      : Volume2;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        aria-label={isMuted ? "Desilenciar" : "Silenciar"}
        className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
      >
        <VolumeIcon className="w-4 h-4" />
      </Button>
      
      <div className="w-24 flex items-center">
        <Slider
          min={0}
          max={100}
          step={1}
          value={[isMuted ? 0 : volume]}
          onValueChange={(val) => onVolumeChange(val[0])}
          aria-label="Ajustar volumen"
        />
      </div>
    </div>
  );
}
