/**
 * Archivo: src/components/audio/DropZone.tsx
 * Decisión técnica: Componente reutilizable para carga de archivos con soporte Drag & Drop.
 * Contexto: UI central para añadir archivos. Usa estilos condicionales basados en isDragging.
 * Restricciones: La lógica de validación se delega a useAudioUploader.
 * Known issues: N/A
 */
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useAudioUploader } from '@hooks/useAudioUploader';
import { cn } from '@lib/utils';

interface DropZoneProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export default function DropZone({ 
  onFilesSelected,
  accept = ".wav,.mp3,.ogg,.flac,.aac,.m4a,audio/*", 
  multiple = false,
  className
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    handleFileDrop, 
    handleFileSelect, 
    handleDragOver, 
    handleDragLeave, 
    isDragging, 
    error 
  } = useAudioUploader(onFilesSelected);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className={cn("w-full flex flex-col items-center", className)}>
      <div
        className={cn(
          "w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-150 ease-out cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-border bg-secondary/30 hover:bg-secondary/50",
          error && "border-destructive bg-destructive/10"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Subir archivo de audio"
      >
        <Upload className={cn("w-10 h-10 mb-4 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
        <p className="text-lg font-medium text-foreground mb-1 text-center">
          Arrastra archivos de audio aquí o haz clic para seleccionar
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Formatos: WAV, MP3, OGG, FLAC, AAC, M4A (máx 50 MB Free)
        </p>
        
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />
      </div>
      
      {error && (
        <p className="mt-4 text-sm text-destructive font-medium text-center animate-fast-fade">
          {error}
        </p>
      )}
    </div>
  );
}
