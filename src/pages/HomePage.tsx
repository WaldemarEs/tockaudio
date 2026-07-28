/**
 * Archivo: src/pages/HomePage.tsx
 * Decisión técnica: Landing page inicial para TockAudio Studio.
 * Contexto: Página de entrada orientada a la conversión. Diseño "Minimalismo Veloz".
 * Restricciones: En el futuro incluirá AdSense (si el usuario aceptó cookies). No incluir scripts de AdSense aún.
 * Known issues: N/A
 */
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 text-primary tracking-tight">
          TockAudio Studio
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Edita, limpia y convierte tu audio. 100% en tu navegador. Tus archivos nunca suben a internet.
        </p>
        <Link 
          to="/studio" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:opacity-90 h-11 px-8 py-2"
        >
          Abrir el Editor
        </Link>
      </div>
    </div>
  );
}
