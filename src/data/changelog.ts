/**
 * Archivo: changelog.ts
 * Decisión técnica: Datos del changelog separados del componente para fácil mantenimiento
 * Contexto: Centralizar los datos del changelog para que sea fácil añadir nuevas entradas
 * Restricciones: Mantener orden cronológico inverso (más reciente primero)
 */

export interface ChangelogEntry {
  version: string;
  date: string;
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
    date: '2025-01-20',
    title: 'Normalización de Volumen',
    type: 'minor',
    changes: [
      { type: 'added', description: 'Normalización de pico y LUFS para cumplir estándares de loudness' },
      { type: 'added', description: 'Mediciones en tiempo real de pico y loudness' },
      { type: 'added', description: 'Presets para YouTube (-14 LUFS), Spotify (-16 LUFS) y podcasts' },
      { type: 'improved', description: 'Optimización del procesamiento de audio para archivos grandes' }
    ]
  },
  {
    version: '1.1.0',
    date: '2025-01-15',
    title: 'Reducción de Ruido con IA',
    type: 'minor',
    changes: [
      { type: 'added', description: 'Reducción de ruido con IA local usando Transformers.js' },
      { type: 'added', description: 'Preview A/B para comparar original vs procesado' },
      { type: 'improved', description: 'Mejora en el rendimiento del editor multi-pista' },
      { type: 'fixed', description: 'Corrección de memory leak en Safari' }
    ]
  },
  {
    version: '1.0.0',
    date: '2025-01-10',
    title: 'Lanzamiento Oficial',
    type: 'major',
    changes: [
      { type: 'added', description: 'Editor de audio multi-pista completo' },
      { type: 'added', description: 'Conversión de formatos: WAV, MP3, OGG, FLAC, AAC' },
      { type: 'added', description: 'Extracción de audio desde video (MP4, MOV, AVI, MKV, WEBM)' },
      { type: 'added', description: 'Procesamiento por lotes hasta 50 archivos (PRO)' },
      { type: 'added', description: 'Sistema de licencias con validación RSA local' },
      { type: 'added', description: '100% procesamiento local, cero subidas a servidores' }
    ]
  },
  {
    version: '0.9.0',
    date: '2025-01-05',
    title: 'Beta Pública',
    type: 'announcement',
    changes: [
      { type: 'added', description: 'Versión beta pública disponible para testing' },
      { type: 'added', description: 'Documentación inicial y guías de usuario' }
    ]
  }
];
