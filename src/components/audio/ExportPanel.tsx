/**
 * Archivo: src/components/audio/ExportPanel.tsx
 * Decisión técnica: Panel unificado para opciones de exportación y conversión.
 * Contexto: Permite elegir formato y muestra el progreso del motor de conversión en tiempo real.
 * Restricciones: Todos los formatos (WAV, MP3, OGG, FLAC, AAC) están habilitados.
 * Known issues: N/A
 */
import { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useExport } from '@hooks/useExport';
import { cn } from '@lib/utils';

interface ExportPanelProps {
  activeFile: File | null;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export default function ExportPanel({ activeFile, layout = 'horizontal', className }: ExportPanelProps) {
  const { exportFile, isExporting, isConverting, progress, exportError } = useExport();
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  useEffect(() => {
    if (activeFile) {
      const ext = activeFile.name.split('.').pop()?.toLowerCase() || '';
      setSelectedFormat(ext);
    }
  }, [activeFile]);

  const handleExport = () => {
    if (activeFile) {
      exportFile(activeFile, selectedFormat);
    }
  };

  const FORMATS = ['wav', 'mp3', 'ogg', 'flac', 'aac'];
  const originalExt = activeFile?.name.split('.').pop()?.toLowerCase() || '';
  
  const isBusy = isExporting || isConverting;

  return (
    <div className={cn(
      "w-full bg-card border border-border rounded-xl p-5 shadow-sm transition-opacity",
      !activeFile && "opacity-50 pointer-events-none",
      className
    )}>
      <div className={cn(
        "flex gap-4", 
        layout === 'vertical' ? "flex-col" : "flex-row items-end justify-between"
      )}>
        
        {/* Lado izquierdo: Selector y Progreso */}
        <div className={cn(
          "flex flex-1", 
          layout === 'horizontal' ? "flex-row items-end gap-6" : "flex-col gap-4"
        )}>
          
          <div className={cn("flex flex-col gap-1.5", layout === 'horizontal' && "w-48")}>
            <label htmlFor="format-select" className="text-sm font-medium text-muted-foreground">
              Formato de exportación
            </label>
            <select 
              id="format-select"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              disabled={!activeFile || isBusy}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              aria-label="Seleccionar formato de exportación"
            >
              {FORMATS.map(fmt => {
                const isOriginal = fmt === originalExt;
                return (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()} {isOriginal ? '(Original)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Barra de progreso visual */}
          {isConverting && (
            <div className={cn("animate-fast-fade flex flex-col gap-1.5 justify-center", layout === 'horizontal' ? "flex-1 pb-1" : "w-full")}>
              <div className="flex justify-between text-xs font-medium text-primary">
                <span>Convirtiendo archivo...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out rounded-full" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Lado derecho: Botón de exportar */}
        <div className={cn("flex", layout === 'horizontal' && "mb-0")}>
          <Button 
            size="lg" 
            className={cn("font-semibold shadow-sm h-10", layout === 'vertical' ? "w-full" : "w-auto")}
            onClick={handleExport}
            disabled={!activeFile || isBusy}
            aria-label="Descargar archivo"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isConverting ? "Convirtiendo..." : "Descargando..."}
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Descargar
              </>
            )}
          </Button>
        </div>
      </div>

      {exportError && (
        <p className={cn("mt-4 text-sm text-destructive font-medium animate-fast-fade", layout === 'horizontal' && "text-right")}>
          {exportError}
        </p>
      )}
    </div>
  );
}
