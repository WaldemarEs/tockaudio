/**
 * Archivo: src/components/audio/NoiseReductionPanel.tsx
 * Decisión técnica: Panel de control de la reducción de ruido (IA). Protegido por Paywall local.
 * Contexto: Activa el hook useNoiseReduction y deposita el archivo resultante en el store global.
 * Restricciones: Si el modelo no está cacheado, la primera ejecución detendrá al usuario algunos segundos.
 * Known issues: N/A
 */
import { useState } from 'react';
import { useLicenseContext } from '@context/LicenseContext';
import { useNoiseReduction } from '@hooks/useNoiseReduction';
import { useAudioStore } from '@store/audioStore';
import { Button } from '@components/ui/button';
import { Slider } from '@components/ui/slider';
import { Sparkles, Loader2, Download, Trash2, ShieldAlert } from 'lucide-react';
import LicenseModal from '@components/legal/LicenseModal';
import { cn } from '@lib/utils';

interface NoiseReductionPanelProps {
  activeFile: File | null;
}

export default function NoiseReductionPanel({ activeFile }: NoiseReductionPanelProps) {
  const { isPro } = useLicenseContext();
  const { reduceNoise, isProcessing, progress, error, isModelLoaded } = useNoiseReduction();
  
  const processedFile = useAudioStore(state => state.processedFile);
  const setProcessedFile = useAudioStore(state => state.setProcessedFile);
  const clearProcessedFile = useAudioStore(state => state.clearProcessedFile);

  const [strength, setStrength] = useState(70);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApply = async () => {
    if (!activeFile || isProcessing) return;
    
    // Limpiar previo
    clearProcessedFile();
    
    const resultFile = await reduceNoise(activeFile, strength / 100);
    if (resultFile) {
      setProcessedFile(resultFile);
    }
  };

  const handleDownload = () => {
    if (!processedFile) return;
    const url = URL.createObjectURL(processedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = processedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // UI para usuarios Free
  if (!isPro) {
    return (
      <div className="w-full bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
        {/* Capa de Paywall Visual */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] p-4 text-center">
          <ShieldAlert className="w-8 h-8 text-primary mb-2 opacity-90" />
          <p className="font-bold text-foreground mb-1">IA Reducción de Ruido</p>
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Limpia el fondo de tus audios con redes neuronales. Exclusivo plan PRO.
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="shadow-md">
            Actualizar a PRO
          </Button>
        </div>
        
        {/* Fondo borroso (Muestra la funcionalidad desactivada) */}
        <div className="opacity-30 pointer-events-none filter blur-[1px]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-bold">Reducción de Ruido IA</h3>
          </div>
          <div className="h-20 bg-secondary rounded-lg mb-4" />
          <div className="h-10 bg-secondary rounded-lg w-full" />
        </div>

        <LicenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  // UI para usuarios PRO
  return (
    <div className={cn("w-full bg-card border border-border rounded-xl p-5 shadow-sm transition-all", isProcessing && "border-primary/50")}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Reducción de Ruido IA</h3>
        {processedFile && <span className="ml-auto text-xs font-bold bg-green-500/10 text-green-600 px-2 py-1 rounded-full border border-green-500/20">Procesado</span>}
      </div>

      <div className="space-y-6">
        
        {/* Controles: Solo si no está procesado todavía, o si queremos re-hacerlo */}
        <div className={cn("space-y-4", (isProcessing || processedFile) && "opacity-50 pointer-events-none")}>
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
            <span>Intensidad</span>
            <span>{strength}%</span>
          </div>
          <Slider 
            value={[strength]} 
            onValueChange={(val) => setStrength(val[0])} 
            max={100} 
            step={1} 
            disabled={isProcessing || !activeFile}
          />
        </div>

        {/* Feedback de Progreso */}
        {isProcessing && (
          <div className="animate-fast-fade space-y-2">
            <div className="flex justify-between text-xs font-bold text-primary">
              <span>{!isModelLoaded && progress < 45 ? 'Descargando y activando modelo ONNX...' : 'Inferencia de audio en curso...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive font-medium text-center animate-fast-fade">
            {error}
          </div>
        )}

        {/* Botonera de Acción */}
        {!processedFile ? (
          <Button 
            className="w-full font-bold shadow-sm" 
            onClick={handleApply}
            disabled={!activeFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando
              </>
            ) : (
              <>
                Aplicar limpieza neuronal
              </>
            )}
          </Button>
        ) : (
          <div className="flex gap-3 animate-fast-fade">
            <Button 
              variant="outline"
              className="flex-1 font-semibold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={clearProcessedFile}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Descartar
            </Button>
            <Button 
              className="flex-[2] font-semibold"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Limpio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
