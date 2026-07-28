/**
 * Archivo: src/components/desktop/EQGraph.tsx
 * Decisión técnica: Interfaz UI del ecualizador gráfico (Panel Studio).
 * Contexto: Muestra 10 faders de frecuencia estilo hardware analógico y un visualizador logarítmico (Canvas) de la curva.
 * Restricciones: Exclusivo para usuarios con licencia PRO activa.
 * Known issues: Input de type range vertical nativo puede renderizar diferente en algunos navegadores antiguos.
 */
import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, RefreshCcw, Download, Trash2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useEqualizer } from '@hooks/useEqualizer';
import { cn } from '@lib/utils';
import { Link } from 'react-router-dom';

export default function EQGraph({ activeFile, isProUser }: { activeFile: File | null, isProUser: boolean }) {
  const { 
    bands, 
    activePreset, 
    isProcessing, 
    frequencyResponse, 
    presets, 
    setBandGain, 
    applyPreset, 
    resetToFlat, 
    processWithEQ 
  } = useEqualizer(isProUser);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  // Lógica de Pintado: Canvas Curva EQ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frequencyResponse) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Grid (Fondo)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); // 0 dB
    ctx.moveTo(0, height * 0.1); ctx.lineTo(width, height * 0.1); // +12 dB
    ctx.moveTo(0, height * 0.9); ctx.lineTo(width, height * 0.9); // -12 dB
    ctx.stroke();

    // Curva Principal
    ctx.beginPath();
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'hsl(var(--primary))';
    ctx.shadowBlur = 12;

    const { magnitudes } = frequencyResponse;
    const step = width / magnitudes.length;
    
    for (let i = 0; i < magnitudes.length; i++) {
      const magDb = magnitudes[i];
      // Altura normalizada (mapeamos -12dB a +12dB)
      const normalizedY = height / 2 - (magDb / 12) * (height / 2);
      
      if (i === 0) ctx.moveTo(i * step, normalizedY);
      else ctx.lineTo(i * step, normalizedY);
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Limpiar sombra para evitar bleeding
  }, [frequencyResponse]);

  const handleProcess = async () => {
    if (!activeFile) return;
    
    // Decodificar el archivo original a Float32 PCM
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await activeFile.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    // Inyectar el buffer en el motor de filtros offline
    const processed = await processWithEQ(audioBuffer);
    if (processed) {
      const wavBlob = audioBufferToWavBlob(processed);
      setProcessedUrl(URL.createObjectURL(wavBlob));
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `tock_eq_${activeFile?.name || 'audio.wav'}`;
    a.click();
  };

  const handleDiscard = () => {
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setProcessedUrl(null);
  };

  // Bloqueo Gráfico Condicional (Licencia Free)
  if (!isProUser) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden h-[420px]">
        <div className="absolute inset-0 bg-secondary/10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <SlidersHorizontal className="w-12 h-12 text-muted-foreground mb-2 relative z-10" />
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-foreground">Ecualizador Gráfico (10 Bandas)</h3>
          <p className="text-sm text-muted-foreground font-medium mt-1">Herramienta de grado Mastering. Exclusiva del plan PRO.</p>
        </div>
        <Link to="/pricing" className="relative z-10 mt-2">
           <Button variant="default" className="font-bold gap-2"><Sparkles className="w-4 h-4"/> Actualizar a PRO</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6 relative">
      
      {/* HEADER: Título y Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl"><SlidersHorizontal className="w-5 h-5 text-primary" /></div>
          <h3 className="text-xl font-black text-foreground tracking-tight">Master EQ</h3>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground border-b-2 border-primary/40 shadow-sm">PRO</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.name)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                activePreset === p.name ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-foreground border-border hover:border-primary/50"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("flex flex-col gap-8 transition-opacity duration-300", (!activeFile || isProcessing) && "opacity-50 pointer-events-none")}>
        
        {/* CANVAS CURVA EQ */}
        <div className="w-full h-32 bg-[#0c0c0e] rounded-xl border border-border/80 overflow-hidden relative shadow-inner">
           <canvas ref={canvasRef} width={800} height={128} className="w-full h-full" />
           <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-1.5 px-3 text-[9px] uppercase font-black tracking-widest text-muted-foreground/40">
             <span>+12 dB</span>
             <span>0 dB</span>
             <span>-12 dB</span>
           </div>
        </div>

        {/* FADERS (SLIDERS 10-BAND) */}
        <div className="flex justify-between items-end gap-1 px-2 h-44">
          {bands.map((band, idx) => {
            const isZero = band.gain === 0;
            const isPositive = band.gain > 0;
            return (
              <div key={idx} className="flex flex-col items-center gap-3 flex-1">
                <span className={cn(
                  "text-[11px] font-black font-mono w-10 text-center transition-colors", 
                  isZero ? "text-muted-foreground" : (isPositive ? "text-primary" : "text-amber-500")
                )}>
                  {band.gain > 0 ? '+' : ''}{band.gain}
                </span>
                
                <div className="relative h-32 w-1.5 bg-secondary/80 rounded-full flex items-center justify-center">
                   {/* Track de progreso virtual */}
                   {band.gain !== 0 && (
                     <div 
                       className={cn("absolute w-1.5 rounded-full pointer-events-none", isPositive ? "bg-primary" : "bg-amber-500")}
                       style={{ 
                         bottom: isPositive ? "50%" : `${50 + (band.gain / 12) * 50}%`,
                         height: `${Math.abs(band.gain / 12) * 50}%` 
                       }}
                     />
                   )}
                   <input
                     type="range"
                     min="-12" max="12" step="0.5"
                     value={band.gain}
                     onChange={(e) => setBandGain(idx, parseFloat(e.target.value))}
                     className="absolute appearance-none w-32 h-1.5 -rotate-90 bg-transparent cursor-ns-resize [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border"
                     aria-label={`Gain for ${band.label}Hz`}
                   />
                </div>

                <span className="text-[10px] uppercase font-black tracking-wider text-foreground mt-2">{band.label}</span>
              </div>
            )
          })}
        </div>

        {/* CONTROLES INFERIORES */}
        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" size="sm" onClick={resetToFlat} className="text-muted-foreground hover:text-foreground font-bold">
            <RefreshCcw className="w-4 h-4 mr-2" /> Resetear (Flat)
          </Button>
          
          <div className="flex gap-3">
            {processedUrl ? (
              <>
                <Button variant="outline" size="sm" onClick={handleDiscard} className="font-bold border-red-500/30 text-red-500 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 mr-2" /> Descartar
                </Button>
                <Button variant="default" size="sm" onClick={handleDownload} className="font-black bg-green-600 hover:bg-green-700 text-white">
                  <Download className="w-4 h-4 mr-2" /> Guardar (.WAV)
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={handleProcess} disabled={isProcessing || !activeFile} className="font-black">
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SlidersHorizontal className="w-4 h-4 mr-2" />}
                {isProcessing ? 'Renderizando Frecuencias...' : 'Aplicar Ecualización'}
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* OVERLAY BLOQUEO SIN ARCHIVO */}
      {!activeFile && isProUser && (
         <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-2xl">
            <span className="bg-card px-5 py-3 border border-border rounded-xl text-sm font-black uppercase tracking-widest shadow-2xl text-foreground">
              Sube una pista para ecualizar
            </span>
         </div>
      )}
    </div>
  );
}

// Convertidor offline de AudioBuffer a Blob WAV 16bit estándar de la industria.
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [], sampleRate = buffer.sampleRate;
  let offset = 0, pos = 0;

  function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); 
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16); 
  setUint16(1); 
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); 
  setUint16(numOfChan * 2); 
  setUint16(16); 
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); 

  for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));

  while(offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([bufferArray], { type: "audio/wav" });
}
