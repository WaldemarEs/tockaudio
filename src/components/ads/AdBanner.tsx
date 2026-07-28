/**
 * Archivo: src/components/ads/AdBanner.tsx
 * Decisión técnica: Wrapper reactivo para Google AdSense condicionado al estado de Cookies (Marketing).
 * Contexto: Provee monetización ética sin romper el layout y respetando estrictamente GDPR ePrivacy.
 * Restricciones: Jamás debe renderizarse en /studio. Solo se activa si marketing === true.
 * Known issues: Bloqueadores de anuncios (uBlock, AdBlock) impedirán la carga, el contenedor se colapsará graciosamente.
 */
import { useEffect, useRef } from 'react';
import { useCookieConsent } from '@hooks/useCookieConsent';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const { consent } = useCookieConsent();
  const adRef = useRef<HTMLInsElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    // Si no hay consentimiento explícito, cortamos ejecución
    if (!consent.marketing) return;
    if (loaded.current) return;

    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
      loaded.current = true;
    } catch (err) {
      console.error('Error inyectando script de AdSense:', err);
    }
  }, [consent.marketing]);

  if (!consent.marketing) {
    return null; // Cumplimiento estricto: cero DOM, cero tracking
  }

  return (
    <div className={`w-full flex justify-center items-center overflow-hidden min-h-[90px] bg-secondary/10 rounded-xl transition-all ${className}`} aria-hidden="true">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-0000000000000000" // Sustituir por ID Real
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
