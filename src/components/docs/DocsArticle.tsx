/**
 * Archivo: src/components/docs/DocsArticle.tsx
 * Decisión técnica: Wrapper semántico para todos los artículos SEO de la plataforma.
 * Contexto: Estandariza la tipografía (prose), inyecta los CTAs globales y el AdBanner al final sin ensuciar los contenidos.
 * Restricciones: Requiere Tailwind typography plug-in (prose) activo en tailwind.config.
 * Known issues: N/A
 */
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@components/ui/button';
import AdBanner from '@components/ads/AdBanner';

interface DocsArticleProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export default function DocsArticle({ title, lastUpdated, children }: DocsArticleProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 pb-32 animate-fast-fade">
      
      {/* Navegación Breadcrumb */}
      <Link 
        to="/docs" 
        className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Documentación
      </Link>

      {/* Cabecera del Artículo SEO */}
      <header className="mb-12 border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
          {title}
        </h1>
        {lastUpdated && (
          <p className="text-sm font-semibold text-muted-foreground mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            Última actualización: {lastUpdated}
          </p>
        )}
      </header>

      {/* Content Injection (Prose API) */}
      <article className="prose prose-neutral dark:prose-invert max-w-none 
        prose-headings:font-black prose-headings:tracking-tight 
        prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-2 prose-h2:mt-12
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-bold
        prose-img:rounded-xl prose-img:shadow-md
        prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border
        text-foreground/90 font-medium leading-relaxed text-[17px] space-y-6">
        {children}
      </article>

      {/* Footer del Artículo (CTA Loop) */}
      <div className="mt-16 bg-primary/5 border border-primary/20 p-8 rounded-2xl text-center shadow-inner relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <h3 className="text-2xl font-black mb-2 text-foreground relative z-10">¿Listo para probar el conocimiento?</h3>
        <p className="text-muted-foreground font-medium mb-6 relative z-10">Pasa de la teoría a la práctica de inmediato en nuestro editor sin servidor.</p>
        <Link to="/studio" className="relative z-10 inline-block">
          <Button size="lg" className="font-bold text-base px-8 h-12 shadow-lg hover:scale-105 transition-transform">
            <Play className="w-4 h-4 mr-2" />
            Abrir Editor Local (Gratis)
          </Button>
        </Link>
      </div>

      {/* Monetización Ética (Condicional al final del artículo) */}
      <div className="mt-12 pt-8 border-t border-border">
        <AdBanner slot="2222222222" format="auto" />
      </div>
      
    </div>
  );
}
