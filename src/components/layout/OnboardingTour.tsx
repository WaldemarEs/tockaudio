/**
 * Archivo: src/components/layout/OnboardingTour.tsx
 * Decisión técnica: Tour guiado de 4 pasos mediante Modal superpuesto (Onboarding).
 * Contexto: Reduce la fricción inicial mostrando el mapa de valor a los nuevos usuarios.
 * Restricciones: Bloquea la interacción debajo hasta que se salta o completa. Usa localStorage como persistencia.
 * Known issues: Si el usuario limpia datos de sitio, el tour reaparecerá.
 */
import { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Sparkles, UploadCloud, SlidersHorizontal, Download, X, ArrowRight } from 'lucide-react';
import { cn } from '@lib/utils';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    title: 'Bienvenido al Futuro del Audio',
    description: 'TockAudio Studio es 100% local. Nada se sube a internet, garantizando privacidad absoluta, sin lag de servidores y una velocidad feroz.',
    icon: <Sparkles className="w-12 h-12 text-primary" />
  },
  {
    title: 'Arrastra y Suelta',
    description: 'Comienza inyectando un archivo de audio (o video) en la zona de drop superior. El motor lo decodificará instantáneamente en tu memoria RAM.',
    icon: <UploadCloud className="w-12 h-12 text-blue-500" />
  },
  {
    title: 'Rack de Efectos Atómicos',
    description: 'Utiliza nuestro algoritmo de normalización, el ecualizador analógico o la IA de reducción de ruido neuronal para masterizar en milisegundos.',
    icon: <SlidersHorizontal className="w-12 h-12 text-amber-500" />
  },
  {
    title: 'Exporta tu Master',
    description: 'Cuando el Preview Global suene perfecto, renderiza tu archivo procesado offline y descárgalo con un solo clic.',
    icon: <Download className="w-12 h-12 text-green-500" />
  }
];

export default function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onClose();
  };

  if (!isVisible && !isOpen) return null;

  const stepData = TOUR_STEPS[currentStep];

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm transition-opacity duration-300",
      isOpen ? "opacity-100" : "opacity-0"
    )}>
      <div 
        className={cn(
          "bg-card border-2 border-border shadow-2xl rounded-[2rem] p-10 max-w-lg w-full relative mx-4 transition-all duration-300 transform overflow-hidden",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

        <button 
          onClick={handleComplete}
          className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors z-10"
          aria-label="Cerrar tour"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2 relative z-10">
          <div className="mb-8 p-5 bg-secondary/80 rounded-[2rem] shadow-sm border border-border">
            {stepData.icon}
          </div>
          
          <h2 id="onboarding-title" className="text-3xl font-black text-foreground mb-4 tracking-tight">{stepData.title}</h2>
          <p className="text-muted-foreground font-medium text-lg mb-10 leading-relaxed max-w-[90%]">
            {stepData.description}
          </p>

          <div className="flex items-center gap-3 mb-10">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  idx === currentStep ? "w-10 bg-primary shadow-sm" : "w-2.5 bg-border hover:bg-muted-foreground/30 cursor-pointer"
                )}
                onClick={() => setCurrentStep(idx)}
              />
            ))}
          </div>

          <div className="flex w-full gap-4">
            <Button variant="ghost" size="lg" className="flex-1 font-bold text-muted-foreground hover:bg-secondary/50" onClick={handleComplete}>
              Saltar
            </Button>
            <Button variant="default" size="lg" className="flex-1 font-black shadow-lg" onClick={handleNext}>
              {currentStep === TOUR_STEPS.length - 1 ? '¡Comenzar a Editar!' : 'Siguiente'}
              {currentStep < TOUR_STEPS.length - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
