/**
 * Archivo: src/workers/license-core.worker.ts
 * Decisión técnica: Worker dedicado a la criptografía pesada y recolección de fingerprint.
 * Contexto: Aísla la verificación RSA (Web Crypto API) para no congelar la UI de React (<100ms UI delay).
 * Restricciones: Al ejecutarse en un Worker, no tiene acceso al DOM real, por lo que el fingerprint depende de navigator.
 * Known issues: Generar un fingerprint 100% estable en navegadores modernos que usan mitigaciones anti-fingerprinting es desafiante; si falla el usuario consumirá un reset.
 */

// Helper: Convierte Base64Url a Uint8Array
function base64UrlToUint8Array(base64Url: string) {
  const padding = '='.repeat((4 - base64Url.length % 4) % 4);
  const base64 = (base64Url + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 1. Verificar firma RSA (Asumiendo formato payloadBase64.signatureBase64)
async function verifySignature(licenseKey: string, publicKeyPem: string): Promise<boolean> {
  try {
    const parts = licenseKey.split('.');
    if (parts.length !== 2) return false;
    
    const payloadStr = parts[0];
    const signatureStr = parts[1];
    
    const signatureBytes = base64UrlToUint8Array(signatureStr);
    const dataBytes = new TextEncoder().encode(payloadStr);

    // Importar la clave pública (Limpia headers PEM si existen)
    const binaryDer = base64UrlToUint8Array(publicKeyPem.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\n|\r)/g, ''));
    
    const cryptoKey = await self.crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const isValid = await self.crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signatureBytes,
      dataBytes
    );

    return isValid;
  } catch (err) {
    console.error("Error criptográfico de validación:", err);
    return false;
  }
}

// 2. Generar Fingerprint del dispositivo (sin DOM)
async function generateFingerprint(): Promise<string> {
  const nav = self.navigator as any;
  const data = [
    nav.userAgent,
    nav.language,
    nav.hardwareConcurrency || 'unknown',
    nav.deviceMemory || 'unknown',
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ].join('|');

  const dataBuffer = new TextEncoder().encode(data);
  const hashBuffer = await self.crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 3. Validar Licencia completa
async function validateLicense(licenseKey: string, publicKey: string, storedFingerprint: string | null) {
  const parts = licenseKey.split('.');
  if (parts.length !== 2) throw new Error("Formato de licencia inválido (No es un JWT-like válido).");

  // Verificar firma criptográfica
  const isValidSig = await verifySignature(licenseKey, publicKey);
  if (!isValidSig) throw new Error("Firma criptográfica inválida o licencia corrupta.");

  // Decodificar payload
  const payloadStr = new TextDecoder().decode(base64UrlToUint8Array(parts[0]));
  const payload = JSON.parse(payloadStr);

  // Verificar caducidad
  const expiresAt = new Date(payload.exp);
  if (expiresAt < new Date()) {
    throw new Error("La licencia ha expirado.");
  }

  // Verificar fingerprint si existe uno almacenado
  const currentFingerprint = await generateFingerprint();
  if (storedFingerprint && storedFingerprint !== currentFingerprint) {
    throw new Error("DISPOSITIVO_DIFERENTE");
  }

  return {
    isValid: true,
    expiresAt,
    planType: payload.plan || 'pro',
    currentFingerprint
  };
}

// Manejador de eventos del Worker
self.onmessage = async (e: MessageEvent) => {
  const { type, payload, id } = e.data;
  try {
    if (type === 'validate') {
      const { licenseKey, publicKey, storedFingerprint } = payload;
      const result = await validateLicense(licenseKey, publicKey, storedFingerprint);
      self.postMessage({ type: 'validate_success', payload: result, id });
    }
    
    if (type === 'fingerprint') {
      const currentFingerprint = await generateFingerprint();
      self.postMessage({ type: 'fingerprint_success', payload: currentFingerprint, id });
    }
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err.message || 'Error interno de validación', id });
  }
};
