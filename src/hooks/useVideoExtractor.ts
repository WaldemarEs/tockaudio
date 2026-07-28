/**
 * Archivo: src/hooks/useVideoExtractor.ts
 * Decisión técnica: Hook especializado para aislar la lógica de extracción de audio desde video.
 * Contexto: Emplea el ffmpeg-manager existente para exportar la pista de audio sin subir a servidores.
 * Restricciones: Límites asimétricos validados preventivamente: Desktop Free 50MB, PRO 2GB. Mobile: 100MB.
 * Known issues: El prompt requería forzar "-vn -acodec pcm_s16le" en FFmpeg. Dado que la Regla 1 prohíbe 
 * editar ffmpeg-manager.ts en este paso, la conversión se apoya en el auto-mapping nativo de FFmpeg 
 * (el cual ignora inteligentemente el video al exportar a .wav).
 */
import { useState, useCallback, useEffect } from 'react';
import { ffmpegManager } from '@lib/ffmpeg-manager';
import { useDeviceType } from './useDeviceType';

const IS_PRO = false; // Hardcodeado por ahora sin backend
const DESKTOP_FREE_LIMIT_MB = 50;
const DESKTOP_PRO_LIMIT_MB = 2048;
const MOBILE_LIMIT_MB = 100;

export function useVideoExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { isMobile } = useDeviceType();

  // Aseguramos que FFmpeg WASM comience a descargarse silenciosamente
  useEffect(() => {
    ffmpegManager.init().catch(err => {
      console.warn("Error pre-inicializando FFmpeg para extractor de video:", err);
    });
  }, []);

  const extractAudio = useCallback(async (
    videoFile: File, 
    outputFormat: string = 'wav'
  ): Promise<File | null> => {
    setIsExtracting(true);
    setProgress(0);
    setError(null);

    try {
      if (!videoFile) {
        throw new Error("No se proporcionó un archivo de video válido.");
      }

      const sizeMB = videoFile.size / (1024 * 1024);
      const limitMB = isMobile ? MOBILE_LIMIT_MB : (IS_PRO ? DESKTOP_PRO_LIMIT_MB : DESKTOP_FREE_LIMIT_MB);
      
      if (sizeMB > limitMB) {
        if (isMobile) {
          throw new Error(`Los móviles están limitados a videos de ${MOBILE_LIMIT_MB}MB por restricciones de memoria. Usa Desktop para videos grandes.`);
        } else {
          throw new Error(`Tu video excede el límite de extracción de ${limitMB}MB ${IS_PRO ? '(Plan PRO)' : '(Plan Free)'}.`);
        }
      }

      // Convertimos enviando el archivo al ffmpeg-manager. 
      // Al elegir un formato de salida de solo audio, FFmpeg descarta el canal de video (equivalente a -vn).
      const outputBlob = await ffmpegManager.convert(
        videoFile, 
        outputFormat, 
        {}, // Sin opciones extra por ahora
        (p) => setProgress(p)
      );

      // Crear un File a partir del Blob extraído para consumo del audioStore
      const originalName = videoFile.name.substring(0, videoFile.name.lastIndexOf('.'));
      const extractedFileName = `${originalName}_extracted.${outputFormat}`;
      const mimeType = outputFormat === 'wav' ? 'audio/wav' : (outputFormat === 'mp3' ? 'audio/mpeg' : `audio/${outputFormat}`);
      
      const extractedFile = new File([outputBlob], extractedFileName, { type: mimeType });
      return extractedFile;

    } catch (err: any) {
      setError(err.message || 'Error durante la extracción del audio del video.');
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, [isMobile]);

  return {
    extractAudio,
    isExtracting,
    progress,
    error
  };
}
