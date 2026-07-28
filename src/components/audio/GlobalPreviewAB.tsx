/**
 * Archivo: src/components/audio/GlobalPreviewAB.tsx
 * Decisión técnica: Interfaz de comparación de Mastering Global (A/B).
 * Contexto: Permite al usuario escuchar la diferencia entre el track crudo original y el track resultante después de atravesar todos los racks de efectos.
 * Restricciones: Depende del componente de reproducción nativo (HTMLAudioElement para ligereza en memoria).
 * Known issues: N/A
 */
import { useState, useRef, useEffect } from 'react';
import { GitCompare, Play, Square, Download, Trash2, CheckCircle2, Loader2, FileAudio, Sparkles } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useGlobalPreview } from '@hooks/useGlobalPreview';
import { cn } from '@lib/utils';

export default function GlobalPreviewAB({ activeFile }: { activeFile: File | null }) {
  const { 
    originalFile, 
    finalProcessedFile, 
    hasModifications, 
    appliedEffects, 
    discardAll, 
    isProcessing, 
    progress 
  } = useGlobalPreview(activeFile);

  const [mode, setMode] = useState<'A' | 'B'>('B');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Limpieza de URLs
  useEffect(() => {
    return () => {
      if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.src = "";
      }
    };
  }, []);

  // Sincronizar reproductor con el modo actual (A/B switching instantáneo)
  useEffect(() => {
    if (!audioRef.current || !originalFile || !finalProcessedFile) return;
    
    const wasPlaying = !audioRef.current.paused;
    const currentTime = audioRef.current.currentTime;
    
    const targetFile = mode === 'A' ? originalFile : finalProcessedFile;
    const url = URL.createObjectURL(targetFile);
    
    audioRef.current.src = url;
    audioRef.current.currentTime = currentTime; // Intentar mantener sincronía de tiempo
    
    if (wasPlaying) {
      audioRef.current.play().catch(console.error);
    }
    
    return () => URL.revokeObjectURL(url);
  }, [mode, originalFile, finalProcessedFile]);

  if (!hasModifications || !originalFile || !finalProcessedFile) {
    return null; // Oculto si no hay cadena de efectos aplicados
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(finalProcessedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Master_${finalProcessedFile.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + ' MB';

  return (
    <div className="w-full max-w-7xl mx-auto bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col gap-6 animate-fast-fade mt-16">
      
      {/* Audio Element Oculto */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)} 
        onPlay={() => setIsPlaying(true)} 
      />

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl"><GitCompare className="w-6 h-6 text-primary" /></div>
          <div>
            <h3 className="text-2xl font-black text-foreground">Vista Previa Global A/B</h3>
            <p className="text-sm text-muted-foreground font-medium">Audita el resultado final del Mastering</p>
          </div>
        </div>
      </div>

      {isProcessing ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <div className="w-full max-w-md h-2 bg-secondary rounded-full overflow-hidden">
             <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm font-bold animate-pulse text-muted-foreground">Aplicando rack de efectos... {progress}%</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* COMPARADOR A/B UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LADO A: ORIGINAL */}
            <div 
              onClick={() => setMode('A')}
              className={cn(
                "p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-4 group",
                mode === 'A' ? "border-amber-500 bg-amber-500/5 shadow-md" : "border-border bg-background hover:border-amber-500/30"
              )}
            >
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                   <div className={cn("p-3 rounded-lg transition-colors", mode === 'A' ? "bg-amber-500 text-white" : "bg-secondary text-muted-foreground")}>
                     <FileAudio className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-black text-lg">A. Crudo (Original)</h4>
                     <p className="text-xs font-mono text-muted-foreground">{originalFile.name}</p>
                   </div>
                 </div>
                 {mode === 'A' && <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded"><Play className="w-3 h-3"/> Escuchando</span>}
              </div>
              <div className="text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50 flex justify-between">
                 <span>{formatSize(originalFile.size)}</span>
                 <span>Pista sin procesar</span>
              </div>
            </div>

            {/* LADO B: PROCESADO */}
            <div 
              onClick={() => setMode('B')}
              className={cn(
                "p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-4 group",
                mode === 'B' ? "border-primary bg-primary/5 shadow-md" : "border-border bg-background hover:border-primary/30"
              )}
            >
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                   <div className={cn("p-3 rounded-lg transition-colors", mode === 'B' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                     <Sparkles className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-black text-lg">B. Masterizado (Final)</h4>
                     <p className="text-xs font-mono text-muted-foreground">master_{originalFile.name}</p>
                   </div>
                 </div>
                 {mode === 'B' && <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded"><Play className="w-3 h-3"/> Escuchando</span>}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {appliedEffects.map(fx => (
                  <span key={fx} className="flex items-center text-[10px] uppercase tracking-wider font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {fx}
                  </span>
                ))}
              </div>

              <div className="text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50 flex justify-between">
                 <span>{formatSize(finalProcessedFile.size)}</span>
                 <span>Cadena completa aplicada</span>
              </div>
            </div>
            
          </div>

          {/* CONTROLES MAESTROS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-secondary/30 rounded-xl border border-border">
            
            <Button 
              size="lg" 
              variant={isPlaying ? "destructive" : "default"} 
              onClick={togglePlay}
              className={cn("w-full sm:w-auto font-black shadow-lg", !isPlaying && "bg-foreground text-background hover:bg-foreground/90")}
            >
              {isPlaying ? <Square className="w-5 h-5 mr-2 fill-current" /> : <Play className="w-5 h-5 mr-2 fill-current" />}
              {isPlaying ? `Pausar (Lado ${mode})` : `Reproducir (Lado ${mode})`}
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="ghost" className="font-bold text-muted-foreground hover:text-red-500 w-full sm:w-auto" onClick={discardAll}>
                <Trash2 className="w-4 h-4 mr-2" /> Descartar FX
              </Button>
              <Button size="lg" className="w-full sm:w-auto font-black bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform" onClick={handleDownload}>
                <Download className="w-5 h-5 mr-2" /> Exportar Master
              </Button>
            </div>
            
          </div>

        </div>
      )}
    </div>
  );
}
