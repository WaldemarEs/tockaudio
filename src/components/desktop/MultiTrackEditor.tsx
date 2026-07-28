/**
 * Archivo: src/components/desktop/MultiTrackEditor.tsx
 * Decisión técnica: Wrapper general del modo Multipista que divide el Canvas del Inspector.
 * Contexto: Coordina visualmente el lienzo multipista y expone controles top-level (Añadir Pista, Limpiar).
 * Restricciones: Depende de un grid horizontal (70/30) para escritorio y se bloquea en < 1024px.
 * Known issues: Si el usuario Free intenta añadir pistas desde el OS dialog, se bloquea por la UI, pero el store lo permitiría programáticamente.
 */
import { useMultiTrackStore } from '@store/multiTrackStore';
import { useMultiTrackEditor } from '@hooks/useMultiTrackEditor';
import MultiTrackTimeline from './MultiTrackTimeline';
import TrackControls from './TrackControls';
import { Button } from '@components/ui/button';
import { Plus, Download, Trash2, ZoomIn, ZoomOut, AudioLines } from 'lucide-react';
import { cn } from '@lib/utils';

export default function MultiTrackEditor({ isProUser }: { isProUser: boolean }) {
  const store = useMultiTrackStore();
  const { handleZoom, exportMixdown } = useMultiTrackEditor();

  const selectedTrack = store.tracks.find(t => t.id === store.selectedTrackId) || null;
  
  // Free = Max 1 track, Pro = Max 10 tracks
  const maxTracks = isProUser ? 10 : 1;
  const canAddTrack = store.tracks.length < maxTracks;

  const onAddTrack = () => {
    // Fallback nativo: si se usa este botón, pedimos el archivo al SO para inyectarlo directo.
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        const color = colors[store.tracks.length % colors.length];

        store.addTrack({
          id: crypto.randomUUID(),
          name: file.name,
          file,
          audioBuffer,
          color
        });
      } catch (err) {
        console.error("No se pudo decodificar el archivo:", err);
      }
    };
    input.click();
  };

  const onExport = async () => {
    const mixdown = await exportMixdown();
    if (mixdown) {
      const url = URL.createObjectURL(mixdown);
      const a = document.createElement('a');
      a.href = url;
      a.download = mixdown.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    }
  };

  const onClearAll = () => {
    if (window.confirm("¿Seguro que deseas limpiar todas las pistas y el mixdown actual?")) {
      store.clearAllTracks();
    }
  };

  return (
    <div className="w-full bg-background rounded-2xl border-2 border-border overflow-hidden shadow-2xl flex flex-col animate-fast-fade ring-1 ring-black/5">
      
      {/* Header del DAW */}
      <div className="p-4 bg-card border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <AudioLines className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Editor Multi-Pista</h2>
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-black shadow-sm",
            isProUser ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
          )}>
            {isProUser ? "PRO" : "Free (1 pista)"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Button 
              onClick={onAddTrack} 
              disabled={!canAddTrack}
              variant="outline" 
              size="sm"
              className="font-bold border-primary/30 text-primary hover:bg-primary/10 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Añadir Pista
            </Button>
            {!canAddTrack && !isProUser && (
              <div className="absolute top-full right-0 mt-2 w-56 p-2 bg-foreground text-background text-xs font-medium rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Actualiza a PRO para componer con hasta 10 pistas simultáneas.
              </div>
            )}
          </div>
          <Button 
            onClick={onExport}
            disabled={store.tracks.length === 0}
            size="sm"
            className="font-bold shadow-md hover:scale-105 transition-transform"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Exportar Mezcla Master
          </Button>
        </div>
      </div>

      {/* Main Canvas + Inspector */}
      <div className="flex flex-col lg:flex-row w-full bg-secondary/5 min-h-[450px]">
        {/* Columna Izquierda: Canvas (70%) */}
        <div className="w-full lg:w-[70%] border-b lg:border-b-0 lg:border-r border-border p-5">
          <MultiTrackTimeline isProUser={isProUser} />
        </div>
        
        {/* Columna Derecha: Inspector (30%) */}
        <div className="w-full lg:w-[30%] p-5 bg-card/40">
          <TrackControls track={selectedTrack} />
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className="bg-card border-t border-border px-5 py-2.5 flex items-center justify-between text-xs text-muted-foreground font-semibold">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Pistas: <strong className="text-foreground">{store.tracks.length}</strong> / {isProUser ? '10' : '1'}
          </span>
          <span className="border-l border-border/50 pl-4">
            Duración Master: <strong className="text-foreground">{store.duration.toFixed(1)}s</strong>
          </span>
        </div>
        
        <div className="flex items-center gap-5">
          {/* Zoom en Footer para fácil acceso */}
          <div className="flex items-center gap-0.5 bg-secondary/50 rounded p-0.5 border border-border/30">
            <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-background" onClick={() => handleZoom(-0.2)}><ZoomOut className="w-3 h-3" /></Button>
            <span className="text-[10px] w-8 text-center tabular-nums">{store.zoom.toFixed(1)}x</span>
            <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-background" onClick={() => handleZoom(0.2)}><ZoomIn className="w-3 h-3" /></Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            disabled={store.tracks.length === 0}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-6 px-3 text-[10px] font-bold rounded-full transition-colors border border-destructive/20"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Limpiar Memoria
          </Button>
        </div>
      </div>
    </div>
  );
}
