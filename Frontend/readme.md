# Quantia Frontend

## Variables de entorno (API)

El frontend construye la base de API desde `src/config/apiBaseUrl.js`.

Orden de prioridad:

1. `VITE_BACKEND_URL` (preferida)
2. `VITE_API_URLBackend` (compatibilidad)
3. `VITE_API_BASE_URL`

En desarrollo también puede usar `VITE_API_URL` como fallback.

Ejemplo recomendado para Vercel:

```env
VITE_BACKEND_URL=https://quantia-g8k2.onrender.com
```

Nota: el frontend agrega `/api` automáticamente si no está presente.

## Rutas esperadas

Con la variable anterior, las llamadas quedan así:

- Login: `https://quantia-g8k2.onrender.com/api/auth/login`
- Simulación preliminares: `https://quantia-g8k2.onrender.com/api/motor/preliminares/simular`
- Simulación módulo: `https://quantia-g8k2.onrender.com/api/motor/modulos/{module_key}/simular`

## Diagnóstico rápido de errores

- `404 Not Found` en simulación:
  - Generalmente la URL se está armando sin `/api` o hacia dominio incorrecto.
  - Verificar en DevTools > Network el `Request URL` exacto.

- `422` en simulación con mensaje de Supabase:
  - El endpoint existe, pero faltan variables del backend (`SUPABASE_*`) en Render.

## Vite proxy local

`vite.config.js` usa estas variables para proxy local `/api`:

1. `VITE_API_URLBackend`
2. `VITE_BACKEND_URL`
3. `VITE_API_BASE_URL`
4. fallback local `http://127.0.0.1:8000`

## Servicio documental

El cliente reutilizable se encuentra en:

`src/modules/vivienda/services/documentosApiService.js`

Incluye operaciones para estado de Ollama, subida multipart, listado, indexacion, preguntas RAG, eliminacion y consulta directa de texto. Todas las operaciones requieren el `accessToken` emitido por el backend durante login.

Ejemplo:

```js
import { listarDocumentos } from "@/modules/vivienda/services/documentosApiService";

const response = await listarDocumentos({
  accessToken: authStore.accessToken,
});
```

El servicio normaliza errores mediante `DocumentApiError`, con codigos para autenticacion, archivo demasiado grande, tipo no permitido, documento inexistente, OCR sin texto, embeddings, Ollama/modelo, timeout, cancelacion y errores de red.

Validacion automatizada:

```bash
npm run test:documents
```
