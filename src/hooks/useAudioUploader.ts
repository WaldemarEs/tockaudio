/**
 * Archivo: src/hooks/useAudioUploader.ts
 * Decisión técnica: Hook centralizado para validación y carga de archivos en local.
 * Contexto: Aplica dinámicamente los límites (Free vs PRO) consumiendo el estado del LicenseContext.
 * Restricciones: Almacena el uso de la cuota gratuita en localStorage.
 * Known issues: El localStorage puede ser burlado si el usuario borra la caché web, pero el tamaño máximo no se puede burlar.
 */
import { useState, useCallback } from 'react';
import { useAudioStore } from '@store/audioStore';
import { useLicenseContext } from '@context/LicenseContext';

const FREE_MAX_SIZE_MB = 50;
const PRO_MAX_SIZE_MB = 500;
const FREE_MAX_FILES_PER_DAY = 3;

const ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.ogg', '.flac', '.aac', '.m4a'];
const ALLOWED_MIME_TYPES = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/x-m4a'];

export function useAudioUploader(onFilesSelected?: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addFile = useAudioStore((state) => state.addFile);
  const { isPro } = useLicenseContext();

  const checkDailyQuota = useCallback((): boolean => {
    if (isPro) return true; // PRO = uploads ilimitados
    
    const today = new Date().toDateString();
    const quotaData = localStorage.getItem('tockaudio_quota');
    
    if (quotaData) {
      const { date, count } = JSON.parse(quotaData);
      if (date === today) {
        if (count >= FREE_MAX_FILES_PER_DAY) return false;
        localStorage.setItem('tockaudio_quota', JSON.stringify({ date: today, count: count + 1 }));
        return true;
      }
    }
    
    localStorage.setItem('tockaudio_quota', JSON.stringify({ date: today, count: 1 }));
    return true;
  }, [isPro]);

  const validateAndAddFile = useCallback((file: File) => {
    setError(null);
    
    // 1. Validar tipo
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtensionValid = ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isMimeValid && !isExtensionValid) {
      setError(`Formato no soportado: ${file.name}. Solo audio (WAV, MP3, OGG, FLAC, AAC, M4A).`);
      return false;
    }

    // 2. Validar tamaño (dinámico)
    const sizeInMB = file.size / (1024 * 1024);
    const limit = isPro ? PRO_MAX_SIZE_MB : FREE_MAX_SIZE_MB;
    
    if (sizeInMB > limit) {
      if (isPro) {
        setError(`El archivo "${file.name}" excede el límite masivo de ${PRO_MAX_SIZE_MB}MB.`);
      } else {
        setError(`Has alcanzado el límite de ${FREE_MAX_SIZE_MB} MB del plan Free. Actualiza a PRO para archivos de hasta ${PRO_MAX_SIZE_MB} MB.`);
      }
      return false;
    }

    // 3. Validar cuota diaria
    if (!checkDailyQuota()) {
      setError(`Has subido ${FREE_MAX_FILES_PER_DAY} archivos hoy (límite Free). Actualiza a PRO para cargas ilimitadas.`);
      return false;
    }

    // Agregar al store global
    addFile({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'idle'
    });

    return true;
  }, [isPro, checkDailyQuota, addFile]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      if (validateAndAddFile(file)) {
        validFiles.push(file);
      }
    });
    
    if (validFiles.length > 0 && onFilesSelected) {
      onFilesSelected(validFiles);
    }
  }, [validateAndAddFile, onFilesSelected]);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = ''; // Limpiar input para re-seleccionar
  }, [handleFiles]);

  return {
    handleFileDrop,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    isDragging,
    error,
  };
}
