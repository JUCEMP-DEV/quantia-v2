# Proceso de implementación: OCR + RAG + Llama 3.1 8B

## 1. Análisis inicial

El proyecto actual ya cuenta con una base sólida de backend en FastAPI, rutas organizadas en la carpeta Backend/app y conexión con Supabase. Para incorporar OCR + RAG + un modelo LLM, la propuesta más práctica es integrar un flujo de ingestión y consulta basado en servicios backend independientes, sin modificar el núcleo del sistema de cotizaciones.

### Recomendación técnica

- OCR: Tesseract o PaddleOCR para documentos PDF e imágenes escaneadas.
- RAG: chunking de texto, embeddings, almacenamiento vectorial en Supabase Postgres con pgvector.
- Modelo LLM: Llama 3.1 8B ejecutado con Ollama para un PoC rápido y fácil de desplegar.
- Backend: FastAPI ya existente, con nuevos endpoints para subir documentos, procesarlos y consultar respuestas.

## 2. Objetivo del proyecto

Permitir que el sistema procese documentos escaneados o PDFs, extraiga texto con OCR, cree una base de conocimiento semántica y responda preguntas usando un modelo Llama 3.1 8B con contexto recuperado.

## 3. Arquitectura propuesta

### Flujo general

1. Subida de documentos desde el frontend o directamente por API.
2. Extracción de texto con OCR.
3. Limpieza y normalización del texto.
4. División en chunks.
5. Generación de embeddings.
6. Almacenamiento en base vectorial.
7. Consulta del usuario.
8. Recuperación de chunks relevantes.
9. Generación de respuesta con Llama 3.1 8B.

### Componentes recomendados

- Backend FastAPI: orquesta el flujo.
- Servicio OCR: extrae texto desde PDF, imágenes y documentos escaneados.
- Servicio de embeddings: convierte chunks a vectores.
- Vector DB: Supabase Postgres + pgvector.
- Servicio RAG: recupera contexto y arma prompt.
- Servicio LLM: conecta con Ollama y Llama 3.1 8B.

## 4. Proceso de implementación por fases

### Fase 1: definición de alcance

Objetivo: dejar claro qué documentos se van a procesar y qué tipo de preguntas debe responder el sistema.

Acciones:

- Definir tipos de documentos: PDFs, imágenes, contratos, manuales, informes.
- Definir alcance inicial: solo documentos de texto legible y escaneados simples.
- Definir casos de uso: búsqueda de información, resumen, extracción de datos, preguntas por contexto.
- Definir métricas de éxito: precisión de respuesta, velocidad, cobertura.

Entregable:

- Documento de alcance y casos de uso.

### Fase 2: infraestructura base

Objetivo: preparar el entorno de desarrollo para OCR, embeddings y LLM.

Acciones:

- Instalar dependencias en Backend/requirements.txt.
- Añadir variables de entorno para:
  - OCR_ENGINE
  - OLLAMA_HOST
  - OLLAMA_MODEL
  - EMBEDDING_MODEL
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
- Instalar Ollama y descargar Llama 3.1 8B.
- Configurar pgvector en Supabase si aún no está habilitado.

Paquetes sugeridos:

- fastapi
- python-multipart
- pdf2image
- pytesseract
- paddleocr o easyocr
- sentence-transformers
- langchain o llama-index
- sqlalchemy
- pgvector
- ollama

Entregable:

- Entorno funcional para pruebas locales.

### Fase 3: implementación de OCR

Objetivo: convertir documentos en texto legible.

Acciones:

- Crear un servicio de OCR en Backend/app/services/ocr_service.py.
- Soportar archivos PDF y JPG/PNG.
- Para PDFs, convertir páginas a imágenes y ejecutar OCR.
- Guardar texto extraído con metadata: nombre del archivo, página, fecha, idioma.
- Implementar limpieza básica: corregir saltos de línea, eliminar ruido y caracteres raros.

Flujo recomendado:

1. Subir archivo.
2. Guardar en almacenamiento temporal.
3. Ejecutar OCR por página.
4. Consolidar el texto.
5. Guardar el resultado con el documento.

Entregable:

- Endpoint para procesar documentos y obtener texto OCR.

### Fase 4: indexación y embeddings

Objetivo: convertir texto a contexto semántico recuperable.

Acciones:

- Crear un servicio de chunking en Backend/app/services/rag_service.py.
- Dividir el texto en chunks de tamaño razonable.
- Generar embeddings por chunk.
- Almacenar en una tabla vectorial con:
  - document_id
  - chunk_id
  - content
  - embedding
  - metadata

Estrategia recomendada:

- Tamaño de chunk: 400 a 800 tokens.
- Solapamiento: 50 a 100 tokens.
- Recuperación top-k: 3 a 5 chunks.

Entregable:

- Base vectorial poblada con documentos procesados.

### Fase 5: integración con Llama 3.1 8B

Objetivo: responder preguntas con contexto recuperado.

Acciones:

- Crear un endpoint para consultas tipo RAG.
- Recuperar los chunks más relevantes.
- Construir un prompt con instrucciones claras:
  - responder únicamente con el contexto proporcionado
  - citar el contenido recuperado
  - indicar cuando no exista suficiente información
- Enviar la consulta al modelo Llama 3.1 8B mediante Ollama.

Ejemplo de prompt:

- Contexto: [chunks recuperados]
- Pregunta: [pregunta del usuario]
- Instrucciones: responde de forma breve, precisa y cita el contexto.

Entregable:

- Endpoint de consulta con respuestas generadas por el modelo.

### Fase 6: integración con la arquitectura actual

Objetivo: conectar el nuevo módulo con el sistema existente sin romper el flujo actual.

Cambios recomendados:

- Crear nuevos endpoints en Backend/app/api/v1/endpoints/documentos.py.
- Añadirlos al router principal en Backend/app/api/v1/api.py.
- Crear servicios nuevos bajo Backend/app/services/.
- Si es necesario, añadir un modelo de esquema en Backend/app/schemas/.
- Exponer la funcionalidad desde el frontend con un flujo simple de subida y consulta.

Endpoints sugeridos:

- POST /api/documentos/upload
- POST /api/documentos/{id}/procesar
- POST /api/documentos/{id}/preguntar
- GET /api/documentos

### Fase 7: validación y mejora

Objetivo: asegurar que el sistema responde con calidad.

Acciones:

- Evaluar respuestas con preguntas reales.
- Medir precisión, cobertura y latencia.
- Ajustar:
  - tamaño de chunks
  - número de documentos recuperados
  - prompt engineering
  - modelo OCR
- Añadir logging y monitoreo.

Entregable:

- Proceso validado con ejemplos reales.

## 5. Estructura recomendada en el backend

Propuesta mínima:

- Backend/app/services/ocr_service.py
- Backend/app/services/embedding_service.py
- Backend/app/services/rag_service.py
- Backend/app/services/llm_service.py
- Backend/app/api/v1/endpoints/documentos.py
- Backend/app/schemas/documentos.py

## 6. Riesgos y mitigaciones

### Riesgo: OCR deficiente en documentos escaneados

Mitigación:

- Usar una segunda pasada con preprocesamiento de imagen.
- Probar con varios motores OCR.

### Riesgo: respuestas poco precisas

Mitigación:

- Mejorar chunking.
- Recuperar más contexto.
- Ajustar el prompt.

### Riesgo: latencia alta

Mitigación:

- Usar modelos cuantizados.
- Limitar chunks recuperados.
- Cachear resultados frecuentes.

### Riesgo: costo o dependencia de servicios externos

Mitigación:

- Iniciar con Ollama local y almacenamiento propio.
- Evitar depender de APIs externas en la primera etapa.

## 7. Plan recomendado para el PoC

### Semana 1

- Preparar entorno.
- Instalar OCR y Ollama.
- Probar extracción de texto básica desde PDF e imagen.

### Semana 2

- Implementar ingestión y chunking.
- Crear tabla vectorial.
- Probar embeddings y recuperación.

### Semana 3

- Conectar Llama 3.1 8B.
- Crear endpoint de consulta RAG.
- Validar respuestas con documentos reales.

### Semana 4

- Mejorar prompt y calidad.
- Integrar al frontend.
- Preparar una versión piloto.

## 8. Recomendación final

Para este proyecto, la mejor ruta inicial es:

1. Implementar un PoC con OCR local.
2. Usar Supabase + pgvector para la base semántica.
3. Ejecutar Llama 3.1 8B con Ollama.
4. Exponer la funcionalidad por API en FastAPI.
5. Validar con documentos reales antes de escalar.

Este enfoque permite avanzar rápido, mantener control del costo y alinearse con la arquitectura actual del backend.
