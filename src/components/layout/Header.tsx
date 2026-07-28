/**
 * Archivo: src/components/layout/Header.tsx
 * Decisión técnica: Cabecera global constante en todas las rutas con información de la licencia.
 * Contexto: Muestra navegación principal y el estado de la licencia actual (Free/PRO) dinámicamente. 
 * Restricciones: En móvil, esconde enlaces secundarios para maximizar espacio vertical para el editor.
 * Known issues: N/A
 */
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useLicenseContext } from '@context/LicenseContext';
import { Button } from '@components/ui/button';
import LicenseModal from '@components/legal/LicenseModal';
import { cn } from '@lib/utils';
import { useDeviceType } from '@hooks/useDeviceType';

export default function Header() {
  const { isPro, licenseStatus } = useLicenseContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isMobile } = useDeviceType();

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur flex-none border-b border-border bg-background/90 supports-backdrop-blur:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80" aria-label="Volver al inicio">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-extrabold text-lg">T</span>
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:inline-block text-foreground">
                TockAudio
              </span>
            </Link>

            {/* Nav Desktop */}
            {!isMobile && (
              <nav className="flex items-center gap-5 text-sm font-medium text-muted-foreground ml-4">
                <Link to="/studio" className="hover:text-primary transition-colors">Editor</Link>
                <Link to="/pricing" className="hover:text-primary transition-colors">Precios</Link>
                <Link to="/docs" className="hover:text-primary transition-colors">Docs</Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isPro ? (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setIsModalOpen(true)}
                role="button"
                aria-label="Licencia PRO activa. Clic para gestionar."
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">PRO</span>
                <span className="text-xs font-medium text-primary/80 hidden sm:inline-block border-l border-primary/20 pl-2">
                  {licenseStatus.daysRemaining} días
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground cursor-pointer hover:bg-secondary/80 border border-border transition-colors"
                  onClick={() => setIsModalOpen(true)}
                  role="button"
                  aria-label="Licencia Free actual"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Free</span>
                </div>
                <Button 
                  size="sm" 
                  variant="default"
                  className="h-8 text-xs font-bold px-3 shadow-sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  Activar PRO
                </Button>
              </div>
            )}
          </div>

        </div>
      </header>

      <LicenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
