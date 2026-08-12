import { defineStore } from "pinia";
import { readReglasCatalogosV4 } from "@/modules/vivienda/services/viviendaService";
import { validateSpatialRelations } from "@/modules/vivienda/services/spatialRelationsService";

const MODULE_ORDER = [
  "cimentacion",
  "estructura",
  "albanileria",
  "instalaciones",
  "acabados",
  "complementarios_y_equipamiento",
];

const MODULE_ROUTES = {
  cimentacion: "/vivienda/cotizacion/cimentacion",
  estructura: "/vivienda/cotizacion/estructura",
  albanileria: "/vivienda/cotizacion/albanileria",
  instalaciones: "/vivienda/cotizacion/instalaciones",
  acabados: "/vivienda/cotizacion/acabados",
  complementarios_y_equipamiento: "/vivienda/cotizacion/complementarios",
};

const MODULE_KEY_ALIASES = {
  cimentacion: "cimentacion",
  estructura: "estructura",
  albanileria: "albanileria",
  instalaciones: "instalaciones",
  acabados: "acabados",
  complementarios: "complementarios_y_equipamiento",
  complementarios_y_equipamiento: "complementarios_y_equipamiento",
};

const ALCANCE_MODULES_OBRA_NUEVA = {
  obra_negra: ["cimentacion", "estructura", "albanileria"],
  obra_gris: ["cimentacion", "estructura", "albanileria", "instalaciones"],
  obra_completa: [...MODULE_ORDER],
  obra_blanca: [...MODULE_ORDER],
};

function normalizeModuleKey(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");

  return MODULE_KEY_ALIASES[raw] || "";
}

function normalizeModuleList(list = []) {
  const seen = new Set();
  const result = [];

  for (const item of Array.isArray(list) ? list : []) {
    const normalized = normalizeModuleKey(item);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function emptyRegistro() {
  return {
    prestador: {
      nombre: "",
      telefono: "",
      profesion: "",
      alias: "",
    },
    cliente: {
      nombre: "",
      telefono: "",
      ubicacion: "",
    },
    proyecto: {
      nombreProyecto: "",
      tipoProyecto: "",
    },
    terminosAceptados: false,
  };
}

function emptyClasificacion() {
  return {
    tipoIntervencion: "",
    nivelAcabado: "",
    arquitecturaVersion: "v4",
  };
}

function emptyAlcance() {
  return {
    tipoIntervencion: "",
    alcance: "",
    subalcances: [],
    restricciones: {},
    partidasSeleccionadas: [],
    modulosActivos: [],
    activacionModo: "",
  };
}

function emptyPreliminares() {
  return {
    tipoIntervencion: "",
    alcanceSeleccionado: "",
    areaPreliminares: "",
    superficiePreliminar: "",
    tipoAcceso: "",
    condicionTerreno: "",
    topografia: "",
    pendienteProfundidadM: "",
    servicios: {
      agua: true,
      energia: true,
      drenaje: true,
    },
    demolicion: {
      tipoDemolicion: "",
      tipoEstructuraExistente: "",
      nivelesExistentes: "",
      anchoDemolicionM: "",
      largoDemolicionM: "",
      areaDemolicionM2: "",
      volumenDemolicion: "",
    },
    observaciones: "",
    conceptosActivos: [],
    technicalConcepts: [],
    officialSummary: [],
    pendingDefinitions: [],
    costoEstimado: 0,
  };
}

function emptyResultado() {
  return {
    resultadoFinal: 0,
    desglose: {
      technicalConcepts: [],
      officialSummary: [],
    },
    metadata: {
      perfilSalida: "",
      motorVersion: "",
      factorAjusteAplicado: 1,
      pendingDefinitions: [],
    },
    fechaSimulacion: "",
    estadoResultado: "pendiente",
  };
}

function emptyDatosGeneralesObra() {
  return {
    ubicacionProyecto: "",
    anchoTerrenoM: "",
    largoTerrenoM: "",
    areaTerrenoM2: "",
    areaConstruccionPropuestaM2: "",
    areaConstruccionM2: "",
    niveles: "",
    alturaNivel1M: "",
    alturaNivel2M: "",
    alturaNivel3M: "",
    alturaPromedioM: "",
    sistemaEstructural: "",
    tipoCimentacion: "",
    nivelComplejidad: "",
    condicionesEspeciales: "",
    factorAjuste: 1,
    notas: "",
  };
}

function toComparableDatosGeneralesObra(payload = {}) {
  const text = (value) => String(value ?? "").trim();
  const number = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    ubicacionProyecto: text(payload.ubicacionProyecto),
    anchoTerrenoM: number(payload.anchoTerrenoM),
    largoTerrenoM: number(payload.largoTerrenoM),
    areaTerrenoM2: number(payload.areaTerrenoM2),
    areaConstruccionPropuestaM2: number(payload.areaConstruccionPropuestaM2),
    areaConstruccionM2: number(payload.areaConstruccionM2),
    niveles: number(payload.niveles),
    alturaNivel1M: number(payload.alturaNivel1M),
    alturaNivel2M: number(payload.alturaNivel2M),
    alturaNivel3M: number(payload.alturaNivel3M),
    alturaPromedioM: number(payload.alturaPromedioM),
    sistemaEstructural: text(payload.sistemaEstructural),
    tipoCimentacion: text(payload.tipoCimentacion),
    nivelComplejidad: text(payload.nivelComplejidad),
    condicionesEspeciales: text(payload.condicionesEspeciales),
    factorAjuste: number(payload.factorAjuste),
    notas: text(payload.notas),
  };
}

function toComparablePreliminares(payload = {}) {
  const text = (value) => String(value ?? "").trim();
  const number = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const demolicion = payload.demolicion || {};

  return {
    tipoIntervencion: text(payload.tipoIntervencion),
    alcanceSeleccionado: text(payload.alcanceSeleccionado),
    areaPreliminares: number(payload.areaPreliminares || payload.superficiePreliminar),
    tipoAcceso: text(payload.tipoAcceso),
    condicionTerreno: text(payload.condicionTerreno),
    topografia: text(payload.topografia),
    pendienteProfundidadM: number(payload.pendienteProfundidadM),
    tipoDemolicion: text(demolicion.tipoDemolicion),
    tipoEstructuraExistente: text(demolicion.tipoEstructuraExistente),
    nivelesExistentes: number(demolicion.nivelesExistentes),
    anchoDemolicionM: number(demolicion.anchoDemolicionM),
    largoDemolicionM: number(demolicion.largoDemolicionM),
  };
}

function emptyVariablesEntrada() {
  return {
    ubicacionProyecto: "",
    nivelComplejidad: "",
    condicionesEspeciales: "",
    factorAjuste: 1,
    notas: "",
  };
}

function emptyEstructuraEspacial() {
  return {
    espacios: [],
    observaciones: "",
  };
}

function emptyColindanciasRecorrido() {
  return {
    relaciones: [],
    inconsistencias: [],
    resumen: {
      spacesCount: 0,
      relationRowsCount: 0,
      internalLinks: 0,
      reciprocalLinks: 0,
      brokenLinks: 0,
      coverageRatio: 0,
    },
    observaciones: "",
  };
}

function emptyValidacionEspacial() {
  return {
    coherenciaArea: false,
    coherenciaVolumetria: false,
    revisado: false,
    observaciones: "",
    alertas: [],
  };
}

function emptyRevisionInferencia() {
  return {
    revisado: false,
    observaciones: "",
    snapshot: {
      conceptosActivados: 0,
      reglasAplicadas: 0,
      pendientes: [],
    },
  };
}

function emptyModuleRow() {
  return {
    capturado: false,
    controles: {},
    selectedConceptKeys: [],
    selectedConcepts: [],
    summaryByPartida: [],
    costoEstimado: 0,
  };
}

function emptyModulos() {
  return {
    cimentacion: emptyModuleRow(),
    estructura: emptyModuleRow(),
    albanileria: emptyModuleRow(),
    instalaciones: emptyModuleRow(),
    acabados: emptyModuleRow(),
    complementarios_y_equipamiento: emptyModuleRow(),
  };
}

function getOrderedRequiredModules(state) {
  if (state.clasificacion.tipoIntervencion === "obra_nueva") {
    const alcanceKey = String(state.alcance?.alcance || "").trim();
    const byScope = ALCANCE_MODULES_OBRA_NUEVA[alcanceKey];
    if (Array.isArray(byScope) && byScope.length > 0) {
      return [...byScope];
    }
    return [...MODULE_ORDER];
  }

  const active = normalizeModuleList(state.alcance.modulosActivos || []);
  if (active.length > 0) {
    const ordered = MODULE_ORDER.filter((key) => active.includes(key));
    if (ordered.length > 0) return ordered;
  }

  return [];
}

function isModuloRequiredState(state, key) {
  const normalizedKey = normalizeModuleKey(key);
  return normalizedKey ? getOrderedRequiredModules(state).includes(normalizedKey) : false;
}

function isModuleCaptureValidState(state, key) {
  const normalizedKey = normalizeModuleKey(key);
  if (!normalizedKey) return false;
  if (!isModuloRequiredState(state, normalizedKey)) return true;
  const row = state.modulos?.[normalizedKey] || {};
  if (!row?.capturado) return false;

  const selected = Array.isArray(row.selectedConcepts) ? row.selectedConcepts : [];
  const summary = Array.isArray(row.summaryByPartida) ? row.summaryByPartida : [];
  const costo = toNumber(row.costoEstimado, 0);
  if (!selected.length || !summary.length || costo <= 0) return false;

  const selectedTotal = selected.reduce((acc, item) => acc + toNumber(item?.total, 0), 0);
  const summaryTotal = summary.reduce((acc, item) => acc + toNumber(item?.total, 0), 0);
  const base = Math.max(selectedTotal, summaryTotal, 1);
  const mismatch = Math.abs(selectedTotal - summaryTotal) / base;
  if (mismatch > 0.05) return false;
  if (costo + 0.01 < Math.max(selectedTotal, summaryTotal)) return false;

  return true;
}

export const useViviendaStore = defineStore("vivienda", {
  state: () => ({
    moduloSeleccionado: "",
    subtipoSeleccionado: "",
    inicioSimulacion: false,
    registro: emptyRegistro(),
    clasificacion: emptyClasificacion(),
    alcance: emptyAlcance(),
    preliminares: emptyPreliminares(),
    modulos: emptyModulos(),
    datosGeneralesObra: emptyDatosGeneralesObra(),
    variablesEntrada: emptyVariablesEntrada(),
    estructuraEspacial: emptyEstructuraEspacial(),
    colindanciasRecorrido: emptyColindanciasRecorrido(),
    validacionEspacial: emptyValidacionEspacial(),
    revisionInferencia: emptyRevisionInferencia(),
    resumenConfirmado: false,
    resultado: emptyResultado(),
    reglasSnapshot: {
      reglas: [],
      catalogos: [],
      errors: [],
      loaded: false,
    },
  }),

  getters: {
    acumuladoPreliminares: (state) => Number(toNumber(state.preliminares?.costoEstimado, 0).toFixed(2)),
    acumuladoModulos: (state) => {
      const keys = Object.keys(state.modulos || {});
      const total = keys.reduce((acc, key) => acc + toNumber(state.modulos?.[key]?.costoEstimado, 0), 0);
      return Number(total.toFixed(2));
    },
    acumuladoGlobal() {
      return Number((toNumber(this.acumuladoPreliminares, 0) + toNumber(this.acumuladoModulos, 0)).toFixed(2));
    },
    hasRegistroData: (state) =>
      Boolean(
        state.registro.prestador.nombre &&
          state.registro.prestador.telefono &&
          state.registro.prestador.profesion &&
          state.registro.cliente.nombre &&
          state.registro.cliente.telefono &&
          state.registro.cliente.ubicacion &&
          state.registro.terminosAceptados
      ),
    hasClasificacionData: (state) => Boolean(state.clasificacion.tipoIntervencion),
    hasAlcanceData: (state) => {
      if (!state.alcance.tipoIntervencion || !state.alcance.alcance) return false;
      if (state.alcance.modulosActivos.length > 0) return true;
      return state.alcance.partidasSeleccionadas.length > 0;
    },
    hasPreliminaresData: (state) => {
      const hasBase = Boolean(
        (state.preliminares.areaPreliminares || state.preliminares.superficiePreliminar) &&
          state.preliminares.tipoAcceso &&
          state.preliminares.condicionTerreno &&
          state.preliminares.topografia
      );
      if (!hasBase) return false;
      if (state.preliminares.topografia !== "con_pendiente") return true;
      return Number(state.preliminares.pendienteProfundidadM || 0) > 0;
    },
    hasCimentacionData: (state) => isModuleCaptureValidState(state, "cimentacion"),
    hasEstructuraData: (state) => isModuleCaptureValidState(state, "estructura"),
    hasAlbanileriaData: (state) => isModuleCaptureValidState(state, "albanileria"),
    hasInstalacionesData: (state) => isModuleCaptureValidState(state, "instalaciones"),
    hasAcabadosData: (state) => isModuleCaptureValidState(state, "acabados"),
    hasComplementariosData: (state) => isModuleCaptureValidState(state, "complementarios_y_equipamiento"),
    hasDatosGeneralesData: (state) =>
      Boolean(
        state.datosGeneralesObra.ubicacionProyecto &&
          Number(state.datosGeneralesObra.anchoTerrenoM || 0) > 0 &&
          Number(state.datosGeneralesObra.largoTerrenoM || 0) > 0 &&
          Number(state.datosGeneralesObra.areaTerrenoM2) > 0 &&
          Number(state.datosGeneralesObra.areaConstruccionM2) > 0 &&
          Number(state.datosGeneralesObra.niveles) > 0 &&
          state.datosGeneralesObra.sistemaEstructural &&
          state.datosGeneralesObra.tipoCimentacion
      ),
    hasVariablesData() {
      return this.hasDatosGeneralesData;
    },
    hasEstructuraEspacialData: (state) => {
      const rows = Array.isArray(state.estructuraEspacial.espacios)
        ? state.estructuraEspacial.espacios
        : [];
      return rows.some((item) => item.tipo && Number(item.areaM2) > 0);
    },
    hasColindanciasData: (state) =>
      validateSpatialRelations({
        espacios: state.estructuraEspacial.espacios || [],
        relaciones: state.colindanciasRecorrido.relaciones || [],
      }).valid,
    hasValidacionEspacialData: (state) => Boolean(state.validacionEspacial.revisado),
    hasModeloEspacialData() {
      return (
        this.hasDatosGeneralesData &&
        this.hasEstructuraEspacialData &&
        this.hasColindanciasData &&
        this.hasValidacionEspacialData
      );
    },
    hasRevisionInferenciaData: (state) => Boolean(state.revisionInferencia.revisado),
    hasResumenData: (state) => Boolean(state.resumenConfirmado),
    hasResultadoData: (state) => {
      const technicalCount = state.resultado.desglose.technicalConcepts.length;
      const officialCount = state.resultado.desglose.officialSummary.length;
      const total = Number(state.resultado.resultadoFinal || 0);
      return technicalCount > 0 || officialCount > 0 || total > 0;
    },
    nextPendingRoute() {
      if (!this.hasRegistroData) return "/vivienda/cotizacion/registro";
      if (!this.hasClasificacionData) return "/vivienda/cotizacion/clasificacion";
      if (!this.hasAlcanceData) return "/vivienda/cotizacion/alcance";
      if (!this.hasModeloEspacialData) return "/vivienda/cotizacion/modelo-espacial";
      if (!this.hasPreliminaresData) return "/vivienda/cotizacion/preliminares";

      if (!this.hasCimentacionData) return MODULE_ROUTES.cimentacion;
      if (!this.hasEstructuraData) return MODULE_ROUTES.estructura;
      if (!this.hasAlbanileriaData) return MODULE_ROUTES.albanileria;
      if (!this.hasInstalacionesData) return MODULE_ROUTES.instalaciones;
      if (!this.hasAcabadosData) return MODULE_ROUTES.acabados;
      if (!this.hasComplementariosData) return MODULE_ROUTES.complementarios_y_equipamiento;

      if (!this.hasRevisionInferenciaData) return "/vivienda/cotizacion/revision-inferencia";
      if (!this.hasResultadoData) return "/vivienda/cotizacion/revision-inferencia";
      return "/vivienda/cotizacion/imprimible";
    },
  },

  actions: {
    startSimulation({ modulo = "vivienda", subtipo = "" } = {}) {
      this.moduloSeleccionado = modulo;
      this.subtipoSeleccionado = subtipo;
      this.inicioSimulacion = true;
    },

    setRegistro(payload) {
      this.startSimulation({ modulo: "vivienda", subtipo: this.subtipoSeleccionado });
      const previous = JSON.stringify(this.registro);
      const next = { ...emptyRegistro(), ...payload };
      this.registro = next;

      if (previous !== JSON.stringify(next)) {
        this.resetFrom("clasificacion");
      }
    },

    setClasificacion(payload) {
      const previousTipoIntervencion = String(this.clasificacion?.tipoIntervencion || "").trim();
      const previous = JSON.stringify(this.clasificacion);
      const next = { ...emptyClasificacion(), ...payload };
      this.clasificacion = next;

      if (previous !== JSON.stringify(next)) {
        this.alcance = emptyAlcance();
        console.info("[TRACE][STORE][ESCENARIO][CLASIFICACION]", {
          previousTipoIntervencion,
          nextTipoIntervencion: String(next.tipoIntervencion || "").trim(),
          resetDesde: "preliminares",
        });
        this.resetFrom("preliminares");
      }
    },

    setAlcance(payload) {
      const previousAlcanceKey = String(this.alcance?.alcance || "").trim();
      const previousModulosActivos = normalizeModuleList(this.alcance?.modulosActivos || []);
      const previous = JSON.stringify(this.alcance);
      const nextRaw = { ...emptyAlcance(), ...payload };
      const tipoIntervencion = String(nextRaw.tipoIntervencion || this.clasificacion.tipoIntervencion || "").trim();
      const alcanceKey = String(nextRaw.alcance || "").trim();
      const derivedByScope =
        tipoIntervencion === "obra_nueva"
          ? ALCANCE_MODULES_OBRA_NUEVA[alcanceKey] || [...MODULE_ORDER]
          : null;
      const next = {
        ...nextRaw,
        partidasSeleccionadas: normalizeModuleList(nextRaw.partidasSeleccionadas),
        modulosActivos: normalizeModuleList(derivedByScope || nextRaw.modulosActivos),
        subalcances: normalizeModuleList(nextRaw.subalcances),
      };
      this.alcance = next;

      if (previous !== JSON.stringify(next)) {
        console.info("[TRACE][STORE][ESCENARIO][ALCANCE]", {
          previousAlcance: previousAlcanceKey,
          nextAlcance: alcanceKey,
          previousModulosActivos,
          nextModulosActivos: next.modulosActivos,
          resetDesde: "preliminares",
        });
        this.resetFrom("preliminares");
      }
    },

    setPreliminares(payload) {
      const previousComparable = toComparablePreliminares(this.preliminares);
      const next = { ...emptyPreliminares(), ...payload };
      const nextComparable = toComparablePreliminares(next);
      this.preliminares = next;
      console.info("[TRACE][PRELIMINARES][SAVE]", {
        costoBloque: Number(toNumber(next.costoEstimado, 0).toFixed(2)),
        conceptosTecnicos: Array.isArray(next.technicalConcepts) ? next.technicalConcepts.length : 0,
        partidas: Array.isArray(next.officialSummary) ? next.officialSummary.length : 0,
        acumuladoGlobal: Number((toNumber(next.costoEstimado, 0) + toNumber(this.acumuladoModulos, 0)).toFixed(2)),
      });

      if (JSON.stringify(previousComparable) !== JSON.stringify(nextComparable)) {
        this.resetFrom("modulos");
      }
    },

    setModuloData(key, payload) {
      const normalizedKey = normalizeModuleKey(key);
      if (!normalizedKey || !this.modulos[normalizedKey]) return false;
      const previous = JSON.stringify(this.modulos[normalizedKey]);
      const selectedConceptsRaw = Array.isArray(payload?.selectedConcepts) ? payload.selectedConcepts : [];
      const selectedConcepts = selectedConceptsRaw.map((item) => ({ ...item }));
      const selectedTotal = selectedConcepts.reduce((acc, item) => acc + toNumber(item?.total, 0), 0);
      const summaryByPartida = Array.isArray(payload?.summaryByPartida)
        ? payload.summaryByPartida.map((item) => ({ ...item }))
        : [];
      const summaryTotal = summaryByPartida.reduce((acc, item) => acc + toNumber(item?.total, 0), 0);
      const providedCost = toNumber(payload?.costoEstimado, 0);
      const normalizedCost = Number(providedCost.toFixed(2));
      const base = Math.max(selectedTotal, summaryTotal, 1);
      const mismatch = Math.abs(selectedTotal - summaryTotal) / base;
      if (!selectedConcepts.length || !summaryByPartida.length || normalizedCost <= 0) {
        return false;
      }
      if (selectedTotal <= 0 || summaryTotal <= 0 || mismatch > 0.05) {
        return false;
      }
      if (normalizedCost + 0.01 < Math.max(selectedTotal, summaryTotal)) {
        return false;
      }
      const selectedConceptKeysRaw = Array.isArray(payload?.selectedConceptKeys) ? payload.selectedConceptKeys : [];
      const selectedConceptKeys = [
        ...new Set(
          [...selectedConceptKeysRaw, ...selectedConcepts.map((item) => String(item?.key || ""))].filter(Boolean)
        ),
      ];
      const next = {
        ...emptyModuleRow(),
        ...payload,
        selectedConceptKeys,
        selectedConcepts,
        summaryByPartida,
        costoEstimado: normalizedCost,
        capturado: true,
      };
      this.modulos[normalizedKey] = next;
      console.info("[TRACE][MODULO][SAVE]", {
        modulo: normalizedKey,
        costoBloque: normalizedCost,
        conceptos: selectedConcepts.length,
        partidas: summaryByPartida.length,
        acumuladoGlobal: Number((toNumber(this.acumuladoPreliminares, 0) + toNumber(this.acumuladoModulos, 0)).toFixed(2)),
        siguiente: this.getNextRouteAfterModule(normalizedKey),
      });

      if (previous !== JSON.stringify(next)) {
        this.resetFrom("revision_inferencia");
      }
      return true;
    },

    isModuloRequired(key) {
      return isModuloRequiredState(this.$state, key);
    },

    getRequiredModuleOrder() {
      return getOrderedRequiredModules(this.$state);
    },

    getRouteForModule(key) {
      const normalizedKey = normalizeModuleKey(key);
      return MODULE_ROUTES[normalizedKey] || "/vivienda/cotizacion/modelo-espacial";
    },

    getNextRouteAfterModule(currentKey) {
      const required = this.getRequiredModuleOrder();
      if (!required.length) return "/vivienda/cotizacion/revision-inferencia";
      const currentIndex = required.indexOf(currentKey);
      const nextKey = currentIndex >= 0 ? required[currentIndex + 1] : required[0];
      if (!nextKey) return "/vivienda/cotizacion/revision-inferencia";
      return this.getRouteForModule(nextKey);
    },

    setDatosGeneralesObra(payload) {
      const previous = { ...this.datosGeneralesObra };
      const next = { ...emptyDatosGeneralesObra(), ...payload };
      const previousComparable = toComparableDatosGeneralesObra(previous);
      const nextComparable = toComparableDatosGeneralesObra(next);
      const hasAnyChange =
        JSON.stringify(previousComparable) !== JSON.stringify(nextComparable);

      // Si no cambió nada, conservamos estado downstream (acumulado/resultados).
      if (!hasAnyChange) {
        return;
      }

      const structuralChanged =
        previousComparable.ubicacionProyecto !== nextComparable.ubicacionProyecto ||
        previousComparable.anchoTerrenoM !== nextComparable.anchoTerrenoM ||
        previousComparable.largoTerrenoM !== nextComparable.largoTerrenoM ||
        previousComparable.areaTerrenoM2 !== nextComparable.areaTerrenoM2 ||
        previousComparable.areaConstruccionPropuestaM2 !==
          nextComparable.areaConstruccionPropuestaM2 ||
        previousComparable.areaConstruccionM2 !== nextComparable.areaConstruccionM2 ||
        previousComparable.niveles !== nextComparable.niveles ||
        previousComparable.alturaNivel1M !== nextComparable.alturaNivel1M ||
        previousComparable.alturaNivel2M !== nextComparable.alturaNivel2M ||
        previousComparable.alturaNivel3M !== nextComparable.alturaNivel3M ||
        previousComparable.alturaPromedioM !== nextComparable.alturaPromedioM ||
        previousComparable.sistemaEstructural !== nextComparable.sistemaEstructural ||
        previousComparable.tipoCimentacion !== nextComparable.tipoCimentacion;

      this.datosGeneralesObra = next;
      this.variablesEntrada = {
        ...emptyVariablesEntrada(),
        ubicacionProyecto: next.ubicacionProyecto,
        nivelComplejidad: next.nivelComplejidad,
        condicionesEspeciales: next.condicionesEspeciales,
        factorAjuste: next.factorAjuste,
        notas: next.notas,
      };

      if (structuralChanged) {
        this.resetFrom("estructura_espacial");
        return;
      }

      this.resetFrom("revision_inferencia");
    },

    setVariablesEntrada(payload) {
      this.setDatosGeneralesObra({
        ...this.datosGeneralesObra,
        ...payload,
      });
    },

    setEstructuraEspacial(payload) {
      const previous = JSON.stringify(this.estructuraEspacial);
      const next = { ...emptyEstructuraEspacial(), ...payload };
      this.estructuraEspacial = next;

      if (previous !== JSON.stringify(next)) {
        this.resetFrom("colindancias");
      }
    },

    setColindanciasRecorrido(payload) {
      const validation = validateSpatialRelations({
        espacios: this.estructuraEspacial.espacios || [],
        relaciones: payload?.relaciones || [],
      });

      const previous = JSON.stringify(this.colindanciasRecorrido);
      const next = {
        ...emptyColindanciasRecorrido(),
        ...payload,
        relaciones: validation.normalizedRelations,
        inconsistencias: validation.issues,
        resumen: validation.summary,
      };
      this.colindanciasRecorrido = next;

      if (previous !== JSON.stringify(next)) {
        this.resetFrom("validacion_espacial");
      }
    },

    setValidacionEspacial(payload) {
      const previous = JSON.stringify(this.validacionEspacial);
      const next = { ...emptyValidacionEspacial(), ...payload };
      this.validacionEspacial = next;

      if (previous !== JSON.stringify(next)) {
        this.resetFrom("preliminares");
      }
    },

    setRevisionInferencia(payload) {
      this.revisionInferencia = { ...emptyRevisionInferencia(), ...payload };
      this.resumenConfirmado = false;
    },

    confirmResumen() {
      this.resumenConfirmado = true;
    },

    setResultado(payload) {
      this.resultado = {
        resultadoFinal: payload.resultadoFinal ?? 0,
        desglose: {
          technicalConcepts: payload.desglose?.technicalConcepts || [],
          officialSummary: payload.desglose?.officialSummary || [],
        },
        metadata: {
          perfilSalida: payload.metadata?.perfilSalida || "",
          motorVersion: payload.metadata?.motorVersion || "",
          factorAjusteAplicado: payload.metadata?.factorAjusteAplicado || 1,
          pendingDefinitions: payload.metadata?.pendingDefinitions || [],
        },
        fechaSimulacion: payload.fechaSimulacion || new Date().toISOString(),
        estadoResultado: payload.estadoResultado || "generado",
      };
    },

    resetFrom(step) {
      const sequence = [
        "clasificacion",
        "alcance",
        "datos_generales",
        "estructura_espacial",
        "colindancias",
        "validacion_espacial",
        "preliminares",
        "modulos",
        "revision_inferencia",
        "resumen",
        "resultado",
      ];

      const stepIndex = sequence.indexOf(step);
      if (stepIndex < 0) return;
      console.info("[TRACE][STORE][RESET_FROM]", {
        step,
        cleared: sequence.slice(stepIndex),
      });

      if (stepIndex <= 0) {
        this.clasificacion = emptyClasificacion();
      }
      if (stepIndex <= 1) {
        this.alcance = emptyAlcance();
      }
      if (stepIndex <= 2) {
        this.datosGeneralesObra = emptyDatosGeneralesObra();
        this.variablesEntrada = emptyVariablesEntrada();
      }
      if (stepIndex <= 3) {
        this.estructuraEspacial = emptyEstructuraEspacial();
      }
      if (stepIndex <= 4) {
        this.colindanciasRecorrido = emptyColindanciasRecorrido();
      }
      if (stepIndex <= 5) {
        this.validacionEspacial = emptyValidacionEspacial();
      }
      if (stepIndex <= 6) {
        this.preliminares = emptyPreliminares();
      }
      if (stepIndex <= 7) {
        this.modulos = emptyModulos();
      }
      if (stepIndex <= 8) {
        this.revisionInferencia = emptyRevisionInferencia();
      }
      if (stepIndex <= 9) {
        this.resumenConfirmado = false;
      }
      if (stepIndex <= 10) {
        this.resultado = emptyResultado();
      }
    },

    resetSimulation() {
      this.inicioSimulacion = false;
      this.moduloSeleccionado = "";
      this.subtipoSeleccionado = "";
      this.registro = emptyRegistro();
      this.clasificacion = emptyClasificacion();
      this.alcance = emptyAlcance();
      this.preliminares = emptyPreliminares();
      this.modulos = emptyModulos();
      this.datosGeneralesObra = emptyDatosGeneralesObra();
      this.variablesEntrada = emptyVariablesEntrada();
      this.estructuraEspacial = emptyEstructuraEspacial();
      this.colindanciasRecorrido = emptyColindanciasRecorrido();
      this.validacionEspacial = emptyValidacionEspacial();
      this.revisionInferencia = emptyRevisionInferencia();
      this.resumenConfirmado = false;
      this.resultado = emptyResultado();
      this.reglasSnapshot = {
        reglas: [],
        catalogos: [],
        errors: [],
        loaded: false,
      };
    },

    async loadReglasSnapshot() {
      const snapshot = await readReglasCatalogosV4();
      this.reglasSnapshot = {
        reglas: snapshot.reglas || [],
        catalogos: snapshot.catalogos || [],
        errors: snapshot.errors || snapshot.pending || [],
        loaded: true,
      };
    },

    sanitizeHydratedState() {
      const tipoIntervencion = String(this.clasificacion?.tipoIntervencion || "").trim();
      const alcanceKey = String(this.alcance?.alcance || "").trim();
      if (tipoIntervencion === "obra_nueva") {
        const derived = ALCANCE_MODULES_OBRA_NUEVA[alcanceKey] || [...MODULE_ORDER];
        this.alcance.modulosActivos = normalizeModuleList(derived);
      } else {
        this.alcance.modulosActivos = normalizeModuleList(this.alcance?.modulosActivos || []);
      }
      this.alcance.partidasSeleccionadas = normalizeModuleList(this.alcance?.partidasSeleccionadas || []);
      this.alcance.subalcances = normalizeModuleList(this.alcance?.subalcances || []);

      for (const key of MODULE_ORDER) {
        const row = this.modulos?.[key] || emptyModuleRow();
        const selected = Array.isArray(row.selectedConcepts) ? row.selectedConcepts : [];
        const summary = Array.isArray(row.summaryByPartida) ? row.summaryByPartida : [];
        const costo = toNumber(row.costoEstimado, 0);
        const selectedConceptKeys = [
          ...new Set(
            [
              ...(Array.isArray(row.selectedConceptKeys) ? row.selectedConceptKeys : []),
              ...selected.map((item) => String(item?.key || "")),
            ].filter(Boolean)
          ),
        ];
        this.modulos[key] = {
          ...emptyModuleRow(),
          ...row,
          capturado: Boolean(row.capturado),
          controles: row.controles && typeof row.controles === "object" ? { ...row.controles } : {},
          selectedConcepts: selected.map((item) => ({ ...item })),
          summaryByPartida: summary.map((item) => ({ ...item })),
          selectedConceptKeys,
          costoEstimado: Number(Math.max(costo, 0).toFixed(2)),
        };
      }

      this.preliminares = {
        ...emptyPreliminares(),
        ...this.preliminares,
        conceptosActivos: Array.isArray(this.preliminares?.conceptosActivos)
          ? this.preliminares.conceptosActivos
          : [],
        technicalConcepts: Array.isArray(this.preliminares?.technicalConcepts)
          ? this.preliminares.technicalConcepts
          : [],
        officialSummary: Array.isArray(this.preliminares?.officialSummary)
          ? this.preliminares.officialSummary
          : [],
        pendingDefinitions: Array.isArray(this.preliminares?.pendingDefinitions)
          ? this.preliminares.pendingDefinitions
          : [],
        costoEstimado: Number(toNumber(this.preliminares?.costoEstimado, 0).toFixed(2)),
      };
    },
  },
});
