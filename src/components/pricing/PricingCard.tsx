/**
 * Archivo: src/components/pricing/PricingCard.tsx
 * Decisión técnica: Tarjeta presentacional reutilizable para mantener consistencia en la grilla de precios.
 * Contexto: Acepta children/ReactNode (button) para inyectar flexiblemente el botón (router link vs lemon squeezy).
 * Restricciones: N/A
 * Known issues: N/A
 */
import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@lib/utils';

interface PricingCardProps {
  planName: string;
  price: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
  button: ReactNode;
}

export default function PricingCard({ planName, price, duration, features, isPopular, button }: PricingCardProps) {
  return (
    <div className={cn(
      "relative flex flex-col p-6 bg-card rounded-2xl transition-all duration-300",
      isPopular 
        ? "border-2 border-primary shadow-lg scale-100 lg:scale-[1.03] z-10" 
        : "border border-border shadow-sm hover:shadow-md hover:border-primary/50"
    )}>
      {isPopular && (
        <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
          <span className="bg-primary text-primary-foreground text-xs font-extrabold uppercase tracking-widest py-1 px-4 rounded-full shadow-sm">
            Más Popular
          </span>
        </div>
      )}

      <div className="mb-6 mt-2">
        <h3 className="text-xl font-bold text-foreground mb-2">{planName}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-foreground">{price}</span>
          {price !== "$0" && <span className="text-muted-foreground text-sm font-medium">/ pago único</span>}
        </div>
        <p className="text-sm font-medium text-muted-foreground mt-2">{duration}</p>
      </div>

      <div className="flex-1">
        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-foreground/90 font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        {button}
      </div>
    </div>
  );
}
