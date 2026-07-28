/**
 * Archivo: src/components/desktop/MultiTrackTimeline.tsx
 * Decisión técnica: Renderizador avanzado del Timeline Multi-pista con arrastre temporal (Drag & Drop nativo simplificado).
 * Contexto: Core visual del editor PRO. Dibuja pistas, cursor de reproducción, regla temporal (ruler) y gestiona el zoom.
 * Restricciones: El Playhead se reposiciona vía transform: translateX() para no causar reflows excesivos en la vista.
 * Known issues: Drag & Drop sin bibliotecas de arrastre fluidas (dnd-kit/react-beautiful-dnd) carece de animaciones intercaladas.
 */
import { useEffect, useState } from 'react';
import { useMultiTrackEditor } from '@hooks/useMultiTrackEditor';
import { useMultiTrackStore, Track } from '@store/multiTrackStore';
import { Button } from '@components/ui/button';
import { ZoomIn, ZoomOut, Play, Pause, Download } from 'lucide-react';
import { cn } from '@lib/utils';

export default function MultiTrackTimeline({ isProUser }: { isProUser: boolean }) {
  const store = useMultiTrackStore();
  const { timelineRef, handleTimelineClick, handleZoom, exportMixdown } = useMultiTrackEditor();
  const [isExporting, setIsExporting] = useState(false);

  const pixelsPerSecond = 100 * store.zoom;

  // Placeholder para un Waveform Canvas. Se optimiza usando CSS gradient filters por velocidad.
  const renderWaveform = (track: Track) => {
    return (
      <div className="absolute inset-0 opacity-50 pointer-events-none flex items-center px-1 overflow-hidden">
        <div className="w-full h-8 bg-gradient-to-r from-transparent via-foreground to-transparent rounded-full filter blur-[1px]"></div>
      </div>
    );
  };

  const handleDragStart = (e: React.DragEvent, trackId: string) => {
    e.dataTransfer.setData('text/plain', trackId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!timelineRef.current) return;
    
    const trackId = e.dataTransfer.getData('text/plain');
    if (!trackId) return;

    const rect = timelineRef.current.getBoundingClientRect();
    // Offset local del contenedor menos el scroll
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const newStartTime = Math.max(0, x / pixelsPerSecond);
    
    store.moveTrack(trackId, newStartTime);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necesario para permitir Drop
    e.dataTransfer.dropEffect = 'move';
  };

  const onExport = async () => {
    setIsExporting(true);
    const mixdownFile = await exportMixdown();
    if (mixdownFile) {
      const url = URL.createObjectURL(mixdownFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = mixdownFile.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    }
    setIsExporting(false);
  };

  return (
    <div className="w-full flex flex-col bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fast-fade">
      
      {/* Controles Globales Timeline */}
      <div className="h-14 bg-secondary/50 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="icon" 
            className="w-8 h-8 shadow-sm"
            onClick={() => store.setIsPlaying(!store.isPlaying)}
            aria-label={store.isPlaying ? 'Pausar Master' : 'Reproducir Master'}
          >
            {store.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          <span className="font-mono text-sm font-semibold ml-2 w-16 text-foreground">
            {store.currentTime.toFixed(2)}s
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-background rounded-md border border-border p-1">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleZoom(-0.2)} aria-label="Zoom Out">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </Button>
            <span className="text-xs font-bold text-muted-foreground w-8 text-center">{store.zoom.toFixed(1)}x</span>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleZoom(0.2)} aria-label="Zoom In">
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          
          {/* Mixdown */}
          <Button 
            size="sm" 
            variant="default" 
            className="h-9 px-4 font-bold shadow-sm"
            onClick={onExport}
            disabled={isExporting || store.tracks.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Renderizando...' : 'Exportar Mixdown'}
          </Button>
        </div>
      </div>

      {/* Grid del Timeline (con scroll) */}
      <div 
        ref={timelineRef}
        className="relative w-full h-[400px] overflow-auto bg-background/50 custom-scrollbar select-none"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        
        {/* Playhead (Cursor rojo posicionado con GPU acceleration) */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-30 pointer-events-none transition-transform duration-75 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          style={{ transform: `translateX(${store.currentTime * pixelsPerSecond}px)` }}
        >
          <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-red-500 rounded-full cursor-pointer pointer-events-auto hover:scale-125 transition-transform" />
        </div>

        {/* Ruler Superior (Regla de tiempo) */}
        <div 
          className="sticky top-0 h-8 border-b border-border bg-secondary/90 backdrop-blur z-20 cursor-pointer overflow-hidden transition-colors hover:bg-secondary"
          onClick={handleTimelineClick}
          style={{ minWidth: `${store.duration * pixelsPerSecond}px` }}
          aria-label="Regla de tiempo, clic para posicionar"
        >
          {Array.from({ length: Math.ceil(store.duration) }).map((_, i) => (
            // Dibuja un marcador visible solo dependiendo del nivel de zoom para no saturar
            i % (store.zoom < 1 ? 10 : store.zoom < 3 ? 5 : 1) === 0 ? (
              <div 
                key={i} 
                className="absolute h-full border-l border-border/60 text-[10px] text-muted-foreground px-1 pt-1 font-mono pointer-events-none"
                style={{ left: `${i * pixelsPerSecond}px` }}
              >
                {i}s
              </div>
            ) : null
          ))}
        </div>

        {/* Zona de Pistas */}
        <div 
          className="relative pt-2 pb-8 flex flex-col min-h-[360px]" 
          style={{ minWidth: `${store.duration * pixelsPerSecond}px` }}
        >
          {store.tracks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium pointer-events-none">
              Inyecta un clip de audio para comenzar la composición...
            </div>
          )}

          {store.tracks.map(track => {
            const trackWidth = (track.audioBuffer ? track.audioBuffer.duration : 10) * pixelsPerSecond;
            const isSelected = track.id === store.selectedTrackId;

            return (
              <div 
                key={track.id}
                className={cn(
                  "relative h-28 border-b border-border/30 transition-colors",
                  isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-secondary/20"
                )}
                onClick={() => store.selectTrack(track.id)}
              >
                {/* Header de Pista (Flotante) */}
                <div className="sticky left-2 top-2 z-10 inline-block px-3 py-1 bg-background/95 backdrop-blur rounded-md border border-border shadow-sm text-xs font-bold text-foreground">
                  <span className="w-2 h-2 rounded-full inline-block mr-2" style={{ backgroundColor: track.color }} />
                  {track.name} 
                  {track.isMuted && <span className="text-red-500 ml-2 font-black">M</span>} 
                  {track.isSolo && <span className="text-yellow-500 ml-2 font-black">S</span>}
                </div>

                {/* Bloque Draggable de Audio */}
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, track.id)}
                  className={cn(
                    "absolute top-2 bottom-2 rounded-lg shadow-sm border overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:brightness-110",
                    track.isMuted ? "opacity-30 grayscale border-border/50" : "opacity-90 border-black/10 dark:border-white/10",
                    isSelected && "ring-2 ring-primary border-transparent z-10"
                  )}
                  style={{
                    left: `${track.startTime * pixelsPerSecond}px`,
                    width: `${trackWidth}px`,
                    backgroundColor: `${track.color}25` // Color distintivo tintado
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: track.color }} />
                  {renderWaveform(track)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
