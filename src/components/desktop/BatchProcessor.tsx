/**
 * Archivo: src/components/desktop/BatchProcessor.tsx
 * Decisión técnica: Interfaz de usuario para la orquestación masiva de archivos.
 * Contexto: Coordina la cola de trabajos en el estado local del hook y muestra feedback global e individual.
 * Restricciones: Requiere isPro y isDesktop. Máx 50 archivos simultáneos para no quebrar la RAM/VRAM del navegador.
 * Known issues: Descargar ZIP muy pesados (>1GB) puede congelar el main thread temporalmente durante la compresión.
 */
import { useState } from 'react';
import { useBatchProcessor } from '@hooks/useBatchProcessor';
import DropZone from '@components/audio/DropZone';
import BatchJobItem from './BatchJobItem';
import { Button } from '@components/ui/button';
import LicenseModal from '@components/legal/LicenseModal';
import { ShieldAlert, Play, Pause, Download, Trash2, Layers } from 'lucide-react';

export default function BatchProcessor({ isProUser, isDesktop }: { isProUser: boolean, isDesktop: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operation, setOperation] = useState<'convert' | 'noise-reduction' | 'normalize'>('convert');
  const [options, setOptions] = useState<any>({ format: 'mp3', strength: 0.7, normalizeType: 'peak' });

  const { 
    jobs, addJobs, removeJob, startProcessing, pauseProcessing, 
    resumeProcessing, clearCompleted, downloadAll, isProcessing, isPaused, progress 
  } = useBatchProcessor(isDesktop);

  if (!isDesktop) return null; // Componente de protección absoluta

  // PAYWALL ESTÉTICO
  if (!isProUser) {
    return (
      <div className="w-full bg-card border border-border rounded-xl p-8 shadow-sm relative overflow-hidden group min-h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px] p-4 text-center transition-all group-hover:bg-background/90">
          <Layers className="w-12 h-12 text-primary mb-4 opacity-90 drop-shadow-md" />
          <h2 className="text-2xl font-black text-foreground mb-2">Procesamiento Masivo (Batch)</h2>
          <p className="text-sm font-medium text-muted-foreground mb-6 max-w-md">
            Automatiza la conversión, normalización o limpieza IA de hasta 50 archivos simultáneos. Optimiza tu tiempo con el plan PRO.
          </p>
          <Button size="lg" onClick={() => setIsModalOpen(true)} className="shadow-lg font-bold text-base px-8 h-12 hover:scale-105 transition-transform">
            Desbloquear PRO
          </Button>
        </div>
        <div className="opacity-20 pointer-events-none filter blur-sm w-full h-full border-4 border-dashed rounded-xl bg-secondary/50"></div>
        <LicenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  const handleFiles = (files: File[]) => {
    try {
      addJobs(files, operation, options);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;
  const queuedCount = jobs.filter(j => j.status === 'queued').length;

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-xl animate-fast-fade">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Procesamiento por Lotes</h2>
          <span className="bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded shadow-sm">PRO</span>
        </div>
        <div className="text-sm font-bold text-foreground bg-secondary px-4 py-1.5 rounded-full border border-border">
          {jobs.length} archivos en memoria
        </div>
      </div>

      {/* Grid Superior: Configuración y Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel Izquierdo: Opciones */}
        <div className="lg:col-span-1 flex flex-col gap-5 bg-secondary/20 p-5 rounded-xl border border-border shadow-inner">
          <h3 className="font-bold text-foreground">Configuración Global</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Operación</label>
            <select 
              value={operation}
              onChange={(e: any) => setOperation(e.target.value)}
              className="w-full bg-background border border-border rounded-md p-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
              disabled={isProcessing}
            >
              <option value="convert">Convertir Formato (FFmpeg)</option>
              <option value="noise-reduction">Reducción de Ruido (IA ONNX)</option>
              <option value="normalize">Normalizar Volumen (Peak)</option>
            </select>
          </div>

          {operation === 'convert' && (
            <div className="space-y-2 animate-fast-fade">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Formato Destino</label>
              <select 
                value={options.format}
                onChange={(e) => setOptions({...options, format: e.target.value})}
                className="w-full bg-background border border-border rounded-md p-2.5 text-sm font-semibold outline-none shadow-sm focus:ring-2 focus:ring-primary"
                disabled={isProcessing}
              >
                <option value="mp3">MP3 de Alta Calidad</option>
                <option value="wav">WAV Lossless</option>
                <option value="ogg">OGG Vorbis</option>
              </select>
            </div>
          )}

          {operation === 'noise-reduction' && (
            <div className="space-y-3 animate-fast-fade">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Atenuación IA</span>
                <span className="text-primary">{Math.round(options.strength * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={options.strength} 
                onChange={(e) => setOptions({...options, strength: parseFloat(e.target.value)})}
                className="w-full accent-primary"
                disabled={isProcessing}
              />
            </div>
          )}
        </div>

        {/* Panel Derecho: Área de Caída Masiva */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <DropZone 
            onFilesSelected={handleFiles} 
            multiple={true} 
            className="flex-1 min-h-[180px] border-dashed border-2 hover:border-primary/50 transition-colors bg-background/50 rounded-xl" 
          />
          <p className="text-xs font-semibold text-muted-foreground mt-3 text-center">
            Suelta hasta 50 archivos. El procesamiento usará Web Workers secuenciales para no colapsar tu navegador.
          </p>
        </div>
      </div>

      {/* Botonera de Control */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
        {!isProcessing && !isPaused ? (
          <Button onClick={startProcessing} disabled={queuedCount === 0} className="font-bold shadow-md">
            <Play className="w-4 h-4 mr-2" /> Iniciar Lote
          </Button>
        ) : isPaused ? (
          <Button onClick={resumeProcessing} className="font-bold bg-green-600 hover:bg-green-700 text-white shadow-md">
            <Play className="w-4 h-4 mr-2" /> Reanudar Tareas
          </Button>
        ) : (
          <Button onClick={pauseProcessing} variant="secondary" className="font-bold border-border shadow-sm">
            <Pause className="w-4 h-4 mr-2" /> Interrumpir
          </Button>
        )}

        <Button 
          variant="outline" 
          onClick={downloadAll} 
          disabled={completedCount === 0 || isProcessing}
          className="font-bold border-primary/30 text-primary hover:bg-primary/10 shadow-sm transition-colors ml-2"
        >
          <Download className="w-4 h-4 mr-2" /> Generar ZIP ({completedCount})
        </Button>

        <Button 
          variant="ghost" 
          onClick={clearCompleted} 
          disabled={completedCount === 0}
          className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-bold px-3 rounded-full"
        >
          <Trash2 className="w-4 h-4 mr-1.5" /> Limpiar Exitosos
        </Button>
      </div>

      {/* Progreso Global y Estadísticas */}
      {jobs.length > 0 && (
        <div className="bg-secondary/40 p-5 rounded-xl border border-border shadow-inner">
          <div className="flex justify-between text-sm font-bold mb-3 text-foreground">
            <span>Rendimiento Global</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-background rounded-full overflow-hidden mb-4 border border-border/50 shadow-inner">
            <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-6 text-xs font-bold">
            <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded">{completedCount} Exitosos</span>
            <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded">{failedCount} Fallidos</span>
            <span className="text-muted-foreground bg-background px-2 py-1 rounded border border-border">{queuedCount} Esperando</span>
          </div>
        </div>
      )}

      {/* Cola de Trabajos */}
      {jobs.length > 0 && (
        <div className="flex flex-col gap-2 max-h-[450px] overflow-y-auto custom-scrollbar pr-2 mt-2 bg-background p-2 rounded-xl border border-border/50">
          {jobs
            .sort((a, b) => {
              const order = { 'processing': 0, 'queued': 1, 'completed': 2, 'failed': 3 };
              return order[a.status] - order[b.status];
            })
            .map(job => (
              <BatchJobItem 
                key={job.id} 
                job={job} 
                onRemove={removeJob} 
              />
            ))
          }
        </div>
      )}

    </div>
  );
}
