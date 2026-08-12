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
DOCUMENT_MAX_PAGES=100
DOCUMENT_MAX_USER_DOCUMENTS=100
DOCUMENT_MAX_USER_BYTES=524288000
DOCUMENT_REJECT_DUPLICATES=true
DOCUMENT_RETENTION_DAYS=90
DOCUMENT_FAILED_RETENTION_HOURS=24
DOCUMENT_CLEANUP_BATCH_SIZE=100
VECTOR_STORE_BACKEND=supabase
VECTOR_TABLE_NAME=document_chunks
EMBEDDING_BACKEND=hashing
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384
RAG_CHUNK_SIZE=150
RAG_CHUNK_OVERLAP=30
RAG_TOP_K=3
AUTH_TOKEN_SECRET=<secreto-aleatorio-de-al-menos-32-caracteres>
AUTH_TOKEN_TTL_SECONDS=28800
```

La dimensión de `EMBEDDING_DIMENSION` debe coincidir con la columna vectorial creada por la migración y con el modelo configurado. Cambiar el modelo o la dimensión requiere una migración y reindexación.

`EMBEDDING_BACKEND=hashing` genera vectores deterministas y normalizados sin cargar PyTorch, apropiados para instancias de memoria limitada. `sentence_transformers` conserva la búsqueda semántica de mayor calidad para instancias con recursos suficientes. Ambos backends deben usar la dimensión declarada en `EMBEDDING_DIMENSION`; cambiar de backend o modelo requiere reindexar los documentos.

Para ejecutar Ollama localmente en un equipo de 8 GB de RAM, usar `Backend/.env.local`:

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_CONTEXT_LENGTH=2048
OLLAMA_MAX_TOKENS=64
OLLAMA_TIMEOUT_SECONDS=60
OLLAMA_TEMPERATURE=0
```

`OLLAMA_CONTEXT_LENGTH` se envía a Ollama como `num_ctx`. El archivo `.env.local` está ignorado por Git y no modifica las variables configuradas por separado en Render.

Para OCR de imagenes y PDF escaneados, `pytesseract` y `pdf2image` requieren tambien los binarios del sistema. La configuracion local admite rutas explicitas para no depender de `PATH`:

```env
OCR_ENGINE=tesseract
TESSERACT_CMD="C:/ruta/Tesseract-OCR/tesseract.exe"
TESSERACT_LANGUAGE=spa
TESSERACT_DATA_DIR="C:/ruta/tessdata"
POPPLER_PATH="C:/ruta/poppler/Library/bin"
```

`TESSERACT_DATA_DIR` debe contener `spa.traineddata`. Si falta Tesseract, el idioma configurado o Poppler, el endpoint documental responde un error recuperable y no guarda el mensaje tecnico como texto OCR.

Antes de activar el modo `supabase`, aplicar en el proyecto de Supabase:

```text
Backend/supabase/migrations/20260811_001_document_persistence.sql
Backend/supabase/migrations/20260811_002_document_policies.sql
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

La política de carga valida la firma o estructura real de PDF, imágenes, JSON y texto UTF-8; limita páginas, cantidad y bytes acumulados por usuario; y rechaza contenido duplicado mediante SHA-256. La limpieza de retención se ejecuta de forma oportunista al listar o subir documentos: elimina documentos vencidos, aplica una ventana más corta a estados `failed` y elimina primero chunks y binarios antes del registro. Un valor `0` en las variables de retención desactiva esa ventana.
