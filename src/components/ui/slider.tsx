/**
 * Archivo: src/components/ui/slider.tsx
 * Decisión técnica: Componente Slider nativo estilizado para parecerse al de Shadcn UI.
 * Contexto: Alternativa sin dependencias (@radix-ui/react-slider) que cumple con la estética.
 * Restricciones: Usa <input type="range" /> estandarizado de forma cross-browser lo mejor posible.
 * Known issues: El track dinámico se simula con un linear-gradient en línea.
 */
import * as React from "react"
import { cn } from "@lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
    const internalValue = value?.[0] ?? min;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.([Number(e.target.value)]);
    };

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={internalValue}
        onChange={handleChange}
        className={cn(
          "w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
            ((internalValue - min) / (max - min)) * 100
          }%, hsl(var(--secondary)) ${
            ((internalValue - min) / (max - min)) * 100
          }%, hsl(var(--secondary)) 100%)`,
        }}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
