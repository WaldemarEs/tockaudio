/**
 * Archivo: src/hooks/useLicense.ts
 * Decisión técnica: Hook unificado para reaccionar al estado de la licencia RSA en la UI.
 * Contexto: Se inicializa montándose y revalidando de fondo contra el hardware actual usando el Worker.
 * Restricciones: N/A
 * Known issues: N/A
 */
import { useState, useEffect, useCallback } from 'react';
import { licenseValidator, LicenseInfo } from '@lib/license-validator';

export interface ExtendedLicenseInfo extends LicenseInfo {
  daysRemaining?: number;
  resetsRemaining?: number;
}

export function useLicense() {
  const [licenseStatus, setLicenseStatus] = useState<ExtendedLicenseInfo>({ isValid: false, planType: 'free' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await licenseValidator.validateCurrentLicense();
      
      let daysRemaining = 0;
      if (info.expiresAt) {
        const diff = info.expiresAt.getTime() - new Date().getTime();
        daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }

      setLicenseStatus({
        ...info,
        daysRemaining,
        resetsRemaining: licenseValidator.getResetsRemaining()
      });
      
      if (info.error) setError(info.error);
    } catch (err: any) {
      setError(err.message);
      setLicenseStatus({ isValid: false, planType: 'free' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-validar contra hardware silenciosamente al montar la app/hook
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const activateLicense = async (licenseKey: string) => {
    setIsLoading(true);
    setError(null);
    const result = await licenseValidator.activateLicense(licenseKey);
    if (result.success) {
      await checkStatus(); // Refresca UI
      return true;
    } else {
      setError(result.error || "Firma de licencia inválida");
      setIsLoading(false);
      return false;
    }
  };

  const resetLicense = async () => {
    setIsLoading(true);
    setError(null);
    const result = await licenseValidator.resetLicense();
    if (result.success) {
      await checkStatus();
      return true;
    } else {
      setError(result.error || "Fallo al transferir licencia");
      setIsLoading(false);
      return false;
    }
  };

  return {
    licenseStatus,
    activateLicense,
    resetLicense,
    isLoading,
    error
  };
}
