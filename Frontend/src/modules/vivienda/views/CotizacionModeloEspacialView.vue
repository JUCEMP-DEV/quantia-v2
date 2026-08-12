<template>
  <div class="page">
    <header class="head">
      <LogoQuantia />
      <nav>
        <a href="#" @click.prevent="goDashboard">Inicio</a>
        <a href="#" @click.prevent="goBack">Alcance</a>
      </nav>
      <strong>{{ userName }}</strong>
    </header>

    <h1>Diseno Arquitectonico</h1>
    <p class="lead">
      Formato operativo basado en archivo 25: datos generales, crear espacios, colindancias y validacion arquitectonica en una sola pantalla.
    </p>

    <section class="card">
      <h2>Datos Generales</h2>
      <div class="pair-grid">
        <label>Ancho del terreno (m)
          <input v-model.number="general.anchoTerrenoM" type="number" min="1" step="0.01" />
        </label>

        <label>Area de terreno calculada (m2)
          <input :value="areaTerrenoCalculada.toFixed(2)" type="text" readonly />
        </label>

        <label>Largo del terreno (m)
          <input v-model.number="general.largoTerrenoM" type="number" min="1" step="0.01" />
        </label>

        <label>Area de construccion calculada (m2)
          <input :value="totalAreaM2.toFixed(2)" type="text" readonly />
        </label>

        <label>Numero de niveles
          <select v-model.number="general.niveles">
            <option :value="1">1 nivel</option>
            <option :value="2">2 niveles</option>
            <option :value="3">3 niveles</option>
          </select>
        </label>

        <label>Area de construccion propuesta (m2)
          <input v-model.number="general.areaConstruccionPropuestaM2" type="number" min="1" step="0.01" />
        </label>

        <label>Tipo de cimentacion
          <select v-model="general.tipoCimentacion">
            <option value="">Selecciona</option>
            <option value="mamposteria">Mamposteria</option>
            <option value="zapata_corrida">Zapata corrida</option>
            <option value="zapata_aislada">Zapata aislada</option>
            <option value="trabe_liga">Trabe liga</option>
          </select>
        </label>

        <label>Tipo de estructura
          <select v-model="general.sistemaEstructural">
            <option value="">Selecciona</option>
            <option value="tradicional">Tradicional</option>
            <option value="concreto_reforzado">Concreto reforzado</option>
            <option value="mixta">Mixta</option>
          </select>
        </label>
      </div>

      <div class="height-grid">
        <label>Altura nivel 1 (m)
          <input v-model.number="general.alturaNivel1M" type="number" min="2" step="0.01" />
        </label>

        <label v-if="general.niveles >= 2">Altura nivel 2 (m)
          <input v-model.number="general.alturaNivel2M" type="number" min="2" step="0.01" />
        </label>

        <label v-if="general.niveles >= 3">Altura nivel 3 (m)
          <input v-model.number="general.alturaNivel3M" type="number" min="2" step="0.01" />
        </label>
      </div>
      <small class="helper">
        Se agregan automaticamente las secciones de planta y azotea.
      </small>
      <p class="hint">{{ structuralHint }}</p>
      <p v-if="errors.datos" class="error">{{ errors.datos }}</p>
    </section>

    <section class="card">
      <h2>Crear Espacios</h2>

      <div
        v-for="section in levelSections"
        :key="section.value"
        class="level-block"
      >
        <div class="level-head">
          <h3>{{ section.label }}</h3>
          <button type="button" @click="addRow(section.value)">Agregar espacio</button>
        </div>

        <div
          v-for="row in getRowsByLevel(section.value)"
          :key="row.id"
          class="row"
        >
          <div class="row-head">
            <strong>{{ getSpaceLabel(row.id) }}</strong>
            <button type="button" @click="removeRow(row.id)">Eliminar</button>
          </div>

          <div class="matrix-grid">
            <label class="matrix-block">
              <span class="block-title">Tipo de espacio</span>
              <select v-model="row.tipo">
                <option value="">Selecciona</option>
                <option
                  v-for="spaceType in getSpaceTypesForLevel(section.value)"
                  :key="spaceType.value"
                  :value="spaceType.value"
                >
                  {{ spaceType.label }}
                </option>
              </select>
            </label>

            <div class="matrix-block">
              <span class="block-title">Dimensiones</span>
              <label>{{ row.tipo === "barda_perimetral" ? "Espesor (m)" : "Ancho (m)" }}
                <input v-model.number="row.anchoM" type="number" min="0.5" step="0.01" />
              </label>
              <label>{{ row.tipo === "barda_perimetral" ? "Longitud de tramo (m)" : "Largo (m)" }}
                <input v-model.number="row.largoM" type="number" min="0.5" step="0.01" />
              </label>
              <label>{{ row.tipo === "barda_perimetral" ? "Area equivalente (m2)" : "Area (m2)" }}
                <input :value="formatArea(row.areaM2)" type="text" readonly />
              </label>
              <small v-if="row.tipo === 'barda_perimetral'" class="helper-inline">
                Captura espesor y longitud del tramo de barda para su cuantificación.
              </small>
            </div>

            <div class="matrix-block">
              <span class="block-title">{{ getLadosLabel(section.value) }}</span>
              <div class="side-flags">
                <label><input v-model="row.ladosCimentacion.a1" type="checkbox" /> A1</label>
                <label><input v-model="row.ladosCimentacion.a2" type="checkbox" /> A2</label>
                <label><input v-model="row.ladosCimentacion.l1" type="checkbox" /> L1</label>
                <label><input v-model="row.ladosCimentacion.l2" type="checkbox" /> L2</label>
              </div>
            </div>

            <div class="matrix-block">
              <span class="block-title">Ubicacion ventana</span>
              <label>Lado
                <select v-model="row.ventana.lado">
                  <option value="">Sin ventana</option>
                  <option v-for="side in SIDE_OPTIONS" :key="`win-${side.value}`" :value="side.value">
                    {{ side.label }}
                  </option>
                </select>
              </label>
              <label>Cantidad (m2)
                <input v-model.number="row.ventana.areaM2" type="number" min="0" step="0.01" />
              </label>
            </div>

            <div class="matrix-block">
              <span class="block-title">Ubicacion puerta</span>
              <label>Lado
                <select v-model="row.puerta.lado">
                  <option value="">Sin puerta</option>
                  <option v-for="side in SIDE_OPTIONS" :key="`door-${side.value}`" :value="side.value">
                    {{ side.label }}
                  </option>
                </select>
              </label>
              <label>Cantidad (m2)
                <input v-model.number="row.puerta.areaM2" type="number" min="0" step="0.01" />
              </label>
            </div>

            <div class="matrix-block colindante-block">
              <span class="block-title">Colindante N/S</span>
              <label>Norte
                <select class="compact-select" v-model="getRelationRow(row.id).norte">
                  <option
                    v-for="option in getOptions(row.id)"
                    :key="`n-inline-${row.id}-${option.value}`"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>
              <label>Sur
                <select class="compact-select" v-model="getRelationRow(row.id).sur">
                  <option
                    v-for="option in getOptions(row.id)"
                    :key="`s-inline-${row.id}-${option.value}`"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>

            <div class="matrix-block colindante-block">
              <span class="block-title">Colindante E/O</span>
              <label>Este
                <select class="compact-select" v-model="getRelationRow(row.id).este">
                  <option
                    v-for="option in getOptions(row.id)"
                    :key="`e-inline-${row.id}-${option.value}`"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>
              <label>Oeste
                <select class="compact-select" v-model="getRelationRow(row.id).oeste">
                  <option
                    v-for="option in getOptions(row.id)"
                    :key="`o-inline-${row.id}-${option.value}`"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>

            <div class="matrix-block">
              <span class="block-title">Datos estructurales</span>
              <label v-if="showCastillosInput">Castillos (pzas)
                <input v-model.number="row.castillosPzas" type="number" min="0" step="1" />
              </label>
              <label v-if="showColumnasInput">Columnas (pzas)
                <input
                  v-model.number="row.columnasPzas"
                  type="number"
                  min="0"
                  step="1"
                />
              </label>
              <label v-if="showZapatasAisladasInput">Zapata aislada (pzas)
                <input
                  v-model.number="row.zapatasAisladasPzas"
                  type="number"
                  min="0"
                  step="1"
                />
              </label>
              <label class="toggle">
                <input
                  v-model="row.dobleAltura"
                  type="checkbox"
                  :disabled="!isInteriorType(row.tipo)"
                />
                <span>Doble altura (espacio interior)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <p class="hint">Un espacio puede compartir el mismo colindante con otros espacios.</p>
      <p class="hint">
        Barda perimetral: se captura en esta sección como tipo de espacio "Barda Perimetral" (solo en planta baja).
      </p>
      <p class="hint">Total calculado de espacios: {{ totalAreaM2.toFixed(2) }} m2</p>
      <p v-if="errors.espacios" class="error">{{ errors.espacios }}</p>
      <p v-if="errors.colindancias" class="error">{{ errors.colindancias }}</p>
    </section>

    <section class="card">
      <h2>Validacion Arquitectonica</h2>

      <div class="metrics-grid">
        <article class="metric-item">
          <span>Area de terreno</span>
          <strong>{{ areaTerrenoCalculada.toFixed(2) }} m2</strong>
        </article>
        <article class="metric-item">
          <span>Area de construccion calculada</span>
          <strong>{{ totalAreaM2.toFixed(2) }} m2</strong>
        </article>
        <article class="metric-item">
          <span>Area de obra interior</span>
          <strong>{{ areaObraInterior.toFixed(2) }} m2</strong>
        </article>
        <article class="metric-item">
          <span>Area de obra exterior</span>
          <strong>{{ areaObraExterior.toFixed(2) }} m2</strong>
        </article>
        <article class="metric-item">
          <span>Area libre o solares</span>
          <strong>{{ areaLibreSolares.toFixed(2) }} m2</strong>
        </article>
      </div>

      <label><input v-model="validation.coherenciaArea" type="checkbox" /> Coherencia de area</label>
      <label><input v-model="validation.coherenciaVolumetria" type="checkbox" /> Coherencia de volumetria</label>
      <label><input v-model="validation.revisado" type="checkbox" /> Marcar como revisado</label>
      <p v-if="alerts.length" class="hint">Alertas: {{ alerts.join(" | ") }}</p>
      <p v-if="errors.validacion" class="error">{{ errors.validacion }}</p>
    </section>

    <footer class="actions">
      <button type="button" @click="goBack">Regresar</button>
      <button type="button" @click="handleContinue">Guardar y continuar a preliminares</button>
    </footer>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import LogoQuantia from "@/components/common/LogoQuantia.vue";
import { useAuthStore } from "@/stores/authStore";
import { useViviendaStore } from "@/modules/vivienda/store/viviendaStore";
import {
  EXTERIOR_NODE,
  buildSpaceLabelMap,
  normalizeSpatialRelations,
  validateSpatialRelations,
} from "@/modules/vivienda/services/spatialRelationsService";

const SPACE_TYPES = [
  { value: "recamara_principal", label: "Recamara Principal" },
  { value: "recamara_2", label: "Recamara 2" },
  { value: "recamara_3", label: "Recamara 3" },
  { value: "recamara_4", label: "Recamara 4" },
  { value: "bano_1", label: "Bano 1" },
  { value: "bano_2", label: "Bano 2" },
  { value: "medio_bano", label: "Medio Bano" },
  { value: "sala", label: "Sala" },
  { value: "cocina", label: "Cocina" },
  { value: "comedor", label: "Comedor" },
  { value: "estancia", label: "Estancia" },
  { value: "estudio", label: "Estudio" },
  { value: "escalera_1", label: "Escalera 1" },
  { value: "escalera_2", label: "Escalera 2" },
  { value: "escalera_3", label: "Escalera 3" },
  { value: "terraza", label: "Terraza" },
  { value: "pasillo_interior", label: "Pasillo interior" },
  { value: "patio_servicio", label: "Patio Servicio" },
  { value: "patio_exterior", label: "Patio Exterior" },
  { value: "cochera", label: "Cochera" },
  { value: "jardin", label: "Jardin" },
  { value: "barda_perimetral", label: "Barda Perimetral" },
  { value: "cuarto_servicio", label: "Cuarto de servicio" },
  { value: "almacen", label: "Almacen" },
];
const SPACE_TYPE_LABEL_MAP = Object.fromEntries(
  SPACE_TYPES.map((item) => [item.value, item.label])
);

const SIDE_OPTIONS = [
  { value: "a1", label: "A1" },
  { value: "a2", label: "A2" },
  { value: "l1", label: "L1" },
  { value: "l2", label: "L2" },
];

const LEVEL_LABELS = {
  planta_baja: "Planta Baja",
  segunda_planta: "Segunda Planta",
  tercera_planta: "Tercera Planta",
  planta_azotea: "Planta Azotea",
};

const FLOOR_LEVEL_ORDER = ["planta_baja", "segunda_planta", "tercera_planta"];
const ROOF_LEVEL = "planta_azotea";

const EXTERIOR_TYPES = new Set([
  "terraza",
  "patio_servicio",
  "patio_exterior",
  "cochera",
  "jardin",
  "barda_perimetral",
]);

const EXTERIOR_OBRA_TYPES = new Set([
  "patio_servicio",
  "patio_exterior",
  "cochera",
  "jardin",
]);

const router = useRouter();
const authStore = useAuthStore();
const viviendaStore = useViviendaStore();

function clampNiveles(value) {
  const raw = Number(value || 1);
  if (!Number.isFinite(raw)) return 1;
  return Math.min(Math.max(Math.trunc(raw), 1), 3);
}

function normalizeLevel(level) {
  const raw = String(level || "").trim().toLowerCase();
  if (raw === "1" || raw === "planta_baja") return "planta_baja";
  if (raw === "2" || raw === "segunda_planta") return "segunda_planta";
  if (raw === "3" || raw === "tercera_planta") return "tercera_planta";
  if (raw === "4" || raw === "planta_azotea") return "planta_azotea";
  return "";
}

function normalizeType(type) {
  const raw = String(type || "").trim().toLowerCase();
  return SPACE_TYPES.some((item) => item.value === raw) ? raw : "";
}

function getConfiguredLevels(niveles) {
  const floors = FLOOR_LEVEL_ORDER.slice(0, clampNiveles(niveles));
  return [...floors, ROOF_LEVEL];
}

function supportsCastillos(tipoCimentacion) {
  return ["mamposteria", "zapata_corrida"].includes(String(tipoCimentacion || ""));
}

function supportsColumnas(tipoCimentacion) {
  return ["zapata_aislada", "trabe_liga"].includes(String(tipoCimentacion || ""));
}

function supportsZapatasAisladas(tipoCimentacion) {
  return ["zapata_aislada", "trabe_liga"].includes(String(tipoCimentacion || ""));
}

function createRow(level = "planta_baja") {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nivel: level,
    tipo: "",
    anchoM: "",
    largoM: "",
    areaM2: 0,
    dobleAltura: false,
    ladosCimentacion: {
      a1: false,
      a2: false,
      l1: false,
      l2: false,
    },
    ventana: {
      lado: "",
      areaM2: "",
    },
    puerta: {
      lado: "",
      areaM2: "",
    },
    castillosPzas: "",
    columnasPzas: "",
    zapatasAisladasPzas: "",
  };
}

function calculateArea(ancho, largo) {
  const width = Number(ancho || 0);
  const length = Number(largo || 0);
  if (width <= 0 || length <= 0) return 0;
  return Number((width * length).toFixed(2));
}

function guessTerrainSide() {
  const area = Number(viviendaStore.datosGeneralesObra.areaTerrenoM2 || 0);
  if (area <= 0) return "";
  return Number(Math.sqrt(area).toFixed(2));
}

const guessedSide = guessTerrainSide();

const general = reactive({
  ubicacionProyecto:
    viviendaStore.datosGeneralesObra.ubicacionProyecto ||
    viviendaStore.registro.cliente.ubicacion ||
    "",
  anchoTerrenoM: Number(viviendaStore.datosGeneralesObra.anchoTerrenoM || 0) || guessedSide || "",
  largoTerrenoM: Number(viviendaStore.datosGeneralesObra.largoTerrenoM || 0) || guessedSide || "",
  areaConstruccionPropuestaM2:
    Number(viviendaStore.datosGeneralesObra.areaConstruccionPropuestaM2 || 0) ||
    Number(viviendaStore.datosGeneralesObra.areaConstruccionM2 || 0) ||
    "",
  niveles: clampNiveles(viviendaStore.datosGeneralesObra.niveles || 1),
  alturaNivel1M:
    Number(viviendaStore.datosGeneralesObra.alturaNivel1M || 0) ||
    Number(viviendaStore.datosGeneralesObra.alturaPromedioM || 0) ||
    "",
  alturaNivel2M: Number(viviendaStore.datosGeneralesObra.alturaNivel2M || 0) || "",
  alturaNivel3M: Number(viviendaStore.datosGeneralesObra.alturaNivel3M || 0) || "",
  sistemaEstructural: viviendaStore.datosGeneralesObra.sistemaEstructural || "",
  tipoCimentacion: viviendaStore.datosGeneralesObra.tipoCimentacion || "",
});

const spatial = reactive({
  espacios: viviendaStore.estructuraEspacial.espacios?.length
    ? viviendaStore.estructuraEspacial.espacios.map((item, index) => ({
      id: item.id || `row-${index + 1}`,
      nivel: normalizeLevel(item.nivel),
      tipo: normalizeType(item.tipo),
      anchoM: Number(item.anchoM || 0) || "",
      largoM: Number(item.largoM || 0) || "",
      areaM2: calculateArea(item.anchoM || 0, item.largoM || 0),
      dobleAltura: Boolean(item.dobleAltura),
      ladosCimentacion: {
        a1: Boolean(item?.ladosCimentacion?.a1),
        a2: Boolean(item?.ladosCimentacion?.a2),
        l1: Boolean(item?.ladosCimentacion?.l1),
        l2: Boolean(item?.ladosCimentacion?.l2),
      },
      ventana: {
        lado: String(item?.ventana?.lado || "").toLowerCase(),
        areaM2: Number(item?.ventana?.areaM2 || 0) || "",
      },
      puerta: {
        lado: String(item?.puerta?.lado || "").toLowerCase(),
        areaM2: Number(item?.puerta?.areaM2 || 0) || "",
      },
      castillosPzas: Number(item?.castillosPzas || 0) || "",
      columnasPzas: Number(item?.columnasPzas || 0) || "",
      zapatasAisladasPzas: Number(item?.zapatasAisladasPzas || 0) || "",
    }))
    : [createRow("planta_baja")],
});

const levelSections = computed(() =>
  getConfiguredLevels(general.niveles).map((level) => ({
    value: level,
    label: LEVEL_LABELS[level] || level,
  }))
);

const relations = reactive({
  rows: normalizeSpatialRelations({
    espacios: spatial.espacios,
    relaciones: viviendaStore.colindanciasRecorrido.relaciones || [],
  }),
});

const validation = reactive({
  coherenciaArea: Boolean(viviendaStore.validacionEspacial.coherenciaArea),
  coherenciaVolumetria: Boolean(viviendaStore.validacionEspacial.coherenciaVolumetria),
  revisado: Boolean(viviendaStore.validacionEspacial.revisado),
});

const errors = reactive({ datos: "", espacios: "", colindancias: "", validacion: "" });
const userName = computed(() => authStore.user?.nombre || "Usuario Demo");
const showCastillosInput = computed(() => supportsCastillos(general.tipoCimentacion));
const showColumnasInput = computed(() => supportsColumnas(general.tipoCimentacion));
const showZapatasAisladasInput = computed(() =>
  supportsZapatasAisladas(general.tipoCimentacion)
);

const structuralHint = computed(() => {
  const map = {
    tradicional: "Tradicional: cimentacion mamposteria/zapata corrida, castillos y muros.",
    concreto_reforzado: "Concreto reforzado: zapata aislada/corrida, columnas y trabes.",
    mixta: "Mixta: combina criterios de mamposteria y concreto reforzado.",
  };
  if (!general.sistemaEstructural || !general.tipoCimentacion) {
    return "Selecciona sistema estructural y tipo de cimentacion para habilitar captura fina.";
  }
  return `${map[general.sistemaEstructural]} Tipo de cimentacion activo: ${general.tipoCimentacion.replace("_", " ")}.`;
});

const areaTerrenoCalculada = computed(() =>
  calculateArea(general.anchoTerrenoM || 0, general.largoTerrenoM || 0)
);

const sanitizedSpaces = computed(() =>
  spatial.espacios
    .filter((item) => getConfiguredLevels(general.niveles).includes(item.nivel))
    .map((item) => {
      const anchoM = Number(item.anchoM || 0);
      const largoM = Number(item.largoM || 0);
      const areaM2 = calculateArea(anchoM, largoM);
      const interior = isInteriorType(item.tipo);
      return {
        id: item.id,
        nivel: normalizeLevel(item.nivel),
        tipo: normalizeType(item.tipo),
        anchoM,
        largoM,
        areaM2,
        dobleAltura: interior ? Boolean(item.dobleAltura) : false,
        ladosCimentacion: {
          a1: Boolean(item?.ladosCimentacion?.a1),
          a2: Boolean(item?.ladosCimentacion?.a2),
          l1: Boolean(item?.ladosCimentacion?.l1),
          l2: Boolean(item?.ladosCimentacion?.l2),
        },
        ventana: {
          lado: ["a1", "a2", "l1", "l2"].includes(String(item?.ventana?.lado || "").toLowerCase())
            ? String(item?.ventana?.lado || "").toLowerCase()
            : "",
          areaM2: Number(item?.ventana?.areaM2 || 0),
        },
        puerta: {
          lado: ["a1", "a2", "l1", "l2"].includes(String(item?.puerta?.lado || "").toLowerCase())
            ? String(item?.puerta?.lado || "").toLowerCase()
            : "",
          areaM2: Number(item?.puerta?.areaM2 || 0),
        },
        castillosPzas: supportsCastillos(general.tipoCimentacion)
          ? Number(item?.castillosPzas || 0)
          : 0,
        columnasPzas: supportsColumnas(general.tipoCimentacion)
          ? Number(item?.columnasPzas || 0)
          : 0,
        zapatasAisladasPzas: supportsZapatasAisladas(general.tipoCimentacion)
          ? Number(item?.zapatasAisladasPzas || 0)
          : 0,
      };
    })
);

const totalAreaM2 = computed(() =>
  sanitizedSpaces.value.reduce((acc, item) => acc + Number(item.areaM2 || 0), 0)
);

const areaObraExterior = computed(() =>
  sanitizedSpaces.value
    .filter((item) => EXTERIOR_OBRA_TYPES.has(item.tipo))
    .reduce((acc, item) => acc + Number(item.areaM2 || 0), 0)
);

const areaObraInterior = computed(() =>
  Number(Math.max(totalAreaM2.value - areaObraExterior.value, 0).toFixed(2))
);

const areaLibreSolares = computed(() =>
  Number((areaTerrenoCalculada.value - totalAreaM2.value).toFixed(2))
);

const spaceLabelMap = computed(() => buildSpaceLabelMap(sanitizedSpaces.value));

const spatialValidation = computed(() =>
  validateSpatialRelations({ espacios: sanitizedSpaces.value, relaciones: relations.rows })
);

const alerts = computed(() => {
  const list = [];
  if (totalAreaM2.value > areaTerrenoCalculada.value && areaTerrenoCalculada.value > 0) {
    list.push("Area de espacios supera el area de terreno.");
  }

  const areaCheckDelta = Number(
    Math.abs(totalAreaM2.value - (areaObraInterior.value + areaObraExterior.value)).toFixed(4)
  );
  if (areaCheckDelta > 0.01) {
    list.push("No se cumple relacion: Area construccion calculada = interior + exterior.");
  }

  if (!spatialValidation.value.valid) {
    list.push("Hay inconsistencias de colindancias.");
  }
  return list;
});

watch(
  () => spatial.espacios,
  (rows) => {
    rows.forEach((row) => {
      row.areaM2 = calculateArea(row.anchoM, row.largoM);
      if (!isInteriorType(row.tipo)) {
        row.dobleAltura = false;
      }
    });
  },
  { deep: true, immediate: true }
);

watch(
  () => general.niveles,
  (value) => {
    general.niveles = clampNiveles(value);
    const allowed = new Set(getConfiguredLevels(general.niveles));
    spatial.espacios = spatial.espacios.filter((item) => allowed.has(item.nivel));
    if (!spatial.espacios.length) {
      spatial.espacios.push(createRow("planta_baja"));
    }
  }
);

watch(
  () => general.tipoCimentacion,
  (tipoCimentacion) => {
    spatial.espacios.forEach((row) => {
      if (!supportsCastillos(tipoCimentacion)) {
        row.castillosPzas = "";
      }
      if (!supportsColumnas(tipoCimentacion)) {
        row.columnasPzas = "";
      }
      if (!supportsZapatasAisladas(tipoCimentacion)) {
        row.zapatasAisladasPzas = "";
      }
    });
  },
  { immediate: true }
);

watch(
  () => sanitizedSpaces.value.map((item) => `${item.id}|${item.nivel}|${item.tipo}`).join("|"),
  () => {
    relations.rows = normalizeSpatialRelations({
      espacios: sanitizedSpaces.value,
      relaciones: relations.rows,
    });
  }
);

function getRowsByLevel(level) {
  return spatial.espacios.filter((item) => item.nivel === level);
}

function getLadosLabel(level) {
  if (level === "planta_baja") {
    return supportsCastillos(general.tipoCimentacion)
      ? "Cimentacion en lados"
      : "Trabes en lados";
  }

  if (supportsCastillos(general.tipoCimentacion)) {
    return "Dala de cerramiento en lados";
  }

  if (supportsColumnas(general.tipoCimentacion)) {
    return "Trabes en lados";
  }

  return "Elementos en lados";
}

function getSpaceTypesForLevel(level) {
  if (level === "planta_azotea") {
    return SPACE_TYPES.filter((item) => ["cuarto_servicio", "almacen"].includes(item.value));
  }
  if (level === "planta_baja") {
    return SPACE_TYPES;
  }
  return SPACE_TYPES.filter((item) => item.value !== "barda_perimetral");
}

function getSpaceIndexInLevel(spaceId) {
  const row = spatial.espacios.find((item) => item.id === spaceId);
  if (!row) return 1;
  return getRowsByLevel(row.nivel).findIndex((item) => item.id === spaceId) + 1;
}

function addRow(level) {
  spatial.espacios.push(createRow(level));
}

function removeRow(rowId) {
  if (spatial.espacios.length === 1) return;
  const index = spatial.espacios.findIndex((item) => item.id === rowId);
  if (index < 0) return;
  spatial.espacios.splice(index, 1);
}

function isInteriorType(type) {
  return Boolean(type) && !EXTERIOR_TYPES.has(type);
}

function getSpaceById(id) {
  return sanitizedSpaces.value.find((item) => String(item.id) === String(id));
}

function getSpaceLabel(id, fallbackIndex = 0) {
  if (spaceLabelMap.value[String(id)]) return spaceLabelMap.value[String(id)];
  if (String(id || "").trim()) {
    const index = getSpaceIndexInLevel(id);
    const row = spatial.espacios.find((item) => item.id === id);
    const level = LEVEL_LABELS[row?.nivel] || "Nivel";
    return `Espacio ${index} - ${level}`;
  }
  return `Espacio ${fallbackIndex + 1}`;
}

function getRelationRow(espacioId) {
  const id = String(espacioId || "");
  if (!id) {
    return {
      espacioId: "",
      norte: EXTERIOR_NODE,
      sur: EXTERIOR_NODE,
      este: EXTERIOR_NODE,
      oeste: EXTERIOR_NODE,
    };
  }

  let row = relations.rows.find((item) => String(item?.espacioId || "") === id);
  if (!row) {
    row = {
      espacioId: id,
      norte: EXTERIOR_NODE,
      sur: EXTERIOR_NODE,
      este: EXTERIOR_NODE,
      oeste: EXTERIOR_NODE,
    };
    relations.rows.push(row);
  }
  return row;
}

function getOptions(espacioId) {
  const source = getSpaceById(espacioId);
  const sourceLevel = source?.nivel || "";
  const base = [{ value: EXTERIOR_NODE, label: "Exterior / Ninguno" }];
  const peers = sanitizedSpaces.value
    .filter((item) => String(item.id) !== String(espacioId))
    .filter((item) => item.nivel === sourceLevel);
  return [
    ...base,
    ...peers.map((item) => ({ value: String(item.id), label: getOptionLabel(item) })),
  ];
}

function getOptionLabel(item) {
  const typeLabel = SPACE_TYPE_LABEL_MAP[item.tipo] || "Espacio";
  const sameTypeLevel = sanitizedSpaces.value.filter(
    (space) => space.nivel === item.nivel && space.tipo === item.tipo
  );
  if (sameTypeLevel.length <= 1) {
    return typeLabel;
  }
  const idx = sameTypeLevel.findIndex((space) => String(space.id) === String(item.id)) + 1;
  return `${typeLabel} ${idx}`;
}

function formatArea(value) {
  return Number(value || 0).toFixed(2);
}

function resetErrors() {
  errors.datos = "";
  errors.espacios = "";
  errors.colindancias = "";
  errors.validacion = "";
}

function validateDatosSection() {
  errors.datos = "";
  const niveles = clampNiveles(general.niveles);
  const h1 = Number(general.alturaNivel1M || 0);
  const h2 = Number(general.alturaNivel2M || 0);
  const h3 = Number(general.alturaNivel3M || 0);
  if (
    Number(general.anchoTerrenoM || 0) <= 0 ||
    Number(general.largoTerrenoM || 0) <= 0 ||
    Number(general.areaConstruccionPropuestaM2 || 0) <= 0 ||
    !general.sistemaEstructural ||
    !general.tipoCimentacion ||
    clampNiveles(general.niveles) < 1
  ) {
    errors.datos = "Completa correctamente los datos generales.";
    return false;
  }
  if (h1 <= 0 || (niveles >= 2 && h2 <= 0) || (niveles >= 3 && h3 <= 0)) {
    errors.datos = "Captura altura valida para cada nivel configurado.";
    return false;
  }
  if (Number(areaTerrenoCalculada.value || 0) <= 0) {
    errors.datos = "El area de terreno calculada debe ser mayor que cero.";
    return false;
  }
  return true;
}

function validateEspaciosSection() {
  errors.espacios = "";
  if (
    !sanitizedSpaces.value.length ||
    sanitizedSpaces.value.some(
      (item) =>
        !item.nivel ||
        !item.tipo ||
        Number(item.anchoM || 0) <= 0 ||
        Number(item.largoM || 0) <= 0 ||
        Number(item.areaM2 || 0) <= 0
    )
  ) {
    errors.espacios = "Captura tipo, ancho y largo validos para todos los espacios.";
    return false;
  }

  const invalidByLevel = sanitizedSpaces.value.some((item) => {
    if (item.nivel === "planta_azotea") {
      return !["cuarto_servicio", "almacen"].includes(item.tipo);
    }
    if (item.tipo === "barda_perimetral" && item.nivel !== "planta_baja") {
      return true;
    }
    return false;
  });
  if (invalidByLevel) {
    errors.espacios =
      "En planta azotea solo se permite Cuarto de servicio o Almacen. Barda perimetral solo en planta baja.";
    return false;
  }

  if (Number(totalAreaM2.value || 0) > Number(areaTerrenoCalculada.value || 0)) {
    errors.espacios = "El area de construccion calculada no puede superar el area del terreno.";
    return false;
  }

  return true;
}

function validateColindanciasSection() {
  errors.colindancias = "";
  if (!spatialValidation.value.valid) {
    errors.colindancias = spatialValidation.value.issues[0] || "Corrige colindancias.";
    return false;
  }
  return true;
}

function validateValidacionSection() {
  errors.validacion = "";
  if (!validation.revisado || !validation.coherenciaArea || !validation.coherenciaVolumetria) {
    errors.validacion = "Debes confirmar la validacion espacial.";
    return false;
  }
  return true;
}

function persistAndContinue() {
  const alturas = [
    Number(general.alturaNivel1M || 0),
    Number(general.alturaNivel2M || 0),
    Number(general.alturaNivel3M || 0),
  ].filter((value, index) => value > 0 && index < clampNiveles(general.niveles));
  const alturaPromedioM = alturas.length
    ? Number((alturas.reduce((acc, value) => acc + value, 0) / alturas.length).toFixed(2))
    : 0;

  viviendaStore.setDatosGeneralesObra({
    ubicacionProyecto: String(viviendaStore.registro.cliente.ubicacion || "").trim(),
    anchoTerrenoM: Number(general.anchoTerrenoM || 0),
    largoTerrenoM: Number(general.largoTerrenoM || 0),
    areaTerrenoM2: Number(areaTerrenoCalculada.value.toFixed(2)),
    areaConstruccionPropuestaM2: Number(general.areaConstruccionPropuestaM2 || 0),
    areaConstruccionM2: Number(totalAreaM2.value.toFixed(2)),
    niveles: clampNiveles(general.niveles),
    alturaPromedioM,
    alturaNivel1M: Number(general.alturaNivel1M || 0),
    alturaNivel2M: Number(general.alturaNivel2M || 0),
    alturaNivel3M: Number(general.alturaNivel3M || 0),
    sistemaEstructural: general.sistemaEstructural,
    tipoCimentacion: general.tipoCimentacion,
    factorAjuste: 1,
  });

  viviendaStore.setEstructuraEspacial({ espacios: sanitizedSpaces.value });
  viviendaStore.setColindanciasRecorrido({
    relaciones: spatialValidation.value.normalizedRelations,
    inconsistencias: spatialValidation.value.issues,
    resumen: spatialValidation.value.summary,
  });
  viviendaStore.setValidacionEspacial({
    coherenciaArea: Boolean(validation.coherenciaArea),
    coherenciaVolumetria: Boolean(validation.coherenciaVolumetria),
    revisado: Boolean(validation.revisado),
    alertas: alerts.value,
  });

  router.push("/vivienda/cotizacion/preliminares");
}

function handleContinue() {
  resetErrors();

  if (!validateDatosSection() || !validateEspaciosSection() || !validateColindanciasSection() || !validateValidacionSection()) {
    return;
  }

  persistAndContinue();
}

function goDashboard() {
  router.push("/vivienda/dashboard");
}

function goBack() {
  router.push("/vivienda/cotizacion/clasificacion");
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24px;
  color: #f8f7ff;
  background: linear-gradient(135deg, #151d6b 0%, #2b1d83 32%, #4523a6 58%, #6a39cc 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.95fr);
  grid-template-areas:
    "head head"
    "title title"
    "lead lead"
    "spaces general"
    "spaces validation"
    "actions actions";
  gap: 12px;
  align-items: start;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  grid-area: head;
}

.head nav {
  display: flex;
  gap: 12px;
}

.head a {
  color: #fff;
  text-decoration: none;
}

.lead {
  opacity: 0.9;
  margin-bottom: 12px;
  grid-area: lead;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tabs button {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.tabs .active {
  background: rgba(47, 196, 255, 0.35);
}

.card {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 0;
}

.page > h1 {
  grid-area: title;
  margin: 0;
}

.card:nth-of-type(1) {
  grid-area: general;
}

.card:nth-of-type(2) {
  grid-area: spaces;
}

.card:nth-of-type(3) {
  grid-area: validation;
}

.pair-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.pair-grid label,
.height-grid label,
.grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
  min-width: 0;
}

.height-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.level-block + .level-block {
  margin-top: 18px;
}

.level-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.level-head h3 {
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.row-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.matrix-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.matrix-block {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  container-type: inline-size;
}

.block-title {
  font-size: 0.83rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: rgba(236, 242, 255, 0.88);
}

.matrix-block label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
  min-width: 0;
  font-size: clamp(0.88rem, 2.05cqw, 1rem);
}

.colindante-block {
  gap: 6px;
}

.colindante-block label {
  gap: 4px;
}

.compact-select {
  padding: clamp(5px, 1.2cqw, 7px) clamp(7px, 1.6cqw, 9px);
  font-size: clamp(0.8rem, 1.75cqw, 0.92rem);
  min-height: 34px;
}

.side-flags {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 10px;
}

.side-flags label {
  font-weight: 600;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

input,
select {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px;
  font-size: 0.98rem;
  line-height: 1.2;
}

.matrix-block input,
.matrix-block select {
  padding: clamp(6px, 1.45cqw, 8px) clamp(8px, 2cqw, 10px);
  font-size: clamp(0.85rem, 1.95cqw, 0.98rem);
}

input[readonly] {
  opacity: 0.88;
}

option {
  color: #111827;
}

.row {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
}

.toggle {
  align-self: start;
  justify-content: flex-start;
  min-height: auto;
}

.toggle input {
  margin-right: 8px;
}

.metrics-grid {
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.metric-item {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
}

.metric-item span {
  display: block;
  font-size: 0.84rem;
  color: rgba(236, 242, 255, 0.85);
  margin-bottom: 6px;
}

.metric-item strong {
  display: block;
  font-size: 0.98rem;
}

.helper {
  color: rgba(229, 236, 255, 0.76);
  font-size: 0.82rem;
}

.helper-inline {
  color: rgba(229, 236, 255, 0.82);
  font-size: 0.78rem;
  line-height: 1.35;
}

.hint {
  color: rgba(235, 239, 255, 0.86);
  margin-top: 8px;
}

.error {
  color: #ff9dbb;
  margin-top: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  grid-area: actions;
}

button {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .matrix-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .page {
    display: block;
  }

  .pair-grid,
  .height-grid,
  .matrix-grid,
  .grid {
    grid-template-columns: 1fr;
  }

  .head {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    flex-direction: column;
  }

  .level-head {
    flex-direction: column;
    align-items: stretch;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
