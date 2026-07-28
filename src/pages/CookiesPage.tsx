/**
 * Archivo: src/pages/CookiesPage.tsx
 * Decisión técnica: Dashboard de información sobre Cookies, con acción directa para volver a abrir el banner (Opt-Out).
 * Contexto: Legal requirement for European visitors. Explicación de las variables de LocalStorage que usa el código fuente.
 * Restricciones: N/A
 * Known issues: N/A
 */
import { useCookieConsent } from '@hooks/useCookieConsent';
import { Button } from '@components/ui/button';
import { Settings2, ShieldCheck, Database, LayoutPanelTop } from 'lucide-react';

export default function CookiesPage() {
  const { openBanner } = useCookieConsent();

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 pb-32 animate-fast-fade">
      
      {/* Header Flex */}
      <div className="mb-10 border-b border-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Política de Cookies</h1>
          <p className="text-muted-foreground mt-2 font-bold text-sm">Transparencia sobre tu almacenamiento local persistente.</p>
        </div>
        <Button 
          onClick={openBanner} 
          variant="outline" 
          className="font-bold border-border shadow-sm bg-card hover:bg-secondary shrink-0"
        >
          <Settings2 className="w-4 h-4 mr-2" />
          Ajustar Consentimiento
        </Button>
      </div>

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary space-y-10 text-foreground/90 leading-relaxed font-medium text-[15px]">
        
        <section>
          <p className="lead text-lg text-foreground font-semibold border-l-4 border-primary pl-4">
            En TockAudio Studio somos ingenieros de software, no brókers de datos. Usamos tecnologías de almacenamiento del lado del cliente (Local Storage) de manera estrictamente funcional para brindarte la experiencia de un editor profesional offline.
          </p>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-foreground" />
            1. Técnicas y Esenciales (Sin Consentimiento)
          </h2>
          <p>Son variables incrustadas en el DOM que no requieren opt-in porque son necesarias para prestar el servicio del DAW.</p>
          <div className="bg-card rounded-xl border border-border overflow-hidden mt-6 shadow-sm ring-1 ring-black/5">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-foreground font-bold">
                <tr>
                  <th className="px-5 py-4 border-b border-border">Clave LocalStorage</th>
                  <th className="px-5 py-4 border-b border-border">Función</th>
                  <th className="px-5 py-4 border-b border-border">Expiración</th>
                </tr>
              </thead>
              <tbody className="font-medium text-muted-foreground divide-y divide-border/50">
                <tr className="hover:bg-secondary/10 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-primary font-bold">tockaudio_license</td>
                  <td className="px-5 py-4">Firma encriptada que te reconoce como usuario PRO para desbloquear módulos.</td>
                  <td className="px-5 py-4 italic">Persistente</td>
                </tr>
                <tr className="hover:bg-secondary/10 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-primary font-bold">tockaudio_cookie_consent</td>
                  <td className="px-5 py-4">Tu decisión final sobre este mismo panel (True/False).</td>
                  <td className="px-5 py-4 italic">12 Meses</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-foreground" />
            2. Analíticas Anónimas
          </h2>
          <p>Son secuencias de comandos livianas (Plausible o Umami Analytics) que nos permiten observar el rendimiento de los servidores de assets estáticos y ver de qué continentes provienen nuestros visitantes. Estos servicios están configurados en modo anónimo, donde la IP es irreversible y no existen cookies de seguimiento cross-site. Operan bajo tu consentimiento en el Banner.</p>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
            <LayoutPanelTop className="w-6 h-6 text-foreground" />
            3. Redes de Monetización (Google AdSense)
          </h2>
          <p>Para solventar el alto costo operativo de este software libre (modo Free), dependemos de la inserción de anuncios no intrusivos mediante Google AdSense en las landing pages informativas. Google empleará cookies convencionales para orientar publicidad si haces Opt-In.</p>
          <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl mt-6">
            <p className="text-primary font-bold text-sm m-0">Garantía: Si en el panel bloqueas el trackeo de Marketing, nuestro código suspenderá por completo la descarga de los scripts .js de Google en tu dispositivo. Tu elección es ley técnica en esta App.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">4. Destrucción Nuclear (Borrado de Navegador)</h2>
          <p>Si cambias de opinión, o simplemente quieres purgar toda existencia de nuestra App en tu ordenador, puedes forzar la limpieza manual:</p>
          <ul className="list-disc pl-6 space-y-3 text-sm font-medium mt-4 bg-secondary/20 p-6 rounded-xl border border-border">
            <li><strong>Google Chrome:</strong> Pulsa <kbd className="bg-background px-1 border border-border rounded font-mono shadow-sm">F12</kbd> (Console) {`>`} Pestaña <em>Application</em> {`>`} <em>Storage</em> {`>`} <em>Clear Site Data</em>.</li>
            <li><strong>Mozilla Firefox:</strong> Pulsa el icono del candado en la URL {`>`} <em>Limpiar cookies y datos del sitio...</em>.</li>
          </ul>
          <p className="text-xs text-red-500 font-bold mt-4">Peligro: Hacer un borrado nuclear eliminará de tu ordenador la validación PRO. Deberás volver a validar tu PC usando tu email e Invocando un Token de Recuperación de tu licencia.</p>
        </section>
      </article>
    </div>
  );
}
