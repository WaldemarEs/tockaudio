/**
 * Archivo: src/pages/ContactPage.tsx
 * Decisión técnica: Formulario dummy y presentación visual para soporte.
 * Contexto: Punto de contacto para usuarios que necesiten ayuda (Resets de licencias o bugs).
 * Restricciones: El form no posee backend activo; recomienda enviar correo directo.
 * Known issues: N/A
 */
import { useState } from 'react';
import AdBanner from '@components/ads/AdBanner';
import { Button } from '@components/ui/button';
import { Mail, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitted(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 pb-24 animate-fast-fade flex flex-col gap-12">
      
      {/* Header */}
      <div className="border-b border-border pb-8 text-center md:text-left">
        <h1 className="text-4xl font-black text-primary tracking-tight">Contacto & Soporte</h1>
        <p className="text-muted-foreground mt-3 font-medium text-lg max-w-xl">
          Estamos aquí para ayudarte a sacar el máximo provecho a tu estación TockAudio Studio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Info Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0 shadow-sm border border-primary/20">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Correo Directo</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1 hover:text-primary transition-colors cursor-pointer">hola@tockaudio.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-secondary rounded-xl text-foreground shrink-0 border border-border shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Tiempo de Respuesta</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1">Menos de 48 horas (días laborables).</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-secondary rounded-xl text-foreground shrink-0 border border-border shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Ubicación Física</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1">Somos una entidad 100% digital sin oficinas públicas.</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            
            <h2 className="text-2xl font-black mb-6 text-foreground relative z-10">Envíanos un mensaje</h2>
            
            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-fast-fade relative z-10">
                <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" />
                <h3 className="text-xl font-black text-foreground mb-2">¡Gracias por tu mensaje!</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-sm">
                  (Por ahora esto es una demo frontend. Por favor escríbenos directamente a <strong>hola@tockaudio.com</strong> y te responderemos en breve.)
                </p>
                <Button variant="outline" className="mt-8 font-bold shadow-sm" onClick={() => setSubmitted(false)}>
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asunto</label>
                  <input
                    id="subject"
                    type="text"
                    required
                    aria-required="true"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Ej. Problema con la validación de Licencia"
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-primary outline-none transition-shadow shadow-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mensaje</label>
                  <textarea
                    id="message"
                    required
                    aria-required="true"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe en detalle tu situación..."
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none min-h-[160px] resize-y transition-shadow shadow-sm"
                  ></textarea>
                </div>
                
                <Button type="submit" className="w-full font-bold h-12 text-base shadow-md mt-4 hover:scale-[1.02] transition-transform">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Ticket
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Monetización Ética (Condicional) */}
      <div className="mt-12 pt-12 border-t border-border">
        <AdBanner slot="1111111111" format="horizontal" />
      </div>

    </div>
  );
}
