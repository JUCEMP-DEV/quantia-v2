import assert from "node:assert/strict";
import { File } from "node:buffer";

import {
  eliminarDocumento,
  listarDocumentos,
  subirDocumento,
} from "../src/modules/vivienda/services/documentosApiService.js";


const accessToken = String(process.env.DOCUMENT_TEST_TOKEN || "").trim();
if (!accessToken) throw new Error("DOCUMENT_TEST_TOKEN es obligatorio para la prueba de integracion.");

const file = new File(["Documento de integracion OCR"], "integracion.txt", {
  type: "text/plain",
});

const uploaded = await subirDocumento({ file, accessToken, timeoutMs: 30000 });
assert.equal(uploaded.status, "ocr_completed");
assert.ok(uploaded.document_id);

const listed = await listarDocumentos({ accessToken, timeoutMs: 10000 });
assert.ok(listed.documents.some((item) => item.document_id === uploaded.document_id));

const deleted = await eliminarDocumento({
  documentId: uploaded.document_id,
  accessToken,
  timeoutMs: 10000,
});
assert.equal(deleted.document_id, uploaded.document_id);

console.log(`Integracion documental local correcta: ${uploaded.document_id}`);
