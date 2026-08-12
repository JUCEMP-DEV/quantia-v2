<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="modulo-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goDashboard">Inicio</a>
          <a href="#" @click.prevent="goBack">Anterior</a>
          <a href="#" @click.prevent>Ayuda</a>
        </nav>

        <div class="user-pill">
          <span>{{ profileLabel }}</span>
          <strong>{{ userName }}</strong>
        </div>
      </header>

      <section class="hero-card">
        <div class="hero-left">
          <p class="module-tag">Quantia · Módulos condicionados</p>
          <h1>{{ moduleConfig.title }}</h1>
          <p class="hero-text">{{ moduleConfig.description }}</p>
        </div>

        <div class="hero-right">
          <div class="cost-box">
            <span>Total del modulo</span>
            <strong>{{ formattedModuleCost }}</strong>
          </div>
          <div class="cost-box">
            <span>Acumulado global oficial</span>
            <strong>{{ formattedGlobalCost }}</strong>
          </div>

          <div class="resume-box">
            <div class="resume-item">
              <span>Paso actual</span>
              <strong>{{ currentStep }} de {{ totalSteps }}</strong>
            </div>
            <div class="resume-item">
              <span>Partida</span>
              <strong>{{ moduleConfig.title }}</strong>
            </div>
            <div class="resume-item">
              <span>Siguiente</span>
              <strong>{{ nextStepLabel }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="modulo-grid">
        <article class="main-card">
          <div class="card-header">
            <div>
              <p class="card-tag">Paso {{ currentStep }} de {{ totalSteps }}</p>
              <h2>Selección de conceptos de {{ moduleConfig.title.toLowerCase() }}</h2>
              <p>
                Las cantidades se calculan automáticamente desde Distribución Arquitectónica y solo seleccionas los conceptos aplicables.
              </p>
            </div>
          </div>

          <form class="modulo-form" @submit.prevent="handleContinue">
            <div class="section-block">
              <div class="section-title-row">
                <h3>Condiciones del módulo</h3>
                <span class="section-badge">Contexto</span>
              </div>

              <div class="grid-form">
                <div class="field-group">
                  <label>Sistema estructural</label>
                  <input :value="sistemaEstructuralLabel" type="text" readonly />
                </div>

                <div v-if="showZapataControl" class="field-group">
                  <label for="tipoZapata">Tipo de zapata</label>
                  <select id="tipoZapata" v-model="controls.tipoZapata">
                    <option
                      v-for="option in CIMENTACION_ZAPATA_OPTIONS"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div v-if="showLosaControl" class="field-group">
                  <label for="tipoLosa">Tipo de losa</label>
                  <select id="tipoLosa" v-model="controls.tipoLosa">
                    <option
                      v-for="option in LOSA_OPTIONS"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div v-if="showAcabadoControl" class="field-group">
                  <label for="nivelAcabado">Nivel de acabado</label>
                  <select id="nivelAcabado" v-model="controls.nivelAcabado">
                    <option
                      v-for="option in ACABADO_OPTIONS"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div v-if="showServiciosInstalacionesControl" class="field-group field-group-services">
                  <label>Servicios a considerar en instalaciones</label>
                  <div class="service-filters">
                    <label>
                      <input v-model="controls.serviciosInstalaciones.agua" type="checkbox" />
                      Agua
                    </label>
                    <label>
                      <input v-model="controls.serviciosInstalaciones.energia" type="checkbox" />
                      Energia
                    </label>
                    <label>
                      <input v-model="controls.serviciosInstalaciones.drenaje" type="checkbox" />
                      Drenaje / Pluvial
                    </label>
                    <label>
                      <input v-model="controls.serviciosInstalaciones.gas" type="checkbox" />
                      Gas
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-block">
              <div class="section-title-row">
                <h3>Listado de conceptos</h3>
                <span class="section-badge concepts">{{ availableConcepts.length }} disponibles</span>
              </div>
              <p v-if="catalogState.loading && !availableConcepts.length" class="helper-text">
                Consultando conceptos en BD...
              </p>
              <p v-else-if="catalogState.source === 'bd'" class="helper-text success">
                Fuente activa: catálogo de BD.
              </p>
              <p v-if="forceSelectAllByDb" class="helper-text success">
                Selección automática activa: se enviarán todos los conceptos disponibles para esta partida.
              </p>
              <p v-if="catalogState.error" class="helper-text warning">
                {{ catalogState.error }}
              </p>
              <p
                v-if="showServiciosInstalacionesControl && controls.serviciosInstalaciones.gas && !gasConceptsAvailable"
                class="helper-text warning"
              >
                No hay conceptos de gas activos en la BD para este catálogo/fuente.
              </p>
              <p v-if="catalogLocked && catalogState.error" class="helper-text warning">
                No se pudo simular este modulo en backend. Intenta nuevamente para continuar y conservar el acumulado.
              </p>

              <div v-if="!availableConcepts.length" class="empty-box">
                No hay conceptos disponibles para esta combinación. Revisa las condiciones del módulo.
              </div>

              <div v-else class="concepts-list">
                <label
                  v-for="concept in availableConcepts"
                  :key="concept.key"
                  class="concept-item"
                  :class="{ selected: isConceptSelected(concept.key) }"
                >
                  <input
                    type="checkbox"
                    :checked="isConceptSelected(concept.key)"
                    @change="toggleConceptSelection(concept.key, $event.target.checked)"
                    :disabled="forceSelectAllByDb || catalogLocked"
                  />
                  <div class="concept-main">
                    <strong>{{ concept.title }}</strong>
                    <span class="concept-partida">{{ concept.partida }}</span>
                    <p>{{ concept.description }}</p>
                  </div>
                  <div class="concept-metrics">
                    <span>{{ concept.quantity }} {{ concept.unit }}</span>
                    <span>{{ formatCurrency(concept.unitPrice) }}</span>
                    <strong>{{ formatCurrency(concept.total) }}</strong>
                  </div>
                </label>
              </div>

              <p v-if="errors.selection" class="error-text">{{ errors.selection }}</p>
            </div>

            <div class="actions">
              <button type="button" class="btn btn-secondary" @click="goBack">Regresar</button>
              <button type="submit" class="btn btn-primary" :disabled="catalogLocked">Guardar y continuar</button>
            </div>
          </form>
        </article>

        <aside class="side-column">
          <article class="side-card">
            <div class="card-header small">
              <p class="card-tag">Resumen de selección</p>
              <h3>Conceptos elegidos</h3>
            </div>

            <div v-if="!selectedConcepts.length" class="empty-box">
              Selecciona al menos un concepto para continuar.
            </div>

            <div v-else class="selected-list">
              <div v-for="item in selectedConcepts" :key="item.key" class="selected-item">
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.quantity }} {{ item.unit }} · {{ formatCurrency(item.unitPrice) }}</p>
                </div>
                <strong>{{ formatCurrency(item.total) }}</strong>
              </div>
            </div>

            <div v-if="summaryByPartida.length" class="summary-by-partida">
              <div v-for="summary in summaryByPartida" :key="summary.partida" class="summary-item">
                <span>{{ summary.partida }}</span>
                <strong>{{ summary.concepts }} concepto(s) · {{ formatCurrency(summary.total) }}</strong>
              </div>
            </div>
          </article>

          <article class="side-card">
            <div class="card-header small">
              <p class="card-tag">Secuencia de obra</p>
              <h3>Flujo activo</h3>
            </div>

            <div class="summary-list">
              <div v-for="step in flowSteps" :key="step.key" class="summary-item">
                <span>{{ step.label }}</span>
                <strong>{{ step.status }}</strong>
              </div>
            </div>
          </article>

          <article class="side-card">
            <div class="card-header small">
              <p class="card-tag">Métricas base</p>
              <h3>Distribución Arquitectónica</h3>
            </div>

            <div class="summary-list">
              <div class="summary-item">
                <span>Área construcción</span>
                <strong>{{ metrics.areaConstruccion.toFixed(2) }} m2</strong>
              </div>
              <div class="summary-item">
                <span>Niveles</span>
                <strong>{{ metrics.levelsCount }}</strong>
              </div>
              <div class="summary-item">
                <span>Espacios</span>
                <strong>{{ metrics.totalSpaces }}</strong>
              </div>
              <div class="summary-item">
                <span>Baños</span>
                <strong>{{ metrics.totalBanos }}</strong>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LogoQuantia from "@/components/common/LogoQuantia.vue";
import { useAuthStore } from "@/stores/authStore";
import { useViviendaStore } from "@/modules/vivienda/store/viviendaStore";
import {
  ACABADO_OPTIONS,
  CIMENTACION_ZAPATA_OPTIONS,
  LOSA_OPTIONS,
  getModuleConfig,
} from "@/modules/vivienda/services/moduleConceptsService";
import { simularModuloBackend } from "@/modules/vivienda/services/motorApiService";

const BASE_STEPS = [
  { key: "registro", label: "Registro" },
  { key: "clasificacion", label: "Clasificacion" },
  { key: "alcance", label: "Alcance" },
  { key: "modelo_espacial", label: "Distribucion" },
  { key: "preliminares", label: "Preliminares" },
];
const ROUTE_MODULE_KEY_MAP = {
  "cotizacion-cimentacion": "cimentacion",
  "cotizacion-estructura": "estructura",
  "cotizacion-albanileria": "albanileria",
  "cotizacion-instalaciones": "instalaciones",
  "cotizacion-acabados": "acabados",
  "cotizacion-complementarios": "complementarios_y_equipamiento",
};

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const viviendaStore = useViviendaStore();

function resolveModuleKeyFromRoute(currentRoute) {
  const routeName = String(currentRoute?.name || "");
  const byName = ROUTE_MODULE_KEY_MAP[routeName];
  if (byName) return byName;

  const metaKey = String(currentRoute?.meta?.moduleKey || "").trim();
  if (metaKey) return metaKey;

  const path = String(currentRoute?.path || "");
  if (path.includes("/cotizacion/estructura")) return "estructura";
  if (path.includes("/cotizacion/albanileria")) return "albanileria";
  if (path.includes("/cotizacion/instalaciones")) return "instalaciones";
  if (path.includes("/cotizacion/acabados")) return "acabados";
  if (path.includes("/cotizacion/complementarios")) return "complementarios_y_equipamiento";
  return "cimentacion";
}

const moduleKey = computed(() => resolveModuleKeyFromRoute(route));
const moduleConfig = computed(() => getModuleConfig(moduleKey.value));
const currentModuleData = computed(() => viviendaStore.modulos[moduleKey.value] || {});

const selectedConceptKeys = ref([...(currentModuleData.value.selectedConceptKeys || [])]);
const controls = reactive({
  tipoZapata: currentModuleData.value.controles?.tipoZapata || "aislada",
  tipoLosa: currentModuleData.value.controles?.tipoLosa || "maciza",
  nivelAcabado:
    currentModuleData.value.controles?.nivelAcabado ||
    viviendaStore.clasificacion.nivelAcabado ||
    "estandar",
  serviciosInstalaciones: {
    agua: currentModuleData.value.controles?.serviciosInstalaciones?.agua ?? true,
    energia: currentModuleData.value.controles?.serviciosInstalaciones?.energia ?? true,
    drenaje: currentModuleData.value.controles?.serviciosInstalaciones?.drenaje ?? true,
    gas: currentModuleData.value.controles?.serviciosInstalaciones?.gas ?? true,
  },
});
const errors = reactive({ selection: "" });
const catalogState = reactive({
  loading: false,
  source: "bd",
  error: "",
});
const simulationState = reactive({
  availableConcepts: [],
  selectedConcepts: [],
  summaryByPartida: [],
  costoEstimado: 0,
  contextSnapshot: {},
});
let lastSimulationRequestId = 0;
const autoSelectedByModule = ref({});

const profileLabel = computed(() => {
  if (authStore.accessProfile === "tecnico") return "Tecnico";
  if (authStore.accessProfile === "oficial") return "Oficial / General";
  return "Sin definir";
});
const userName = computed(() => authStore.user?.nombre || "Usuario Demo");

const sistemaEstructural = computed(() => viviendaStore.datosGeneralesObra.sistemaEstructural || "");
const sistemaEstructuralLabel = computed(() => {
  if (sistemaEstructural.value === "tradicional") return "Tradicional";
  if (sistemaEstructural.value === "concreto_reforzado") return "Concreto reforzado";
  if (sistemaEstructural.value === "mixta") return "Mixta";
  return "Sin definir";
});

const showZapataControl = computed(
  () => moduleKey.value === "cimentacion" && sistemaEstructural.value === "concreto_reforzado"
);
const showLosaControl = computed(() => moduleKey.value === "estructura");
const showAcabadoControl = computed(() => moduleKey.value === "acabados");
const showServiciosInstalacionesControl = computed(() => moduleKey.value === "instalaciones");
const forceSelectAllByDb = computed(() => false);
const catalogLocked = computed(() => catalogState.loading);

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildFallbackMetrics() {
  const spaces = Array.isArray(viviendaStore.estructuraEspacial?.espacios)
    ? viviendaStore.estructuraEspacial.espacios
    : [];
  const areaBySpaces = spaces.reduce((acc, item) => {
    const direct = toNumber(item?.areaM2, 0);
    if (direct > 0) return acc + direct;
    return acc + Math.max(toNumber(item?.anchoM, 0), 0) * Math.max(toNumber(item?.largoM, 0), 0);
  }, 0);
  const countByType = {};
  spaces.forEach((item) => {
    const key = String(item?.tipo || "").trim();
    if (!key) return;
    countByType[key] = (countByType[key] || 0) + 1;
  });
  return {
    areaConstruccion: toNumber(viviendaStore.datosGeneralesObra?.areaConstruccionM2, areaBySpaces),
    levelsCount: Math.max(
      toNumber(viviendaStore.datosGeneralesObra?.niveles, 0),
      new Set(spaces.map((item) => String(item?.nivel || "").trim()).filter(Boolean)).size,
      1
    ),
    totalSpaces: spaces.length,
    totalBanos: (countByType.bano_1 || 0) + (countByType.bano_2 || 0) + (countByType.medio_bano || 0),
  };
}

const metrics = computed(() => {
  const fallback = buildFallbackMetrics();
  return {
    areaConstruccion: toNumber(simulationState.contextSnapshot?.areaConstruccion, fallback.areaConstruccion),
    levelsCount: toNumber(simulationState.contextSnapshot?.levelsCount, fallback.levelsCount),
    totalSpaces: toNumber(simulationState.contextSnapshot?.totalSpaces, fallback.totalSpaces),
    totalBanos: toNumber(simulationState.contextSnapshot?.totalBanos, fallback.totalBanos),
  };
});

const availableConcepts = computed(() => simulationState.availableConcepts || []);
const selectedConcepts = computed(() => simulationState.selectedConcepts || []);
const summaryByPartida = computed(() => simulationState.summaryByPartida || []);
const gasConceptsAvailable = computed(() =>
  availableConcepts.value.some((concept) => {
    const partida = String(concept?.partida || "").toUpperCase();
    const code = String(concept?.key || "").toUpperCase();
    return partida.includes("GAS") || code.startsWith("GAS-");
  })
);

const moduleCost = computed(() => {
  const fromSimulation = Number(simulationState.costoEstimado || 0);
  if (fromSimulation > 0) return fromSimulation;
  return selectedConcepts.value.reduce((acc, item) => acc + Number(item.total || 0), 0);
});
const formattedModuleCost = computed(() => formatCurrency(moduleCost.value));
const acumuladoGlobal = computed(() => Number(viviendaStore.acumuladoGlobal || 0));
const formattedGlobalCost = computed(() => formatCurrency(acumuladoGlobal.value));

const requiredModules = computed(() => viviendaStore.getRequiredModuleOrder());
const currentStep = computed(() => {
  const idx = requiredModules.value.indexOf(moduleKey.value);
  return idx < 0 ? BASE_STEPS.length + 1 : BASE_STEPS.length + idx + 1;
});
const totalSteps = computed(() => BASE_STEPS.length + requiredModules.value.length + 3);
const nextRoute = computed(() => viviendaStore.getNextRouteAfterModule(moduleKey.value));
const nextStepLabel = computed(() => {
  if (nextRoute.value.includes("/cimentacion")) return "Cimentación";
  if (nextRoute.value.includes("/estructura")) return "Estructura";
  if (nextRoute.value.includes("/albanileria")) return "Albañilería";
  if (nextRoute.value.includes("/instalaciones")) return "Instalaciones";
  if (nextRoute.value.includes("/acabados")) return "Acabados";
  if (nextRoute.value.includes("/complementarios")) return "Complementarios";
  if (nextRoute.value.includes("/revision-inferencia")) return "Revisión de inferencia";
  return "Imprimible";
});

const flowSteps = computed(() => {
  const dynamic = requiredModules.value.map((key) => {
    const data = viviendaStore.modulos[key];
    const title = getModuleConfig(key)?.title || key;
    let status = "Pendiente";
    if (key === moduleKey.value) status = "Actual";
    if (data?.capturado) status = "Completo";
    return {
      key,
      label: title,
      status,
    };
  });

  return [...BASE_STEPS.map((step) => ({ ...step, status: "Completo" })), ...dynamic];
});

watch([showZapataControl, showLosaControl, showAcabadoControl], () => {
  if (!showZapataControl.value) controls.tipoZapata = controls.tipoZapata || "aislada";
  if (!showLosaControl.value) controls.tipoLosa = controls.tipoLosa || "maciza";
  if (!showAcabadoControl.value) controls.nivelAcabado = controls.nivelAcabado || "estandar";
});

watch(
  moduleKey,
  async () => {
    hydrateModuleControls();
    if (!viviendaStore.isModuloRequired(moduleKey.value)) return;
    await runModuleSimulation({ forceSelectAll: false });
  },
  { immediate: true }
);

watch(
  () => [
    controls.tipoZapata,
    controls.tipoLosa,
    controls.nivelAcabado,
    Boolean(controls.serviciosInstalaciones.agua),
    Boolean(controls.serviciosInstalaciones.energia),
    Boolean(controls.serviciosInstalaciones.drenaje),
    Boolean(controls.serviciosInstalaciones.gas),
  ],
  async () => {
    if (!viviendaStore.isModuloRequired(moduleKey.value)) return;
    await runModuleSimulation({ forceSelectAll: false });
  }
);

function validateForm() {
  errors.selection = "";
  if (catalogState.loading) {
    errors.selection = "Espera a que termine la simulacion de modulo en backend.";
    return false;
  }
  if (catalogState.error && !availableConcepts.value.length) {
    errors.selection = "No se pudo simular el modulo en backend. Reintenta para continuar.";
    return false;
  }
  if (!availableConcepts.value.length) {
    errors.selection = "No hay conceptos disponibles para guardar en este modulo.";
    return false;
  }
  if (!selectedConceptKeys.value.length) {
    errors.selection = "Selecciona al menos un concepto para continuar.";
    return false;
  }
  return true;
}

function hydrateModuleControls() {
  const data = currentModuleData.value || {};
  const controlsState = data.controles || {};
  const persistedKeys = Array.isArray(data.selectedConceptKeys) ? data.selectedConceptKeys : [];
  const fallbackKeys = Array.isArray(data.selectedConcepts)
    ? data.selectedConcepts.map((item) => item?.key).filter(Boolean)
    : [];

  selectedConceptKeys.value = [...new Set([...(persistedKeys || []), ...(fallbackKeys || [])])];
  controls.tipoZapata = controlsState.tipoZapata || "aislada";
  controls.tipoLosa = controlsState.tipoLosa || "maciza";
  controls.nivelAcabado = controlsState.nivelAcabado || viviendaStore.clasificacion.nivelAcabado || "estandar";
  controls.serviciosInstalaciones.agua = controlsState.serviciosInstalaciones?.agua ?? true;
  controls.serviciosInstalaciones.energia = controlsState.serviciosInstalaciones?.energia ?? true;
  controls.serviciosInstalaciones.drenaje = controlsState.serviciosInstalaciones?.drenaje ?? true;
  controls.serviciosInstalaciones.gas = controlsState.serviciosInstalaciones?.gas ?? true;
  errors.selection = "";
}

async function runModuleSimulation({ forceSelectAll = false } = {}) {
  if (!viviendaStore.isModuloRequired(moduleKey.value)) return null;

  const requestId = ++lastSimulationRequestId;
  catalogState.loading = true;
  catalogState.error = "";

  try {
    const response = await simularModuloBackend({
      moduleKey: moduleKey.value,
      controles: {
        sistemaEstructural: sistemaEstructural.value,
        tipoZapata: controls.tipoZapata,
        tipoLosa: controls.tipoLosa,
        nivelAcabado: controls.nivelAcabado,
        serviciosInstalaciones: {
          agua: Boolean(controls.serviciosInstalaciones.agua),
          energia: Boolean(controls.serviciosInstalaciones.energia),
          drenaje: Boolean(controls.serviciosInstalaciones.drenaje),
          gas: Boolean(controls.serviciosInstalaciones.gas),
        },
      },
      selectedConceptKeys: [...selectedConceptKeys.value],
      forceSelectAll: Boolean(forceSelectAll),
      preliminares: viviendaStore.preliminares,
      datosGeneralesObra: viviendaStore.datosGeneralesObra,
      estructuraEspacial: viviendaStore.estructuraEspacial,
      colindanciasRecorrido: viviendaStore.colindanciasRecorrido,
    });
    if (requestId !== lastSimulationRequestId) return null;

    simulationState.availableConcepts = Array.isArray(response?.availableConcepts)
      ? response.availableConcepts.map((item) => ({ ...item }))
      : [];
    simulationState.selectedConcepts = Array.isArray(response?.selectedConcepts)
      ? response.selectedConcepts.map((item) => ({ ...item }))
      : [];
    simulationState.summaryByPartida = Array.isArray(response?.summaryByPartida)
      ? response.summaryByPartida.map((item) => ({ ...item }))
      : [];
    simulationState.costoEstimado = toNumber(response?.costoEstimado, 0);
    simulationState.contextSnapshot = response?.contextSnapshot || {};
    catalogState.source = "bd";

    const moduleFlagKey = moduleKey.value;
    const alreadyAutoSelected = Boolean(autoSelectedByModule.value[moduleFlagKey]);
    if (
      !forceSelectAll &&
      !currentModuleData.value?.capturado &&
      !selectedConceptKeys.value.length &&
      simulationState.availableConcepts.length &&
      !alreadyAutoSelected
    ) {
      autoSelectedByModule.value = {
        ...autoSelectedByModule.value,
        [moduleFlagKey]: true,
      };
      selectedConceptKeys.value = simulationState.availableConcepts
        .map((item) => String(item?.key || ""))
        .filter(Boolean);
      return runModuleSimulation({ forceSelectAll: false });
    }

    return response;
  } catch (error) {
    if (requestId !== lastSimulationRequestId) return null;
    catalogState.error = String(error?.message || "No se pudo simular modulo en backend.");
    simulationState.availableConcepts = [];
    simulationState.selectedConcepts = [];
    simulationState.summaryByPartida = [];
    simulationState.costoEstimado = 0;
    simulationState.contextSnapshot = {};
    return null;
  } finally {
    if (requestId === lastSimulationRequestId) {
      catalogState.loading = false;
    }
  }
}

async function handleContinue() {
  if (!validateForm()) return;
  const backendSimulation = await runModuleSimulation({ forceSelectAll: false });
  if (!backendSimulation) {
    errors.selection = "No fue posible validar la simulacion del modulo en backend.";
    return;
  }

  const availableCount = availableConcepts.value.length;
  const conceptKeysToPersist = Array.isArray(backendSimulation?.selectedConceptKeys)
    ? backendSimulation.selectedConceptKeys
    : [...selectedConceptKeys.value];
  if (availableCount > 0 && !conceptKeysToPersist.length) {
    errors.selection = "No puedes continuar sin seleccionar conceptos del modulo.";
    return;
  }
  const selectedSnapshot = Array.isArray(backendSimulation?.selectedConcepts)
    ? backendSimulation.selectedConcepts.map((item) => ({ ...item }))
    : [];
  const summarySnapshot = Array.isArray(backendSimulation?.summaryByPartida)
    ? backendSimulation.summaryByPartida.map((item) => ({ ...item }))
    : [];
  if (!selectedSnapshot.length) {
    errors.selection = "No hay selectedConcepts para persistir en este modulo.";
    return;
  }
  if (!summarySnapshot.length) {
    errors.selection = "No hay summaryByPartida para persistir en este modulo.";
    return;
  }
  const selectedTotal = selectedSnapshot.reduce((acc, item) => acc + Number(item?.total || 0), 0);
  const summaryTotal = summarySnapshot.reduce((acc, item) => acc + Number(item?.total || 0), 0);
  const backendCost = Number(backendSimulation?.costoEstimado || 0);
  const normalizedModuleCost = Number(Math.max(backendCost, selectedTotal, summaryTotal).toFixed(2));
  const base = Math.max(selectedTotal, summaryTotal, 1);
  const mismatch = Math.abs(selectedTotal - summaryTotal) / base;
  if (mismatch > 0.05) {
    errors.selection =
      "El resumen por partida no coincide con los conceptos seleccionados. Revisa antes de continuar.";
    return;
  }
  if (normalizedModuleCost + 0.01 < selectedTotal) {
    errors.selection = "El costo estimado no cubre el total real de conceptos seleccionados.";
    return;
  }
  if (!selectedSnapshot.length || !summarySnapshot.length || backendCost <= 0) {
    errors.selection =
      "La simulacion backend del modulo regreso incompleta. No se puede continuar.";
    return;
  }

  const persistedOk = viviendaStore.setModuloData(moduleKey.value, {
    controles: {
      sistemaEstructural: sistemaEstructural.value,
      tipoZapata: controls.tipoZapata,
      tipoLosa: controls.tipoLosa,
      nivelAcabado: controls.nivelAcabado,
      serviciosInstalaciones: {
        agua: Boolean(controls.serviciosInstalaciones.agua),
        energia: Boolean(controls.serviciosInstalaciones.energia),
        drenaje: Boolean(controls.serviciosInstalaciones.drenaje),
        gas: Boolean(controls.serviciosInstalaciones.gas),
      },
    },
    selectedConceptKeys: conceptKeysToPersist,
    selectedConcepts: selectedSnapshot,
    summaryByPartida: summarySnapshot,
    costoEstimado: normalizedModuleCost,
  });
  if (!persistedOk) {
    errors.selection =
      "El store rechazo la persistencia del modulo por inconsistencias en selectedConcepts, resumen o costo.";
    return;
  }
  const persisted = viviendaStore.modulos[moduleKey.value] || {};
  const persistedSelected = Array.isArray(persisted.selectedConcepts) ? persisted.selectedConcepts.length : 0;
  const persistedSummary = Array.isArray(persisted.summaryByPartida) ? persisted.summaryByPartida.length : 0;
  if (persistedSelected <= 0 || persistedSummary <= 0 || Number(persisted.costoEstimado || 0) <= 0) {
    errors.selection =
      "No se pudo persistir correctamente el modulo. Corrige la captura antes de avanzar.";
    return;
  }
  console.info("[TRACE][MODULO][CONTINUE]", {
    modulo: moduleKey.value,
    selectedConcepts: persistedSelected,
    partidas: persistedSummary,
    costoBloque: Number(persisted.costoEstimado || 0),
    acumuladoGlobal: Number(viviendaStore.acumuladoGlobal || 0),
    source: "backend",
    siguiente: nextRoute.value,
  });

  router.push(nextRoute.value);
}

function isConceptSelected(conceptKey) {
  return selectedConceptKeys.value.includes(conceptKey);
}

async function toggleConceptSelection(conceptKey, checked) {
  if (catalogLocked.value) return;
  const selected = new Set(selectedConceptKeys.value);
  if (checked) {
    selected.add(conceptKey);
  } else {
    selected.delete(conceptKey);
  }
  selectedConceptKeys.value = [...selected];
  await runModuleSimulation({ forceSelectAll: false });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}

function goBack() {
  const idx = requiredModules.value.indexOf(moduleKey.value);
  if (idx <= 0) {
    router.push("/vivienda/cotizacion/preliminares");
    return;
  }
  router.push(viviendaStore.getRouteForModule(requiredModules.value[idx - 1]));
}

function goDashboard() {
  router.push("/vivienda/dashboard");
}

onMounted(() => {
  if (!viviendaStore.isModuloRequired(moduleKey.value)) {
    router.push(nextRoute.value);
  }
});
</script>

<style scoped>
.quantia-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 20%, rgba(84, 212, 255, 0.22), transparent 20%),
    radial-gradient(circle at 85% 15%, rgba(170, 92, 255, 0.24), transparent 22%),
    radial-gradient(circle at 50% 80%, rgba(122, 71, 255, 0.18), transparent 25%),
    linear-gradient(135deg, #151d6b 0%, #2b1d83 32%, #4523a6 58%, #6a39cc 100%);
  color: #f8f7ff;
  padding: 36px;
}

.bg-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(60px);
  pointer-events: none;
}

.orb-1 {
  width: 240px;
  height: 240px;
  background: rgba(68, 228, 255, 0.14);
  top: 60px;
  left: -20px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: rgba(194, 93, 255, 0.14);
  top: 0;
  right: -40px;
}

.orb-3 {
  width: 260px;
  height: 260px;
  background: rgba(104, 91, 255, 0.12);
  bottom: 30px;
  left: 30%;
}

.modulo-shell {
  position: relative;
  z-index: 1;
  max-width: 1380px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.brand-wrap {
  display: flex;
  align-items: center;
}

.topnav {
  display: flex;
  gap: 30px;
  align-items: center;
}

.topnav a {
  color: rgba(255, 255, 255, 0.92);
  text-decoration: none;
  font-weight: 500;
  transition: 0.2s ease;
}

.topnav a:hover {
  color: #8fe8ff;
}

.user-pill {
  min-width: 200px;
  padding: 12px 16px;
  border-radius: 16px;
  text-align: right;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.user-pill span {
  display: block;
  font-size: 0.8rem;
  color: rgba(242, 242, 255, 0.75);
  margin-bottom: 4px;
}

.hero-card {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.08));
  backdrop-filter: blur(18px);
  border-radius: 30px;
  box-shadow: 0 24px 80px rgba(13, 19, 72, 0.42);
  margin-bottom: 26px;
  padding: 34px;
}

.module-tag {
  margin: 0 0 10px;
  color: #84efff;
  font-size: 0.95rem;
  font-weight: 700;
}

.hero-left h1 {
  font-size: 3rem;
  line-height: 1.05;
  margin: 0 0 16px;
  font-weight: 800;
}

.hero-text {
  margin: 0;
  color: rgba(245, 245, 255, 0.88);
  font-size: 1.08rem;
  line-height: 1.6;
}

.hero-right {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-end;
}

.cost-box {
  min-width: 250px;
  border-radius: 20px;
  padding: 18px 20px;
  text-align: right;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.cost-box span {
  display: block;
  color: rgba(235, 235, 255, 0.8);
  margin-bottom: 6px;
}

.cost-box strong {
  font-size: 1.8rem;
}

.resume-box {
  width: 100%;
  max-width: 330px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.resume-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
}

.resume-item + .resume-item {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.modulo-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 22px;
}

.main-card,
.side-card {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px);
  border-radius: 26px;
  box-shadow: 0 20px 60px rgba(10, 17, 68, 0.28);
  padding: 26px;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 22px;
  order: 1;
}

.main-card {
  order: 2;
}

.card-header {
  margin-bottom: 18px;
}

.card-header.small {
  margin-bottom: 14px;
}

.card-tag {
  margin: 0 0 8px;
  color: #8fe8ff;
  font-size: 0.88rem;
  font-weight: 700;
}

.card-header p {
  margin: 0;
  color: rgba(245, 245, 255, 0.82);
  line-height: 1.55;
}

.modulo-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-block {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-badge {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  background: rgba(143, 232, 255, 0.18);
  color: #8fe8ff;
  font-weight: 700;
}

.section-badge.concepts {
  background: rgba(139, 92, 246, 0.2);
  color: #c9b4ff;
}

.section-badge.selected {
  background: rgba(83, 235, 188, 0.2);
  color: #8ff6d8;
}

.helper-text {
  margin: 0 0 12px;
  font-size: 0.86rem;
  color: rgba(236, 241, 255, 0.84);
}

.helper-text.success {
  color: #91f7dc;
}

.helper-text.warning {
  color: #ffc6d7;
}

.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group label {
  font-size: 0.96rem;
  font-weight: 700;
  color: #f6f7ff;
}

.field-group-services {
  grid-column: span 2;
}

.service-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.service-filters label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.field-group input,
.field-group select {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border-radius: 16px;
  padding: 14px 16px;
  outline: none;
  font-size: 1rem;
}

.field-group select option {
  color: #111827;
}

.concepts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.concept-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.concept-item.selected {
  border-color: rgba(143, 232, 255, 0.45);
  background: rgba(143, 232, 255, 0.14);
}

.concept-item input {
  margin-top: 4px;
}

.concept-main strong {
  display: block;
  margin-bottom: 6px;
}

.concept-partida {
  display: inline-block;
  margin-bottom: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #8fe8ff;
  background: rgba(143, 232, 255, 0.15);
}

.concept-main p {
  margin: 0;
  color: rgba(238, 241, 255, 0.84);
  line-height: 1.5;
}

.concept-metrics {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 4px;
}

.concept-metrics span {
  color: rgba(235, 241, 255, 0.86);
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.selected-item p {
  margin: 4px 0 0;
  color: rgba(233, 238, 255, 0.82);
}

.summary-by-partida {
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 12px;
}

.summary-by-partida .summary-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.summary-list {
  display: flex;
  flex-direction: column;
}

.summary-list .summary-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}

.summary-list .summary-item + .summary-item {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.error-text {
  margin: 0;
  color: #ff96b6;
  font-size: 0.88rem;
}

.empty-box {
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.25);
  color: rgba(233, 239, 255, 0.88);
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.btn {
  border: none;
  border-radius: 18px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #2fc4ff 0%, #6a52ff 55%, #8b5cf6 100%);
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

@media (max-width: 1100px) {
  .hero-card,
  .modulo-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .quantia-page {
    padding: 18px;
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-card,
  .main-card,
  .side-card {
    padding: 20px;
  }

  .hero-left h1 {
    font-size: 2.2rem;
  }

  .grid-form {
    grid-template-columns: 1fr;
  }

  .concept-item {
    grid-template-columns: 1fr;
  }

  .concept-metrics {
    align-items: start;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
