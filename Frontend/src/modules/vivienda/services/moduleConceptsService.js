import {
  buildVolumetryContext,
  estimateCatalogConceptQuantity,
} from "@/modules/vivienda/services/volumetryRulesService";

const MODULE_CONFIG = {
  cimentacion: {
    title: "Cimentacion",
    description:
      "Selecciona conceptos de cimentacion segun sistema estructural definido en distribucion arquitectonica.",
  },
  estructura: {
    title: "Estructura",
    description:
      "Selecciona conceptos de estructura condicionados por sistema estructural y tipo de losa.",
  },
  albanileria: {
    title: "Albanileria",
    description:
      "Selecciona libremente los conceptos de albanileria requeridos para el proyecto.",
  },
  instalaciones: {
    title: "Instalaciones",
    description:
      "Selecciona conceptos de instalaciones integradas (sin equipamiento).",
  },
  acabados: {
    title: "Acabados",
    description:
      "La lista se adapta al nivel de acabado para evitar duplicidad con clasificación.",
  },
  complementarios_y_equipamiento: {
    title: "Complementarios y equipamiento",
    description:
      "Selecciona conceptos complementarios, cancelería y equipamiento con resumen por partida.",
  },
};

const CONCEPT_LIBRARY = {
  cim_mamposteria: {
    moduleKey: "cimentacion",
    title: "Cimiento de mamposteria",
    description: "Cimiento corrido de mamposteria de piedra braza.",
    unit: "m3",
    unitPrice: 1450,
    partida: "Cimentacion",
  },
  cim_cadena_desplante: {
    moduleKey: "cimentacion",
    title: "Cadena de desplante",
    description:
      "Cadena de desplante de concreto reforzado con seccion, armado y concreto segun proyecto estructural; incluye cimbra, habilitado de acero, colado, vibrado, curado y descimbrado.",
    unit: "m",
    unitPrice: 240,
    partida: "Cimentacion",
  },
  cim_castillo_arranque: {
    moduleKey: "cimentacion",
    title: "Castillo de arranque",
    description: "Castillo de arranque para sistema tradicional.",
    unit: "pza",
    unitPrice: 520,
    partida: "Cimentacion",
  },
  cim_relleno_compactado: {
    moduleKey: "cimentacion",
    title: "Relleno compactado",
    description: "Relleno y compactacion en cepa y desplante.",
    unit: "m3",
    unitPrice: 180,
    partida: "Cimentacion",
  },
  cim_zapata_aislada: {
    moduleKey: "cimentacion",
    title: "Zapata aislada",
    description: "Zapata aislada de concreto reforzado.",
    unit: "pza",
    unitPrice: 3100,
    partida: "Cimentacion",
  },
  cim_zapata_corrida: {
    moduleKey: "cimentacion",
    title: "Zapata corrida",
    description: "Zapata corrida de concreto reforzado.",
    unit: "m",
    unitPrice: 780,
    partida: "Cimentacion",
  },
  cim_dado_columna: {
    moduleKey: "cimentacion",
    title: "Dado de columna",
    description: "Dado de concreto para arranque de columna.",
    unit: "pza",
    unitPrice: 1680,
    partida: "Cimentacion",
  },
  cim_trabe_liga: {
    moduleKey: "cimentacion",
    title: "Trabe de liga",
    description: "Trabe de liga entre elementos de cimentacion.",
    unit: "m",
    unitPrice: 510,
    partida: "Cimentacion",
  },
  cim_transicion_mixta: {
    moduleKey: "cimentacion",
    title: "Transicion de sistema mixto",
    description: "Ajustes de transicion entre mamposteria y concreto reforzado.",
    unit: "lote",
    unitPrice: 6200,
    partida: "Cimentacion",
  },

  est_castillos: {
    moduleKey: "estructura",
    title: "Castillos",
    description: "Castillos de refuerzo vertical para sistema tradicional.",
    unit: "pza",
    unitPrice: 760,
    partida: "Estructura",
  },
  est_dalas: {
    moduleKey: "estructura",
    title: "Dalas de cerramiento",
    description: "Dalas de cerramiento perimetral.",
    unit: "m",
    unitPrice: 320,
    partida: "Estructura",
  },
  est_columnas: {
    moduleKey: "estructura",
    title: "Columnas",
    description: "Columnas de concreto reforzado.",
    unit: "pza",
    unitPrice: 2400,
    partida: "Estructura",
  },
  est_trabes: {
    moduleKey: "estructura",
    title: "Trabes",
    description: "Trabes de concreto reforzado.",
    unit: "m",
    unitPrice: 840,
    partida: "Estructura",
  },
  est_marco_mixto: {
    moduleKey: "estructura",
    title: "Marco estructural mixto",
    description: "Integracion de sistema mixto en niveles y claros.",
    unit: "lote",
    unitPrice: 9800,
    partida: "Estructura",
  },
  est_losa_maciza: {
    moduleKey: "estructura",
    title: "Losa maciza",
    description: "Losa maciza de concreto reforzado.",
    unit: "m2",
    unitPrice: 780,
    partida: "Estructura",
  },
  est_losa_aligerada: {
    moduleKey: "estructura",
    title: "Losa aligerada caseton-nervaduras",
    description: "Losa aligerada con caseton y nervaduras.",
    unit: "m2",
    unitPrice: 860,
    partida: "Estructura",
  },
  est_losa_vigueta: {
    moduleKey: "estructura",
    title: "Losa sistema vigueta-bovedilla",
    description: "Losa de vigueta y bovedilla.",
    unit: "m2",
    unitPrice: 840,
    partida: "Estructura",
  },

  alb_muros: {
    moduleKey: "albanileria",
    title: "Muros de tabique",
    description: "Muro de tabique rojo recocido asentado con mortero.",
    unit: "m2",
    unitPrice: 460,
    partida: "Albanileria",
  },
  alb_aplanados: {
    moduleKey: "albanileria",
    title: "Aplanados en muros",
    description: "Aplanado fino en muros interiores y exteriores.",
    unit: "m2",
    unitPrice: 160,
    partida: "Albanileria",
  },
  alb_firmes: {
    moduleKey: "albanileria",
    title: "Firmes de concreto",
    description: "Firme de concreto simple en planta baja y exteriores.",
    unit: "m2",
    unitPrice: 210,
    partida: "Albanileria",
  },
  alb_bardas: {
    moduleKey: "albanileria",
    title: "Bardas y delimitaciones",
    description: "Bardas de colindancia y delimitacion perimetral.",
    unit: "m",
    unitPrice: 690,
    partida: "Albanileria",
  },

  ins_hidraulica: {
    moduleKey: "instalaciones",
    title: "Instalación hidráulica",
    description: "Tubería hidráulica principal y derivaciones.",
    unit: "m",
    unitPrice: 135,
    partida: "Instalaciones",
  },
  ins_sanitaria: {
    moduleKey: "instalaciones",
    title: "Instalación sanitaria",
    description: "Descargas sanitarias y ventilaciones.",
    unit: "m",
    unitPrice: 148,
    partida: "Instalaciones",
  },
  ins_electrica: {
    moduleKey: "instalaciones",
    title: "Instalación eléctrica",
    description: "Canalización y cableado eléctrico interior.",
    unit: "m",
    unitPrice: 110,
    partida: "Instalaciones",
  },
  ins_pluvial: {
    moduleKey: "instalaciones",
    title: "Instalación pluvial",
    description: "Bajantes pluviales y red de desalojo.",
    unit: "m",
    unitPrice: 122,
    partida: "Instalaciones",
  },
  ins_gas: {
    moduleKey: "instalaciones",
    title: "Instalación de gas",
    description: "Tubería de gas para servicios interiores.",
    unit: "m",
    unitPrice: 156,
    partida: "Instalaciones",
  },

  aca_piso_estandar: {
    moduleKey: "acabados",
    title: "Piso cerámico estándar",
    description: "Piso cerámico de línea estándar.",
    unit: "m2",
    unitPrice: 320,
    partida: "Acabados",
  },
  aca_azulejo_estandar: {
    moduleKey: "acabados",
    title: "Azulejo en zonas húmedas",
    description: "Recubrimiento cerámico en baños y cocina.",
    unit: "m2",
    unitPrice: 350,
    partida: "Acabados",
  },
  aca_pintura_estandar: {
    moduleKey: "acabados",
    title: "Pintura vinílica estándar",
    description: "Aplicación de pintura vinílica en muros y plafones.",
    unit: "m2",
    unitPrice: 92,
    partida: "Acabados",
  },
  aca_piso_personalizado: {
    moduleKey: "acabados",
    title: "Piso porcelanato",
    description: "Piso porcelanato de formato medio.",
    unit: "m2",
    unitPrice: 520,
    partida: "Acabados",
  },
  aca_recubrimiento_personalizado: {
    moduleKey: "acabados",
    title: "Recubrimiento decorativo especial",
    description: "Recubrimiento decorativo en muros seleccionados.",
    unit: "m2",
    unitPrice: 460,
    partida: "Acabados",
  },
  aca_pintura_personalizada: {
    moduleKey: "acabados",
    title: "Pintura premium",
    description: "Aplicación de pintura premium en interiores.",
    unit: "m2",
    unitPrice: 145,
    partida: "Acabados",
  },
  aca_carpinteria_fina: {
    moduleKey: "acabados",
    title: "Carpintería fina",
    description: "Puertas y detalles de carpintería en acabado fino.",
    unit: "pza",
    unitPrice: 2800,
    partida: "Acabados",
  },

  com_herreria: {
    moduleKey: "complementarios_y_equipamiento",
    title: "Herrerías y protecciones",
    description: "Protecciones, barandales y herrería ligera.",
    unit: "m",
    unitPrice: 910,
    partida: "Complementarios",
  },
  com_carpinteria: {
    moduleKey: "complementarios_y_equipamiento",
    title: "Carpintería adicional",
    description: "Clósets y muebles fijos de carpintería.",
    unit: "pza",
    unitPrice: 4200,
    partida: "Complementarios",
  },
  com_canceleria_ventanas: {
    moduleKey: "complementarios_y_equipamiento",
    title: "Cancelería de aluminio para ventanas",
    description: "Suministro e instalación de cancelería de aluminio y cristal en ventanas.",
    unit: "m2",
    unitPrice: 1950,
    partida: "Cancelería",
  },
  com_canceleria_puertas: {
    moduleKey: "complementarios_y_equipamiento",
    title: "Cancelería de aluminio para puertas",
    description: "Suministro e instalación de cancelería de aluminio y cristal en puertas.",
    unit: "m2",
    unitPrice: 2150,
    partida: "Cancelería",
  },
  eq_muebles_bano: {
    moduleKey: "complementarios_y_equipamiento",
    title: "Muebles de baño",
    description: "Muebles de lavabo y accesorios básicos.",
    unit: "jgo",
    unitPrice: 5600,
    partida: "Equipamiento",
  },
  eq_cocina: {
    moduleKey: "complementarios_y_equipamiento",
    title: "Cocina integral",
    description: "Mobiliario integral de cocina.",
    unit: "jgo",
    unitPrice: 18500,
    partida: "Equipamiento",
  },
  eq_iluminacion: {
    moduleKey: "complementarios_y_equipamiento",
    title: "Luminarias interiores",
    description: "Suministro e instalación de luminarias interiores.",
    unit: "pza",
    unitPrice: 520,
    partida: "Equipamiento",
  },
};

const MODULE_CONCEPT_KEYS = {
  albanileria: ["alb_muros", "alb_aplanados", "alb_firmes", "alb_bardas"],
  instalaciones: ["ins_hidraulica", "ins_sanitaria", "ins_electrica", "ins_pluvial", "ins_gas"],
  complementarios_y_equipamiento: [
    "com_herreria",
    "com_carpinteria",
    "com_canceleria_ventanas",
    "com_canceleria_puertas",
    "eq_muebles_bano",
    "eq_cocina",
    "eq_iluminacion",
  ],
};

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function calculateSpaceArea(spaces = []) {
  return spaces.reduce((acc, item) => {
    const width = normalizeNumber(item.anchoM, 0);
    const length = normalizeNumber(item.largoM, 0);
    const direct = normalizeNumber(item.areaM2, 0);
    const area = direct > 0 ? direct : width * length;
    return acc + Math.max(area, 0);
  }, 0);
}

export function getSpatialMetrics({
  estructuraEspacial = {},
  colindanciasRecorrido = {},
  datosGeneralesObra = {},
  preliminares = {},
} = {}) {
  const spaces = Array.isArray(estructuraEspacial.espacios) ? estructuraEspacial.espacios : [];
  const areaBySpaces = calculateSpaceArea(spaces);
  const areaConstruccion =
    normalizeNumber(datosGeneralesObra.areaConstruccionM2, 0) > 0
      ? normalizeNumber(datosGeneralesObra.areaConstruccionM2, 0)
      : areaBySpaces;
  const areaTerreno = normalizeNumber(datosGeneralesObra.areaTerrenoM2, areaConstruccion);
  const levels = new Set(spaces.map((item) => String(item?.nivel || "").trim()).filter(Boolean));
  const counts = {};

  spaces.forEach((item) => {
    const key = String(item?.tipo || "").trim();
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });

  const totalSpaces = spaces.length;
  const totalBanos = (counts.bano_1 || 0) + (counts.bano_2 || 0) + (counts.medio_bano || 0);
  const totalRecamaras =
    (counts.recamara_principal || 0) +
    (counts.recamara_2 || 0) +
    (counts.recamara_3 || 0) +
    (counts.recamara_4 || 0);

  const base = {
    areaConstruccion: Number(areaConstruccion.toFixed(2)),
    areaTerreno: Number(areaTerreno.toFixed(2)),
    areaBySpaces: Number(areaBySpaces.toFixed(2)),
    levelsCount: Math.max(levels.size, normalizeNumber(datosGeneralesObra.niveles, 1)),
    totalSpaces,
    totalBanos,
    totalRecamaras,
    countByType: counts,
  };

  const enriched = buildVolumetryContext({
    estructuraEspacial,
    colindanciasRecorrido,
    datosGeneralesObra,
    preliminares,
    metrics: base,
  });

  return {
    ...base,
    ...enriched,
  };
}

function estimateQuantity(conceptKey, metrics) {
  const area = normalizeNumber(metrics.areaConstruccion, 0);
  const levels = Math.max(normalizeNumber(metrics.levelsCount, 1), 1);
  const spaces = Math.max(normalizeNumber(metrics.totalSpaces, 0), 1);
  const banos = Math.max(normalizeNumber(metrics.totalBanos, 0), 1);
  const recamaras = Math.max(normalizeNumber(metrics.totalRecamaras, 0), 1);

  const calculators = {
    cim_mamposteria: () => area * 0.32,
    cim_cadena_desplante: () => area * 0.24,
    cim_castillo_arranque: () => spaces * 1.8,
    cim_relleno_compactado: () => area * 0.22,
    cim_zapata_aislada: () => Math.max(Math.round(recamaras + levels + 2), 4),
    cim_zapata_corrida: () => area * 0.16,
    cim_dado_columna: () => Math.max(Math.round(recamaras + levels + 4), 6),
    cim_trabe_liga: () => area * 0.12,
    cim_transicion_mixta: () => 1,

    est_castillos: () => spaces * 2.4,
    est_dalas: () => area * 0.2,
    est_columnas: () => Math.max(Math.round(spaces * 0.8), 6),
    est_trabes: () => area * 0.18,
    est_marco_mixto: () => 1,
    est_losa_maciza: () => area,
    est_losa_aligerada: () => area,
    est_losa_vigueta: () => area,

    alb_muros: () => area * 2.1,
    alb_aplanados: () => area * 2.9,
    alb_firmes: () => area * 0.9,
    alb_bardas: () => area * 0.18,

    ins_hidraulica: () => area * 0.9,
    ins_sanitaria: () => area * 0.76,
    ins_electrica: () => area * 1.45,
    ins_pluvial: () => area * 0.22,
    ins_gas: () => Math.max(banos * 6, 12),

    aca_piso_estandar: () => area,
    aca_azulejo_estandar: () => Math.max(banos * 12, 12),
    aca_pintura_estandar: () => area * 2.8,
    aca_piso_personalizado: () => area,
    aca_recubrimiento_personalizado: () => Math.max(area * 0.62, 12),
    aca_pintura_personalizada: () => area * 2.8,
    aca_carpinteria_fina: () => Math.max(spaces * 0.7, 4),

    com_herreria: () => Math.max(area * 0.25, 8),
    com_carpinteria: () => Math.max(recamaras + 2, 3),
    com_canceleria_ventanas: () => Math.max(area * 0.2, 6),
    com_canceleria_puertas: () => Math.max(spaces * 0.9, 4),
    eq_muebles_bano: () => banos,
    eq_cocina: () => 1,
    eq_iluminacion: () => Math.max(spaces * 2.2, 8),
  };

  const value = calculators[conceptKey] ? calculators[conceptKey]() : 1;
  return Number(Math.max(value, 0.01).toFixed(2));
}

function estimateQuantityByCatalogConcept(concept, metrics = {}, quantitiesByCode = {}) {
  return estimateCatalogConceptQuantity({
    concept,
    context: metrics,
    quantitiesByCode,
  });
}

function filterByInstalacionesServices(list = [], serviciosInstalaciones = {}) {
  const agua = Boolean(serviciosInstalaciones.agua);
  const energia = Boolean(serviciosInstalaciones.energia);
  const drenaje = Boolean(serviciosInstalaciones.drenaje);
  const gas = Boolean(serviciosInstalaciones.gas);

  return list.filter((concept) => {
    const partidaCode = String(concept?.partida_code || "").trim().toUpperCase();
    if (partidaCode === "HID") return agua;
    if (partidaCode === "ELE") return energia;
    if (partidaCode === "SAN") return drenaje;
    if (partidaCode === "PLU") return drenaje;
    if (partidaCode === "GAS") return gas;
    return true;
  });
}

function filterFallbackInstalacionesByServices(list = [], serviciosInstalaciones = {}) {
  const agua = Boolean(serviciosInstalaciones.agua);
  const energia = Boolean(serviciosInstalaciones.energia);
  const drenaje = Boolean(serviciosInstalaciones.drenaje);
  const gas = Boolean(serviciosInstalaciones.gas);

  return list.filter((item) => {
    const key = String(item?.key || "");
    if (key === "ins_hidraulica") return agua;
    if (key === "ins_electrica") return energia;
    if (key === "ins_sanitaria" || key === "ins_pluvial") return drenaje;
    if (key === "ins_gas") return gas;
    return true;
  });
}

function resolveLosaCode(tipoLosa = "") {
  if (tipoLosa === "vigueta_bovedilla") return "EST-006";
  if (tipoLosa === "aligerada_caseton_nervaduras") return "EST-007";
  return "EST-005";
}

function normalizeConceptCode(value = "") {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return "";
  const match = raw.match(/^([A-Z]{3})-?(\d{3})/);
  if (!match) return raw;
  return `${match[1]}-${match[2]}`;
}

function filterDbConceptsByStructure(list = [], sistemaEstructural = "", tipoLosa = "") {
  const sistema = String(sistemaEstructural || "").trim().toLowerCase();
  const losaCode = resolveLosaCode(tipoLosa);
  const alwaysSkip = new Set(["EST-008", "EST-009", "EST-010"]);
  const byCode = list.filter((concept) => !alwaysSkip.has(normalizeConceptCode(concept?.code || "")));

  if (sistema === "tradicional") {
    const allow = new Set(["EST-001", "EST-002", losaCode]);
    return byCode.filter((concept) => allow.has(normalizeConceptCode(concept?.code || "")));
  }

  if (sistema === "concreto_reforzado") {
    const allow = new Set(["EST-003", "EST-004", losaCode]);
    return byCode.filter((concept) => allow.has(normalizeConceptCode(concept?.code || "")));
  }

  if (sistema === "mixta") {
    const allow = new Set(["EST-001", "EST-002", "EST-003", "EST-004", losaCode]);
    return byCode.filter((concept) => allow.has(normalizeConceptCode(concept?.code || "")));
  }

  return byCode;
}

function buildDbAvailableConcepts({
  moduleKey,
  catalogConcepts = [],
  sistemaEstructural = "",
  tipoLosa = "",
  nivelAcabado = "",
  metrics = {},
  serviciosInstalaciones = {},
} = {}) {
  const base = Array.isArray(catalogConcepts) ? catalogConcepts : [];
  if (!base.length) return [];

  let filtered = moduleKey === "instalaciones"
    ? filterByInstalacionesServices(base, serviciosInstalaciones)
    : base;
  if (moduleKey === "estructura") {
    filtered = filterDbConceptsByStructure(filtered, sistemaEstructural, tipoLosa);
  }
  const quantitiesByCode = {};

  return filtered
    .map((concept) => {
      const unitPrice = normalizeNumber(concept?.unit_price, 0);
      const quantity = estimateQuantityByCatalogConcept(concept, metrics, quantitiesByCode);
      const code = String(concept?.code || "").trim().toUpperCase();
      if (code) {
        quantitiesByCode[code] = quantity;
      }
      const title = String(
        concept?.official_description || concept?.technical_description || concept?.code || "Concepto"
      ).trim();

      return {
        key: String(concept?.code || "").trim(),
        moduleKey,
        partida: String(concept?.partida_name || concept?.partida_code || "General").trim(),
        title,
        description: String(concept?.technical_description || concept?.official_description || "").trim(),
        unit: String(concept?.unit_symbol || concept?.unit_code || "u").trim().toLowerCase(),
        quantity,
        unitPrice,
        total: Number((quantity * unitPrice).toFixed(2)),
        formulaCode: concept?.default_formula_code || "",
        quantificationMode: concept?.quantification_mode || "",
        sourceName: concept?.source_name || "",
      };
    })
    .filter((item) => item.key);
}

function getLosaConcept(tipoLosa = "") {
  if (tipoLosa === "aligerada_caseton_nervaduras") return "est_losa_aligerada";
  if (tipoLosa === "vigueta_bovedilla") return "est_losa_vigueta";
  return "est_losa_maciza";
}

export function getAvailableConceptKeys({
  moduleKey,
  sistemaEstructural = "",
  tipoZapata = "",
  tipoLosa = "",
  nivelAcabado = "",
} = {}) {
  if (moduleKey === "cimentacion") {
    if (sistemaEstructural === "tradicional") {
      return ["cim_mamposteria", "cim_cadena_desplante", "cim_castillo_arranque", "cim_relleno_compactado"];
    }
    if (sistemaEstructural === "concreto_reforzado") {
      const base = ["cim_dado_columna", "cim_trabe_liga"];
      if (tipoZapata === "corrida") {
        return ["cim_zapata_corrida", ...base];
      }
      return ["cim_zapata_aislada", ...base];
    }
    if (sistemaEstructural === "mixta") {
      return [
        "cim_mamposteria",
        "cim_cadena_desplante",
        "cim_zapata_aislada",
        "cim_zapata_corrida",
        "cim_dado_columna",
        "cim_trabe_liga",
        "cim_transicion_mixta",
      ];
    }
    return [];
  }

  if (moduleKey === "estructura") {
    const losa = getLosaConcept(tipoLosa);
    if (sistemaEstructural === "tradicional") {
      return ["est_castillos", "est_dalas", losa];
    }
    if (sistemaEstructural === "concreto_reforzado") {
      return ["est_columnas", "est_trabes", losa];
    }
    if (sistemaEstructural === "mixta") {
      return ["est_marco_mixto", "est_columnas", "est_trabes", losa];
    }
    return [losa];
  }

  if (moduleKey === "acabados") {
    if (nivelAcabado === "personalizado") {
      return [
        "aca_piso_personalizado",
        "aca_recubrimiento_personalizado",
        "aca_pintura_personalizada",
        "aca_carpinteria_fina",
      ];
    }
    return ["aca_piso_estandar", "aca_azulejo_estandar", "aca_pintura_estandar"];
  }

  return MODULE_CONCEPT_KEYS[moduleKey] ? [...MODULE_CONCEPT_KEYS[moduleKey]] : [];
}

export function getAvailableConcepts({
  moduleKey,
  sistemaEstructural = "",
  tipoZapata = "",
  tipoLosa = "",
  nivelAcabado = "",
  metrics = {},
  catalogConcepts = [],
  serviciosInstalaciones = {},
} = {}) {
  const dbAvailable = buildDbAvailableConcepts({
    moduleKey,
    catalogConcepts,
    sistemaEstructural,
    tipoLosa,
    nivelAcabado,
    metrics,
    serviciosInstalaciones,
  });
  if (dbAvailable.length) {
    return dbAvailable;
  }

  const keys = getAvailableConceptKeys({
    moduleKey,
    sistemaEstructural,
    tipoZapata,
    tipoLosa,
    nivelAcabado,
  });

  const fallback = keys
    .map((key) => {
      const concept = CONCEPT_LIBRARY[key];
      if (!concept) return null;
      const quantity = estimateQuantity(key, metrics);
      const unitPrice = normalizeNumber(concept.unitPrice, 0);
      return {
        key,
        moduleKey: concept.moduleKey,
        partida: concept.partida,
        title: concept.title,
        description: concept.description,
        unit: concept.unit,
        quantity,
        unitPrice,
        total: Number((quantity * unitPrice).toFixed(2)),
      };
    })
    .filter(Boolean);

  if (moduleKey === "instalaciones") {
    return filterFallbackInstalacionesByServices(fallback, serviciosInstalaciones);
  }
  return fallback;
}

export function buildSelectedConcepts({
  moduleKey,
  selectedConceptKeys = [],
  sistemaEstructural = "",
  tipoZapata = "",
  tipoLosa = "",
  nivelAcabado = "",
  metrics = {},
  catalogConcepts = [],
  serviciosInstalaciones = {},
  forceSelectAll = false,
} = {}) {
  const available = getAvailableConcepts({
    moduleKey,
    sistemaEstructural,
    tipoZapata,
    tipoLosa,
    nivelAcabado,
    metrics,
    catalogConcepts,
    serviciosInstalaciones,
  });
  const selectedSet = forceSelectAll
    ? new Set(available.map((item) => item.key))
    : new Set(selectedConceptKeys);
  const selected = available.filter((item) => selectedSet.has(item.key));

  const grouped = {};
  selected.forEach((item) => {
    const key = item.partida || "General";
    if (!grouped[key]) {
      grouped[key] = {
        partida: key,
        concepts: 0,
        total: 0,
      };
    }
    grouped[key].concepts += 1;
    grouped[key].total += Number(item.total || 0);
  });

  return {
    availableConcepts: available,
    selectedConcepts: selected,
    summaryByPartida: Object.values(grouped).map((item) => ({
      ...item,
      total: Number(item.total.toFixed(2)),
    })),
  };
}

export function getModuleConfig(moduleKey) {
  return MODULE_CONFIG[moduleKey] || MODULE_CONFIG.cimentacion;
}

export const CIMENTACION_ZAPATA_OPTIONS = [
  { value: "aislada", label: "Zapata aislada" },
  { value: "corrida", label: "Zapata corrida" },
];

export const LOSA_OPTIONS = [
  { value: "maciza", label: "Maciza" },
  { value: "aligerada_caseton_nervaduras", label: "Aligerada caseton-nervaduras" },
  { value: "vigueta_bovedilla", label: "Sistema vigueta-bovedilla" },
];

export const ACABADO_OPTIONS = [
  { value: "estandar", label: "Estandar" },
  { value: "personalizado", label: "Personalizado" },
];
