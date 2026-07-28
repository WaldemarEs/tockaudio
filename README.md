# TockAudio Studio

> Editor de audio 100% local en el navegador. Tus archivos nunca salen de tu dispositivo.

## 🚀 Características

- **Edición multi-pista** (Desktop PRO)
- **Conversión de formatos**: WAV, MP3, OGG, FLAC, AAC
- **Extracción de audio desde video**: MP4, MOV, AVI, MKV, WEBM
- **Reducción de ruido con IA** (Transformers.js, solo PRO)
- **Normalización de volumen**: Pico y LUFS
- **Ecualizador gráfico** de 10 bandas (solo PRO)
- **Procesamiento por lotes** hasta 50 archivos (solo PRO Desktop)
- **100% local**: Cero subidas a servidores, máxima privacidad

## 🛠️ Stack Tecnológico

- **Frontend**: React + Vite + TypeScript
- **Estilos**: Tailwind CSS + Shadcn UI
- **Estado**: Zustand
- **Audio**: Web Audio API + WaveSurfer.js
- **Procesamiento**: @ffmpeg/ffmpeg (WASM) + Web Workers
- **IA**: @xenova/transformers (WebGPU/WASM)
- **Licencias**: Criptografía RSA local
- **Hosting**: Cloudflare Pages

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/WaldemarEs/tockaudio.git
cd tockaudio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🚀 Deploy en Cloudflare Pages

### Configuración inicial

1. Crear cuenta en [Cloudflare](https://dash.cloudflare.com/)
2. Ir a "Workers & Pages" → "Create application" → "Pages"
3. Conectar repositorio de GitHub (`https://github.com/WaldemarEs/tockaudio.git`)
4. Configurar build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Cloudflare detectará automáticamente `public/_headers` y `public/_routes.json`
6. Deploy automático en cada push a main

### Variables de entorno (si las necesitas)

Cloudflare Pages soporta variables de entorno en el dashboard:
- Settings → Variables
- Añadir variables según necesites

**IMPORTANTE**: Los headers COOP/COEP en `public/_headers` son CRÍTICOS para que FFmpeg.wasm funcione. Sin ellos, la conversión de audio/video fallará y arruinará la experiencia del usuario.

### Dominio personalizado

1. En Cloudflare Dashboard → Pages → tu proyecto → Custom domains
2. Añadir dominio (ej: tockaudio.com)
3. Cloudflare configurará automáticamente los DNS y SSL gratuitos.

## 🔑 Sistema de Licencias

TockAudio usa un sistema de licencias 100% local con validación RSA:

- **Free**: 50 MB máx, 3 archivos/día, 1 pista, sin IA
- **PRO**: 500 MB (audio) / 2 GB (video), ilimitado, multi-pista, IA, batch

### Generar licencias

```bash
# Generar par de claves RSA (solo la primera vez)
node scripts/generate-license.js --init

# Generar licencia PRO 30 días
node scripts/generate-license.js --plan pro-30

# Generar licencia PRO 60 días
node scripts/generate-license.js --plan pro-60

# Generar licencia PRO 90 días
node scripts/generate-license.js --plan pro-90
```

Las licencias generadas se guardan en `scripts/licenses/` (NUNCA subir a git).

## 🌐 Navegadores Compatibles

**Recomendado**: Chrome y Edge (Chromium) para experiencia óptima.

**Compatible**: Firefox, Safari (con limitaciones conocidas, como la pre-carga profunda de WebAssembly).

**No compatible**: Navegadores antiguos sin soporte para WebAssembly o SharedArrayBuffer.

## 📄 Licencia

Este proyecto es propietario. Todos los derechos reservados.

## 🤝 Contribuciones

Este es un proyecto personal. No se aceptan contribuciones externas por ahora.

## 📧 Contacto

- Email: hola@tockaudio.com
- Web: https://tockaudio.com
