/**
 * Archivo: src/data/changelog.ts
 * Decisión técnica: Base de datos estática para el historial de versiones (Changelog).
 * Contexto: Abastece a la página del Changelog con un array tipado de actualizaciones para evitar Hardcoding en el componente y facilitar el mantenimiento.
 * Restricciones: Sin dependencias externas. Se asume que el arreglo está ordenado de más reciente a más antiguo cronológicamente.
 * Known issues: N/A
 */

export interface ChangelogEntry {
  version: string;
  date: string; // Formato ISO corto: YYYY-MM-DD
  title: string;
  type: 'major' | 'minor' | 'patch' | 'announcement';
  changes: {
    type: 'added' | 'improved' | 'fixed' | 'removed';
    description: string;
  }[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.2.0',
    date: '2026-10-24',
    title: 'Normalización de Volumen (Mastering)',
    type: 'minor',
    changes: [
      { type: 'added', description: 'Normalización de pico y LUFS (ITU-R BS.1770) para cumplir estándares estrictos de loudness' },
      { type: 'added', description: 'Mediciones en tiempo real de pico, RMS y Headroom (Telemetría visual)' },
      { type: 'added', description: 'Presets rápidos para YouTube (-14 LUFS), Spotify (-16 LUFS) y Podcasts' },
      { type: 'improved', description: 'Optimización del procesamiento de audio PCM usando buffers Float32Array para rendimiento extremo' }
    ]
  },
  {
    version: '1.1.0',
    date: '2026-10-15',
    title: 'Reducción de Ruido con Inteligencia Artificial',
    type: 'minor',
    changes: [
      { type: 'added', description: 'Reducción de ruido nativa con IA local usando Transformers.js y el runtime de ONNX Web' },
      { type: 'added', description: 'Módulo Preview A/B apilado para comparar el clip original vs el audio procesado instantáneamente' },
      { type: 'improved', description: 'Mejora agresiva en el rendimiento del renderizado en el editor multi-pista a 60 FPS' },
      { type: 'fixed', description: 'Mitigación parcial de Memory Leak (OOM) en Safari y dispositivos iOS aislando el Garbage Collector' }
    ]
  },
  {
    version: '1.0.0',
    date: '2026-10-10',
    title: 'Lanzamiento Oficial (V1)',
    type: 'major',
    changes: [
      { type: 'added', description: 'Editor de audio multi-pista asíncrono y escalable con interfaz dual (Mobile/Desktop)' },
      { type: 'added', description: 'Conversor de contenedores y codecs nativo vía WASM: WAV, MP3, OGG, FLAC, AAC' },
      { type: 'added', description: 'Extracción directa de pistas de audio incrustadas desde video pesado (MP4, MOV, AVI, WEBM)' },
      { type: 'added', description: 'Procesamiento masivo por lotes (Batch) de hasta 50 archivos simultáneos (Exclusivo Desktop PRO)' },
      { type: 'added', description: 'Sistema de licencias local offline validado criptográficamente mediante RSA-2048' },
      { type: 'added', description: '100% privacidad Edge-Computing garantizada: Procesamiento local en dispositivo, cero subidas a servidores ajenos' }
    ]
  },
  {
    version: '0.9.0',
    date: '2026-10-01',
    title: 'Beta Pública Limitada',
    type: 'announcement',
    changes: [
      { type: 'added', description: 'Versión beta pública (Release Candidate) disponible para pruebas de estrés de la comunidad web' },
      { type: 'added', description: 'Inauguración de las páginas de documentación SEO, manifiesto de arquitectura y framework legal GDPR' }
    ]
  }
];
