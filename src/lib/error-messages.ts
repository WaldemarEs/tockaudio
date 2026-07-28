/**
 * Archivo: src/lib/error-messages.ts
 * Decisión técnica: Diccionario centralizado de errores operativos.
 * Contexto: Estandariza la respuesta de la UI ante fallos (OOM, decodificación, licencias), haciéndolos educativos y no punitivos (UX).
 * Restricciones: N/A
 * Known issues: N/A
 */

export const errorMessages = {
  fileTooLarge: (limit: string) => ({
    title: 'Archivo demasiado grande',
    message: `Tu archivo supera el límite de ${limit}. Los archivos extremadamente grandes pueden ahogar la memoria de tu navegador local.`,
    suggestion: 'Intenta comprimirlo primero o actualiza a PRO para acceder al procesamiento en lotes de archivos pesados.'
  }),
  unsupportedFormat: (format: string) => ({
    title: 'Formato no soportado',
    message: `Lamentablemente, el formato ${format} no está soportado por nuestro motor WASM actualmente.`,
    suggestion: 'Usa formatos estandarizados: WAV, MP3, OGG, FLAC, AAC. O extrae audio de videos MP4/MOV.'
  }),
  dailyLimitReached: () => ({
    title: 'Límite de procesamiento alcanzado',
    message: 'Has procesado el máximo de archivos diarios permitidos en el plan gratuito.',
    suggestion: 'Actualiza a PRO por una licencia única para desbloquear el poder de Edge Computing ilimitado.'
  }),
  conversionFailed: () => ({
    title: 'Error catastrófico en la conversión',
    message: 'No pudimos recodificar tu archivo. El códec interno podría estar corrupto o usar un perfil no estándar.',
    suggestion: 'Verifica la integridad del archivo original e intenta procesarlo en otro formato de destino.'
  }),
  aiModelLoadFailed: () => ({
    title: 'Fallo al cargar el cerebro de la IA',
    message: 'No pudimos instanciar el modelo Transformers de reducción de ruido debido a una caída de red o falta de RAM.',
    suggestion: 'Revisa tu conexión a internet (solo se descarga la primera vez) y cierra pestañas pesadas para liberar memoria.'
  }),
  memoryError: () => ({
    title: 'Memoria insuficiente (OOM)',
    message: 'Tu navegador se ha quedado sin memoria de trabajo (RAM) para montar este buffer PCM.',
    suggestion: 'Cierra otras aplicaciones. Para producción musical local, recomendamos un mínimo de 8GB de RAM.'
  }),
  licenseInvalid: () => ({
    title: 'Licencia criptográfica inválida',
    message: 'La clave de licencia RSA que ingresaste ha sido manipulada, ha caducado o no se pudo decodificar.',
    suggestion: 'Asegúrate de copiar el bloque completo del correo. Si persiste, recupérala desde tu panel de Lemon Squeezy.'
  }),
  deviceMismatch: () => ({
    title: 'Desajuste de Fingerprint',
    message: 'Esta clave RSA ya se encuentra registrada en otro dispositivo y navegador.',
    suggestion: 'Puedes transferir la licencia haciendo clic en "Resetear Hardware" (consumirá 1 de tus 2 reseteos anuales permitidos).'
  })
};

export function getErrorMessage(errorType: keyof typeof errorMessages, params?: any) {
  const handler = errorMessages[errorType];
  if (!handler) {
    return {
      title: 'Error Desconocido',
      message: 'Ha ocurrido un error inesperado en la matriz de audio.',
      suggestion: 'Por favor, recarga la pestaña completa para limpiar la memoria caché.'
    };
  }
  return (handler as any)(params);
}
