import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  DocumentApiError,
  listarDocumentos,
  preguntarDocumento,
  subirDocumento,
} from "../src/modules/vivienda/services/documentosApiService.js";


const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("rechaza peticiones sin token", async () => {
  await assert.rejects(
    listarDocumentos(),
    (error) => error instanceof DocumentApiError && error.code === "document_auth_required"
  );
});

test("lista documentos con Bearer y URL local", async () => {
  let capturedUrl = "";
  let capturedOptions = null;
  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return new Response(JSON.stringify({ documents: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await listarDocumentos({ accessToken: "token-prueba" });

  assert.deepEqual(result, { documents: [] });
  assert.equal(capturedUrl, "/api/documentos");
  assert.equal(capturedOptions.headers.Authorization, "Bearer token-prueba");
});

test("sube multipart sin fijar Content-Type manualmente", async () => {
  let capturedOptions = null;
  globalThis.fetch = async (_url, options) => {
    capturedOptions = options;
    return new Response(JSON.stringify({ document_id: "doc-1", status: "ocr_completed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const file = new Blob(["contenido"], { type: "text/plain" });

  await subirDocumento({
    file,
    accessToken: "token-prueba",
    quoteId: "11111111-1111-1111-1111-111111111111",
    moduleKey: "preliminares",
  });

  assert.equal(capturedOptions.method, "POST");
  assert.ok(capturedOptions.body instanceof FormData);
  assert.equal(capturedOptions.headers["Content-Type"], undefined);
  assert.equal(capturedOptions.body.get("module_key"), "preliminares");
});

test("clasifica indisponibilidad de Ollama", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ detail: "Ollama no responde y el modelo no esta disponible" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });

  await assert.rejects(
    preguntarDocumento({
      documentId: "doc-1",
      query: "Que contiene?",
      accessToken: "token-prueba",
    }),
    (error) =>
      error instanceof DocumentApiError &&
      error.code === "document_llm_unavailable" &&
      error.status === 503
  );
});

test("distingue timeout de cancelacion externa", async () => {
  globalThis.fetch = (_url, options) =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        reject(new DOMException("aborted", "AbortError"));
      });
    });

  await assert.rejects(
    listarDocumentos({ accessToken: "token-prueba", timeoutMs: 5 }),
    (error) => error instanceof DocumentApiError && error.code === "document_list_timeout"
  );
});

test("envia pregunta y top_k como JSON", async () => {
  let capturedOptions = null;
  globalThis.fetch = async (_url, options) => {
    capturedOptions = options;
    return new Response(JSON.stringify({ answer: "respuesta" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  await preguntarDocumento({
    documentId: "doc 1",
    query: "  pregunta  ",
    topK: 4,
    accessToken: "token-prueba",
  });

  assert.equal(capturedOptions.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(capturedOptions.body), { query: "pregunta", top_k: 4 });
});
