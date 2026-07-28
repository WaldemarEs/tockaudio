/**
 * Archivo: src/components/audio/Waveform.tsx
 * Decisión técnica: Componente visual para renderizar la onda de audio (simplificado).
 * Contexto: Ahora solo pinta la onda. Los controles se manejan por separado para mayor flexibilidad.
 * Restricciones: Requiere recibir containerRef desde un componente padre que ejecute useAudioPlayer.
 * Known issues: N/A
 */
import React from 'react';
import { cn } from '@lib/utils';

interface WaveformProps {
  containerRef: React.RefObject<HTMLDivElement>;
  audioFile: File | null;
  height?: number;
  className?: string;
}

export default function Waveform({ containerRef, audioFile, height = 80, className }: WaveformProps) {
  if (!audioFile) {
    return (
      <div 
        className={cn("w-full flex items-center justify-center bg-secondary/30 rounded-xl border-2 border-dashed border-border p-6", className)} 
        style={{ height }}
      >
        <p className="text-muted-foreground font-medium text-center">Carga un archivo para ver el waveform</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full p-5 bg-card rounded-xl border border-border shadow-sm", className)}>
      <div ref={containerRef} className="w-full cursor-pointer" style={{ height }} />
    </div>
  );
}
