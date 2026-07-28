/**
 * Archivo: src/components/audio/NormalizationPanel.tsx
 * Decisión técnica: Dashboard UI táctil para la Normalización (Podcast Master).
 * Contexto: Brinda una visual de los niveles actuales (dBFS / LUFS) y permite ecualizar la potencia total.
 * Restricciones: Depende de un `activeFile` crudo.
 * Known issues: N/A
 */
import { useState, useEffect } from 'react';
import { useNormalization } from '@hooks/useNormalization';
import { Button } from '@components/ui/button';
import { Gauge, Download, RotateCcw, Loader2, Info } from 'lucide-react';
import { cn } from '@lib/utils';

interface NormalizationPanelProps {
  activeFile: File | null;
}

export default function NormalizationPanel({ activeFile }: NormalizationPanelProps) {
  const { normalize, measureFile, isProcessing, progress, error, measurements } = useNormalization();
  const [mode, setMode] = useState<'peak' | 'lufs'>('peak');
  const [targetPeak, setTargetPeak] = useState(-1);
  const [targetLUFS, setTargetLUFS] = useState(-16);
  const [processedFile, setProcessedFile] = useState<File | null>(null);

  // Escucha activa de archivo inyectado para medir
  useEffect(() => {
    if (activeFile) {
      setProcessedFile(null); // Purga de caché local
      measureFile(activeFile);
    }
  }, [activeFile, measureFile]);

  const handleApply = async () => {
    if (!activeFile) return;
    const result = await normalize(activeFile, mode, { 
      targetPeakDb: targetPeak, 
      targetLUFS: targetLUFS 
    });
    if (result) {
      setProcessedFile(result);
      measureFile(result); // Medir el output generado para feedback UX
    }
  };

  const handleDownload = () => {
    if (!processedFile) return;
    const url = URL.createObjectURL(processedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = processedFile.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500); // Cleanup safe
  };

  // Termómetro semántico
  const getColorByLufs = (lufs: number) => {
    if (lufs >= -18 && lufs <= -12) return 'text-green-500'; // Sweet spot podcast
    if (lufs > -12) return 'text-red-500'; // Clipping / Distorsión YouTube
    return 'text-amber-500'; // Muy silencioso
  };

  const getColorByPeak = (peak: number) => {
    if (peak > -0.2) return 'text-red-500'; // Riesgo Clipping
    if (peak >= -3) return 'text-green-500'; // Nivel Comercial
    return 'text-muted-foreground'; // Silencioso
  };

  return (
    <div className={cn(
      "w-full bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl transition-all animate-fast-fade relative overflow-hidden",
      !activeFile && "opacity-50 pointer-events-none grayscale-[50%]"
    )}>
      
      {/* Background Decorator */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Panel */}
      <div className="flex items-center gap-3 border-b border-border pb-4 mb-6 relative z-10">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Gauge className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Normalización (Master)</h2>
      </div>

      {/* Bloqueo Estado Vacío */}
      {!activeFile && (
        <div className="text-center py-10 bg-secondary/30 rounded-xl border border-border border-dashed relative z-10">
          <p className="text-muted-foreground font-bold text-sm">Carga o arrastra un archivo de audio para analizar sus métricas sonoras.</p>
        </div>
      )}

      {activeFile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          
          {/* Columna Izquierda: Monitorización Telemetría */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-2">Lectura Espectral</h3>
            
            {measurements ? (
              <div className="bg-secondary/40 rounded-xl p-5 border border-border space-y-4 shadow-inner">
                <div className="flex justify-between items-center text-sm border-b border-border/50 pb-3">
                  <span className="font-bold text-muted-foreground">Pico Absoluto True-Peak</span>
                  <span className={cn("font-black font-mono text-base bg-background px-2 py-1 rounded shadow-sm border border-border/50", getColorByPeak(measurements.peakDb))}>
                    {measurements.peakDb.toFixed(1)} dB
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-border/50 pb-3">
                  <span className="font-bold text-muted-foreground">Loudness (Proxy RMS)</span>
                  <span className={cn("font-black font-mono text-base bg-background px-2 py-1 rounded shadow-sm border border-border/50", getColorByLufs(measurements.lufs))}>
                    {measurements.lufs.toFixed(1)} LUFS
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground">Headroom Disponible</span>
                  <span className="font-black text-foreground font-mono bg-background px-2 py-1 rounded shadow-sm border border-border/50">
                    {measurements.headroom.toFixed(1)} dB
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/30 rounded-xl border border-border flex items-center justify-center h-[160px] shadow-inner">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <span className="text-xs font-bold text-muted-foreground">Analizando espectro...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <Info className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
          </div>

          {/* Columna Derecha: Motor de Comando */}
          <div className="space-y-6 flex flex-col justify-between">
            
            {/* Toggle Tipo Motor */}
            <div className="flex bg-secondary p-1.5 rounded-lg border border-border shadow-sm">
              <button
                className={cn(
                  "flex-1 py-2 text-xs font-black rounded-md transition-colors uppercase tracking-wider",
                  mode === 'peak' ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode('peak')}
                disabled={isProcessing || processedFile !== null}
              >
                Pico
              </button>
              <button
                className={cn(
                  "flex-1 py-2 text-xs font-black rounded-md transition-colors uppercase tracking-wider",
                  mode === 'lufs' ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode('lufs')}
                disabled={isProcessing || processedFile !== null}
              >
                LUFS (Podcasts)
              </button>
            </div>

            {/* Configuración Dinámica */}
            {!processedFile ? (
              <div className="space-y-6 animate-fast-fade bg-background border border-border/50 p-5 rounded-xl shadow-sm">
                
                {mode === 'peak' && (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground font-medium">Ajusta la ganancia para que el punto más ruidoso de la pista aterrice en el objetivo.</p>
                    <div className="flex justify-between items-center text-sm font-bold bg-secondary/50 p-2 rounded-lg border border-border">
                      <span>Objetivo Digital:</span>
                      <span className="text-primary font-black text-lg">{targetPeak} dB</span>
                    </div>
                    <input 
                      type="range" min="-6" max="0" step="0.5" 
                      value={targetPeak} 
                      onChange={(e) => setTargetPeak(parseFloat(e.target.value))}
                      className="w-full accent-primary cursor-grab active:cursor-grabbing"
                      disabled={isProcessing}
                    />
                  </div>
                )}

                {mode === 'lufs' && (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground font-medium">Ecualiza la energía sonora total de tu podcast para igualar el estándar corporativo.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => setTargetLUFS(-14)} className="font-bold text-xs bg-red-500/5 hover:bg-red-500/10 border-red-500/20 text-red-500">YouTube (-14)</Button>
                      <Button variant="outline" size="sm" onClick={() => setTargetLUFS(-16)} className="font-bold text-xs bg-green-500/5 hover:bg-green-500/10 border-green-500/20 text-green-500">Spotify (-16)</Button>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold bg-secondary/50 p-2 rounded-lg border border-border mt-3">
                      <span>Objetivo LUFS:</span>
                      <span className="text-primary font-black text-lg">{targetLUFS}</span>
                    </div>
                    <input 
                      type="range" min="-24" max="-10" step="1" 
                      value={targetLUFS} 
                      onChange={(e) => setTargetLUFS(parseFloat(e.target.value))}
                      className="w-full accent-primary cursor-grab active:cursor-grabbing"
                      disabled={isProcessing}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleApply} 
                  disabled={isProcessing || !measurements}
                  className="w-full font-black shadow-lg h-12 text-sm mt-4 hover:scale-[1.02] transition-transform"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Computando Buffer ({progress}%)...</>
                  ) : (
                    "Renderizar Normalización"
                  )}
                </Button>
              </div>
            ) : (
              // Actions on Processed (Post-Render)
              <div className="space-y-4 animate-fast-fade flex flex-col justify-center h-full bg-green-500/5 p-6 rounded-xl border border-green-500/20">
                <h3 className="font-black text-green-600 text-center mb-2">¡Pista Renderizada con Éxito!</h3>
                <Button 
                  onClick={handleDownload} 
                  className="w-full font-black h-12 shadow-lg bg-green-600 hover:bg-green-700 text-white hover:scale-[1.02] transition-transform"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Descargar Archivo WAV
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setProcessedFile(null);
                    measureFile(activeFile);
                  }}
                  className="w-full text-xs font-bold text-muted-foreground hover:text-red-500 bg-background border border-border"
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  Deshacer y Restaurar Mix
                </Button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
