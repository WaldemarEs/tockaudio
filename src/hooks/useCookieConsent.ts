/**
 * Archivo: src/hooks/useCookieConsent.ts
 * Decisión técnica: Hook gestor de consentimientos persistente en LocalStorage.
 * Contexto: Brinda una API fácil para reactivar o desactivar scripts analíticos/publicitarios en tiempo real y controla si el Banner flota sobre la UI.
 * Restricciones: Depende del objeto window.localStorage (síncrono).
 * Known issues: Limpiar datos del sitio desatará el banner nuevamente en la siguiente visita.
 */
import { useState, useEffect } from 'react';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  consentDate: string | null;
}

const DEFAULT_CONSENT: CookieConsent = {
  essential: true, // GDPR mandate
  analytics: false,
  marketing: false,
  consentDate: null,
};

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tockaudio_cookie_consent');
      if (stored) {
        setConsent(JSON.parse(stored));
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    } catch (e) {
      console.warn('Error reading cookie consent', e);
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    newConsent.consentDate = new Date().toISOString();
    setConsent(newConsent);
    localStorage.setItem('tockaudio_cookie_consent', JSON.stringify(newConsent));
    setShowBanner(false);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      consentDate: null
    });
  };

  const rejectAll = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      consentDate: null
    });
  };

  const updateConsent = (customConsent: Omit<CookieConsent, 'consentDate'>) => {
    saveConsent({ ...customConsent, consentDate: null });
  };

  return {
    consent,
    showBanner,
    acceptAll,
    rejectAll,
    updateConsent,
    openBanner: () => setShowBanner(true)
  };
}
