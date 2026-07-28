/**
 * Archivo: src/hooks/useExport.ts
 * Decisión técnica: Hook que coordina exportación directa vs conversión vía FFmpeg.
 * Contexto: Evalúa si el formato solicitado es el original (descarga directa) o distinto (dispara worker).
 * Restricciones: Depende de useAudioConverter para procesar formatos distintos.
 * Known issues: Limpiar ObjectURL requiere un ligero retraso en Safari.
 */
import { useState, useCallback } from 'react';
import { useAudioConverter } from './useAudioConverter';

const FREE_MAX_SIZE_MB = 50;
const IS_PRO = false;

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  
  const { convertFile, isConverting, progress, error: convertError } = useAudioConverter();

  const exportFile = useCallback(async (file: File, format?: string) => {
    setIsExporting(true);
    setExportError(null);

    try {
      if (!file) throw new Error("No hay archivo activo para exportar.");

      const sizeInMB = file.size / (1024 * 1024);
      if (!IS_PRO && sizeInMB > FREE_MAX_SIZE_MB) {
        throw new Error(`Tu archivo excede el límite de exportación de ${FREE_MAX_SIZE_MB}MB (Plan Free).`);
      }

      const originalExt = file.name.split('.').pop()?.toLowerCase() || '';
      const targetFormat = format?.toLowerCase() || originalExt;
      
      let blobToDownload: Blob = file;
      let finalName = file.name;

      // Si el formato es distinto, realizamos la conversión real con FFmpeg
      if (targetFormat !== originalExt) {
        const convertedBlob = await convertFile(file, targetFormat);
        if (!convertedBlob) {
          throw new Error("Ocurrió un error en el motor de conversión. Revisa que el formato sea válido.");
        }
        blobToDownload = convertedBlob;
        
        // Reemplazar la extensión en el nombre original para la descarga
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        finalName = `${nameWithoutExt}.${targetFormat}`;
      } else {
        // Retraso artificial mínimo para dar feedback visual si la descarga es instantánea
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Descarga nativa (Web API)
      const url = URL.createObjectURL(blobToDownload);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 150);

    } catch (error: any) {
      setExportError(error.message || "Ocurrió un error al exportar el archivo.");
    } finally {
      setIsExporting(false);
    }
  }, [convertFile]);

  // Consolidamos el error de exportación local y el del convertidor asíncrono
  const finalError = exportError || convertError;

  return {
    exportFile,
    isExporting,
    isConverting,
    progress,
    exportError: finalError
  };
}
