/**
 * Archivo: src/pages/docs/HowLocalProcessingWorksPage.tsx
 * Decisión técnica: Artículo SEO de arquitectura técnica y privacy-first (Trust building).
 * Contexto: Detalla el stack tecnológico tras TockAudio para generar confianza técnica en el mercado orgánico.
 * Restricciones: Depende de DocsArticle para renderizado visual.
 * Known issues: N/A
 */
import DocsArticle from '@components/docs/DocsArticle';

export default function HowLocalProcessingWorksPage() {
  return (
    <DocsArticle 
      title="¿Cómo funciona el procesamiento local?" 
      lastUpdated="24 de Octubre de 2026"
    >
      <p className="lead text-xl text-foreground font-semibold border-l-4 border-primary pl-5">
        El concepto generalizado de "aplicación web" tradicionalmente asume que tu navegador es solo un monitor tonto (Thin Client), mientras un rack de servidores en AWS hace todo el trabajo computacional pesado. <strong>TockAudio Studio invierte ese paradigma</strong> para siempre.
      </p>
      
      <p>Te explicamos, sin demasiados tecnicismos aburridos, cómo logramos convertir tu humilde navegador en un motor de audio de nivel corporativo.</p>

      <h2>Las Tecnologías Punteras que lo hacen posible</h2>
      <p>
        Para lograr procesar audio sin subir un solo kilobyte a internet (Zero-Server Architecture), hemos orquestado estándares modernos avalados por la W3C junto con revolucionarios motores de Inteligencia Artificial portados a JavaScript puro.
      </p>

      <h3>1. WebAssembly (WASM): Código nativo en la web</h3>
      <p>
        WebAssembly es un estándar de bajo nivel que permite ejecutar código pre-compilado (escrito en lenguajes salvajemente rápidos como C++ o Rust) directamente en el navegador a velocidades casi nativas. 
      </p>
      <p>
        Nosotros utilizamos <strong>FFmpeg.wasm</strong>, una versión portada por la comunidad de la herramienta de línea de comandos de tratamiento de audio más respetada del planeta. Gracias a la magia de WASM, tu navegador puede transcodificar archivos, decodificar el contenedor de un MP4 o comprimir un MP3 usando el procesador en bruto de tu PC, saltándose por completo las limitaciones de rendimiento de JavaScript convencional.
      </p>

      <h3>2. Web Audio API: Mezcla microscópica</h3>
      <p>
        Es una API nativa incrustada en HTML5 diseñada para procesar, espacializar y sintetizar audio en aplicaciones web con una latencia nula. TockAudio explota esta API para generar un poderoso <em>OfflineAudioContext</em> invisible que se encarga de renderizar tu mezcla multi-pista en tiempo irreal (más rápido que la reproducción normal), aplicando algoritmos de paneo (Pan), ganancia algorítmica (Gain Nodes) y crossfades matemáticamente perfectos.
      </p>

      <h3>3. Transformers.js (Edge IA Local)</h3>
      <p>
        La limpieza de ruido inteligente de TockAudio PRO funciona mediante inferencia de redes neuronales avanzadas. Usualmente, las apps comerciales requerirían enviar tus clips de voz a una API en la nube (como OpenAI o Google Cloud) para procesarla y devolvértela, vulnerando tu privacidad y gastando ancho de banda masivo.
      </p>
      <p>
        En su lugar, hemos implementado <strong>Transformers.js</strong> sobre la tecnología <strong>ONNX Runtime Web</strong>. Descargamos (sólo la primera vez) un modelo neuronal compacto directamente a la caché interna de tu navegador (IndexedDB) y forzamos a los núcleos lógicos de tu procesador (CPU multi-threading) a limpiar el ruido matemáticamente. Tu clip jamás viaja a través del router inalámbrico.
      </p>

      <h3>4. Web Workers: Multitarea asíncrona</h3>
      <p>
        Procesar gigabytes de audio en crudo es asfixiante para cualquier sistema. Para evitar que la interfaz de usuario se congele temporalmente (lo que te impediría hacer clic en botones o mover el Playhead del timeline mientras exportas), enviamos estas tareas pesadas a un batallón de <strong>Web Workers</strong>. Son hilos (threads) de procesamiento aislado que trabajan en las sombras en segundo plano, permitiendo que funciones como el Batch Processing (limpieza de 50 archivos de golpe) ocurra sin interrupciones.
      </p>

      <h2>El Flujo de Trabajo Local (Análisis Visual)</h2>
      <p>Entender este flujo secuencial te ayudará a apreciar la radical ventaja en seguridad y rendimiento de nuestro ecosistema:</p>
      <ol>
        <li><strong>Lectura Ciega en Memoria:</strong> Arrastras tu archivo al cuadro. El navegador simplemente lee los bits magnéticos desde tu disco duro directamente a su segmento RAM seguro (usando la File/Blob API), pero se abstiene de abrir un socket de red.</li>
        <li><strong>Descompresión Inmediata:</strong> El motor FFmpeg.wasm decodifica tu archivo MP3/WAV a un buffer PCM nativo puro para poder dibujarlo visualmente en el canvas en milisegundos.</li>
        <li><strong>Ejecución Paralela:</strong> Mueves trozos de audio, mutas un canal, o activas el denoiser neuronal. Todo es matemática ejecutada localmente en microsegundos por tu tarjeta madre.</li>
        <li><strong>Empaquetado (Exportación):</strong> Al renderizar la mezcla, el mixdown se empaqueta en un Blob que tu navegador te "descarga" internamente, creando el archivo final directamente en tu carpeta de Descargas.</li>
      </ol>

      <h2>Batalla Arquitectónica: Nube vs Edge Local</h2>
      <div className="bg-card rounded-xl border border-border overflow-hidden my-10 shadow-sm ring-1 ring-black/5">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/40 text-foreground font-bold">
            <tr>
              <th className="px-5 py-4 border-b border-border">Métrica Crítica</th>
              <th className="px-5 py-4 border-b border-border text-primary font-black">TockAudio (100% Edge Local)</th>
              <th className="px-5 py-4 border-b border-border text-muted-foreground">Editor Clásico en la Nube</th>
            </tr>
          </thead>
          <tbody className="font-medium text-foreground/80 divide-y divide-border/50">
            <tr className="hover:bg-secondary/10 transition-colors">
              <td className="px-5 py-4 font-bold bg-secondary/5 border-r border-border/30">Seguridad y Privacidad</td>
              <td className="px-5 py-4">Totalmente Absoluta (Cero Servidores)</td>
              <td className="px-5 py-4 text-red-500">Baja (Dependes de bases de datos ajenas)</td>
            </tr>
            <tr className="hover:bg-secondary/10 transition-colors">
              <td className="px-5 py-4 font-bold bg-secondary/5 border-r border-border/30">Velocidad de Carga inicial</td>
              <td className="px-5 py-4 text-green-500 font-bold">Inmediata (Cero Network Latency)</td>
              <td className="px-5 py-4 text-red-500">Lenta (Dependes al 100% de tu router y WiFi)</td>
            </tr>
            <tr className="hover:bg-secondary/10 transition-colors">
              <td className="px-5 py-4 font-bold bg-secondary/5 border-r border-border/30">Límites y Paywalls de Peso</td>
              <td className="px-5 py-4">Ilimitado (Escalado por la RAM de tu PC)</td>
              <td className="px-5 py-4 text-red-500">Muros de pago al superar cuotas de 50MB o 200MB</td>
            </tr>
            <tr className="hover:bg-secondary/10 transition-colors">
              <td className="px-5 py-4 font-bold bg-secondary/5 border-r border-border/30">Ejecución de Inferencia IA</td>
              <td className="px-5 py-4 text-primary">Aprovecha la CPU/GPU ociosa local</td>
              <td className="px-5 py-4 text-amber-500">Coste computacional centralizado en granjas remotas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>La Realidad: Limitaciones de Nuestra Arquitectura</h2>
      <p>
        Ser brutalmente transparentes es parte de nuestra ética como desarrolladores. Al transferirte todo el poder de cómputo a tus manos, pasamos a depender orgánicamente de la salud del hardware de tu dispositivo. 
      </p>
      <p>
        Si utilizas una laptop muy antigua (Low-end device) o una tablet económica, la inferencia de la Inteligencia Artificial (Reducción de Ruido) tardará notablemente más tiempo en compilar los fotogramas de audio de lo que tardaría un servidor gigante con GPUs dedicadas de Nvidia de un producto corporativo masivo de pago. Adicionalmente, manipular pistas absurdamente largas (más de 3 horas de audio consecutivo) o intentar realizar envíos a 10 pistas cruzadas simultáneamente puede llegar a causar un Out-Of-Memory (OOM) matando temporalmente la pestaña de tu navegador al saturar la memoria VRAM disponible.
      </p>
      <p>
        Para el 98% de los flujos de trabajo convencionales (podcasts, loops, samples y limpieza de clips de YouTube), TockAudio brillará. Además, para aprovechar plenamente estas APIs crudas, recomendamos usar exclusivamente navegadores modernos basados en el ecosistema <strong>Chromium</strong> (Google Chrome, Microsoft Edge, Brave Browser) o Firefox en su versión más actual. Safari en iOS puede presentar limitaciones técnicas estrictas por las políticas restrictivas de Apple sobre memoria WebAssembly.
      </p>
    </DocsArticle>
  );
}
