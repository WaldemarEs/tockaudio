/**
 * Archivo: src/pages/StudioPage.tsx
 * Decisión técnica: Contenedor orquestador para la vista de Studio.
 * Contexto: Renderiza condicionalmente la interfaz móvil o desktop basándose en el hook useDeviceType.
 * Restricciones: No debe contener lógica de negocio ni estado de la aplicación, solo enrutamiento interno.
 * Known issues: N/A
 */
import { useDeviceType } from '@hooks/useDeviceType';
import MobileStudio from '@components/mobile/MobileStudio';
import DesktopStudio from '@components/desktop/DesktopStudio';

export default function StudioPage() {
  const { isMobile } = useDeviceType();

  return isMobile ? <MobileStudio /> : <DesktopStudio />;
}
