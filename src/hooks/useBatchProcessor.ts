/**
 * Archivo: src/hooks/useBatchProcessor.ts
 * Decisión técnica: Controlador secuencial del procesamiento por lotes.
 * Contexto: Mantiene una cola en memoria y despacha iterativamente los trabajos usando dependencias como IA.
 * Restricciones: Depende de JSZip para la empaquetación final masiva. Límite de seguridad en RAM: 50 archivos.
 * Known issues: Si el usuario cierra la pestaña o recarga la página durante el proceso en Desktop, se pierde la cola y resultados.
 */
import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { useLicenseContext } from '@context/LicenseContext';
import { useNoiseReduction } from '@hooks/useNoiseReduction';
// Nota de integración: Si se requiere useAudioConverter, importar aquí.

export interface BatchJob {
  id: string;
  file: File;
  operation: 'convert' | 'noise-reduction' | 'normalize';
  options: any;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: File;
  error?: string;
}

export function useBatchProcessor(isDesktop: boolean) {
  const { isPro } = useLicenseContext();
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Refs para controlar mutaciones dentro del bucle while asíncrono
  const isPausedRef = useRef(false);
  const isProcessingRef = useRef(false);

  const { reduceNoise } = useNoiseReduction();

  const addJobs = useCallback((files: File[], operation: 'convert' | 'noise-reduction' | 'normalize', options: any) => {
    if (!isPro) throw new Error("El procesamiento por lotes está disponible solo en el plan PRO.");
    if (!isDesktop) throw new Error("El procesamiento por lotes está disponible solo en Desktop.");
    
    setJobs(prev => {
      if (prev.length + files.length > 50) {
        throw new Error("Máximo 50 archivos por lote permitidos por límite de memoria VRAM/RAM.");
      }
      
      const newJobs: BatchJob[] = files.map(file => ({
        id: crypto.randomUUID(),
        file,
        operation,
        options,
        status: 'queued',
        progress: 0
      }));
      
      return [...prev, ...newJobs];
    });
  }, [isPro, isDesktop]);

  const removeJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId && j.status !== 'processing'));
  }, []);

  const updateJob = (id: string, updates: Partial<BatchJob>) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job));
  };

  const processJob = async (job: BatchJob): Promise<File> => {
    updateJob(job.id, { status: 'processing', progress: 10 });
    
    try {
      if (job.operation === 'noise-reduction') {
        updateJob(job.id, { progress: 50 });
        const result = await reduceNoise(job.file, job.options.strength || 0.7);
        if (!result) throw new Error("Fallo en la reducción de ruido por IA");
        return result;
      } 
      else if (job.operation === 'convert') {
        updateJob(job.id, { progress: 50 });
        // MOCK/Fallback: Integrar aquí useAudioConverter real. 
        await new Promise(r => setTimeout(r, 1000));
        return new File([job.file], `${job.file.name.split('.')[0]}.${job.options.format}`, { type: `audio/${job.options.format}` });
      }
      else if (job.operation === 'normalize') {
        updateJob(job.id, { progress: 50 });
        await new Promise(r => setTimeout(r, 800)); // MOCK Normalización WebAudio API
        return new File([job.file], `${job.file.name.split('.')[0]}_norm.wav`, { type: 'audio/wav' });
      }
      throw new Error("Operación desconocida");
    } catch (e: any) {
      throw e;
    }
  };

  const startProcessing = useCallback(async () => {
    if (!isPro || !isDesktop || isProcessingRef.current) return;
    
    setIsProcessing(true);
    setIsPaused(false);
    isProcessingRef.current = true;
    isPausedRef.current = false;

    // Snapshot inicial (usamos función para no depender de closure estancado)
    let currentJobs: BatchJob[] = [];
    setJobs(prev => { currentJobs = prev; return prev; });

    for (let i = 0; i < currentJobs.length; i++) {
      const job = currentJobs[i];
      if (job.status === 'completed' || job.status === 'failed') continue;

      // Esperar activamente si la UI ordena Pausa
      while (isPausedRef.current) {
        if (!isProcessingRef.current) return; // Cancelación forzada
        await new Promise(r => setTimeout(r, 500));
      }

      try {
        const result = await processJob(job);
        updateJob(job.id, { status: 'completed', progress: 100, result });
      } catch (err: any) {
        updateJob(job.id, { status: 'failed', progress: 0, error: err.message });
      }
    }

    setIsProcessing(false);
    isProcessingRef.current = false;
  }, [isPro, isDesktop, reduceNoise]);

  const pauseProcessing = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
  }, []);

  const resumeProcessing = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs(prev => prev.filter(j => j.status !== 'completed'));
  }, []);

  const downloadAll = useCallback(async () => {
    const completedJobs = jobs.filter(j => j.status === 'completed' && j.result);
    if (completedJobs.length === 0) return;

    // ADVERTENCIA: Requiere `npm install jszip` si no está en package.json
    const zip = new JSZip();
    completedJobs.forEach(job => {
      zip.file(job.result!.name, job.result!);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TockAudio_Batch_${new Date().getTime()}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [jobs]);

  const progress = jobs.length === 0 ? 0 : 
    Math.round(jobs.reduce((acc, job) => acc + job.progress, 0) / jobs.length);

  return {
    jobs, addJobs, removeJob, startProcessing, pauseProcessing, 
    resumeProcessing, clearCompleted, downloadAll, isProcessing, isPaused, progress
  };
}
