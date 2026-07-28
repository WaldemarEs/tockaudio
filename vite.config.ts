/**
 * Archivo: vite.config.ts
 * Decisión técnica: Configurar Vite para soportar Web Workers, WebAssembly y SharedArrayBuffer
 * Contexto: FFmpeg.wasm requiere SharedArrayBuffer, que necesita headers especiales (COOP/COEP)
 * Restricciones: Los headers solo aplican en desarrollo; en producción se configuran en Vercel/Netlify
 * Known issues: Safari no soporta SharedArrayBuffer sin flags experimentales
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Alias de rutas para imports limpios
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@workers': path.resolve(__dirname, './src/workers'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@data': path.resolve(__dirname, './src/data'),
      '@context': path.resolve(__dirname, './src/context'),
    },
  },

  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    open: true,
    
    // Headers críticos para SharedArrayBuffer (requerido por FFmpeg.wasm)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  // Configuración de Web Workers
  worker: {
    format: 'es', // Usar ES modules para workers
  },

  // Optimización de build
  build: {
    target: 'esnext', // Soporte para features modernas (WebAssembly, WebGPU)
    outDir: 'dist',
    sourcemap: false, // Desactivar en producción para reducir tamaño
    
    // Configuración de chunks para WASM y modelos de IA
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-audio': ['wavesurfer.js'],
          'vendor-state': ['zustand'],
        },
        // Nombrar chunks para mejor cacheo
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Aumentar límite de tamaño de chunk (WASM puede ser grande)
    chunkSizeWarningLimit: 2000,
  },

  // Configuración para modelos de IA (Transformers.js)
  optimizeDeps: {
    include: ['@xenova/transformers'],
    exclude: ['@ffmpeg/ffmpeg'], // FFmpeg se carga dinámicamente
  },
});
