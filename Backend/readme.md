# Quantia Backend

## Variables de entorno (requeridas)

Para que el backend pueda resolver catálogos y simulaciones, se requiere:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Alternativas aceptadas por código (menos recomendadas para admin):

- `SUPABASE_KEY`
- `SUPABASE_ANON_KEY`

Prioridad interna de clave admin:

1. `SUPABASE_SERVICE_ROLE_KEY`
2. `SUPABASE_KEY`
3. `SUPABASE_ANON_KEY`

## Prefijo de API

El backend monta rutas con prefijo:

`/api`

Por ejemplo:

- `POST /api/auth/login`
- `POST /api/motor/preliminares/simular`
- `POST /api/motor/modulos/{module_key}/simular`
- `POST /api/resultados/inferir`

## Endpoints de verificación

- `GET /health`
- `GET /docs`
- `GET /openapi.json`

Si `openapi.json` muestra rutas pero simulación responde `422` con mensaje de Supabase, el problema es de variables de entorno y no de routing.

## Persistencia documental (OCR + RAG)

El backend soporta dos modos:

- `local`: útil para pruebas; metadata, archivos y vectores no son persistencia de producción.
- `supabase`: guarda metadata en Postgres, binarios en Supabase Storage y embeddings en pgvector.

Para producción en Render se deben configurar:

```env
DOCUMENT_PERSISTENCE_BACKEND=supabase
DOCUMENT_TABLE_NAME=documents
DOCUMENT_STORAGE_BUCKET=quantia-documents
DOCUMENT_MAX_UPLOAD_BYTES=20971520
VECTOR_STORE_BACKEND=supabase
VECTOR_TABLE_NAME=document_chunks
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384
AUTH_TOKEN_SECRET=<secreto-aleatorio-de-al-menos-32-caracteres>
AUTH_TOKEN_TTL_SECONDS=28800
```

La dimensión de `EMBEDDING_DIMENSION` debe coincidir con la columna vectorial creada por la migración y con el modelo configurado. Cambiar el modelo o la dimensión requiere una migración y reindexación.

Antes de activar el modo `supabase`, aplicar en el proyecto de Supabase:

```text
Backend/supabase/migrations/20260811_001_document_persistence.sql
```

La migración es idempotente y crea:

- `public.documents`;
- `public.document_chunks`;
- extensión e índice pgvector;
- función `match_document_chunks`;
- bucket privado `quantia-documents`;
- RLS sin acceso directo para `anon` o `authenticated`.

El backend usa exclusivamente la service role key para estas operaciones y valida propiedad mediante el `user_id` firmado en el token Bearer emitido por registro o login. La service role key nunca debe configurarse en Vercel ni exponerse al navegador.

Endpoints documentales protegidos:

- `POST /api/documentos/upload`
- `GET /api/documentos`
- `POST /api/documentos/{document_id}/procesar`
- `POST /api/documentos/{document_id}/preguntar`
- `DELETE /api/documentos/{document_id}`
- `GET /api/documentos/llm/health`

La subida acepta opcionalmente `quote_id` y `module_key` como campos multipart. En modo Supabase, `quote_id` se valida contra la cotización del usuario autenticado.
