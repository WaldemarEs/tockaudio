/**
 * Archivo: src/pages/PrivacyPage.tsx
 * Decisión técnica: Documento legal para GDPR / CCPA.
 * Contexto: Informa al cliente que el sistema es Serverless para su audio, y que el único trackeo real es el email en LemonSqueezy.
 * Restricciones: UI unificada con las otras páginas legales.
 * Known issues: N/A
 */
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 pb-32 animate-fast-fade">
      <div className="mb-10 border-b border-border pb-6">
        <h1 className="text-4xl font-black text-primary tracking-tight">Política de Privacidad</h1>
        <p className="text-muted-foreground mt-2 font-medium">Transparencia radical sobre cómo TockAudio maneja los datos.</p>
      </div>

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary space-y-10 text-foreground/90 leading-relaxed font-medium text-[15px]">
        
        {/* Banner Hero Privacy */}
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl my-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="text-2xl font-black text-primary mt-0 mb-3 relative z-10">TL;DR: Nunca alojamos ni escuchamos tu audio</h3>
          <p className="mb-0 text-sm font-semibold relative z-10 text-foreground/80 leading-relaxed">
            TockAudio Studio está diseñado meticulosamente bajo la arquitectura <em>Client-Side Processing</em>. Los motores de renderizado y redes neuronales se ejecutan dentro del hardware de tu dispositivo utilizando Web Workers locales. <strong>Nosotros no tenemos servidores donde subas contenido. El audio que editas no sale de tu RAM.</strong>
          </p>
        </div>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">1. Recopilación de Datos (App Local)</h2>
          <p className="font-bold mb-3 text-foreground">Datos Técnicos Operacionales:</p>
          <p>De forma autónoma, la aplicación calculará un <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs mx-1">Browser_Fingerprint</span> (Hashed ID) con el fin único de vincular criptográficamente las firmas RSA (tu licencia comprada) y prevenir pirateo masivo. Estos identificadores se almacenan como simples tokens binarios sin asociación a tu nombre ni email.</p>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">2. Datos de Facturación (Third-Party)</h2>
          <p>Cuando adquieres TockAudio PRO, el proceso de *Checkout* y facturación global (VAT/Tax) es controlado exclusivamente por <a href="https://www.lemonsqueezy.com" target="_blank" rel="noopener noreferrer">Lemon Squeezy</a> (nuestro Merchant of Record oficial).</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-sm">
            <li><strong>Lemon Squeezy recopilará:</strong> Tu email, nombre (si lo provees), país de origen (para cálculo de impuestos) y detalles del método de pago de forma encriptada.</li>
            <li><strong>TockAudio Studio solo almacena:</strong> Tu email asociado, que actúa como puente para poder enviarte los resets (reinicios) de licencias en el futuro si cambias de ordenador. Jamás guardamos tarjetas bancarias.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">3. Analíticas Anónimas y Publicidad</h2>
          <p>Por defecto, somos ciegos ante el uso que le das al editor. Las herramientas analíticas que utilizamos operan por aglomeración anónima. Sin embargo, en las landing pages y artículos (jamás dentro del Editor Studio) es posible que utilicemos <strong>Google AdSense</strong> para solventar los gastos de dominio si tú nos otorgas el consentimiento en el Banner de Cookies.</p>
          <div className="mt-6 bg-secondary/40 p-5 rounded-xl border border-border">
            <Link to="/cookies" className="text-primary font-bold hover:underline flex items-center gap-2">
              <span>Revisa y administra tus Cookies aquí</span> →
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">4. Tus Derechos de Borrado (GDPR)</h2>
          <p>La belleza de no tener un servidor de usuarios tradicional es que tú controlas tus datos primarios. Si deseas eliminar tu existencia del Editor, purga el almacenamiento local de la caché del navegador. </p>
          <p className="mt-3">Si compraste una licencia y deseas solicitar el Derecho al Olvido (eliminación del registro de email y recibos), procesaremos la solicitud escalándola a las APIs de Lemon Squeezy en el marco de tiempo legal europeo.</p>
        </section>

        <section>
          <h2 className="text-2xl border-b border-border/50 pb-2 mb-4">5. Cómo Contactarnos</h2>
          <p>Para preguntas, ejercer derechos GDPR/CCPA o solicitar reembolsos aplicables, envíanos un correo directamente a <a href="mailto:privacy@tockaudio.com" className="font-bold bg-secondary/50 px-2 py-1 rounded">privacy@tockaudio.com</a>. Nuestro tiempo de respuesta oscila entre las 24 y 72 horas hábiles.</p>
        </section>

      </article>
    </div>
  );
}
