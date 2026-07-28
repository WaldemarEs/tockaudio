/**
 * Archivo: src/pages/AboutPage.tsx
 * Decisión técnica: Landing page estática e informativa.
 * Contexto: Informa al usuario sobre la filosofía del proyecto.
 * Restricciones: Renderiza AdBanner al final si el usuario dio consentimiento.
 * Known issues: N/A
 */
import { Link } from 'react-router-dom';
import AdBanner from '@components/ads/AdBanner';
import { Button } from '@components/ui/button';
import { Shield, Zap, Layers, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 pb-24 animate-fast-fade flex flex-col gap-12">
      
      {/* Hero Section */}
      <div className="border-b border-border pb-8 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Sobre TockAudio Studio</h1>
        <p className="text-muted-foreground mt-4 font-medium text-lg max-w-2xl">
          Devolviendo el control creativo a tu navegador. Sin servidores, sin cuentas, privacidad absoluta.
        </p>
      </div>

      {/* Main Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight text-foreground/90 font-medium leading-relaxed">
        
        <section className="mb-12">
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">Nuestra Misión</h2>
          <p>TockAudio Studio nació de una frustración común: la necesidad de realizar ediciones rápidas o aplicar limpieza inteligente a un archivo de audio sin tener que descargar programas pesados de 2GB, ni entregar tus archivos personales a servidores en la nube dudosos.</p>
          <p>La misión es simple: <strong>Privacidad y Velocidad.</strong> Creemos firmemente en el precepto de que "Tus archivos nunca salen de tu dispositivo".</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-6">Tecnología Subyacente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
              <Cpu className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2 text-foreground">Inteligencia Artificial Local</h3>
              <p className="text-sm text-muted-foreground font-medium">Usamos Transformers.js para ejecutar redes neuronales complejas de limpieza directamente sobre los núcleos de tu CPU local.</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
              <Zap className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="font-bold text-lg mb-2 text-foreground">WebAssembly (WASM)</h3>
              <p className="text-sm text-muted-foreground font-medium">FFmpeg portado al navegador permite conversiones de formato ultrarrápidas y extracción desde video, saltándose intermediarios.</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
              <Layers className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-lg mb-2 text-foreground">Web Audio API</h3>
              <p className="text-sm text-muted-foreground font-medium">Manipulación y mezcla (Mixdown) multi-pista con precisión milimétrica usando los estándares modernos de HTML5.</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
              <Shield className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="font-bold text-lg mb-2 text-foreground">Hardware Fingerprint</h3>
              <p className="text-sm text-muted-foreground font-medium">Validamos la licencia PRO anclándola criptográficamente al hardware único de tu máquina (Local Storage).</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">El Equipo</h2>
          <p>Somos un pequeño equipo (Solopreneur) apasionado por exprimir las capacidades de la web moderna al máximo. No tenemos inversores de Silicon Valley, ni dependemos de vender tus datos. La monetización es simple y ética: Anuncios limpios en las páginas informativas (si nos das permiso), y un modelo PRO de pago único por dispositivo para los usuarios hardcore.</p>
        </section>
      </article>

      {/* CTA */}
      <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl text-center shadow-inner">
        <h2 className="text-2xl font-black mb-2 text-foreground">¿Listo para probar el motor de audio?</h2>
        <p className="text-muted-foreground font-medium mb-6">Funciona mejor en navegadores basados en Chromium (Chrome, Edge, Brave).</p>
        <Link to="/studio">
          <Button size="lg" className="font-bold text-base px-8 h-12 shadow-lg hover:scale-105 transition-transform">
            Abrir el Editor →
          </Button>
        </Link>
      </div>

      {/* Monetización Ética (Condicional) */}
      <div className="mt-8 pt-8 border-t border-border">
        <AdBanner slot="0000000000" format="auto" />
      </div>

    </div>
  );
}
