import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const viewSource = await readFile(
  new URL("../src/modules/vivienda/views/DocumentosView.vue", import.meta.url),
  "utf8"
);
const routerSource = await readFile(
  new URL("../src/modules/vivienda/router/index.js", import.meta.url),
  "utf8"
);
const navigationViews = await Promise.all(
  [
    "DashboardView.vue",
    "CotizacionRevisionInferenciaView.vue",
    "CotizacionImprimibleView.vue",
  ].map((fileName) =>
    readFile(new URL(`../src/modules/vivienda/views/${fileName}`, import.meta.url), "utf8")
  )
);

test("registra la ruta documental como vista protegida", () => {
  assert.match(routerSource, /import DocumentosView/);
  assert.match(routerSource, /path:\s*["']\/vivienda\/documentos["']/);
  assert.match(routerSource, /name:\s*["']vivienda-documentos["']/);
  assert.match(routerSource, /component:\s*DocumentosView/);
  assert.match(routerSource, /requiresAuth:\s*true/);
});

test("incluye las operaciones basicas de la tarea 7.3", () => {
  for (const operation of [
    "obtenerEstadoLlmDocumental",
    "listarDocumentos",
    "subirDocumento",
    "procesarDocumento",
    "preguntarDocumento",
  ]) {
    assert.match(viewSource, new RegExp(`\\b${operation}\\b`));
  }

  assert.match(viewSource, /Subir documento/);
  assert.match(viewSource, /Documentos procesados/);
  assert.match(viewSource, /Indexar para consultas/);
  assert.match(viewSource, /Pregunta al documento/);
});

test("muestra metadata OCR sin depender del estado de cotizacion", () => {
  assert.match(viewSource, /file_name/);
  assert.match(viewSource, /page_count/);
  assert.match(viewSource, /chunk_count/);
  assert.match(viewSource, /document\.indexed/);
  assert.doesNotMatch(viewSource, /useViviendaStore/);
  assert.doesNotMatch(viewSource, /resultadoFinal/);
});

test("ofrece accesos documentales sin condicionar el flujo de cotizacion", () => {
  for (const source of navigationViews) {
    assert.match(source, /router\.push\(["']\/vivienda\/documentos["']\)/);
    assert.match(source, /@click="goDocuments"/);
  }

  assert.doesNotMatch(routerSource, /requiresFlow:[^}]*documentos/s);
});

test("presenta el flujo completo con evidencia y recuperacion de errores", () => {
  for (const phase of ["Subiendo", "Procesando OCR", "Indexando", "Consultando modelo"]) {
    assert.match(viewSource, new RegExp(phase));
  }

  assert.match(viewSource, /selectedUploadResult\?\.text/);
  assert.match(viewSource, /selectedIndexedChunks/);
  assert.match(viewSource, /selectedMatches/);
  assert.match(viewSource, /Fragmentos recuperados/);
  assert.match(viewSource, /errorSuggestion/);
  assert.match(viewSource, /retryLastOperation/);
});
