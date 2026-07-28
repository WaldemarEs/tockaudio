/**
 * Archivo: src/context/LicenseContext.tsx
 * Decisión técnica: Proveedor global de la licencia usando React Context.
 * Contexto: Envuelve la aplicación para que cualquier componente (UI y lógica) sepa si el usuario es PRO de forma instantánea.
 * Restricciones: Depende fuertemente de useLicense (que auto-valida onMount en el worker).
 * Known issues: N/A
 */
import { createContext, useContext, ReactNode } from 'react';
import { useLicense, ExtendedLicenseInfo } from '@hooks/useLicense';

interface LicenseContextType {
  licenseStatus: ExtendedLicenseInfo;
  activateLicense: (key: string) => Promise<boolean>;
  resetLicense: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  isPro: boolean;
  isFree: boolean;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const { licenseStatus, activateLicense, resetLicense, isLoading, error } = useLicense();

  const isPro = licenseStatus.isValid && licenseStatus.planType === 'pro';
  const isFree = !isPro;

  const value = {
    licenseStatus,
    activateLicense,
    resetLicense,
    isLoading,
    error,
    isPro,
    isFree
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicenseContext() {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicenseContext debe usarse dentro de un LicenseProvider');
  }
  return context;
}
