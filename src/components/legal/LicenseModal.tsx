/**
 * Archivo: src/components/legal/LicenseModal.tsx
 * Decisión técnica: Modal aislado para la inyección de claves de producto y resolución de conflictos de hardware.
 * Contexto: Atrapa el error DISPOSITIVO_DIFERENTE y propone un reset local amigable al usuario.
 * Restricciones: Debe montarse alto en el árbol de componentes o controlarse mediante Zustand si se desea abrir desde cualquier lado.
 * Known issues: Accesibilidad (focus-trap) simplificada; el escape-key listener está montado de forma rudimentaria.
 */
import { useState, useEffect } from 'react';
import { X, KeyRound, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useLicense } from '@hooks/useLicense';
import { cn } from '@lib/utils';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseActivated?: () => void;
}

export default function LicenseModal({ isOpen, onClose, onLicenseActivated }: LicenseModalProps) {
  const { licenseStatus, activateLicense, resetLicense, isLoading, error } = useLicense();
  const [licenseKey, setLicenseKey] = useState('');

  // Limpiar input al abrir
  useEffect(() => {
    if (isOpen) setLicenseKey('');
  }, [isOpen]);

  // Listener para cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;
    const success = await activateLicense(licenseKey.trim());
    if (success && onLicenseActivated) {
      // Pequeña pausa para deleite visual antes de cerrar
      setTimeout(() => {
        onClose();
        onLicenseActivated();
      }, 1500);
    }
  };

  const handleReset = async () => {
    const success = await resetLicense();
    if (success && onLicenseActivated) {
      setTimeout(() => {
        onClose();
        onLicenseActivated();
      }, 1500);
    }
  };

  const isDeviceError = error === "DISPOSITIVO_DIFERENTE";
  const displayError = isDeviceError ? "Esta licencia fue registrada originalmente en otro navegador o dispositivo." : error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fast-fade p-4">
      
      {/* Background Clickeable para cerrar */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      
      {/* Contenedor Modal */}
      <div 
        className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <h2 id="modal-title" className="text-xl font-bold text-foreground">Activar Licencia PRO</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Feedback de Éxito si ya es válido */}
          {licenseStatus.isValid && !error ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 animate-fast-fade text-center">
              <CheckCircle2 className="w-16 h-16 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">¡Licencia Activa!</h3>
              <p className="text-muted-foreground font-medium text-lg">
                Plan {licenseStatus.planType.toUpperCase()} - {licenseStatus.daysRemaining} días restantes.
              </p>
            </div>
          ) : (
            <>
              {/* Formulario de Activación */}
              <div className="flex flex-col gap-2">
                <label htmlFor="license-input" className="text-sm font-semibold text-foreground">
                  Pega tu clave de licencia criptográfica
                </label>
                <input
                  id="license-input"
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="eyJhbGciOiJSUzI1NiI..."
                  className="w-full h-12 px-4 rounded-lg border border-input bg-background text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              {/* Manejo amigable de Errores y Transferencias (Resets) */}
              {displayError && (
                <div className="flex flex-col gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-fast-fade shadow-inner">
                  <div className="flex items-start gap-3 text-destructive">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{displayError}</span>
                  </div>
                  
                  {isDeviceError && (
                    <div className="mt-2 flex flex-col items-start gap-3 border-t border-destructive/20 pt-4">
                      <span className="text-xs font-semibold text-destructive/90">
                        ¿Quieres transferir la licencia a este navegador? ({licenseStatus.resetsRemaining} transferencias restantes este año)
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleReset}
                        disabled={isLoading || (licenseStatus.resetsRemaining || 0) <= 0}
                        className="w-full sm:w-auto font-bold border-destructive/40 hover:bg-destructive hover:text-destructive-foreground transition-all"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Transferir a este dispositivo
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Botón Principal */}
              <Button 
                size="lg" 
                onClick={handleActivate}
                disabled={isLoading || !licenseKey.trim()}
                className="w-full font-bold h-12 shadow-md text-base transition-all hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Validando firma criptográfica...
                  </>
                ) : (
                  "Activar Licencia"
                )}
              </Button>
            </>
          )}

          {/* Información Adicional Footer */}
          <div className="flex flex-wrap items-center justify-between pt-5 border-t border-border gap-3 text-xs font-medium text-muted-foreground">
            <span className="px-2 py-1 rounded bg-secondary/50">Plan: <strong className="text-foreground">{licenseStatus.planType.toUpperCase()}</strong></span>
            {licenseStatus.daysRemaining !== undefined && (
              <span className="px-2 py-1 rounded bg-secondary/50">Quedan: <strong className="text-foreground">{licenseStatus.daysRemaining} días</strong></span>
            )}
            <span className="px-2 py-1 rounded bg-secondary/50">Transferencias: <strong className="text-foreground">{licenseStatus.resetsRemaining}/2</strong></span>
          </div>

        </div>
      </div>
    </div>
  );
}
