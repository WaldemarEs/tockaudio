/**
 * Archivo: src/pages/docs/WhatIsTockAudioPage.tsx
 * Decisión técnica: Artículo SEO estructurado.
 * Contexto: Informa las características principales y diferenciadores de TockAudio Studio (Elevator Pitch orgánico).
 * Restricciones: Depende de DocsArticle para renderizado visual.
 * Known issues: N/A
 */
import DocsArticle from '@components/docs/DocsArticle';

export default function WhatIsTockAudioPage() {
  return (
    <DocsArticle 
      title="¿Qué es TockAudio Studio?" 
      lastUpdated="24 de Octubre de 2026"
    >
      <p className="lead text-xl text-foreground font-semibold border-l-4 border-primary pl-5">
        En una era donde cada aplicación requiere que subas tus archivos a la nube, crees una cuenta y pagues una suscripción mensual, <strong>TockAudio Studio</strong> nace como una respuesta técnica rebelde. Somos un <em>editor de audio online</em> diseñado bajo una premisa inquebrantable: <strong>procesamiento 100% local.</strong>
      </p>

      <h2>Un Estudio Profesional en tu Navegador</h2>
      <p>
        TockAudio Studio no es un simple cortador de MP3 estático. Es una suite completa (Digital Audio Workstation) que corre exclusivamente dentro de tu navegador web usando las tecnologías más punteras de HTML5, WebAssembly e Inteligencia Artificial en el edge (Local AI).
      </p>
      
      <h3>Arsenal de Herramientas</h3>
      <ul>
        <li><strong>Edición Multi-pista:</strong> Apila, mezcla, recorta y ajusta el panorama de múltiples canales de audio en un canvas de alto rendimiento a 60 FPS.</li>
        <li><strong>Conversión de Formatos (FFmpeg):</strong> Transforma archivos entre WAV, MP3, OGG, FLAC y AAC de forma instantánea mediante WebAssembly.</li>
        <li><strong>Extracción de Audio desde Video:</strong> ¿Tienes un MP4 pesado? Arrástralo. TockAudio aislará la pista de voz en segundos sin subir gigabytes de video a internet, ahorrando horas de carga.</li>
        <li><strong>Reducción de Ruido (IA Local):</strong> Elimina siseos de fondo, ventiladores y tráfico usando modelos neuronales <em>Transformers.js</em> que ejecutan inferencia silenciosa directamente en la CPU de tu máquina.</li>
        <li><strong>Procesamiento Masivo (Batch):</strong> Limpia o convierte hasta 50 archivos simultáneamente en paralelo mediante Web Workers dedicados (Exclusivo en Desktop).</li>
      </ul>

      <h2>¿Por qué elegirnos frente a la competencia tradicional?</h2>
      <p>
        Existen cientos de conversores y editores online gratuitos, pero la inmensa mayoría comparten un flujo defectuoso: te obligan a esperar a que un archivo se suba, se procese remotamente en un servidor alquilado, y luego lo vuelvas a descargar. Nosotros destrozamos este paradigma.
      </p>
      <ul>
        <li><strong>Privacidad Total Absoluta (Cero Subidas):</strong> Tus archivos <em>nunca</em> tocan nuestros servidores. El audio se lee en la memoria viva de tu dispositivo. Si procesas un archivo corporativo confidencial, nadie más en el mundo tiene acceso a él.</li>
        <li><strong>Velocidad Extrema (Sin red):</strong> Dado que eliminamos de la ecuación los tiempos de subida y bajada de tu WiFi, un archivo en bruto de 500MB se carga casi de manera instantánea.</li>
        <li><strong>Onboarding Invisible:</strong> Abres la URL y empiezas a editar en menos de 1 segundo real. No requerimos tu correo electrónico ni passwords para usar las herramientas gratuitas básicas.</li>
        <li><strong>Sin Límites Ocultos de Cuota:</strong> Tu único límite es la capacidad de la memoria RAM de tu computadora. Nosotros no te bloqueamos artificialmente prohibiéndote archivos mayores a 100MB.</li>
      </ul>

      <h2>¿Para quién está diseñado TockAudio Studio?</h2>
      <p>Nuestra arquitectura está balanceada para soportar diversos flujos de trabajo rápidos y exigentes sin la fricción del software de escritorio clásico:</p>
      <ul>
        <li><strong>Podcasters de guerrilla:</strong> Limpia el ruido de fondo, normaliza el volumen para cumplir los estándares LUFS de Spotify, y exporta en MP3 de alta fidelidad sin pagar suscripciones.</li>
        <li><strong>YouTubers y Creadores de Contenido:</strong> Extrae rápidamente fragmentos de audio o voz limpia de clips de video MP4/MOV para tus timelines.</li>
        <li><strong>Periodistas de Investigación:</strong> Procesa entrevistas sensibles sabiendo que el material nunca sale de tu disco duro, protegiendo a tus fuentes.</li>
        <li><strong>Productores y Beatmakers:</strong> Realiza pre-mezclas (mixdowns) rápidas o convierte bancos enteros de samples entre WAV y OGG sobre la marcha.</li>
      </ul>

      <h2>Cómo Empezar en 3 Pasos Tácticos</h2>
      <ol>
        <li><strong>Arrastra (Drag & Drop):</strong> Suelta tu archivo de audio crudo (o un archivo de video) en la zona principal del editor.</li>
        <li><strong>Edita (Mix & Clean):</strong> Usa el timeline táctil para recortar silencios, añade capas de efectos o activa el nodo de IA para reducción de ruido neuronal.</li>
        <li><strong>Descarga (Export):</strong> Renderiza tu mezcla instantáneamente a tu disco local de manera síncrona.</li>
      </ol>
      <p>
        ¿Estás harto de las barras de progreso lentas de "Subiendo archivo (14%)..." que dependen de tu velocidad de subida asimétrica? Bienvenido al futuro del software web distribuido.
      </p>
    </DocsArticle>
  );
}
