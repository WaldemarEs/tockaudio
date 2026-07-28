/**
 * Archivo: src/lib/audio-eq.ts
 * Decisión técnica: Motor de Ecualización Gráfica usando Web Audio API nativo.
 * Contexto: Provee una cadena de nodos BiquadFilter (Peaking) acoplados en serie para escultura de frecuencia.
 * Restricciones: Operaciones de OfflineAudioContext bloquean el hilo principal brevemente si el audio es enorme (se requiere Worker a futuro).
 * Known issues: N/A
 */
export interface EQPreset {
  name: string;
  gains: number[];
}

export const EQ_BANDS = [
  { frequency: 31, label: '31' },
  { frequency: 62, label: '62' },
  { frequency: 125, label: '125' },
  { frequency: 250, label: '250' },
  { frequency: 500, label: '500' },
  { frequency: 1000, label: '1k' },
  { frequency: 2000, label: '2k' },
  { frequency: 4000, label: '4k' },
  { frequency: 8000, label: '8k' },
  { frequency: 16000, label: '16k' }
];

export const EQ_PRESETS: EQPreset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Vocal', gains: [-2, -1, 0, 2, 4, 4, 3, 2, 0, -2] },
  { name: 'Bass Boost', gains: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble Boost', gains: [0, 0, 0, 0, 0, 0, 2, 4, 5, 6] },
  { name: 'Podcast', gains: [-3, -2, 0, 2, 3, 3, 2, 1, 0, -2] },
  { name: 'Music', gains: [2, 1, 0, -1, -2, -2, -1, 0, 1, 2] }
];

export function createEQChain(audioContext: BaseAudioContext, frequencies: number[]) {
  const filters: BiquadFilterNode[] = [];
  let prevNode: AudioNode | null = null;
  const inputNode = audioContext.createGain();

  frequencies.forEach((freq) => {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = freq;
    filter.Q.value = 1.4; // Default Q for graphic EQ
    filter.gain.value = 0;

    if (prevNode) {
      prevNode.connect(filter);
    } else {
      inputNode.connect(filter);
    }
    prevNode = filter;
    filters.push(filter);
  });

  const outputNode = audioContext.createGain();
  if (prevNode) {
    prevNode.connect(outputNode);
  } else {
    inputNode.connect(outputNode);
  }

  return { inputNode, outputNode, filters };
}

export function setBandGain(filter: BiquadFilterNode, gainDb: number, audioContext: BaseAudioContext) {
  // Aplicamos cambio suavemente para evitar clicks (ramping)
  filter.gain.linearRampToValueAtTime(gainDb, audioContext.currentTime + 0.05);
}

export function setBandQ(filter: BiquadFilterNode, q: number, audioContext: BaseAudioContext) {
  filter.Q.linearRampToValueAtTime(q, audioContext.currentTime + 0.05);
}

export function applyPreset(filters: BiquadFilterNode[], preset: EQPreset, audioContext: BaseAudioContext) {
  filters.forEach((filter, index) => {
    const gain = preset.gains[index] || 0;
    setBandGain(filter, gain, audioContext);
  });
}

export function getFrequencyResponse(audioContext: BaseAudioContext, filters: BiquadFilterNode[], frequencyCount = 100) {
  const minFreq = 20;
  const maxFreq = 20000;
  const frequencies = new Float32Array(frequencyCount);
  
  // Escala logarítmica para el eje X
  for (let i = 0; i < frequencyCount; i++) {
    const logVal = Math.log(minFreq) + (Math.log(maxFreq) - Math.log(minFreq)) * (i / (frequencyCount - 1));
    frequencies[i] = Math.exp(logVal);
  }

  // Acumular la respuesta de todos los filtros en serie
  const magResponse = new Float32Array(frequencyCount);
  magResponse.fill(1.0); // 1.0 es 0 dB en magnitud lineal
  const phaseResponse = new Float32Array(frequencyCount);
  
  const tempMag = new Float32Array(frequencyCount);
  const tempPhase = new Float32Array(frequencyCount);

  filters.forEach(filter => {
    filter.getFrequencyResponse(frequencies, tempMag, tempPhase);
    for (let i = 0; i < frequencyCount; i++) {
      magResponse[i] *= tempMag[i];
    }
  });

  // Convertir magnitud combinada a dB
  const magnitudesDb = new Float32Array(frequencyCount);
  for (let i = 0; i < frequencyCount; i++) {
    magnitudesDb[i] = 20 * Math.log10(magResponse[i]);
  }

  return { frequencies, magnitudes: magnitudesDb };
}

export async function processAudioWithEQ(audioBuffer: AudioBuffer, gains: number[]): Promise<AudioBuffer> {
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  const { inputNode, outputNode, filters } = createEQChain(offlineCtx, EQ_BANDS.map(b => b.frequency));
  
  filters.forEach((filter, index) => {
    filter.gain.value = gains[index] || 0;
  });

  source.connect(inputNode);
  outputNode.connect(offlineCtx.destination);
  source.start();

  return await offlineCtx.startRendering();
}
