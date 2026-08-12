# Plan de tareas estructurado: OCR + RAG + Llama 3.1 8B

## Objetivo general

Implementar un mÃ³dulo nuevo de procesamiento documental basado en OCR, recuperaciÃ³n aumentada por generaciÃ³n (RAG) y un modelo Llama 3.1 8B, integrado en la arquitectura actual de FastAPI del backend de Quantia.

## Alcance del plan

Se trabajarÃ¡ sobre el backend existente para agregar:

- subida de documentos PDF o imÃ¡genes,
- extracciÃ³n de texto por OCR,
- segmentaciÃ³n del texto en chunks,
- almacenamiento vectorial para bÃºsqueda semÃ¡ntica,
- generaciÃ³n de respuestas con contexto usando Llama 3.1 8B,
- endpoints API para que el frontend pueda consumir esta funcionalidad.

---

## Fase 1: PreparaciÃ³n del entorno

### Tarea 1.1 â€” Definir la arquitectura del mÃ³dulo nuevo

UbicaciÃ³n:
- Backend/app/services/
- Backend/app/api/v1/endpoints/
- Backend/app/schemas/

Cambios a realizar:
- Crear una carpeta nueva de servicios para encapsular OCR, embeddings, RAG y LLM.
- Definir una arquitectura modular para que el sistema quede escalable y no mezcle lÃ³gica de negocio con lÃ³gica de IA.

Archivos a crear:
- Backend/app/services/ocr_service.py
- Backend/app/services/embedding_service.py
- Backend/app/services/rag_service.py
- Backend/app/services/llm_service.py

### Tarea 1.2 â€” AÃ±adir configuraciÃ³n de variables de entorno

UbicaciÃ³n:
- Backend/app/core/config.py

Cambios a realizar:
- Agregar variables de entorno para:
  - OCR_ENGINE
  - OLLAMA_HOST
  - OLLAMA_MODEL
  - EMBEDDING_MODEL
  - UPLOAD_DIR
- Extender la configuraciÃ³n del proyecto para soportar estas variables sin afectar los endpoints actuales.

Archivos a modificar:
- Backend/app/core/config.py

### Tarea 1.3 â€” Actualizar dependencias del backend

UbicaciÃ³n:
- Backend/requirements.txt

Cambios a realizar:
- AÃ±adir paquetes para:
  - carga de archivos multipart,
  - procesamiento OCR,
  - embeddings,
  - conexiÃ³n con Ollama,
  - manejo de vectores si se decide usar pgvector.

Archivos a modificar:
- Backend/requirements.txt

---

## Fase 2: ImplementaciÃ³n del servicio de OCR

### Tarea 2.1 â€” Crear el servicio base para procesamiento de documentos

UbicaciÃ³n:
- Backend/app/services/ocr_service.py

Cambios a realizar:
- Implementar una clase o funciones para recibir un archivo subido.
- Soportar entradas tipo PDF, PNG y JPG.
- Crear un flujo que convierta pÃ¡ginas PDF a imÃ¡genes y luego aplique OCR.
- Devolver texto extraÃ­do como resultado estructurado.

Responsabilidades del servicio:
- guardar el archivo temporalmente,
- identificar tipo de archivo,
- ejecutar OCR,
- retornar el texto limpio y la metadata del documento.

Archivos a crear:
- Backend/app/services/ocr_service.py

### Tarea 2.2 â€” Preparar limpieza y normalizaciÃ³n del texto OCR

UbicaciÃ³n:
- Backend/app/services/ocr_service.py

Cambios a realizar:
- Aplicar limpieza bÃ¡sica del texto extraÃ­do:
  - quitar saltos de lÃ­nea excesivos,
  - eliminar caracteres raros,
  - normalizar espacios,
  - conservar estructura por pÃ¡rrafos.

Archivos a modificar:
- Backend/app/services/ocr_service.py

### Tarea 2.3 â€” Validar OCR con documentos reales

UbicaciÃ³n:
- Backend/app/services/ocr_service.py
- Backend/app/main.py

Cambios a realizar:
- Crear una ruta temporal de prueba para validar el servicio con un archivo de ejemplo.
- Verificar que el texto extraÃ­do sea usable para la siguiente fase.

Archivos a modificar:
- Backend/app/services/ocr_service.py
- Backend/app/main.py

---

## Fase 3: ImplementaciÃ³n del pipeline de embeddings y chunking

### Tarea 3.1 â€” Crear servicio de chunking

UbicaciÃ³n:
- Backend/app/services/rag_service.py

Cambios a realizar:
- Recibir texto OCR y dividirlo en chunks de tamaÃ±o razonable.
- Aplicar solapamiento entre chunks para conservar contexto.
- Definir una estrategia inicial simple:
  - tamaÃ±o de chunk: 600 a 800 tokens,
  - solapamiento: 80 a 120 tokens.

Archivos a crear:
- Backend/app/services/rag_service.py

### Tarea 3.2 â€” Crear servicio de embeddings

UbicaciÃ³n:
- Backend/app/services/embedding_service.py

Cambios a realizar:
- Implementar generaciÃ³n de embeddings para cada chunk.
- Definir el modelo de embedding que se usarÃ¡ en la etapa inicial.
- Encapsular la lÃ³gica para que luego se pueda cambiar el modelo sin tocar el resto del mÃ³dulo.

Archivos a crear:
- Backend/app/services/embedding_service.py

### Tarea 3.3 â€” DiseÃ±ar el almacenamiento vectorial

UbicaciÃ³n:
- Backend/app/services/rag_service.py
- Backend/app/core/config.py

Cambios a realizar:
- Preparar la estructura necesaria para guardar:
  - document_id,
  - chunk_id,
  - content,
  - embedding,
  - metadata.
- Integrar el almacenamiento con Supabase Postgres + pgvector o con una soluciÃ³n local temporal si se desea probar primero.

Archivos a modificar:
- Backend/app/services/rag_service.py
- Backend/app/core/config.py

---

## Fase 4: ImplementaciÃ³n del servicio RAG

### Tarea 4.1 â€” Crear la lÃ³gica de recuperaciÃ³n de contexto

UbicaciÃ³n:
- Backend/app/services/rag_service.py

Cambios a realizar:
- Implementar una funciÃ³n que reciba una pregunta del usuario y recupere los chunks mÃ¡s relevantes.
- Definir un top-k inicial, por ejemplo 3 o 5 chunks.
- Ordenar los resultados por similitud semÃ¡ntica.

Archivos a modificar:
- Backend/app/services/rag_service.py

### Tarea 4.2 â€” Crear la lÃ³gica de ensamblado del prompt

UbicaciÃ³n:
- Backend/app/services/rag_service.py

Cambios a realizar:
- Construir un prompt con contexto recuperado y la pregunta del usuario.
- Incluir instrucciones para que el modelo responda Ãºnicamente con la informaciÃ³n del contexto, y que indique cuando no encuentre suficiente informaciÃ³n.

Archivos a modificar:
- Backend/app/services/rag_service.py

---

## Fase 5: IntegraciÃ³n con Llama 3.1 8B

### Tarea 5.1 â€” Crear el servicio de conexiÃ³n con Ollama

UbicaciÃ³n:
- Backend/app/services/llm_service.py

Cambios a realizar:
- Implementar la conexiÃ³n con el motor local Ollama.
- Configurar el modelo Llama 3.1 8B.
- Definir una funciÃ³n para enviar prompts y obtener respuestas.

Archivos a crear:
- Backend/app/services/llm_service.py

### Tarea 5.2 â€” Integrar LLM con la recuperaciÃ³n de contexto

UbicaciÃ³n:
- Backend/app/services/rag_service.py
- Backend/app/services/llm_service.py

Cambios a realizar:
- Unir la recuperaciÃ³n de chunks con la generaciÃ³n de respuesta por Llama 3.1 8B.
- Crear una funciÃ³n central que reciba una pregunta, busque contexto y genere la respuesta final.

Archivos a modificar:
- Backend/app/services/rag_service.py
- Backend/app/services/llm_service.py

---

## Fase 6: ExposiciÃ³n de endpoints en la API

### Tarea 6.1 â€” Crear el router de documentos

UbicaciÃ³n:
- Backend/app/api/v1/endpoints/documentos.py

Cambios a realizar:
- Crear un nuevo endpoint para subir documentos.
- Crear un endpoint para procesar un documento y extraer texto OCR.
- Crear un endpoint para consultar informaciÃ³n mediante RAG.
- Crear un endpoint para listar documentos procesados.

Archivos a crear:
- Backend/app/api/v1/endpoints/documentos.py

### Tarea 6.2 â€” Registrar el nuevo router en la API principal

UbicaciÃ³n:
- Backend/app/api/v1/api.py

Cambios a realizar:
- Importar el nuevo router de documentos.
- Incluirlo en el router general de la API.

Archivos a modificar:
- Backend/app/api/v1/api.py

### Tarea 6.3 â€” Crear esquemas de entrada y salida

UbicaciÃ³n:
- Backend/app/schemas/documentos.py

Cambios a realizar:
- Definir modelos Pydantic para:
  - subida de archivo,
  - procesamiento de documento,
  - consulta por pregunta,
  - respuesta generada.

Archivos a crear:
- Backend/app/schemas/documentos.py

---

## Fase 7: Integracion con el frontend y cierre de brechas previas

Objetivo:
- Integrar el modulo OCR + RAG + Llama en la interfaz sin romper el flujo actual de cotizacion.
- Subsanar primero las brechas detectadas en auditoria: persistencia, servicio frontend, ruta de documentos, estados de error y puntos de entrada en la interfaz.
- Mantener separado el modulo documental del calculo de cotizacion hasta validar calidad OCR/RAG con documentos reales.

Criterio de avance:
- No iniciar cambios visuales grandes sin contar con servicio frontend estable.
- No mezclar respuestas RAG con calculos de presupuesto mientras la persistencia documental siga siendo temporal.
- Cada subtarea debe cerrar con una validacion minima: build frontend o prueba manual de endpoint.

### Tarea 7.1 — Subsanar brecha de persistencia documental

Ubicacion:
- Backend/app/api/v1/endpoints/documentos.py
- Backend/app/services/document_service.py
- Backend/app/services/rag_service.py
- Backend/app/services/vector_store_service.py
- Backend/app/core/config.py
- Backend/app/schemas/documentos.py
- Supabase Storage
- Supabase Postgres + pgvector

Reanalisis del estado actual:
- La tarea no puede considerarse resuelta con la implementacion actual.
- Existen tres mecanismos separados y no durables de almacenamiento:
  - El archivo original se guarda en Backend/tmp_documents o en UPLOAD_DIR.
  - El registro del documento, el texto OCR y su estado se guardan en document_registry, un diccionario global en memoria.
  - Los chunks y embeddings se guardan en LocalVectorStore, tambien en memoria.
- Al reiniciar, redesplegar o escalar el backend se pierden el registro y los vectores. Aunque un archivo permaneciera temporalmente en disco, quedaria huerfano porque se pierde su relacion con document_id.
- En un despliegue con mas de un worker, una peticion puede llegar a un proceso diferente al que recibio el archivo y responder documento no encontrado.
- VECTOR_STORE_BACKEND y VECTOR_TABLE_NAME ya existen en configuracion, pero actualmente no seleccionan otra implementacion: RAGService siempre usa LocalVectorStore.
- No existe todavia una migracion SQL para documentos o chunks, una funcion de similitud, un indice pgvector ni una implementacion de almacenamiento vectorial para Supabase.
- El backend desplegado en Render tiene conexion funcional con Supabase, pero las rutas /api/documentos analizadas solo existen en el estado local y aun no aparecen en el OpenAPI remoto.
- El bundle actual de Vercel consume el backend de Render. La persistencia documental y el acceso a Supabase deben permanecer del lado del backend; no se debe exponer la service role key en el frontend.

Decision tecnica recomendada:
- Usar persistencia real en Supabase antes de integrar el primer frontend documental.
- Conservar LocalVectorStore unicamente como implementacion para pruebas automatizadas o PoC local explicitamente temporal.
- Guardar los PDF e imagenes originales en un bucket privado de Supabase Storage.
- Guardar en PostgreSQL la identidad, propiedad, estado de procesamiento, texto OCR y metadata del documento.
- Guardar chunks y embeddings en PostgreSQL con pgvector.
- No utilizar stored_path como contrato publico. El frontend debe recibir document_id y, cuando corresponda, un endpoint de descarga autorizado o una referencia controlada al objeto de Storage.

Modelo de persistencia recomendado:
- Tabla documents:
  - id UUID como document_id estable,
  - user_id como propietario principal,
  - quote_id opcional,
  - module_key opcional,
  - original_file_name,
  - storage_bucket y storage_object_path,
  - mime_type y size_bytes,
  - file_checksum,
  - status,
  - ocr_text,
  - ocr_metadata JSONB,
  - embedding_model y version de procesamiento,
  - created_at y updated_at,
  - error_detail opcional.
- Tabla document_chunks:
  - id UUID o identificador estable del chunk,
  - document_id como llave foranea con eliminacion en cascada,
  - chunk_index con unicidad dentro del documento,
  - content,
  - embedding vector con dimension compatible con el modelo seleccionado,
  - metadata JSONB,
  - created_at.
- La dimension del vector debe quedar ligada al modelo de embeddings realmente configurado. Cambiar EMBEDDING_MODEL debe requerir reindexacion o una nueva version de indice.

Contrato de propiedad recomendado:
- user_id debe referenciar el UUID de app_users y no usar user_email como llave principal, porque el correo es mutable y contiene informacion personal.
- quote_id debe ser opcional para permitir subir documentos antes de crear o seleccionar una cotizacion.
- module_key debe ser opcional y servir para clasificar el documento dentro del flujo de vivienda.
- Un documento debe pertenecer a un usuario; adicionalmente puede pertenecer a una cotizacion y a un modulo.
- La propiedad no puede confiar solamente en un user_id o correo enviado por el navegador.
- El login actual devuelve datos del usuario, pero no emite una sesion o token verificable por el backend. Antes de exponer documentos privados debe definirse autenticacion verificable y autorizacion por propietario.
- Si la autenticacion se pospone para el PoC, debe declararse que no existe aislamiento entre usuarios y el modulo no debe habilitarse publicamente con documentos sensibles.

Contrato de identificadores y estados:
- document_id debe generarse una sola vez en el backend y persistirse como UUID.
- chunk_id debe ser unico y permanecer asociado a un solo document_id.
- La eliminacion de un documento debe eliminar sus chunks y programar la eliminacion de su archivo en Storage.
- Sustituir el estado binario indexed por estados de ciclo de vida, como:
  - uploaded,
  - ocr_processing,
  - ocr_completed,
  - indexing,
  - ready,
  - failed.
- Persistir el detalle del error para distinguir fallas de OCR, embeddings, almacenamiento o indexacion.
- Registrar modelo de embeddings, parametros de chunking, version de procesamiento y checksum para hacer la indexacion reproducible e idempotente.

Observaciones adicionales que afectan la persistencia:
- El archivo usa actualmente su nombre original como ruta de destino. Dos cargas con el mismo nombre pueden sobrescribirse; la ruta del objeto debe derivarse de document_id.
- La subida lee el archivo completo en memoria y no define tamaño maximo, cuota, limite de paginas ni validacion previa de MIME. Estas restricciones deben definirse antes de habilitar la carga publica.
- Debe existir una politica para documentos fallidos, archivos huerfanos, retencion y eliminacion.
- El uso de una service role key en el backend omite las protecciones normales del cliente publico; por ello el backend debe validar explicitamente propiedad y permisos, o adoptar sesiones de Supabase verificables y politicas RLS coherentes.
- Las pruebas actuales validan el almacenamiento en memoria con mocks, pero no prueban persistencia despues de reiniciar, aislamiento por usuario, cargas con nombres repetidos, fallas de Supabase ni eliminacion en cascada.

Cambios a realizar:
- Documentar formalmente la decision de usar Supabase como persistencia real y LocalVectorStore solo para pruebas o PoC local.
- Crear la migracion SQL de documents y document_chunks, habilitar pgvector y preparar el indice o funcion de similitud necesarios.
- Crear una abstraccion de almacenamiento vectorial y seleccionar la implementacion mediante VECTOR_STORE_BACKEND.
- Persistir el documento y su estado antes de iniciar OCR; actualizarlo de forma transaccional o recuperable durante OCR e indexacion.
- Guardar el archivo con una ruta basada en document_id dentro de un bucket privado.
- Sustituir stored_path por un contrato independiente del sistema de archivos del servidor.
- Definir autenticacion, autorizacion y aislamiento por usuario antes de desplegar documentos privados.
- Incorporar limites de carga, validacion de tipo, manejo de duplicados, retencion y limpieza de archivos huerfanos.
- Incorporar pruebas de integracion para persistencia, recuperacion despues de reinicio, propiedad, eliminacion y errores de Supabase.

Entregable:
- Decision tecnica documentada: Supabase para persistencia real y modo local temporal solo para pruebas.
- Migracion reproducible para documents, document_chunks, pgvector, indices y funciones de busqueda requeridas.
- Contrato claro para document_id, chunk_id, user_id, quote_id, module_key, estados y referencias a Storage.
- Politica documentada de autenticacion, acceso, retencion y eliminacion.
- Prueba de que un documento y sus chunks siguen disponibles despues de reiniciar el backend.
- Prueba de aislamiento: un usuario no puede listar, consultar ni eliminar documentos de otro usuario.
- Prueba de eliminacion completa sin dejar chunks o archivos huerfanos.

Criterio de cierre:
- No iniciar la Tarea 7.2 contra un entorno remoto hasta que la decision de persistencia, el esquema y el contrato de propiedad esten definidos.
- La tarea se considera cerrada cuando el flujo upload -> OCR -> indexacion -> consulta puede reconstruirse desde Supabase sin depender de memoria o rutas locales del proceso.

Estado de ejecucion (11 de agosto de 2026):
- Implementado en el repositorio:
  - repositorio documental seleccionable entre local y Supabase,
  - almacenamiento seleccionable entre disco local y Supabase Storage privado,
  - almacenamiento vectorial seleccionable entre LocalVectorStore y Supabase pgvector,
  - migracion SQL reproducible para documents, document_chunks, funcion de similitud, indices, RLS y bucket,
  - estados uploaded, ocr_processing, ocr_completed, indexing, ready y failed,
  - document_id estable y rutas de archivo aisladas por document_id,
  - relacion con user_id, quote_id opcional y module_key opcional,
  - token Bearer firmado para verificar el propietario,
  - listado, consulta y eliminacion aislados por usuario,
  - limites de tamaño, extensiones permitidas, checksum y eliminacion de archivo/chunks,
  - pruebas locales de propiedad, ciclo de vida, nombres repetidos, errores de carga y eliminacion.
- Endurecimiento implementado localmente (11 de agosto de 2026):
  - validacion de firma o estructura real para PDF, imagenes, JSON y texto UTF-8,
  - limite configurable de paginas, documentos y bytes acumulados por usuario,
  - rechazo de duplicados por usuario mediante checksum SHA-256,
  - migracion adicional con indice unico para evitar duplicados entre workers,
  - retencion configurable y limpieza oportunista de registros, chunks y archivos,
  - ventana de retencion independiente para documentos fallidos,
  - prueba de compensacion cuando falla la creacion del registro despues de guardar el archivo,
  - backend de embeddings hashing determinista de 384 dimensiones para instancias con memoria limitada,
  - 67 pruebas backend aprobadas.
- Verificado en el entorno remoto (11 de agosto de 2026):
  - Render responde correctamente en `/health`,
  - el OpenAPI remoto ya publica ocho rutas `/api/documentos`,
  - Vercel responde y consume el backend desplegado en Render,
  - la conexion general de autenticacion entre Render y Supabase responde,
  - el commit `4c6e157` esta activo en Render y Vercel,
  - las variables de persistencia documental y `AUTH_TOKEN_SECRET` ya estan configuradas en Render,
  - las rutas protegidas responden `401` ante un token invalido, confirmando que la autenticacion documental esta activa,
  - las dos migraciones fueron aplicadas en Supabase desde el SQL Editor,
  - `documents`, `document_chunks` y el bucket privado `quantia-documents` responden correctamente,
  - el flujo remoto registro -> upload -> OCR fue validado y persistio el documento,
  - la primera indexacion con `sentence-transformers` reinicio abruptamente la instancia gratuita de Render por consumo de recursos; se incorporo un backend hashing reproducible para completar pgvector sin cargar PyTorch.
- Pendiente de operacion remota antes de declarar cierre total:
  - ninguno para el alcance de persistencia documental de la Tarea 7.1.
- Cierre remoto verificado (11 de agosto de 2026):
  - `EMBEDDING_BACKEND=hashing`, dimension 384 y proteccion de duplicados quedaron activos en Render,
  - el flujo registro -> upload -> OCR -> indexacion termino correctamente; la indexacion tardo 2.35 segundos y persistio un chunk,
  - `match_document_chunks` devolvio el chunk persistido con similitud 1,
  - despues de reiniciar Render, el documento reaparecio con estado `ready`, `indexed=true` y un chunk,
  - un segundo usuario obtuvo lista vacia y `404` al intentar eliminar el documento ajeno,
  - una falla inducida despues de guardar en Storage recibio `409`; Storage permanecio en un objeto y Postgres en una fila, sin huerfanos,
  - la eliminacion final dejo cero documentos, cero chunks, cero objetos y cero usuarios tecnicos de auditoria,
  - el despliegue final `5c3206f` quedo `live` con `DOCUMENT_REJECT_DUPLICATES=true`.
- Estado final: Tarea 7.1 cerrada. La disponibilidad de un LLM para redactar respuestas generativas se valida en las tareas de integracion RAG/Ollama y no condiciona la persistencia ni la recuperacion vectorial verificadas aqui.

### Tarea 7.2 — Crear servicio frontend para documentos

Ubicacion:
- Frontend/src/modules/vivienda/services/documentosApiService.js
- Frontend/src/config/apiBaseUrl.js

Cambios a realizar:
- Crear funciones frontend para consumir:
  - GET /api/documentos/llm/health,
  - POST /api/documentos/upload,
  - POST /api/documentos/{document_id}/procesar,
  - POST /api/documentos/{document_id}/preguntar,
  - GET /api/documentos.
- Manejar multipart/form-data para subida de PDF o imagen.
- Centralizar manejo de errores de backend:
  - OCR sin texto,
  - embeddings no disponibles,
  - Ollama apagado,
  - modelo no descargado,
  - documento no encontrado.
- Definir timeouts razonables para OCR/RAG.

Archivos a crear:
- Frontend/src/modules/vivienda/services/documentosApiService.js

Entregable:
- Servicio frontend reutilizable y probado manualmente contra backend local.

Estado de ejecucion (11 de agosto de 2026):
- Implementado Frontend/src/modules/vivienda/services/documentosApiService.js.
- Operaciones disponibles:
  - estado de Ollama/modelo,
  - subida multipart con quote_id y module_key opcionales,
  - listado de documentos del usuario,
  - procesamiento e indexacion,
  - preguntas RAG con top_k,
  - eliminacion,
  - consulta directa de texto.
- Todas las operaciones protegidas reciben accessToken y envian Authorization: Bearer.
- El login y authStore conservan access_token y token_type entregados por el backend.
- DocumentApiError normaliza autenticacion, documento inexistente, tamaño, MIME, validacion, OCR, embeddings, Ollama/modelo, errores de backend, red, timeout y cancelacion.
- Timeouts diferenciados para health, listado, upload/OCR, indexacion, preguntas, eliminacion y consulta directa.
- apiBaseUrl soporta VITE_BACKEND_URL y variables anteriores de compatibilidad sin duplicar /api.
- Validacion completada:
  - 6 pruebas unitarias del servicio con Node,
  - build de produccion Vite correcto,
  - prueba de integracion real contra FastAPI local: upload -> list -> delete.
- No se inicio la vista ni la ruta de la Tarea 7.3.

### Tarea 7.3 — Crear vista base de documentos

Ubicacion:
- Frontend/src/modules/vivienda/views/DocumentosView.vue
- Frontend/src/modules/vivienda/router/index.js

Cambios a realizar:
- Crear ruta:
  - /vivienda/documentos
- Crear vista con secciones operativas:
  - estado de Ollama/modelo,
  - subida de documento,
  - listado de documentos procesados,
  - accion para indexar documento,
  - panel de pregunta/respuesta.
- Mostrar metadata OCR:
  - nombre de archivo,
  - tipo/extension,
  - numero de paginas/chunks,
  - estado indexado/no indexado.
- Evitar modificar calculos de cotizacion desde esta vista.

Archivos a crear o modificar:
- Frontend/src/modules/vivienda/views/DocumentosView.vue
- Frontend/src/modules/vivienda/router/index.js

Entregable:
- Vista funcional independiente del flujo de cotizacion.

Estado de ejecucion (11 de agosto de 2026):
- Implementada Frontend/src/modules/vivienda/views/DocumentosView.vue.
- Registrada la ruta protegida /vivienda/documentos con nombre vivienda-documentos.
- La vista incluye:
  - estado de Ollama y del modelo configurado,
  - carga multipart de PDF, imagen o TXT con procesamiento OCR,
  - biblioteca de documentos del usuario,
  - accion individual para indexar,
  - seleccion de documento y panel basico de pregunta/respuesta.
- Se muestra metadata documental disponible: nombre, MIME o extension, paginas, chunks, estado y fecha.
- La vista consume exclusivamente documentosApiService y authStore; no importa viviendaStore ni modifica cantidades, precios o resultadoFinal.
- Validacion completada:
  - 6 pruebas unitarias del servicio documental,
  - 3 pruebas de contrato para ruta, operaciones, metadata e independencia de cotizacion,
  - build de produccion Vite correcto con 71 modulos transformados.
- No se agregaron accesos desde Dashboard, revision o imprimible; corresponden a la Tarea 7.4.
- Los estados detallados por fase, fragmentos recuperados y acciones sugeridas permanecen en la Tarea 7.5.

### Tarea 7.4 — Agregar puntos de entrada en interfaces existentes

Ubicacion:
- Frontend/src/modules/vivienda/views/DashboardView.vue
- Frontend/src/modules/vivienda/views/CotizacionRevisionInferenciaView.vue
- Frontend/src/modules/vivienda/views/CotizacionImprimibleView.vue

Cambios a realizar:
- Agregar acceso principal desde Dashboard:
  - boton o card "Documentos / Asistente documental".
- Agregar acceso secundario desde revision de inferencia e imprimible, solo como consulta documental.
- Mantener el flujo de cotizacion protegido como esta actualmente.
- No agregar dependencia obligatoria de documentos para cotizar.

Entregable:
- Navegacion clara hacia el modulo documental sin interrumpir el flujo existente.

Estado de ejecucion (11 de agosto de 2026):
- Dashboard incluye un acceso principal mediante:
  - enlace Documentos en la navegacion superior,
  - card independiente "Documentos / Asistente documental",
  - boton "Abrir asistente documental".
- Revision de inferencia e imprimible incluyen accesos secundarios "Consultar documentos" y enlace superior.
- Todos los accesos navegan a /vivienda/documentos sin escribir en viviendaStore ni ejecutar calculos.
- La ruta documental conserva requiresAuth y no fue agregada a requiresFlow; cotizar e imprimir no dependen del modulo documental.
- Validacion completada:
  - 6 pruebas unitarias del servicio documental,
  - 4 pruebas de contrato de vista, ruta, metadata y navegacion opcional,
  - build de produccion Vite correcto con 71 modulos transformados.

### Tarea 7.5 — Conectar vista con flujo OCR → indexar → preguntar

Ubicacion:
- Frontend/src/modules/vivienda/views/DocumentosView.vue
- Frontend/src/modules/vivienda/services/documentosApiService.js

Cambios a realizar:
- Implementar flujo completo:
  1. seleccionar archivo,
  2. subir/procesar OCR,
  3. mostrar texto extraido o resumen inicial,
  4. indexar documento,
  5. realizar pregunta,
  6. mostrar respuesta y fragmentos recuperados.
- Mostrar estados de carga por fase:
  - subiendo,
  - procesando OCR,
  - indexando,
  - consultando modelo.
- Mostrar errores recuperables y acciones sugeridas.

Entregable:
- Flujo documental usable de extremo a extremo desde frontend.

Estado de ejecucion (11 de agosto de 2026):
- DocumentosView implementa el flujo seleccionar -> subir/OCR -> revisar texto -> indexar -> preguntar -> revisar respuesta y evidencia.
- Se agrego una barra de fases con estados idle, listo, activo y completado para:
  - subiendo,
  - procesando OCR,
  - indexando,
  - consultando modelo.
- La respuesta de upload conserva y muestra el texto extraido durante la sesion activa.
- La respuesta de indexacion conserva y muestra los chunks generados, incluyendo pagina cuando existe en metadata.
- La consulta permite definir top_k entre 1 y 20 y muestra respuesta, fragmentos recuperados, identificador y similitud.
- Los errores documentales incluyen sugerencias especificas y reintento contextual para health, listado, upload, indexacion o consulta.
- Se contemplan autenticacion, tamano, MIME, validacion, OCR vacio, embeddings, Ollama/modelo, documento inexistente, red, backend y timeout.
- La pregunta permanece deshabilitada hasta que el documento este indexado y Ollama/modelo reporten disponibilidad.
- Limitacion conocida: el texto OCR completo y los chunks se muestran para operaciones realizadas en la sesion actual; GET /api/documentos no devuelve texto ni contenido de chunks para reconstruir esas vistas despues de recargar.
- Validacion completada:
  - 9 pruebas unitarias del servicio documental,
  - 5 pruebas de contrato de vista, ruta, navegacion, evidencia y recuperacion,
  - build de produccion Vite correcto con 71 modulos transformados.

### Tarea 7.6 — Definir integracion futura con cotizacion y calculos

Ubicacion:
- Frontend/src/modules/vivienda/store/viviendaStore.js
- Backend/app/services/result_service.py
- Backend/app/services/motor_simulation_service.py

Cambios a realizar:
- Auditar que el modulo documental no altere directamente:
  - cantidades,
  - precios unitarios,
  - factor de ajuste,
  - resultadoFinal.
- Definir una fase futura para que el RAG solo sugiera datos, no los aplique automaticamente.
- Identificar campos candidatos a prellenado asistido:
  - ubicacionProyecto,
  - condicionesEspeciales,
  - observaciones,
  - alcance preliminar,
  - notas tecnicas.
- Requerir confirmacion del usuario antes de copiar informacion del documento al formulario.

Entregable:
- Lista de campos candidatos y regla de no afectar calculo sin confirmacion.

Estado de ejecucion (11 de agosto de 2026):
- Auditoria completada sin modificar viviendaStore, result_service.py ni motor_simulation_service.py.
- No existen imports, llamadas o dependencias de documentos, OCR, RAG, chunks o embeddings en esos tres componentes.
- La fuente autoritativa del calculo permanece separada:
  - motor_simulation_service calcula cantidades desde geometria, espacios, preliminares y controles confirmados,
  - los precios provienen del catalogo y price_concept_bases,
  - result_service aplica factorAjuste a precios/totales y suma resultadoFinal,
  - viviendaStore solo recibe resultadoFinal mediante setResultado despues de la inferencia backend.

Campos candidatos a sugerencia documental:

| Campo destino | Tipo de sugerencia | Efecto al aceptar | Regla |
| --- | --- | --- | --- |
| datosGeneralesObra.ubicacionProyecto | Ubicacion textual | setDatosGeneralesObra reinicia desde estructura_espacial | Confirmacion individual y advertencia de reinicio |
| datosGeneralesObra.condicionesEspeciales | Texto descriptivo | Reinicia revision_inferencia | Confirmacion individual |
| preliminares.observaciones | Nota textual del sitio | No cambia cantidades por si sola | Confirmacion individual |
| preliminares.alcanceSeleccionado | Valor controlado de alcance preliminar | setPreliminares reinicia modulos | Validar contra catalogo, advertir impacto y confirmar |
| datosGeneralesObra.notas | Notas tecnicas | Reinicia revision_inferencia | Confirmacion individual |
| revisionInferencia.observaciones | Nota de revision | Invalida resumen confirmado | Confirmacion individual |

Campos excluidos de aplicacion documental:
- factorAjuste y factorAjusteAplicado,
- dimensiones, areas, niveles, alturas y cantidades,
- unitPrice, total, costoEstimado y resultadoFinal,
- selectedConceptKeys, selectedConcepts y summaryByPartida,
- tipoIntervencion, modulosActivos y partidasSeleccionadas,
- cualquier campo no incluido expresamente en la lista blanca.

Contrato propuesto para una fase futura:
- El RAG genera propuestas, nunca un patch directo sobre viviendaStore o la cotizacion persistida.
- Cada propuesta debe incluir:
  - suggestion_id,
  - document_id,
  - target_path incluido en lista blanca,
  - current_value y proposed_value,
  - confidence,
  - evidence con chunk_id, contenido, pagina y score,
  - status pending, accepted o rejected,
  - accepted_by y accepted_at cuando corresponda.
- La interfaz presenta valor actual, valor sugerido, evidencia y efecto de reinicio antes de habilitar Aceptar.
- Aceptar una propuesta ejecuta el setter publico correspondiente; no se permite mutar el store directamente.
- Las propuestas se aceptan o rechazan una por una; no se contempla "aplicar todo" para campos con impacto downstream.
- Despues de aceptar un campo que invalide etapas, el usuario debe revisar los formularios afectados y volver a ejecutar la inferencia.
- La trazabilidad conserva documento, fragmentos fuente, usuario y fecha de la decision.

Criterios de aceptacion para implementar esta integracion en el futuro:
- RAG y documentos permanecen fuera de result_service y motor_simulation_service.
- Ninguna sugerencia modifica costos antes de confirmacion humana y recaptura/recalculo explicito.
- Backend rechaza target_path fuera de lista blanca y valores que no cumplan tipo, longitud o catalogo.
- Pruebas demuestran que rechazar o ignorar sugerencias deja el estado y resultadoFinal sin cambios.
- Pruebas demuestran que aceptar texto usa setters existentes y respeta sus invalidaciones downstream.

### Tarea 7.7 — Validacion frontend antes de cerrar fase

Ubicacion:
- Frontend/
- Backend/

Cambios a realizar:
- Ejecutar build frontend.
- Ejecutar pruebas backend.
- Probar manualmente con al menos:
  - archivo TXT simple,
  - PDF con texto embebido,
  - imagen o PDF escaneado si Tesseract/Poppler estan instalados.
- Verificar mensajes cuando Ollama esta apagado o modelo no descargado.

Entregable:
- Evidencia minima de funcionamiento y lista de limitaciones conocidas.

Estado de ejecucion (11 de agosto de 2026):
- Frontend validado:
  - 9 pruebas unitarias de documentos aprobadas,
  - 5 pruebas de contrato de vista/navegacion aprobadas,
  - build Vite correcto con 71 modulos transformados.
- Backend validado:
  - 67 pruebas unittest aprobadas,
  - endpoints, autenticacion, persistencia, politicas, OCR, embeddings, RAG, LLM y vector store incluidos.
- Integracion local real frontend -> FastAPI con backends local/hashing:
  - health 200,
  - upload TXT 200,
  - list 200,
  - delete 200,
  - documento eliminado al finalizar,
  - servidor temporal detenido y logs temporales eliminados.
- Validacion manual de formatos con archivos temporales:
  - TXT: correcto; extrajo texto y reporto una pagina,
  - PDF con texto embebido: correcto; extrajo texto y reporto una pagina,
  - PNG escaneado: no disponible porque falta el ejecutable Tesseract,
  - PDF escaneado: no disponible porque falta Poppler.
- Validacion LLM:
  - Ollama esta instalado y el daemon local responde correctamente,
  - `llama3.2:3b` esta descargado y disponible; `llama3.1:8b` fue retirado por su consumo de memoria,
  - la configuracion local usa `OLLAMA_MODEL=llama3.2:3b` y `OLLAMA_CONTEXT_LENGTH=2048`,
  - LLMService envia el limite de contexto a Ollama mediante `num_ctx`,
  - una consulta RAG real respondio correctamente usando el contexto documental,
  - tambien permanecen cubiertos los estados Ollama apagado y modelo ausente mediante pruebas unitarias/controladas,
  - el frontend conserva los mensajes para comprobar Ollama y descargar el modelo cuando corresponda.

Limitaciones y hallazgos:
- Tesseract y Poppler no estan instalados o disponibles en PATH; no se puede certificar OCR de imagen/PDF escaneado en este equipo.
- La inferencia local depende de la memoria disponible; en este equipo de 8 GB se valido `llama3.2:3b` con contexto 2048. Modelos o contextos mayores pueden agotar la memoria.
- Defecto detectado: OCRService convierte los errores de Tesseract/Poppler en contenido textual y reporta page_count=1. Una imagen o PDF escaneado puede aparentar OCR completado con el mensaje de error como texto.
- Antes de declarar soporte de escaneados se debe:
  - instalar y configurar Tesseract y Poppler,
  - hacer que OCRService propague un error tipado o texto vacio ante fallas de dependencias,
  - verificar que el endpoint responda un error recuperable y no persista el mensaje tecnico como contenido OCR,
  - repetir PNG y PDF escaneado con texto conocido.
- Estado de cierre: validacion 7.7 ejecutada con exito para TXT, PDF embebido, suites, flujo local y respuesta RAG generativa real; soporte escaneado queda pendiente por las limitaciones anteriores.

---
## Fase 8: Pruebas y validaciÃ³n

### Requisitos y estado de inicio (11 de agosto de 2026)

La Fase 8 puede iniciar, pero su cierre completo requiere preparar el entorno y un corpus documental controlado.

Estado por tarea:
- Tarea 8.1: parcialmente bloqueada para imagenes y PDF escaneados porque Tesseract y Poppler no estan instalados ni disponibles en PATH. Las pruebas con TXT y PDF con texto embebido pueden comenzar.
- Tarea 8.2: libre para iniciar; el backend de embeddings hashing y el almacenamiento vectorial ya fueron validados.
- Tarea 8.3: libre para iniciar; Ollama responde con `llama3.2:3b`, contexto 2048 y una consulta RAG generativa real ya fue comprobada.
- Tarea 8.4: debe ejecutarse despues de obtener evidencia suficiente de las tareas 8.1, 8.2 y 8.3.

Herramientas requeridas para cerrar la validacion OCR:
- instalar Tesseract OCR y habilitar el idioma espanol;
- instalar Poppler y comprobar que `pdftoppm` este disponible en PATH;
- conservar `pytesseract` y `pdf2image` instalados en el entorno Python;
- mantener Ollama activo con `llama3.2:3b` y `OLLAMA_CONTEXT_LENGTH=2048` durante las pruebas generativas.

Corpus minimo de documentos reales:
- un TXT con informacion y respuestas conocidas;
- un PDF con texto seleccionable;
- una imagen PNG o JPG escaneada;
- un PDF escaneado, preferentemente de varias paginas.

Cada documento de prueba debe incluir una ficha de control con:
- texto o datos esperados;
- datos importantes que deben recuperarse;
- entre tres y cinco preguntas con respuestas conocidas;
- resultado minimo aceptable de OCR y recuperacion.

La evidencia debe registrar documento, formato, resultado OCR, chunks recuperados, pregunta, respuesta esperada, respuesta obtenida, latencia y resultado final.

### Tarea 8.1 â€” Probar OCR con documentos reales

UbicaciÃ³n:
- Backend/app/services/ocr_service.py

Cambios a realizar:
- Validar que los documentos se procesen correctamente.
- Ajustar el preprocesamiento si el texto estÃ¡ incompleto.

Estado de ejecucion (11 de agosto de 2026):
- Entorno local preparado:
  - Tesseract 5.5.3 instalado,
  - modelo oficial `spa.traineddata` de `tessdata_fast` configurado,
  - Poppler 25.07 instalado y `pdftoppm` disponible mediante ruta explicita,
  - rutas locales aisladas en `Backend/.env.local`, sin modificar Render.
- Se creo un corpus controlado y reproducible con TXT, PDF con texto embebido, PNG escaneado y PDF escaneado de dos paginas, junto con datos y preguntas esperadas.
- Evidencia registrada en `Backend/tests/evidence/task_8_1_ocr_results.json`:
  - TXT: similitud 100%, 7/7 datos, 0.61 ms,
  - PDF con texto embebido: similitud 100%, 7/7 datos, 548.37 ms,
  - PNG escaneado: similitud 97.99%, 5/5 datos, 828.37 ms,
  - PDF escaneado: similitud 92.98%, 6/7 coincidencias textuales exactas, 2667.87 ms y todos los valores numericos esenciales recuperados.
- Limitacion observada: el superindice de `cm²` se reconoce como `cm?` en el PDF escaneado. Una prueba adicional a 300 DPI no lo corrigio y redujo el reconocimiento de otro signo, por lo que se conserva la rasterizacion predeterminada de 200 DPI.
- Defecto heredado de 7.7 corregido:
  - las fallas de Tesseract, idioma o Poppler se propagan como errores tipados,
  - un documento soportado sin texto produce error de procesamiento,
  - el endpoint responde `503` ante dependencias ausentes,
  - el registro queda en estado `failed` y el mensaje tecnico no se persiste como `ocr_text`.
- Pruebas especificas: 30/30 aprobadas para OCR, servicio documental y endpoints.
- Estado: validacion tecnica completada con corpus controlado; queda pendiente incorporar al menos un documento externo real del usuario para cerrar la evidencia empirica de 8.1. Este pendiente no bloquea el inicio de 8.2.

### Tarea 8.2 â€” Probar recuperaciÃ³n semÃ¡ntica

UbicaciÃ³n:
- Backend/app/services/rag_service.py

Cambios a realizar:
- Verificar que las preguntas recuperen los chunks correctos.
- Ajustar tamaÃ±o de chunks y nÃºmero de resultados.

Estado de ejecucion (11 de agosto de 2026):
- Se creo un documento controlado de 514 palabras con siete secciones, cifras y responsables distractores, mas ocho preguntas con respuesta conocida.
- Se evaluaron 12 combinaciones de `chunk_size` 80/150/250/700 y `top_k` 1/2/3 usando embeddings hashing de 384 dimensiones.
- Las configuraciones de 700 palabras generaron un solo chunk y se excluyeron de la recomendacion porque no miden recuperacion selectiva.
- Configuracion seleccionada: `RAG_CHUNK_SIZE=150`, `RAG_CHUNK_OVERLAP=30` y `RAG_TOP_K=3`.
- Resultado seleccionado:
  - recall 100% para 8/8 preguntas,
  - mean reciprocal rank 0.9167,
  - cinco chunks indexados,
  - promedio de 450 palabras recuperadas por consulta,
  - latencia media local de recuperacion 0.356 ms.
- Los valores quedaron centralizados como configuracion de entorno y RAGService ya no depende de los valores fijos 700/100.
- Evidencia completa: `Backend/tests/evidence/task_8_2_rag_results.json`.
- Pruebas especificas de RAG, embeddings y vector store: 22/22 aprobadas.
- Estado: Tarea 8.2 completada para el backend hashing/local. La comprobacion de respuestas generativas con estos fragmentos corresponde a 8.3.

### Tarea 8.3 â€” Probar respuestas del modelo

UbicaciÃ³n:
- Backend/app/services/llm_service.py

Cambios a realizar:
- Validar que las respuestas sean Ãºtiles y coherentes.
- Ajustar el prompt si la respuesta es demasiado vaga o inventa informaciÃ³n.

Estado de ejecucion (11 de agosto de 2026):
- Primera linea base con timeout 30 segundos:
  - 4/10 consultas completadas,
  - seis timeouts mientras Ollama continuaba generando en CPU,
  - una respuesta amplio incorrectamente una sigla y varias citas usaron identificadores inexistentes.
- Ajustes aplicados:
  - `OLLAMA_MAX_TOKENS=64` enviado como `num_predict`,
  - `OLLAMA_TIMEOUT_SECONDS=60`, compatible con el timeout frontend de 120 segundos,
  - temperatura local 0 para respuestas factuales,
  - prompt extractivo con rechazo explicito cuando no existe respuesta,
  - normalizacion backend de rechazos y seleccion determinista de una cita valida entre los chunks recuperados.
- Validacion final con `llama3.2:3b`, contexto 2048 y diez consultas reales:
  - 8/8 preguntas con respuesta conocida aprobadas,
  - 2/2 preguntas sin respuesta rechazadas correctamente,
  - 8/8 respuestas documentales con identificador de chunk valido,
  - 10/10 solicitudes completadas sin timeout,
  - latencia media 31.96 segundos y maxima 47.20 segundos en CPU.
- Evidencia completa: `Backend/tests/evidence/task_8_3_llm_results.json`.
- Limitacion conocida: la inferencia local es funcional pero lenta en este equipo de 8 GB; la interfaz debe conservar el indicador de procesamiento y el timeout de 120 segundos.
- Estado: Tarea 8.3 completada para el modelo y hardware locales configurados.

### Tarea 8.4 â€” Verificar integraciÃ³n total

UbicaciÃ³n:
- Backend/app/api/v1/endpoints/documentos.py
- Frontend/src/modules/vivienda/services/documentosApiService.js

Cambios a realizar:
- Validar el flujo completo: subir documento â†’ procesar â†’ indexar â†’ consultar.

Estado de ejecucion (12 de agosto de 2026):
- Integracion ejecutada localmente desde el cliente real `documentosApiService.js` contra FastAPI y Ollama, sin requerir despliegue en Vercel o Render.
- Configuracion de prueba: persistencia local, vector store local, embeddings hashing y `llama3.2:3b`.
- Flujo validado:
  - health de Ollama/modelo 200,
  - upload y OCR de documento controlado 200,
  - procesamiento e indexacion 200 con cinco chunks,
  - pregunta documental 200 con respuesta `$250,000.00 MXN` y cita de chunk valida,
  - listado del documento en estado `ready`,
  - eliminacion 200,
  - listado final sin el documento temporal.
- La corrida completa aprobada tardo 27.3 segundos y recupero tres matches.
- Una primera corrida recibio un `503` transitorio durante la pregunta; el mecanismo `finally` elimino el documento y verifico la limpieza. El reintento inmediato completo todas las operaciones.
- Evidencia: `Backend/tests/evidence/task_8_4_integration_results.json`.
- Validacion final del repositorio:
  - backend 75/75 pruebas aprobadas,
  - servicio documental frontend 9/9 pruebas aprobadas,
  - vista documental frontend 5/5 pruebas aprobadas,
  - build Vite correcto con 71 modulos transformados.
- Estado: Tarea 8.4 completada en entorno local. La certificacion remota en Render/Vercel se mantiene como paso posterior al cierre funcional local.

### Estado general de la Fase 8

- Tarea 8.1: validacion tecnica controlada completada; pendiente una muestra externa real aportada por el usuario.
- Tarea 8.2: completada.
- Tarea 8.3: completada.
- Tarea 8.4: completada localmente.
- Para declarar la Fase 8 totalmente cerrada solo falta incorporar y registrar al menos un documento externo real. El despliegue remoto no es requisito para este cierre local.

---

## Entregables finales

Al concluir el plan se deberÃ¡ contar con:

- un mÃ³dulo backend para OCR + RAG + Llama 3.2 3B,
- endpoints de API listos para consumo,
- una interfaz simple en frontend para subir documentos y consultar respuestas,
- evidencia de funcionamiento con documentos reales.

---

## Riesgos esperados

- calidad limitada del OCR en documentos escaneados,
- respuestas poco precisas si la recuperaciÃ³n semÃ¡ntica es dÃ©bil,
- latencia alta si se recuperan demasiados chunks,
- necesidad de ajustar el prompt y la segmentaciÃ³n.

## Prioridad recomendada

1. OCR y extracciÃ³n de texto.
2. Chunking y embeddings.
3. RecuperaciÃ³n semÃ¡ntica.
4. IntegraciÃ³n con Llama 3.1 8B.
5. ExposiciÃ³n por API.
6. IntegraciÃ³n frontend.

