/**
 * Archivo: src/lib/ffmpeg-manager.ts
 * Decisión técnica: Singleton pattern para manejar el Web Worker de FFmpeg de forma centralizada.
 * Contexto: Evita instanciar múltiples workers pesados. Coordina las promesas y eventos de progreso.
 * Restricciones: El worker se instancia de manera asíncrona. 
 * Known issues: Si el usuario cierra la app a la mitad de una conversión, se pierde el progreso actual.
 */

export interface ConvertOptions {
  bitrate?: string;
  sampleRate?: string;
}

class FFmpegManager {
  private worker: Worker | null = null;
  private isInitializing = false;
  private isReady = false;
  private messageCounter = 0;
  private resolves = new Map<number, { resolve: Function, reject: Function }>();
  private progressCallbacks = new Map<number, (progress: number) => void>();

  public async init(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    
    if (this.isInitializing) {
      // Poll para esperar a que termine la inicialización en curso
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (this.isReady) {
            clearInterval(check);
            resolve();
          } else if (!this.worker && !this.isInitializing) {
            clearInterval(check);
            reject(new Error("Falló la inicialización del worker"));
          }
        }, 100);
      });
    }

    this.isInitializing = true;
    
    // Instanciar Worker usando la API estándar que Vite soporta
    this.worker = new Worker(new URL('../workers/ffmpeg.worker.ts', import.meta.url), {
      type: 'module'
    });

    this.worker.onmessage = this.handleMessage.bind(this);

    return new Promise((resolve, reject) => {
      const id = this.nextId();
      this.resolves.set(id, {
        resolve: () => {
          this.isReady = true;
          this.isInitializing = false;
          resolve();
        },
        reject: (err: any) => {
          this.isInitializing = false;
          reject(err);
        }
      });
      this.worker?.postMessage({ type: 'init', id });
    });
  }

  public async convert(
    file: File, 
    outputFormat: string, 
    options?: ConvertOptions,
    onProgress?: (p: number) => void
  ): Promise<Blob> {
    await this.init();

    return new Promise(async (resolve, reject) => {
      const id = this.nextId();
      // Extraer extensión de manera limpia
      const inputFormat = file.name.split('.').pop()?.toLowerCase() || 'tmp';
      
      this.resolves.set(id, { resolve, reject });
      if (onProgress) {
        this.progressCallbacks.set(id, onProgress);
      }

      // Leemos el File como ArrayBuffer para enviarlo al worker
      const fileData = await file.arrayBuffer();

      // Transferir ownership del arraybuffer optimiza el uso de memoria (zero-copy clone)
      this.worker?.postMessage({
        type: 'convert',
        id,
        payload: {
          fileData,
          inputFormat,
          outputFormat,
          options
        }
      }, [fileData]); 
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    this.isInitializing = false;
    this.resolves.clear();
    this.progressCallbacks.clear();
  }

  private handleMessage(e: MessageEvent) {
    const { type, payload, progress, id, error } = e.data;

    if (type === 'progress') {
      const callback = this.progressCallbacks.get(id);
      if (callback) callback(progress);
      return;
    }

    const promiseHandlers = this.resolves.get(id);
    if (!promiseHandlers) return;

    if (type === 'init_done') {
      promiseHandlers.resolve();
      this.resolves.delete(id);
    } else if (type === 'convert_done') {
      // payload.data es el ArrayBuffer resultante
      const blob = new Blob([payload.data]);
      promiseHandlers.resolve(blob);
      this.resolves.delete(id);
      this.progressCallbacks.delete(id);
    } else if (type === 'error') {
      promiseHandlers.reject(new Error(error));
      this.resolves.delete(id);
      this.progressCallbacks.delete(id);
    }
  }

  private nextId() {
    return ++this.messageCounter;
  }
}

export const ffmpegManager = new FFmpegManager();
