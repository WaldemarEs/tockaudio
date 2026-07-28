/**
 * Archivo: src/hooks/useDeviceType.ts
 * Decisión técnica: Hook para detectar si el usuario está en móvil o desktop.
 * Contexto: Soporta la estrategia "Móvil para tareas rápidas, Desktop para trabajo profundo" (threshold: 768px).
 * Restricciones: Se usa un timeout simple (debounce) en el resize para no bloquear el hilo principal y cumplir <100ms de feedback.
 * Known issues: Durante SSR (si existiera) window no está definido, pero Vite es SPA así que es seguro.
 */
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: number;

    const handleResize = () => {
      clearTimeout(timeoutId);
      // Debounce rápido de 100ms para no penalizar el rendimiento del navegador
      timeoutId = window.setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Validación inicial

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isMobile,
    isDesktop: !isMobile
  };
}
