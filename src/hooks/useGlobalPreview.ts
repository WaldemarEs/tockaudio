/**
 * Archivo: src/hooks/useGlobalPreview.ts
 * Decisión técnica: Agregador de estados para determinar el "Bounce" final del master.
 * Contexto: Lee los archivos generados por las diferentes etapas de la cadena (Normalización, EQ, Noise Reduction) para establecer el archivo resultante.
 * Restricciones: Al ser modular, asume que el archivo final es el del efecto más destructivo/último aplicado en la cadena.
 * Known issues: El encadenamiento estricto real requeriría pasar el buffer de un Web Worker a otro, por lo que resolvemos al estado más avanzado disponible en la jerarquía.
 */
import { useAudioStore } from '@store/audioStore';
import { useMemo, useState } from 'react';

export function useGlobalPreview(activeRawFile: File | null) {
  const normalizedFile = useAudioStore(state => state.normalizedFile);
  const equalizedFile = useAudioStore(state => state.equalizedFile);
  const processedFile = useAudioStore(state => state.processedFile);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Jerarquía de resolución: El último paso de la cadena tiene prioridad
  const finalProcessedFile = useMemo(() => {
    if (processedFile) return processedFile;
    if (equalizedFile) return equalizedFile;
    if (normalizedFile) return normalizedFile;
    return null;
  }, [processedFile, equalizedFile, normalizedFile]);

  const hasModifications = finalProcessedFile !== null;

  const appliedEffects = useMemo(() => {
    const effects = [];
    if (normalizedFile) effects.push('Normalización');
    if (equalizedFile) effects.push('Ecualización');
    if (processedFile) effects.push('Reducción de Ruido');
    return effects;
  }, [normalizedFile, equalizedFile, processedFile]);

  const applyAllModifications = async () => {
    // En la alternativa más simple, las modificaciones ya están en memoria gracias a que el usuario las procesó en cada panel.
    // Simulamos un procesamiento de "Bounce" (re-render master) para UX.
    setIsProcessing(true);
    setProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 50));
    }
    
    setIsProcessing(false);
  };

  const discardAll = () => {
    useAudioStore.getState().clearNormalizedFile();
    useAudioStore.getState().clearEqualizedFile();
    useAudioStore.getState().clearProcessedFile();
  };

  return {
    originalFile: activeRawFile,
    finalProcessedFile,
    hasModifications,
    appliedEffects,
    applyAllModifications,
    discardAll,
    isProcessing,
    progress
  };
}
