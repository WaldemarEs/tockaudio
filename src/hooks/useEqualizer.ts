/**
 * Archivo: src/hooks/useEqualizer.ts
 * Decisión técnica: Hook de gestión del ecualizador gráfico de 10 bandas. 
 * Contexto: Gestiona el estado de las bandas y permite calcular curvas de frecuencia y procesar el buffer offline. Bloqueado bajo condición de Licencia PRO.
 * Restricciones: Depende de un archivo de audio decodificado para poder renderizar. 
 * Known issues: N/A
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { EQ_BANDS, EQ_PRESETS, getFrequencyResponse, processAudioWithEQ } from '@lib/audio-eq';

export interface Band {
  frequency: number;
  label: string;
  gain: number;
  q: number;
}

export function useEqualizer(isProUser: boolean) {
  const [bands, setBands] = useState<Band[]>(
    EQ_BANDS.map(b => ({ ...b, gain: 0, q: 1.4 }))
  );
  const [activePreset, setActivePreset] = useState<string | null>('Flat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [frequencyResponse, setFrequencyResponse] = useState<{ frequencies: Float32Array, magnitudes: Float32Array } | null>(null);

  // Generamos un contexto "dummy" (fantasma) solo para calcular las curvas de respuesta matemática (No reproduce audio).
  const dummyCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!dummyCtxRef.current) {
      dummyCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (dummyCtxRef.current && dummyCtxRef.current.state !== 'closed') {
        dummyCtxRef.current.close();
      }
    };
  }, []);

  const updateResponseCurve = useCallback((currentBands: Band[]) => {
    if (!dummyCtxRef.current) return;
    
    // Instanciar filtros temporales para medir su impacto
    const ctx = dummyCtxRef.current;
    const filters = currentBands.map(b => {
      const f = ctx.createBiquadFilter();
      f.type = 'peaking';
      f.frequency.value = b.frequency;
      f.Q.value = b.q;
      f.gain.value = b.gain;
      return f;
    });

    const resp = getFrequencyResponse(ctx, filters);
    setFrequencyResponse(resp);
  }, []);

  // Actualizar curva inicialmente y cada vez que cambien las ganancias de las bandas
  useEffect(() => {
    updateResponseCurve(bands);
  }, [bands, updateResponseCurve]);

  const setBandGain = useCallback((bandIndex: number, gainDb: number) => {
    if (!isProUser) return;
    setBands(prev => {
      const next = [...prev];
      next[bandIndex] = { ...next[bandIndex], gain: gainDb };
      setActivePreset(null); // Al editar manualmente, perdemos el estado del preset
      return next;
    });
  }, [isProUser]);

  const setBandQ = useCallback((bandIndex: number, q: number) => {
    if (!isProUser) return;
    setBands(prev => {
      const next = [...prev];
      next[bandIndex] = { ...next[bandIndex], q };
      return next;
    });
  }, [isProUser]);

  const applyPreset = useCallback((presetName: string) => {
    if (!isProUser) return;
    const preset = EQ_PRESETS.find(p => p.name === presetName);
    if (!preset) return;

    setBands(prev => prev.map((b, i) => ({
      ...b,
      gain: preset.gains[i] || 0
    })));
    setActivePreset(presetName);
  }, [isProUser]);

  const resetToFlat = useCallback(() => {
    applyPreset('Flat');
  }, [applyPreset]);

  const processWithEQ = async (audioBuffer: AudioBuffer): Promise<AudioBuffer | null> => {
    if (!isProUser) throw new Error('El ecualizador gráfico está disponible solo en el plan PRO');
    
    setIsProcessing(true);
    try {
      const gains = bands.map(b => b.gain);
      const processedBuffer = await processAudioWithEQ(audioBuffer, gains);
      return processedBuffer;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    bands,
    activePreset,
    isProcessing,
    frequencyResponse,
    presets: EQ_PRESETS,
    setBandGain,
    setBandQ,
    applyPreset,
    resetToFlat,
    processWithEQ
  };
}
