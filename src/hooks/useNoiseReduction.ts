/**
 * Archivo: src/hooks/useNoiseReduction.ts
 * Decisión técnica: Hook de alto nivel para orquestar la conversión de Blob a Float32Array, validar la licencia PRO y aplicar IA.
 * Contexto: Bloquea preventivamente la carga del modelo si el usuario es Free para ahorrar memoria RAM de inmediato.
 * Restricciones: Requiere AudioContext del navegador para el resampleo PCM interno.
 * Known issues: Se asume salida final en formato WAV tras la reducción.
 */
import { useState, useCallback, useEffect } from 'react';
import { aiManager } from '@lib/ai-manager';
import { useLicenseContext } from '@context/LicenseContext';

export function useNoiseReduction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(aiManager.isModelLoaded());

  const { isPro } = useLicenseContext();

  // Liberar el worker y memoria VRAM de ONNX cuando se desmonte el componente que use esto
  useEffect(() => {
    return () => {
      aiManager.terminate();
    };
  }, []);

  const reduceNoise = useCallback(async (audioFile: File, strength: number = 0.7): Promise<File | null> => {
    // 1. Barrera arquitectónica PRO
    if (!isPro) {
      setError("La reducción de ruido con IA está disponible solo en el plan PRO.");
      return null;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // 2. Carga lazy del modelo (Solo lo descargará en caché la primera vez)
      if (!aiManager.isModelLoaded()) {
        setProgress(5); 
        await aiManager.init((prog: any) => {
          if (prog.status === 'progress' && prog.progress) {
            // Mapeamos carga del modelo entre 5% y 40% visual
            setProgress(5 + Math.floor(prog.progress * 0.35));
          }
        });
        setIsModelLoaded(true);
      }

      setProgress(45); // Modelo listo, decodificando audio...

      // 3. Extracción de PCM Float32 usando Web Audio API Nativa
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const sampleRate = audioBuffer.sampleRate;
      // Por simplicidad procesamos Mono (canal 0). Multicanal requeriría procesar N tensores iterativamente.
      const float32Data = audioBuffer.getChannelData(0); 

      setProgress(55); // Procesando IA...

      // 4. Inferencia en Worker
      const cleanData = await aiManager.reduceNoise(float32Data, sampleRate, strength, (prog: any) => {
        if (prog.status === 'processing' && prog.progress) {
          // Mapear el procesamiento (55% -> 95%)
          setProgress(55 + Math.floor(prog.progress * 0.40));
        }
      });

      setProgress(95); // Re-empaquetando a WAV...

      // 5. Convertir Float32Array de vuelta a Blob (WAV puro sin pérdida)
      const wavBlob = exportWAV(cleanData, sampleRate);
      
      const originalName = audioFile.name.substring(0, audioFile.name.lastIndexOf('.'));
      const newFile = new File([wavBlob], `${originalName}_denoised.wav`, { type: 'audio/wav' });

      setProgress(100);
      return newFile;

    } catch (err: any) {
      setError(err.message || "Fallo crítico en el motor de Inteligencia Artificial.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isPro]);

  return {
    reduceNoise,
    isProcessing,
    progress,
    error,
    isModelLoaded
  };
}

// Helper: Generador ultraligero de DataView WAV para envolver el resultado PCM sin usar FFMPEG
function exportWAV(float32Array: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + float32Array.length * 2);
  const view = new DataView(buffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + float32Array.length * 2, true);
  writeString(view, 8, 'WAVE');
  
  // FMT Chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Formato PCM
  view.setUint16(22, 1, true); // Canales: 1 (Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16-bits por sample
  
  // Data Chunk
  writeString(view, 36, 'data');
  view.setUint32(40, float32Array.length * 2, true);
  
  // Escribir Samples (Float32 -> Int16)
  let offset = 44;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  
  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
