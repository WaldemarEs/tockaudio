/**
 * Archivo: src/components/pricing/LemonSqueezyButton.tsx
 * Decisión técnica: Componente dedicado a inyectar el script de LemonSqueezy y gestionar el modal de checkout.
 * Contexto: Mantiene el botón de compra desacoplado. Carga el script de forma asíncrona solo si no existe.
 * Restricciones: Depende de un variantId válido en producción. Aquí usa placeholders.
 * Known issues: Bloqueadores de anuncios rígidos pueden interferir con lemon.js.
 */
import { useState, useEffect } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

interface LemonSqueezyButtonProps {
  variantId: string;
  planName: string;
  className?: string;
}

export default function LemonSqueezyButton({ variantId, planName, className }: LemonSqueezyButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si la función ya está globalmente inyectada, estamos listos
    if (window.createLemonSqueezy) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptId = 'lemonsqueezy-js';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.async = true;
    
    script.onload = () => {
      // Inicializar modal de LemonSqueezy en cuanto cargue el script
      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
        setIsScriptLoaded(true);
      }
    };
    
    script.onerror = () => {
      setError("Fallo al cargar pagos. Intenta desactivar tu bloqueador de anuncios.");
    };

    document.body.appendChild(script);
  }, []);

  const handleBuy = () => {
    if (!isScriptLoaded || !window.LemonSqueezy) {
      setError("Cargando sistema seguro de pagos... un momento.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Abrir checkout usando API v2 en modo modal (embed=1)
      window.LemonSqueezy.Url.Open(`https://tockaudio.lemonsqueezy.com/checkout/buy/${variantId}?embed=1`);
      
      // LemonSqueezy maneja su propio loading en el iframe superpuesto,
      // apagamos nuestro loader corto tras 1s.
      setTimeout(() => setIsLoading(false), 1000);
    } catch (err) {
      setError("Ocurrió un error al intentar abrir el checkout.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <Button 
        size="lg" 
        onClick={handleBuy}
        disabled={!isScriptLoaded || isLoading}
        className={cn("w-full font-bold shadow-md transition-all hover:scale-[1.02]", className)}
        aria-label={`Comprar ${planName}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Abriendo...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Comprar {planName}
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-center justify-center gap-2 text-destructive text-xs font-medium animate-fast-fade">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="text-center">{error}</span>
        </div>
      )}
    </div>
  );
}

// Declaración global para TS
declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
      };
      Setup: (options: any) => void;
    };
  }
}
