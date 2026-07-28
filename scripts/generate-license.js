/**
 * Archivo: scripts/generate-license.js
 * Decisión técnica: Script aislado en Node.js puro usando el módulo nativo `crypto`.
 * Contexto: Core del modelo de negocio. Emite firmas criptográficas (RSA 2048) inquebrantables off-line para los planes PRO de TockAudio.
 * Restricciones: Depende de un entorno Node.js local. Requiere Node >= 16 (randomUUID). Cero dependencias externas (NPM).
 * Known issues: Si el archivo private.pem se filtra, cualquier actor malicioso podrá falsificar licencias válidas infinitas.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PRIVATE_KEY_PATH = path.join(__dirname, 'private.pem');
const PUBLIC_KEY_PATH = path.join(__dirname, 'public.pem');
const LICENSES_DIR = path.join(__dirname, 'licenses');

// Crear directorio de licencias si no existe
if (!fs.existsSync(LICENSES_DIR)) {
  fs.mkdirSync(LICENSES_DIR, { recursive: true });
}

function ensureKeysExist() {
  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    return;
  }
  
  console.log("⚠️ No se detectaron claves RSA. Generando par de claves RSA-2048 bits...");
  
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
  
  console.log("✅ Claves criptográficas generadas exitosamente.");
  console.log("¡ADVERTENCIA CRÍTICA!: 'private.pem' NUNCA DEBE SER COMMITEADO A GIT. Verifica tu .gitignore inmediatamente.");
}

function generateLicense(plan) {
  const VALID_PLANS = ['pro-30', 'pro-60', 'pro-90'];
  if (!VALID_PLANS.includes(plan)) {
    console.error(`❌ Error: El plan '${plan}' no es válido. Planes soportados: ${VALID_PLANS.join(', ')}`);
    process.exit(1);
  }

  const id = crypto.randomUUID();
  const createdAt = new Date();
  
  let expiresAt = new Date(createdAt);
  if (plan === 'pro-30') expiresAt.setMonth(expiresAt.getMonth() + 1);
  else if (plan === 'pro-60') expiresAt.setMonth(expiresAt.getMonth() + 2);
  else if (plan === 'pro-90') expiresAt.setMonth(expiresAt.getMonth() + 3);

  const payload = {
    id,
    plan,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  const payloadString = JSON.stringify(payload);
  
  // Firmar (Signature) con clave privada
  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  const sign = crypto.createSign('SHA256');
  sign.update(payloadString);
  sign.end();
  const signature = sign.sign(privateKey, 'base64');

  // Codificar de una forma human-readable (ej: TOCK-A1B2-C3D4)
  const prefix = "TOCK";
  const chunk1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const chunk2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const licenseKey = `${prefix}-${chunk1}-${chunk2}`;

  const license = {
    ...payload,
    signature,
    licenseKey
  };

  const filePath = path.join(LICENSES_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(license, null, 2));

  console.log(`\n======================================================`);
  console.log(`🚀 Licencia [${plan.toUpperCase()}] generada exitosamente`);
  console.log(`======================================================`);
  console.log(`License Key (Para el cliente): ${licenseKey}`);
  console.log(`ID UUID (Interno):           ${id}`);
  console.log(`Caduca:                      ${expiresAt.toUTCString()}`);
  console.log(`Firma Base64 (Truncada):     ${signature.substring(0, 30)}...`);
  console.log(`======================================================\n`);
  console.log(`Se ha guardado el token maestro JSON en: ${filePath}\n`);
}

function main() {
  const args = process.argv.slice(2);
  const planIndex = args.indexOf('--plan');
  
  if (planIndex === -1 || !args[planIndex + 1]) {
    console.error("❌ Uso incorrecto: node scripts/generate-license.js --plan <pro-30|pro-60|pro-90>");
    process.exit(1);
  }

  const plan = args[planIndex + 1];
  
  try {
    ensureKeysExist();
    generateLicense(plan);
  } catch (error) {
    console.error("🔥 Error crítico en el generador criptográfico:", error.message);
  }
}

main();
