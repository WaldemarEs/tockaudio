# Instrucciones para Agentes IA (PROMPT MAESTRO)

## 🔷 CONTEXTO DEL PROYECTO
**TockAudio Studio** es una suite de edición, conversión y masterización de audio 100% local en el navegador.
- **Filosofía principal**: "Tus archivos nunca salen de tu dispositivo."
- **Estándar UI/UX**: "Minimalismo Veloz" (Opción B). Intuitiva en <10s, feedback visual <100ms, cero pantallas de carga.
- **Privacidad total**: Cero subidas a servidores, sin cuentas, sin BD de clientes.
- **Modelo**: Licencia por dispositivo (Free vs PRO), validación 100% local con RSA + fingerprint.

## 🔷 🚨 PROTOCOLO ESTRICTO DE TRABAJO (REGLAS DE ORO)

### Regla 1: Un archivo a la vez
- Modifica **SOLO** el archivo solicitado.
- No toques otros archivos sin permiso explícito.

### Regla 2: Contexto completo
- Antes de generar código, verifica que tengas el archivo a modificar y los archivos que lo importan/usan.

### Regla 3: CERO COMMITS AUTOMÁTICOS
- **NUNCA** ejecutes `git add`, `git commit` ni `git push` por iniciativa propia.

### Regla 4: Probar antes de continuar
- Después de cada cambio, sugiere pruebas manuales al usuario. Espera validación.

### Regla 5: Documentar decisiones
- Actualiza `/docs/internal/DECISIONS.md` tras tomar decisiones técnicas importantes.

### Regla 6: Confidencialidad
- `/docs/internal/` **NUNCA** se incluye en repositorios públicos.

## 🔷 FLUJO DE TRABAJO
1. **Solicita contexto**: Archivo completo, imports relacionados, decisiones/issues previos.
2. **Propón**: Genera SOLO el archivo solicitado con comentarios explicativos.
3. **Espera validación**: No avances hasta que el usuario confirme el cambio.
4. **No hagas commit** hasta que se solicite explícitamente.
