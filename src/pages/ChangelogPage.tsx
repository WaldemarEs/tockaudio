/**
 * Archivo: src/pages/ChangelogPage.tsx
 * Decisión técnica: Interfaz de Timeline vertical responsivo para el historial de versiones.
 * Contexto: Genera confianza (Trust-building) demostrando el desarrollo continuo y activo del producto a clientes e inversores.
 * Restricciones: Depende del array estático exportado en src/data/changelog.ts.
 * Known issues: N/A
 */
import { Link } from 'react-router-dom';
import { changelog, ChangelogEntry } from '@data/changelog';
import AdBanner from '@components/ads/AdBanner';
import { Button } from '@components/ui/button';
import { Play, PlusCircle, Wrench, Bug, Trash2, Rocket, Zap, Clock, Info } from 'lucide-react';
import { cn } from '@lib/utils';

// Diccionarios semánticos para los tipos de cambio (UX)
const CHANGE_ICONS = {
  added: <PlusCircle className="w-4 h-4 text-green-500" />,
  improved: <Wrench className="w-4 h-4 text-blue-500" />,
  fixed: <Bug className="w-4 h-4 text-amber-500" />,
  removed: <Trash2 className="w-4 h-4 text-red-500" />
};

const CHANGE_COLORS = {
  added: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  improved: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  fixed: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  removed: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
};

const CHANGE_LABELS = {
  added: 'Añadido',
  improved: 'Mejorado',
  fixed: 'Corregido',
  removed: 'Eliminado'
};

// Utilidades semánticas para la escala de las versiones (SemVer)
const VERSION_STYLES = {
  major: { icon: <Rocket className="w-5 h-5 text-primary" />, badge: 'bg-primary text-primary-foreground shadow-md border border-primary' },
  minor: { icon: <Zap className="w-5 h-5 text-primary" />, badge: 'bg-primary/10 text-primary border border-primary/30' },
  patch: { icon: <Wrench className="w-5 h-5 text-muted-foreground" />, badge: 'bg-secondary text-muted-foreground border border-border' },
  announcement: { icon: <Info className="w-5 h-5 text-blue-500" />, badge: 'bg-blue-500/10 text-blue-500 border border-blue-500/30' }
};

export default function ChangelogPage() {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 pb-32 animate-fast-fade">
      
      {/* Cabecera de Página */}
      <div className="mb-16 text-center md:text-left border-b border-border pb-8 relative">
        <div className="absolute top-0 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
          Historial de Actualizaciones
        </h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
          Conoce todas las novedades, mejoras de rendimiento e iteraciones arquitectónicas que hemos inyectado en TockAudio Studio para empoderar tu flujo de trabajo local.
        </p>
      </div>

      {/* Timeline Principal (Vertical Line Layout) */}
      <div className="relative border-l-2 border-border/60 ml-4 md:ml-6 space-y-16">
        {changelog.map((entry: ChangelogEntry) => {
          const vStyle = VERSION_STYLES[entry.type];
          
          return (
            <div key={entry.version} className="relative pl-8 md:pl-12 group">
              
              {/* Timeline Dot (Node Icon) */}
              <div className="absolute -left-[17px] top-1 bg-background border-2 border-border/80 rounded-full p-1.5 shadow-sm transition-transform group-hover:scale-125 group-hover:border-primary duration-300">
                {vStyle.icon}
              </div>

              {/* Contenido de la Versión */}
              <div className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-4 mb-6">
                <span className={cn("px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-block w-max", vStyle.badge)}>
                  v{entry.version}
                </span>
                <h2 className="text-2xl font-black text-foreground">{entry.title}</h2>
                <div className="flex items-center text-sm font-bold text-muted-foreground md:ml-auto">
                  <Clock className="w-4 h-4 mr-1.5 opacity-70" />
                  {formatDate(entry.date)}
                </div>
              </div>

              {/* Lista de Cambios de esta release */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm group-hover:border-primary/30 transition-colors">
                <ul className="space-y-4">
                  {entry.changes.map((change: { type: 'added' | 'improved' | 'fixed' | 'removed'; description: string }, idx: number) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border flex items-center justify-center gap-1.5 shrink-0 mt-0.5 w-[110px]", CHANGE_COLORS[change.type])}>
                        {CHANGE_ICONS[change.type]}
                        {CHANGE_LABELS[change.type]}
                      </div>
                      <span className="text-foreground/90 font-medium text-[15px] leading-relaxed">
                        {change.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Final (Growth Loop) */}
      <div className="mt-20 bg-primary/5 border border-primary/20 p-10 rounded-3xl text-center shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/50 rounded-full blur-[50px] pointer-events-none"></div>
        
        <h3 className="text-2xl font-black mb-3 text-foreground relative z-10">¿Listo para exprimir las últimas mejoras?</h3>
        <p className="text-muted-foreground font-medium mb-8 relative z-10 max-w-xl mx-auto">
          El estudio de audio más rápido de la web está a un solo clic. Cero esperas, cero subidas, y con un 100% de potencia local.
        </p>
        <Link to="/studio" className="relative z-10 inline-block">
          <Button size="lg" className="font-black text-base px-10 h-14 shadow-xl hover:scale-[1.03] transition-transform bg-primary text-primary-foreground">
            <Play className="w-5 h-5 mr-2 fill-current" />
            Abrir el Editor Inmediatamente
          </Button>
        </Link>
      </div>

      {/* Monetización Ética (Condicional según Consentimiento) */}
      <div className="mt-16 pt-10 border-t border-border flex justify-center">
        <AdBanner slot="4444444444" format="horizontal" />
      </div>

    </div>
  );
}
