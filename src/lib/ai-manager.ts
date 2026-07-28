/**
 * Archivo: src/lib/ai-manager.ts
 * Decisión técnica: Manager Singleton para gobernar el ciclo de vida del Web Worker de Transformers.js.
 * Contexto: Mantiene la instancia viva durante la sesión para no re-descargar o re-inicializar modelos pesados constantemente.
 * Restricciones: Las operaciones devuelven promesas pero exponen callbacks de progreso en tiempo real.
 * Known issues: El procesamiento masivo (>30 min de audio) puede disparar un error OOM (Out of Memory) en el navegador.
 */

export class AIManager {
  private worker: Worker | null = null;
  private messageCounter = 0;
  private resolves = new Map<number, { resolve: Function, reject: Function }>();
  private progressCallbacks = new Map<number, Function>();
  private modelLoaded = false;

  public async init(onProgress?: (progress: any) => void): Promise<void> {
    if (this.modelLoaded) return Promise.resolve();
    
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/ai.worker.ts', import.meta.url), {
        type: 'module'
      });
      this.worker.onmessage = this.handleMessage.bind(this);
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageCounter;
      this.resolves.set(id, { 
        resolve: () => { this.modelLoaded = true; resolve(); }, 
        reject 
      });
      if (onProgress) this.progressCallbacks.set(id, onProgress);
      
      this.worker!.postMessage({ type: 'init', id });
    });
  }

  public reduceNoise(
    audioData: Float32Array, 
    sampleRate: number, 
    strength: number = 0.7,
    onProgress?: (progress: any) => void
  ): Promise<Float32Array> {
    if (!this.modelLoaded || !this.worker) {
      return Promise.reject(new Error("Modelo de IA no inicializado o cargado."));
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageCounter;
      this.resolves.set(id, { resolve, reject });
      if (onProgress) this.progressCallbacks.set(id, onProgress);

      this.worker!.postMessage({ 
        type: 'reduceNoise', 
        payload: { audioData, sampleRate, strength }, 
        id 
      });
    });
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.modelLoaded = false;
      this.resolves.clear();
      this.progressCallbacks.clear();
    }
  }

  public isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  private handleMessage(e: MessageEvent) {
    const { type, payload, id, error } = e.data;
    
    // El evento 'progress' no cierra la promesa, solo notifica al callback
    if (type === 'progress') {
      const cb = this.progressCallbacks.get(id);
      if (cb) cb(payload);
      return; 
    }

    const promiseHandlers = this.resolves.get(id);
    if (!promiseHandlers) return;

    if (type === 'error') {
      promiseHandlers.reject(new Error(error));
    } else {
      promiseHandlers.resolve(payload);
    }
    
    this.resolves.delete(id);
    this.progressCallbacks.delete(id);
  }
}

export const aiManager = new AIManager();
