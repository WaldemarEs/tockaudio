/**
 * Archivo: src/components/video/VideoDropZone.tsx
 * Decisión técnica: Variante del DropZone optimizada visual y semánticamente para archivos de video.
 * Contexto: Comparte UX "Minimalismo Veloz" con DropZone, pero focalizado en video (iconos, mensajes, limits).
 * Restricciones: Valida preventivamente el tipo MIME y el tamaño en el front-end.
 * Known issues: N/A
 */
import { useCallback, useState } from 'react';
import { Film, UploadCloud, FileWarning } from 'lucide-react';
import { cn } from '@lib/utils';
import { useDeviceType } from '@hooks/useDeviceType';

interface VideoDropZoneProps {
  onVideoSelected: (file: File) => void;
  accept?: string;
  className?: string;
}

const IS_PRO = false;
const DESKTOP_FREE_LIMIT_MB = 50;
const DESKTOP_PRO_LIMIT_MB = 2048;
const MOBILE_LIMIT_MB = 100;

export default function VideoDropZone({ 
  onVideoSelected, 
  accept = "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm",
  className 
}: VideoDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { isMobile } = useDeviceType();
  const currentLimitMB = isMobile ? MOBILE_LIMIT_MB : (IS_PRO ? DESKTOP_PRO_LIMIT_MB : DESKTOP_FREE_LIMIT_MB);

  const validateAndSelect = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('video/')) {
      setErrorMsg("El archivo debe ser un formato de video válido (MP4, MOV, AVI, MKV, WEBM).");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > currentLimitMB) {
      setErrorMsg(`Video demasiado grande (${sizeMB.toFixed(1)}MB). Límite actual: ${currentLimitMB}MB.`);
      return;
    }

    onVideoSelected(file);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  }, [currentLimitMB]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  }, [currentLimitMB]);

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <div 
        className={cn(
          "relative w-full h-48 sm:h-56 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 ease-out",
          isDragActive 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-border bg-card hover:bg-secondary/20 hover:border-primary/50 shadow-sm"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('video-upload-input')?.click()}
        role="button"
        tabIndex={0}
        aria-label="Arrastra un video aquí o haz clic para subir"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('video-upload-input')?.click();
          }
        }}
      >
        <input 
          id="video-upload-input"
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden" 
          aria-hidden="true"
        />
        
        <div className="p-4 rounded-full bg-secondary/50 mb-4 pointer-events-none transition-colors duration-200">
          {isDragActive ? (
            <UploadCloud className="w-8 h-8 text-primary animate-pulse" />
          ) : (
            <Film className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        <p className="font-semibold text-foreground mb-1 pointer-events-none">
          {isDragActive ? "Suelta el video para extraer el audio" : "Arrastra un archivo de video aquí o haz clic para seleccionar"}
        </p>
        
        <p className="text-sm text-muted-foreground pointer-events-none">
          Formatos: MP4, MOV, AVI, MKV, WEBM (máx {currentLimitMB} MB)
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-destructive text-sm font-medium animate-fast-fade justify-center mt-2 p-2 bg-destructive/10 rounded-md border border-destructive/20">
          <FileWarning className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
