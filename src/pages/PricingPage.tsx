/**
 * Archivo: src/pages/PricingPage.tsx
 * Decisión técnica: Página de precios responsiva (1 a 4 columnas) con integración a LemonSqueezy.
 * Contexto: Presenta los límites del plan Free y las ventajas de los 3 tiers PRO (30, 60, 90 días).
 * Restricciones: Usa variantIds placeholders (ej. PLACEHOLDER_30D) que el usuario deberá reemplazar.
 * Known issues: AdSense aún no está implementado visualmente, solo marcado como placeholder estructural.
 */
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/button';
import PricingCard from '@components/pricing/PricingCard';
import LemonSqueezyButton from '@components/pricing/LemonSqueezyButton';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@lib/utils';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pb-24">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto pt-20 pb-16 px-6 text-center animate-fast-fade">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary mb-6">
          Planes y Precios
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          Licencia por dispositivo, sin renovación automática. Tú decides cuándo renovar.
        </p>
      </header>

      {/* Pricing Grid */}
      <main className="w-full max-w-7xl mx-auto px-6 mb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch animate-fast-fade">
          
          <PricingCard 
            planName="Free"
            price="$0"
            duration="Ilimitado en tiempo"
            features={[
              "Archivos de hasta 50 MB",
              "Máximo 3 archivos por día",
              "Soporte para 1 pista activa",
              "Exportación a WAV nativo",
              "Publicidad (AdSense)"
            ]}
            button={
              <Link to="/studio" className="w-full block">
                <Button variant="outline" size="lg" className="w-full font-semibold border-2 hover:bg-secondary">
                  Empezar gratis <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            }
          />

          <PricingCard 
            planName="PRO 30 días"
            price="$19"
            duration="30 días de acceso completo"
            features={[
              "Archivos de hasta 500 MB",
              "Extracción de Video hasta 2 GB",
              "Archivos ilimitados por día",
              "Soporte Multi-Pista",
              "Exportación Multiformato (FFmpeg)",
              "Cero publicidad",
              "Uso comercial"
            ]}
            button={<LemonSqueezyButton variantId="PLACEHOLDER_30D" planName="PRO 30 días" />}
          />

          <PricingCard 
            planName="PRO 60 días"
            price="$35"
            duration="60 días de acceso completo"
            isPopular={true}
            features={[
              "Todo lo de PRO 30 días",
              "Ahorro del 8% mensual",
              "Soporte Multi-Pista",
              "Exportación Multiformato (FFmpeg)",
              "Cero publicidad",
              "Soporte prioritario",
              "Uso comercial"
            ]}
            button={<LemonSqueezyButton variantId="PLACEHOLDER_60D" planName="PRO 60 días" />}
          />

          <PricingCard 
            planName="PRO 90 días"
            price="$49"
            duration="90 días de acceso completo"
            features={[
              "Todo lo de PRO 30 días",
              "Ahorro del 15% mensual",
              "La mejor tarifa a largo plazo",
              "Exportación Multiformato (FFmpeg)",
              "Cero publicidad",
              "Soporte prioritario",
              "Uso comercial"
            ]}
            button={<LemonSqueezyButton variantId="PLACEHOLDER_90D" planName="PRO 90 días" />}
          />

        </div>
      </main>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl mx-auto px-6 animate-fast-fade mb-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          <FaqItem 
            question="¿Cómo funciona la licencia por dispositivo?"
            answer="Tu licencia se enlaza criptográficamente al navegador y dispositivo desde el que realizas la compra. Tus archivos jamás suben a un servidor, lo que garantiza máxima privacidad, pero significa que la licencia no es transferible entre distintos ordenadores."
          />
          <FaqItem 
            question="¿Hay renovación automática?"
            answer="No. TockAudio Studio es de un solo pago por el bloque de tiempo que elijas (30, 60 o 90 días). No guardamos tu tarjeta ni te cobraremos sorpresas. Cuando termine tu periodo, simplemente vuelves al plan Free automáticamente."
          />
          <FaqItem 
            question="¿Qué pasa si mi archivo es más grande que el límite?"
            answer="Si usas el plan Free, recibirás un aviso antes de cargar si el archivo pesa más de 50 MB. En el plan PRO los límites suben drásticamente (500 MB para audio, 2 GB para video), pensados para aguantar podcasts largos de altísima calidad."
          />
          <FaqItem 
            question="¿Tienen política de reembolsos?"
            answer="Dado que TockAudio Studio es una herramienta 100% local, puedes probar todas las funciones básicas en el plan Free antes de comprar. Por esta naturaleza local e instantánea, todas las ventas son definitivas y no se ofrecen reembolsos tras la activación."
          />
        </div>
      </section>

      {/* Espacio reservado para AdSense (Placeholder) */}
      <div className="w-full max-w-5xl mx-auto p-8 border-2 border-dashed border-border bg-secondary/10 text-center rounded-xl animate-fast-fade mx-6">
        <span className="text-muted-foreground text-sm font-semibold tracking-wide">
          ESPACIO RESERVADO PARA ADSENSE (Solo visible en plan Free y tras consentir cookies)
        </span>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card transition-all hover:border-primary/50 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus:bg-secondary/20"
        aria-expanded={isOpen}
      >
        <span className="font-bold text-lg text-foreground/90">{question}</span>
        <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300 ease-out shrink-0", isOpen && "rotate-180")} />
      </button>
      <div 
        className={cn(
          "px-5 overflow-hidden transition-all duration-300 ease-in-out", 
          isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-muted-foreground leading-relaxed font-medium">{answer}</p>
      </div>
    </div>
  );
}
