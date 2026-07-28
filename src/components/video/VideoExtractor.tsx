/**
 * Archivo: src/components/video/VideoExtractor.tsx
 * Decisión técnica: Interfaz unificada que encapsula la selección de video y orquesta la extracción.
 * Contexto: Flujo visual completo: Selección -> Ajuste -> Extracción -> Entrega de Blob a 'onAudioExtracted'.
 * Restricciones: Bloquea interacciones durante la extracción pesada para evitar OOM (Out of Memory).
 * Known issues: Omitimos renderizar un <video> preview completo para no duplicar uso de RAM.
 */
import { useState } from 'react';
import { Loader2, AudioLines, RefreshCcw, Film } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useVideoExtractor } from '@hooks/useVideoExtractor';
import VideoDropZone from './VideoDropZone';
import { cn } from '@lib/utils';

interface VideoExtractorProps {
  onAudioExtracted: (audioFile: File) => void;
  className?: string;
}

export default function VideoExtractor({ onAudioExtracted, className }: VideoExtractorProps) {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('wav');
  
  const { extractAudio, isExtracting, progress, error } = useVideoExtractor();

  const FORMATS = ['wav', 'mp3', 'ogg', 'flac', 'aac'];

  const handleExtract = async () => {
    if (!selectedVideo) return;
    
    const audioFile = await extractAudio(selectedVideo, targetFormat);
    if (audioFile) {
      onAudioExtracted(audioFile);
      // Reiniciamos estado tras el éxito para quedar limpios
      setSelectedVideo(null);
    }
  };

  const handleReset = () => {
    if (isExtracting) return;
    setSelectedVideo(null);
  };

  // 1. Estado inicial: Esperando selección de video
  if (!selectedVideo) {
    return (
      <div className={cn("w-full", className)}>
        <VideoDropZone onVideoSelected={setSelectedVideo} />
      </div>
    );
  }

  // 2. Estado de pre-extracción o extracción en curso
  return (
    <div className={cn("w-full bg-card border border-border rounded-xl p-5 shadow-sm animate-fast-fade", className)}>
      <div className="flex flex-col gap-5">
        
        {/* Info compacta del Video */}
        <div className="flex items-center justify-between p-4 bg-secondary/30 border border-border rounded-lg">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="p-3 bg-secondary rounded-full">
              <Film className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-foreground truncate" title={selectedVideo.name}>
                {selectedVideo.name}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB • {selectedVideo.type || 'video'}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleReset}
            disabled={isExtracting}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Seleccionar otro video"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Controles de Extracción */}
        <div className={cn("flex flex-col sm:flex-row gap-4 sm:items-end", isExtracting && "opacity-90")}>
          
          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="extract-format" className="text-sm font-medium text-muted-foreground">
              Formato de audio resultante
            </label>
            <select 
              id="extract-format"
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              disabled={isExtracting}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              aria-label="Seleccionar formato de extracción"
            >
              {FORMATS.map(fmt => (
                <option key={fmt} value={fmt}>
                  {fmt.toUpperCase()} {fmt === 'wav' ? '(Máxima Calidad sin pérdida)' : ''}
                </option>
              ))}
            </select>
          </div>

          <Button 
            size="lg" 
            onClick={handleExtract}
            disabled={isExtracting}
            className="w-full sm:w-56 font-semibold shadow-sm h-10 transition-all"
            aria-label="Extraer Audio"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Extrayendo...
              </>
            ) : (
              <>
                <AudioLines className="w-5 h-5 mr-2" />
                Extraer Audio
              </>
            )}
          </Button>
        </div>

        {/* Barra de Progreso Dinámica */}
        {isExtracting && (
          <div className="w-full animate-fast-fade flex flex-col gap-2 mt-2">
            <div className="flex justify-between text-xs font-bold text-primary">
              <span>Procesando frame a frame...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out rounded-full" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center font-medium mt-1">
              La extracción usa intensivamente tu dispositivo. Mantén esta pestaña abierta.
            </p>
          </div>
        )}

        {/* Error de extracción */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive font-medium text-center animate-fast-fade mt-1">
            {error}
          </div>
        )}

      </div>
    </div>
  );
}
