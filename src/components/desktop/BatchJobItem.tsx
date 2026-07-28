/**
 * Archivo: src/components/desktop/BatchJobItem.tsx
 * Decisión técnica: Item UI aislado para representar el estado y micro-acciones de un trabajo individual de procesamiento.
 * Contexto: Muestra el progreso de su hilo y expone descargas individuales en caso de que el usuario no quiera descargar el ZIP maestro completo.
 * Restricciones: N/A
 * Known issues: N/A
 */
import { BatchJob } from '@hooks/useBatchProcessor';
import { Button } from '@components/ui/button';
import { FileAudio, Clock, CheckCircle2, XCircle, Trash2, Download, Loader2 } from 'lucide-react';
import { cn } from '@lib/utils';

interface BatchJobItemProps {
  job: BatchJob;
  onRemove: (jobId: string) => void;
}

export default function BatchJobItem({ job, onRemove }: BatchJobItemProps) {
  
  const handleDownload = () => {
    if (!job.result) return;
    const url = URL.createObjectURL(job.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = job.result.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const statusColors = {
    queued: 'border-border bg-secondary/20',
    processing: 'border-primary/50 bg-primary/5',
    completed: 'border-green-500/30 bg-green-500/5',
    failed: 'border-destructive/30 bg-destructive/5'
  };

  const getStatusIcon = () => {
    switch(job.status) {
      case 'queued': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch(job.status) {
      case 'queued': return 'En cola';
      case 'processing': return `${job.progress}%`;
      case 'completed': return '¡Listo!';
      case 'failed': return 'Falló';
    }
  };

  const opLabel = {
    'convert': 'Conversión',
    'noise-reduction': 'IA Limpieza',
    'normalize': 'Normalización'
  }[job.operation];

  return (
    <div className={cn("w-full rounded-lg border p-3 flex items-center justify-between transition-colors shadow-sm", statusColors[job.status])}>
      
      {/* File Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 bg-background rounded-md border border-border shadow-sm">
          <FileAudio className="w-4 h-4 text-foreground/70" />
        </div>
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-sm font-semibold text-foreground truncate" title={job.file.name}>
            {job.file.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
              {opLabel}
            </span>
            {job.status === 'failed' && (
              <span className="text-[10px] font-medium text-destructive truncate bg-destructive/10 px-1.5 rounded" title={job.error}>
                {job.error}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Actions */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2 w-24 justify-end">
          <span className={cn(
            "text-xs font-bold", 
            job.status === 'processing' ? 'text-primary' : 'text-muted-foreground',
            job.status === 'completed' ? 'text-green-600' : ''
          )}>
            {getStatusText()}
          </span>
          {getStatusIcon()}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end w-8">
          {job.status === 'completed' ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownload}
              className="w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-100 shadow-sm border border-green-500/20 bg-background"
              aria-label="Descargar resultado"
            >
              <Download className="w-4 h-4" />
            </Button>
          ) : (job.status === 'queued' || job.status === 'failed') ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onRemove(job.id)}
              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Eliminar de la cola"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : null}
        </div>

      </div>
    </div>
  );
}
