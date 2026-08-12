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
- Pendiente de operacion remota antes de declarar cierre total:
  - aplicar Backend/supabase/migrations/20260811_001_document_persistence.sql en Supabase,
  - configurar DOCUMENT_PERSISTENCE_BACKEND=supabase, VECTOR_STORE_BACKEND=supabase y AUTH_TOKEN_SECRET en Render,
  - desplegar el backend actualizado,
  - ejecutar prueba remota de persistencia despues de reiniciar Render,
  - confirmar que no quedan objetos huerfanos en Supabase Storage ante una falla inducida.

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

---
## Fase 8: Pruebas y validaciÃ³n

### Tarea 8.1 â€” Probar OCR con documentos reales

UbicaciÃ³n:
- Backend/app/services/ocr_service.py

Cambios a realizar:
- Validar que los documentos se procesen correctamente.
- Ajustar el preprocesamiento si el texto estÃ¡ incompleto.

### Tarea 8.2 â€” Probar recuperaciÃ³n semÃ¡ntica

UbicaciÃ³n:
- Backend/app/services/rag_service.py

Cambios a realizar:
- Verificar que las preguntas recuperen los chunks correctos.
- Ajustar tamaÃ±o de chunks y nÃºmero de resultados.

### Tarea 8.3 â€” Probar respuestas del modelo

UbicaciÃ³n:
- Backend/app/services/llm_service.py

Cambios a realizar:
- Validar que las respuestas sean Ãºtiles y coherentes.
- Ajustar el prompt si la respuesta es demasiado vaga o inventa informaciÃ³n.

### Tarea 8.4 â€” Verificar integraciÃ³n total

UbicaciÃ³n:
- Backend/app/api/v1/endpoints/documentos.py
- Frontend/src/services/api.js

Cambios a realizar:
- Validar el flujo completo: subir documento â†’ procesar â†’ indexar â†’ consultar.

---

## Entregables finales

Al concluir el plan se deberÃ¡ contar con:

- un mÃ³dulo backend para OCR + RAG + Llama 3.1 8B,
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

