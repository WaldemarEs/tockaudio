/**
 * Archivo: src/hooks/useAudioConverter.ts
 * Decisión técnica: Hook para interactuar con la cola del manager de FFmpeg desde componentes React.
 * Contexto: Simplifica el ciclo de vida (estado, progreso, errores) y dispara inicializaciones tempranas.
 * Restricciones: Al desmontarse el componente no interrumpe la conversión activa (el manager es global).
 * Known issues: N/A
 */
import { useState, useCallback, useEffect } from 'react';
import { ffmpegManager, ConvertOptions } from '@lib/ffmpeg-manager';

export function useAudioConverter() {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Intentamos inicializar el worker de fondo tempranamente
  useEffect(() => {
    ffmpegManager.init().catch(err => {
      console.warn("Error pre-inicializando FFmpeg worker:", err);
    });
    
    // Descomentar si deseamos destruir el engine WASM completamente al salir del componente
    // return () => ffmpegManager.terminate();
  }, []);

  const convertFile = useCallback(async (
    file: File, 
    outputFormat: string, 
    options?: ConvertOptions
  ): Promise<Blob | null> => {
    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      const outputBlob = await ffmpegManager.convert(
        file, 
        outputFormat, 
        options,
        (p) => setProgress(p)
      );
      return outputBlob;
    } catch (err: any) {
      setError(err.message || 'Error durante la conversión');
      return null;
    } finally {
      setIsConverting(false);
    }
  }, []);

  return {
    convertFile,
    isConverting,
    progress,
    error
  };
}
