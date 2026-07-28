/**
 * Archivo: src/lib/license-validator.ts
 * Decisión técnica: Singleton para comunicación asíncrona con el Worker de criptografía.
 * Contexto: Coordina la clave pública constante, el localStorage y las promesas de validación (anti-piratería).
 * Restricciones: Límite duro de 2 resets al año, guardado localmente (modelo de confianza local).
 * Known issues: Almacenar resets localmente significa que borrar la caché los restaura, pero perderá el hardware tie.
 */

// Placeholder de clave pública. El usuario la reemplazará en producción.
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzPLACEHOLDER...
-----END PUBLIC KEY-----`;

export interface LicenseInfo {
  isValid: boolean;
  planType: 'free' | 'pro';
  expiresAt?: Date;
  error?: string;
}

class LicenseValidator {
  private worker: Worker | null = null;
  private isReady = false;
  private messageCounter = 0;
  private resolves = new Map<number, { resolve: Function, reject: Function }>();

  public async init(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    
    this.worker = new Worker(new URL('../workers/license-core.worker.ts', import.meta.url), {
      type: 'module'
    });

    this.worker.onmessage = this.handleMessage.bind(this);
    this.isReady = true;
  }

  public async activateLicense(licenseKey: string): Promise<{ success: boolean; error?: string }> {
    await this.init();
    try {
      // Forzamos validación cruda (sin fingerprint previo)
      const res: any = await this.sendMessage('validate', { licenseKey, publicKey: PUBLIC_KEY_PEM, storedFingerprint: null });
      
      // Persistencia
      localStorage.setItem('tockaudio_license', licenseKey);
      localStorage.setItem('tockaudio_fingerprint', res.currentFingerprint);
      localStorage.setItem('tockaudio_plan', res.planType);
      localStorage.setItem('tockaudio_exp', res.expiresAt.toISOString());

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async validateCurrentLicense(): Promise<LicenseInfo> {
    await this.init();
    const licenseKey = localStorage.getItem('tockaudio_license');
    const storedFingerprint = localStorage.getItem('tockaudio_fingerprint');

    if (!licenseKey) {
      return { isValid: false, planType: 'free' };
    }

    try {
      const res: any = await this.sendMessage('validate', { licenseKey, publicKey: PUBLIC_KEY_PEM, storedFingerprint });
      
      localStorage.setItem('tockaudio_plan', res.planType);
      localStorage.setItem('tockaudio_exp', res.expiresAt.toISOString());

      return {
        isValid: true,
        planType: res.planType,
        expiresAt: res.expiresAt
      };
    } catch (err: any) {
      // Limpiamos el plan de la UI pero conservamos la licencia para poder transferirla
      localStorage.setItem('tockaudio_plan', 'free');
      return { isValid: false, planType: 'free', error: err.message };
    }
  }

  public async resetLicense(): Promise<{ success: boolean; resetsRemaining: number; error?: string }> {
    await this.init();
    const resetsData = localStorage.getItem('tockaudio_resets');
    let resets = resetsData ? JSON.parse(resetsData) : { count: 2, lastResetYear: new Date().getFullYear() };

    if (resets.lastResetYear < new Date().getFullYear()) {
      resets = { count: 2, lastResetYear: new Date().getFullYear() };
    }

    if (resets.count <= 0) {
      return { success: false, resetsRemaining: 0, error: "Has consumido todas las transferencias de este año (Máx 2)." };
    }

    try {
      const newFingerprint = await this.sendMessage('fingerprint', {});
      localStorage.setItem('tockaudio_fingerprint', newFingerprint as string);
      
      resets.count -= 1;
      localStorage.setItem('tockaudio_resets', JSON.stringify(resets));

      return { success: true, resetsRemaining: resets.count };
    } catch (err: any) {
      return { success: false, resetsRemaining: resets.count, error: "Error de Hardware al intentar transferir." };
    }
  }

  public getLicenseInfo(): LicenseInfo {
    const plan = localStorage.getItem('tockaudio_plan') as 'free' | 'pro' || 'free';
    const expStr = localStorage.getItem('tockaudio_exp');
    const license = localStorage.getItem('tockaudio_license');
    
    if (!license) return { isValid: false, planType: 'free' };
    
    return {
      isValid: plan === 'pro',
      planType: plan,
      expiresAt: expStr ? new Date(expStr) : undefined
    };
  }

  public getResetsRemaining(): number {
    const resetsData = localStorage.getItem('tockaudio_resets');
    if (!resetsData) return 2;
    const resets = JSON.parse(resetsData);
    if (resets.lastResetYear < new Date().getFullYear()) return 2;
    return resets.count;
  }

  public deactivateLicense() {
    localStorage.removeItem('tockaudio_license');
    localStorage.removeItem('tockaudio_fingerprint');
    localStorage.removeItem('tockaudio_plan');
    localStorage.removeItem('tockaudio_exp');
  }

  private sendMessage(type: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageCounter;
      this.resolves.set(id, { resolve, reject });
      this.worker?.postMessage({ type, payload, id });
    });
  }

  private handleMessage(e: MessageEvent) {
    const { type, payload, id, error } = e.data;
    const promiseHandlers = this.resolves.get(id);
    if (!promiseHandlers) return;

    if (type === 'error') {
      promiseHandlers.reject(new Error(error));
    } else {
      promiseHandlers.resolve(payload);
    }
    this.resolves.delete(id);
  }
}

export const licenseValidator = new LicenseValidator();
