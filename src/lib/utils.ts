/**
 * Archivo: src/lib/utils.ts
 * Decisión técnica: Uso de clsx y tailwind-merge para manejo dinámico de clases CSS.
 * Contexto: Función base requerida por la arquitectura de componentes de Shadcn UI.
 * Restricciones: N/A
 * Known issues: N/A
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
