/**
 * Archivo: src/pages/TermsPage.tsx
 * Decisión técnica: Página estática SEO friendly basada en tipografía (Tailwind Typography/prose).
 * Contexto: Texto legal de limitación de garantías y licencias. Obligatorio por Lemon Squeezy (Merchant of Record).
 * Restricciones: Cargar en el Layout principal.
 * Known issues: N/A
 */
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 pb-32 animate-fast-fade">
      <div className="mb-10 border-b border-border pb-6">
        <h1 className="text-4xl font-black text-primary tracking-tight">Términos de Uso</h1>
        <p className="text-muted-foreground mt-2 font-medium">Última actualización: 24 de Octubre de 2026</p>
      </div>

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary space-y-10 text-foreground/90 leading-relaxed font-medium text-[15px]">
        
        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">1. Licencia de Software y Modelo de Uso</h2>
          <p className="mb-4">TockAudio Studio ofrece un modelo de licenciamiento anclado por <strong>dispositivo único</strong> (hardware fingerprint), y no por cuenta de usuario convencional. Al adquirir una licencia PRO, recibes acceso perpetuo (pago único) para utilizar funcionalidades premium en el hardware actual validado mediante criptografía RSA.</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-sm bg-secondary/10 p-5 rounded-xl border border-border">
            <li>La licencia adquirida es de uso personal y es <strong>intransferible de forma simultánea</strong>.</li>
            <li>El usuario posee el derecho técnico a realizar hasta <strong>2 reinicios (resets) de dispositivo por año natural</strong> para migrar su licencia en caso de avería, pérdida o formateo del equipo original.</li>
            <li>El intento de ingeniería inversa, bypass malicioso de tokens RSA, o falsificación de firmas anulará la licencia sin derecho a soporte ni apelación.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">2. Devoluciones (Refund Policy)</h2>
          <p>Operamos mediante <em>Lemon Squeezy</em> como nuestro Merchant of Record para procesar pagos y emitir recibos fiscales internacionales. Garantizamos una <strong>política de devolución incondicional de 14 días (Right of Withdrawal)</strong> desde la fecha exacta de transacción, en cumplimiento estricto con las directrices de la Unión Europea. Superado el día 14, las ventas se considerarán definitivas.</p>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">3. Limitación de Responsabilidad</h2>
          <p>TockAudio Studio es una arquitectura vanguardista <strong>100% Client-Side</strong>. Todo sucede en tu RAM local y CPU.</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-sm text-muted-foreground">
            <li>TockAudio no asume responsabilidad civil ni económica por la pérdida de pistas, mixes o configuraciones si el usuario cierra el navegador, agota su memoria RAM instalada, o vacía su LocalStorage sin precaución.</li>
            <li>No podemos garantizar el rendimiento de funciones exigentes (IA neuronal o Procesamiento Batch masivo) en equipos de bajas especificaciones (Low-end devices).</li>
            <li>El software se proporciona "tal cual" (As-Is), sin garantías implícitas de idoneidad para operaciones de misión crítica o transmisiones de alta resiliencia.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">4. Restricciones de Contenido</h2>
          <p>Como política inquebrantable, está totalmente <strong>prohibido</strong> emplear TockAudio Studio para procesar o manipular material de audio ligado a actividades de abuso, terrorismo, fraudes telefónicos, u operaciones penadas internacionalmente. Dado que TockAudio no posee infraestructura de subida de archivos (0% cloud), la total responsabilidad legal del audio resultante y sus consecuencias recae unívocamente sobre el operador del dispositivo.</p>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">5. Jurisdicción y Cambios</h2>
          <p>Nos reservamos el derecho de enmendar estos términos publicando las actualizaciones en esta URL. El uso continuado del Editor posterior a la notificación se entenderá como aceptación vinculante. Las disputas formales quedarán sujetas a las leyes correspondientes a nuestra jurisdicción comercial.</p>
        </section>

        {/* Legal Links Footer */}
        <section className="pt-8">
          <div className="flex flex-col gap-3 mt-4 bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-bold text-base m-0 border-none pb-2">Documentos Legales Adicionales</h3>
            <Link to="/privacy" className="text-primary font-bold hover:underline">→ Leer Política de Privacidad y Tratamiento de Datos</Link>
            <Link to="/cookies" className="text-primary font-bold hover:underline">→ Revisar la Política Específica de Cookies</Link>
          </div>
        </section>

      </article>
    </div>
  );
}
