/**
 * Archivo: src/workers/ffmpeg.worker.ts
 * Decisión técnica: Web Worker dedicado para procesar tareas de FFmpeg fuera del hilo principal.
 * Contexto: @ffmpeg/ffmpeg requiere SharedArrayBuffer. El worker escucha mensajes 'init' y 'convert'.
 * Restricciones: Depende de los headers COOP/COEP configurados en Vite para habilitar multithreading seguro.
 * Known issues: Descargar y compilar el core WASM puede tomar unos segundos la primera vez (se cachea en navegador).
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpeg: FFmpeg | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, payload, id } = e.data;

  try {
    if (type === 'init') {
      if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        ffmpeg.on('progress', ({ progress, time }) => {
          // progress va de 0 a 1
          self.postMessage({ type: 'progress', progress: Math.round(progress * 100), time, id });
        });
        
        // Inicializa cargando el binario WASM
        await ffmpeg.load();
      }
      self.postMessage({ type: 'init_done', id });
      return;
    }

    if (type === 'convert') {
      if (!ffmpeg) throw new Error("FFmpeg no está inicializado. Llama a init primero.");

      const { fileData, inputFormat, outputFormat, options } = payload;
      const inputName = `input.${inputFormat}`;
      const outputName = `output.${outputFormat}`;

      // 1. Escribir archivo de entrada en el FS virtual de FFmpeg
      await ffmpeg.writeFile(inputName, new Uint8Array(fileData));

      // 2. Construir comando
      const args = ['-i', inputName];
      if (options?.bitrate) {
        args.push('-b:a', options.bitrate);
      }
      if (options?.sampleRate) {
        args.push('-ar', options.sampleRate);
      }
      args.push(outputName);

      // 3. Ejecutar comando
      await ffmpeg.exec(args);

      // 4. Leer archivo resultante
      const outputData = await ffmpeg.readFile(outputName);
      
      // 5. Limpieza de memoria
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      self.postMessage({ 
        type: 'convert_done', 
        payload: { 
          // outputData es Uint8Array, enviamos el ArrayBuffer subyacente
          data: (outputData as Uint8Array).buffer 
        }, 
        id 
      });
      return;
    }
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err.message || 'Error desconocido en FFmpeg worker', id });
  }
};
