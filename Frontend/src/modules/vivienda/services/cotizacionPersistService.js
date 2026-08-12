import {
  buildRawInferenceSnapshot,
  normalizeInferenceSnapshot,
} from "@/modules/vivienda/services/inferenciaSnapshotService";
import { API_BASE_URL } from "@/config/apiBaseUrl";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildTotalsByGroup(technicalConcepts = []) {
  const grouped = {};
  for (const item of technicalConcepts) {
    const group = String(item?.group || "General").trim() || "General";
    grouped[group] = toNumber(grouped[group], 0) + toNumber(item?.total, 0);
  }

  return Object.entries(grouped).map(([group, total]) => ({
    group,
    total: Number(toNumber(total).toFixed(2)),
  }));
}

function hasBackendResultPayload(result = {}) {
  const technical = Array.isArray(result?.desglose?.technicalConcepts)
    ? result.desglose.technicalConcepts
    : [];
  const official = Array.isArray(result?.desglose?.officialSummary)
    ? result.desglose.officialSummary
    : [];
  const total = toNumber(result?.resultadoFinal, 0);
  const technicalTotal = technical.reduce((acc, item) => acc + toNumber(item?.total, 0), 0);
  return technical.length > 0 && official.length > 0 && Math.max(total, technicalTotal) > 0;
}

function buildResumen(viviendaStore, resultPreview = null) {
  const normalizedSnapshot = normalizeInferenceSnapshot({
    preliminares: viviendaStore.preliminares,
    modulos: viviendaStore.modulos,
    datosGeneralesObra: viviendaStore.datosGeneralesObra,
    variablesEntrada: viviendaStore.variablesEntrada,
    estructuraEspacial: viviendaStore.estructuraEspacial,
    colindanciasRecorrido: viviendaStore.colindanciasRecorrido,
    validacionEspacial: viviendaStore.validacionEspacial,
    strict: true,
  });

  const baseResult = resultPreview || viviendaStore.resultado || {};
  const technicalConcepts = Array.isArray(baseResult?.desglose?.technicalConcepts)
    ? baseResult.desglose.technicalConcepts
    : [];
  const officialSummary = Array.isArray(baseResult?.desglose?.officialSummary)
    ? baseResult.desglose.officialSummary
    : [];
  const espacios = normalizedSnapshot.estructuraEspacial?.espacios || [];
  const relaciones = normalizedSnapshot.colindanciasRecorrido?.relaciones || [];
  const totalPresupuesto = toNumber(baseResult?.resultadoFinal, 0);
  const pendingDefinitions = baseResult?.metadata?.pendingDefinitions || [];
  const totalsByGroup = buildTotalsByGroup(technicalConcepts);

  return {
    totalPresupuesto: Number(totalPresupuesto.toFixed(2)),
    moneda: "MXN",
    technicalConcepts: technicalConcepts.length,
    officialGroups: officialSummary.length,
    resumenOficial: officialSummary.map((item) => ({
      group: item?.group || "",
      title: item?.title || "",
      total: Number(toNumber(item?.total, 0).toFixed(2)),
    })),
    totalesPorGrupoTecnico: totalsByGroup,
    conceptosTecnicos: technicalConcepts.map((item) => ({
      key: item?.key || "",
      title: item?.title || "",
      group: item?.group || "",
      unit: item?.unit || "",
      quantity: Number(toNumber(item?.quantity, 0).toFixed(4)),
      unitPrice: Number(toNumber(item?.unitPrice, 0).toFixed(2)),
      total: Number(toNumber(item?.total, 0).toFixed(2)),
    })),
    spaces: espacios.length,
    spatialRelations: relaciones.length,
    pendingDefinitions: pendingDefinitions.length,
    pendingDefinitionsDetail: [...pendingDefinitions],
    motorVersion: baseResult?.metadata?.motorVersion || "",
    generatedAt: new Date().toISOString(),
  };
}

function buildPayload(viviendaStore, resultPreview = null) {
  const normalizedSnapshot = normalizeInferenceSnapshot({
    preliminares: viviendaStore.preliminares,
    modulos: viviendaStore.modulos,
    datosGeneralesObra: viviendaStore.datosGeneralesObra,
    variablesEntrada: viviendaStore.variablesEntrada,
    estructuraEspacial: viviendaStore.estructuraEspacial,
    colindanciasRecorrido: viviendaStore.colindanciasRecorrido,
    validacionEspacial: viviendaStore.validacionEspacial,
    strict: true,
  });
  const captureSnapshot = buildRawInferenceSnapshot(normalizedSnapshot);

  const baseResult = resultPreview || viviendaStore.resultado || {};
  return {
    registro: viviendaStore.registro,
    clasificacion: viviendaStore.clasificacion,
    alcance: viviendaStore.alcance,
    datosGeneralesObra: captureSnapshot.datosGeneralesObra,
    variablesEntrada: captureSnapshot.variablesEntrada,
    estructuraEspacial: captureSnapshot.estructuraEspacial,
    colindanciasRecorrido: captureSnapshot.colindanciasRecorrido,
    validacionEspacial: captureSnapshot.validacionEspacial,
    preliminares: captureSnapshot.preliminares,
    modulos: captureSnapshot.modulos,
    revisionInferencia: viviendaStore.revisionInferencia,
    resultado: baseResult,
  };
}

export async function saveCotizacionSnapshot({
  authUser,
  viviendaStore,
  status = "reviewed",
  resultPreview = null,
} = {}) {
  if (!authUser?.email) {
    throw new Error("No hay usuario autenticado con email para guardar la cotizacion.");
  }

  const inferredResult = resultPreview || viviendaStore.resultado || {};
  if (!hasBackendResultPayload(inferredResult)) {
    throw new Error(
      "No hay resultado completo de inferencia backend para guardar. Ejecuta inferencia antes de persistir."
    );
  }

  const body = {
    quote_id: inferredResult?.metadata?.quoteId || null,
    user_email: String(authUser.email).trim().toLowerCase(),
    status,
    modulo: "vivienda",
    subtipo: authUser.perfil || "",
    payload_json: buildPayload(viviendaStore, resultPreview),
    resumen_json: buildResumen(viviendaStore, resultPreview),
    total: toNumber(inferredResult?.resultadoFinal || 0),
  };

  const response = await fetch(`${API_BASE_URL}/api/cotizaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || "No se pudo guardar la cotizacion en backend.");
  }

  return data;
}
