/**
 * Archivo: src/App.tsx
 * Decisión técnica: Router principal de la aplicación.
 * Contexto: Envuelve toda la jerarquía con el LicenseProvider y el Layout. Administra el sitemap local.
 * Restricciones: N/A
 * Known issues: N/A
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LicenseProvider } from '@context/LicenseContext';
import Layout from '@components/layout/Layout';

// Páginas Product Síncronas (Rápidas)
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import DocsPage from './pages/DocsPage';

// Páginas Pesadas (Lazy Loading)
const StudioPage = lazy(() => import('./pages/StudioPage'));

// Páginas Informativas y Legales
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ChangelogPage from './pages/ChangelogPage';

import './index.css';

// Componente de Carga Esqueleto (Fallback)
const PageLoader = () => (
  <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Iniciando Motor...</span>
  </div>
);

export default function App() {
  return (
    <LicenseProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/docs" element={<DocsPage />} />
            
            {/* Nuevas Rutas SEO/Información */}
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </LicenseProvider>
  );
}
