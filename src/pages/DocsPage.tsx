/**
 * Archivo: src/pages/DocsPage.tsx
 * Decisión técnica: Índice tipo Grid para todos los artículos SEO de soporte.
 * Contexto: Actúa como el Sitemap visual principal para indexar contenido orgánico y guiar a los usuarios.
 * Restricciones: Depende del Router para enlaces.
 * Known issues: N/A
 */
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/button';
import AdBanner from '@components/ads/AdBanner';
import { 
  BookOpen, Play, Info, Cpu, Sparkles, Volume2, ArrowRightLeft, FileAudio, Video, HelpCircle, AlertTriangle 
} from 'lucide-react';
import { cn } from '@lib/utils';

interface ArticleCard {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const ARTICLES: ArticleCard[] = [
  {
    title: '¿Qué es TockAudio Studio?',
    description: 'Descubre nuestra filosofía de procesamiento 100% local y cero servidores.',
    path: '/docs/what-is-tockaudio',
    icon: Info
  },
  {
    title: '¿Cómo funciona el procesamiento local?',
    description: 'Un vistazo técnico a WebAssembly, Web Audio API y IA en tu navegador.',
    path: '/docs/how-local-processing-works',
    icon: Cpu
  },
  {
    title: 'Guía: Cómo limpiar ruido de fondo',
    description: 'Usa Transformers.js para aislar voces de manera profesional.',
    path: '/docs/remove-background-noise',
    icon: Sparkles,
    disabled: true
  },
  {
    title: 'Guía: Cómo normalizar volumen para podcasts',
    description: 'Evita los saltos bruscos de volumen con picos estandarizados.',
    path: '/docs/normalize-podcast-volume',
    icon: Volume2,
    disabled: true
  },
  {
    title: 'Guía: Conversión de formatos de audio',
    description: 'Pasa de WAV a MP3 o FLAC a AAC en segundos con FFmpeg.',
    path: '/docs/audio-format-conversion',
    icon: ArrowRightLeft,
    disabled: true
  },
  {
    title: 'Guía: Edición multi-pista básica',
    description: 'Aprende a apilar canales, hacer pan y exportar mezclas complejas.',
    path: '/docs/multi-track-editing',
    icon: FileAudio,
    disabled: true
  },
  {
    title: 'Guía: Extraer audio de video',
    description: 'Saca la pista de voz de un MP4 pesado sin subirlo a internet.',
    path: '/docs/extract-audio-from-video',
    icon: Video,
    disabled: true
  },
  {
    title: 'Preguntas Frecuentes (FAQ)',
    description: 'Respuestas rápidas a las dudas más comunes de la comunidad.',
    path: '/docs/faq',
    icon: HelpCircle,
    disabled: true
  },
  {
    title: 'Limitaciones del servicio',
    description: 'Lo que podemos y no podemos hacer con las APIs de los navegadores actuales.',
    path: '/docs/limitations',
    icon: AlertTriangle,
    disabled: true
  }
];

export default function DocsPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 pb-32 animate-fast-fade">
      
      {/* Header SEO */}
      <div className="mb-12 border-b border-border pb-8 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Documentación y Guías</h1>
        <p className="text-muted-foreground mt-4 font-medium text-lg max-w-2xl">
          Aprende a usar TockAudio Studio con nuestras guías paso a paso para masterizar el editor local.
        </p>
      </div>

      {/* Grid Index */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {ARTICLES.map((article, i) => {
          const Icon = article.icon;
          const CardContent = (
            <div className={cn(
              "p-6 h-full flex flex-col bg-card border border-border rounded-2xl transition-all",
              article.disabled 
                ? "opacity-60 grayscale-[50%] cursor-not-allowed bg-secondary/20" 
                : "hover:border-primary/50 hover:shadow-md cursor-pointer group"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "p-3 rounded-xl", 
                  article.disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary group-hover:scale-110 transition-transform"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                {article.disabled && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-secondary border border-border px-2 py-1 rounded text-muted-foreground shadow-sm">
                    Próximamente
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2 leading-tight">
                {article.title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground mb-4 flex-1">
                {article.description}
              </p>
              
              {!article.disabled && (
                <div className="text-primary font-bold text-sm flex items-center group-hover:underline mt-auto">
                  Leer más <BookOpen className="w-4 h-4 ml-2" />
                </div>
              )}
            </div>
          );

          if (article.disabled) {
            return <div key={i}>{CardContent}</div>;
          }

          return (
            <Link key={i} to={article.path} className="block outline-none">
              {CardContent}
            </Link>
          );
        })}
      </div>

      {/* CTA Final */}
      <div className="bg-primary/5 border border-primary/20 p-10 rounded-2xl text-center shadow-inner max-w-3xl mx-auto">
        <h2 className="text-3xl font-black mb-3 text-foreground">¿Listo para probarlo?</h2>
        <p className="text-muted-foreground font-medium mb-8">El editor está a un clic de distancia. Gratis, sin descargas, sin esperas.</p>
        <Link to="/studio">
          <Button size="lg" className="font-bold text-lg px-10 h-14 shadow-xl hover:scale-105 transition-transform">
            <Play className="w-5 h-5 mr-2" />
            Abrir el Editor →
          </Button>
        </Link>
      </div>

      {/* Monetización Ética (Condicional) */}
      <div className="mt-16 pt-8 border-t border-border">
        <AdBanner slot="3333333333" format="horizontal" />
      </div>

    </div>
  );
}
