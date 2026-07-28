/**
 * Archivo: src/components/legal/CookieBanner.tsx
 * Decisión técnica: Popup global (Modal + Fixed Bar) para recolectar el consentimiento GDPR ePrivacy.
 * Contexto: Aparecerá sobre toda la aplicación en la parte inferior si el usuario es nuevo. Incluye un Dialog de granularidad (Opt-in marketing).
 * Restricciones: Se bloquea visualmente con backdrop-blur para evitar interacciones no intencionadas en background.
 * Known issues: Al tener `z-[100]`, podría solaparse con modales defectuosos de terceros, pero es diseño previsto para priorizar legalidad.
 */
import { useState } from 'react';
import { useCookieConsent } from '@hooks/useCookieConsent';
import { Button } from '@components/ui/button';
import { ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@lib/utils';

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, updateConsent, consent } = useCookieConsent();
  const [showModal, setShowModal] = useState(false);
  
  // Estado volátil exclusivo para el Modal
  const [tempConsent, setTempConsent] = useState({
    analytics: consent.analytics,
    marketing: consent.marketing
  });

  if (!showBanner && !showModal) return null;

  const handleSaveCustom = () => {
    updateConsent({
      essential: true,
      analytics: tempConsent.analytics,
      marketing: tempConsent.marketing
    });
    setShowModal(false);
  };

  return (
    <>
      {/* 1. BARRA INFERIOR DE ACCIÓN RÁPIDA */}
      {showBanner && !showModal && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-slide-up pointer-events-none">
          <div className="mx-auto max-w-5xl bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-5 flex flex-col md:flex-row items-center gap-6 pointer-events-auto ring-1 ring-black/5">
            
            <div className="flex-1 flex gap-4 items-center">
              <ShieldCheck className="w-8 h-8 text-primary shrink-0 hidden md:block" />
              <div className="text-sm text-foreground/90 font-medium">
                <p>
                  Usamos cookies para mejorar tu experiencia en TockAudio Studio. Las esenciales están activas por defecto (guardan licencias). ¿Aceptas cookies analíticas y de marketing para ayudarnos a mantener la plataforma Free?
                </p>
                <Link to="/cookies" className="text-primary hover:underline text-xs font-bold mt-1.5 inline-block">
                  Saber más en nuestra Política de Cookies
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto justify-end">
              <Button variant="secondary" onClick={rejectAll} className="font-bold text-xs flex-1 md:flex-none">
                Solo Esenciales
              </Button>
              <Button variant="outline" onClick={() => setShowModal(true)} className="font-bold text-xs flex-1 md:flex-none bg-background shadow-sm">
                Personalizar
              </Button>
              <Button onClick={acceptAll} className="font-bold text-xs flex-1 md:flex-none shadow-md">
                Aceptar Todo
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 2. MODAL DE GRANULARIDAD (GDPR) */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fast-fade">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
            
            <div className="flex justify-between items-center p-5 border-b border-border bg-secondary/40">
              <h3 id="cookie-modal-title" className="font-black text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Preferencias de Privacidad
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} aria-label="Cerrar modal">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6 bg-background/50">
              {/* Opción A: Esenciales (Locked) */}
              <div className="flex items-start justify-between gap-4 opacity-70 grayscale">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">Cookies Esenciales (Requeridas)</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">Fundamentales para el funcionamiento de la App. Almacenan tu clave RSA de licencia y preferencias UI en LocalStorage. No pueden desactivarse.</p>
                </div>
                <div className="w-12 h-6 bg-primary/50 rounded-full flex items-center px-1 justify-end shrink-0 cursor-not-allowed">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Opción B: Analíticas */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">Estadísticas Anónimas</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">Nos permiten medir el tráfico (Plausible/Umami) sin vincular datos a tu identidad personal.</p>
                </div>
                <button 
                  onClick={() => setTempConsent(p => ({ ...p, analytics: !p.analytics }))}
                  className={cn("w-12 h-6 rounded-full flex items-center px-1 shrink-0 transition-colors cursor-pointer", tempConsent.analytics ? "bg-primary justify-end" : "bg-secondary border border-border justify-start")}
                  aria-pressed={tempConsent.analytics}
                >
                  <div className="w-4 h-4 bg-background rounded-full shadow-sm"></div>
                </button>
              </div>

              {/* Opción C: Marketing */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">Marketing & AdSense</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">Permite que proveedores como Google muestren anuncios contextuales relevantes fuera del área del Editor. Clave para financiar la versión Free.</p>
                </div>
                <button 
                  onClick={() => setTempConsent(p => ({ ...p, marketing: !p.marketing }))}
                  className={cn("w-12 h-6 rounded-full flex items-center px-1 shrink-0 transition-colors cursor-pointer", tempConsent.marketing ? "bg-primary justify-end" : "bg-secondary border border-border justify-start")}
                  aria-pressed={tempConsent.marketing}
                >
                  <div className="w-4 h-4 bg-background rounded-full shadow-sm"></div>
                </button>
              </div>
            </div>

            <div className="p-5 border-t border-border bg-secondary/30 flex gap-3 justify-end items-center">
              <Button variant="ghost" onClick={() => setShowModal(false)} className="font-bold text-xs">
                Cancelar
              </Button>
              <Button onClick={handleSaveCustom} className="font-bold shadow-md text-xs">
                Guardar preferencias
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
