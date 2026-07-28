/**
 * Archivo: src/components/layout/Layout.tsx
 * Decisión técnica: Wrapper general que inyecta la cabecera, el footer de enlaces legales y el Banner GDPR.
 * Contexto: Mantiene la consistencia de navegación en todas las rutas mientras aísla el cuerpo <main>.
 * Restricciones: CookieBanner intercepta UI si showBanner es true.
 * Known issues: N/A
 */
import { ReactNode } from 'react';
import Header from './Header';
import { Link } from 'react-router-dom';
import CookieBanner from '@components/legal/CookieBanner';
import { useCookieConsent } from '@hooks/useCookieConsent';
import { Sparkles } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const { openBanner } = useCookieConsent();

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Header />
      
      <main className="flex-1 flex flex-col w-full h-full">
        {children}
      </main>

      <footer className="w-full border-t border-border bg-card py-8 mt-auto z-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium text-muted-foreground">
          
          <div className="flex flex-col items-center md:items-start gap-1 text-xs">
            <p className="font-bold text-foreground">© {new Date().getFullYear()} TockAudio Studio</p>
            <p>Procesamiento 100% local. Sin subir archivos.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs">
            <Link to="/about" className="hover:text-primary transition-colors">Quiénes Somos</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contacto</Link>
            <Link to="/changelog" className="hover:text-primary transition-colors flex items-center gap-1 text-primary/90 font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Novedades
            </Link>
            <span className="w-px h-3 bg-border hidden sm:block"></span>
            <Link to="/terms" className="hover:text-primary transition-colors">Términos de Uso</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">Política de Cookies</Link>
            <span className="w-px h-3 bg-border hidden sm:block"></span>
            <button 
              onClick={openBanner}
              className="hover:text-primary transition-colors underline decoration-border underline-offset-4"
            >
              Gestionar Preferencias
            </button>
          </div>
        </div>
      </footer>

      {/* BANNER GDPR */}
      <CookieBanner />
    </div>
  );
}
