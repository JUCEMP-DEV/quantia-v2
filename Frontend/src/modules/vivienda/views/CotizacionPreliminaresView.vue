<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="preliminares-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goDashboard">Inicio</a>
          <a href="#" @click.prevent="goAlcance">Distribución Arquitectónica</a>
          <a href="#" @click.prevent>Ayuda</a>
        </nav>

        <div class="user-pill">
          <span>{{ profileLabel }}</span>
          <strong>{{ userName }}</strong>
        </div>
      </header>

      <section class="hero-card">
        <div class="hero-left">
          <p class="module-tag">Quantia · Pre-análisis técnico</p>
          <h1>Preliminares</h1>
          <p class="hero-text">
            Evalúa las condiciones iniciales del sitio para activar conceptos, advertencias y comportamiento operativo antes de las siguientes etapas del sistema.
          </p>

          <div class="flow-box">
            <div class="flow-item done">
              <span>1</span>
              <strong>Registro</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item done">
              <span>2</span>
              <strong>Clasificación</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item done">
              <span>3</span>
              <strong>Alcance</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item done">
              <span>4</span>
              <strong>Distribución</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item active">
              <span>5</span>
              <strong>Preliminares</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item">
              <span>6</span>
              <strong>Módulos</strong>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="cost-box">
            <span>Costo acumulado oficial</span>
            <strong>{{ formattedCost }}</strong>
            <p class="cost-note">Precalculo preliminares actual: {{ formattedLocalCost }}</p>
          </div>

            <div class="resume-box">
              <div class="resume-item">
                <span>Intervención</span>
                <strong>{{ clasificacionLabel }}</strong>
              </div>
              <div class="resume-item">
                <span>Alcance</span>
                <strong>{{ alcanceLabel }}</strong>
              </div>
              <div class="resume-item">
                <span>Conceptos activos</span>
              <strong>{{ activeConcepts.length }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="preliminares-grid">
        <aside class="side-column">
          <article class="side-card">
            <div class="card-header small">
              <div>
                <p class="card-tag">Resumen de seleccion</p>
                <h3>Estado de preliminares</h3>
              </div>
            </div>

            <div class="summary-list">
              <div class="summary-item">
                <span>Area preliminares</span>
                <strong>{{ form.areaPreliminares || "Sin capturar" }}</strong>
              </div>
              <div class="summary-item">
                <span>Area de terreno</span>
                <strong>{{ areaTerrenoInfoLabel }}</strong>
              </div>
              <div class="summary-item">
                <span>Acceso</span>
                <strong>{{ accessLabel }}</strong>
              </div>
              <div class="summary-item">
                <span>Terreno</span>
                <strong>{{ terrainLabel }}</strong>
              </div>
              <div class="summary-item">
                <span>Topografía</span>
                <strong>{{ topographyLabel }}</strong>
              </div>
              <div class="summary-item">
                <span>Profundidad de calculo</span>
                <strong>{{ topographyDepthLabel }}</strong>
              </div>
              <div class="summary-item">
                <span>Demolicion</span>
                <strong>{{ showDemolitionBlock ? "Si" : "No" }}</strong>
              </div>
            </div>
          </article>

          <article class="side-card">
            <div class="card-header small">
              <div>
                <p class="card-tag">Conceptos activados</p>
                <h3>Vista previa dinamica</h3>
              </div>
            </div>

            <div class="concepts-list">
              <p v-if="catalogState.loading" class="helper-text">Consultando conceptos PRE en BD...</p>
              <p v-else-if="catalogState.source === 'bd'" class="helper-text success">
                Fuente activa: catalogo PRE desde BD ({{ activeConcepts.length }} conceptos).
              </p>
              <p v-if="catalogState.error" class="helper-text warning">
                {{ catalogState.error }} Se usa logica local de respaldo.
              </p>

              <div
                v-for="concept in activeConcepts"
                :key="concept.key"
                class="concept-item"
              >
                <div class="concept-top">
                  <strong>{{ concept.title }}</strong>
                  <span>{{ concept.group }}</span>
                </div>
                <p>{{ concept.description }}</p>
              </div>

              <div v-if="activeConcepts.length === 0" class="concept-empty">
                Aun no hay conceptos activados.
              </div>
            </div>
          </article>
        </aside>

        <article class="main-card">
          <div class="card-header">
            <div>
              <p class="card-tag">Paso 8 de 13</p>
              <h2>Parámetros del sitio</h2>
              <p>
                Esta captura define la condición operativa de arranque y activa conceptos de limpieza, preparación, provisionales, retiro o demolición según corresponda.
              </p>
            </div>
          </div>

          <form class="preliminares-form" @submit.prevent="handleContinue">
            <div class="section-block">
              <div class="section-title-row">
                <h3>Datos principales</h3>
                <span class="section-badge">Obligatorio</span>
              </div>

              <div class="grid-form">
                <div class="field-group">
                  <label>Área de terreno (informativa)</label>
                  <input :value="areaTerrenoInfoLabel" type="text" readonly />
                </div>

                <div class="field-group">
                  <label for="areaPreliminares">Área de preliminares (m²)</label>
                  <input
                    id="areaPreliminares"
                    v-model="form.areaPreliminares"
                    type="number"
                    min="0"
                    placeholder="Ej. 120"
                    :class="{ invalid: errors.areaPreliminares }"
                  />
                  <p v-if="errors.areaPreliminares" class="error-text">{{ errors.areaPreliminares }}</p>
                </div>

                <div class="field-group">
                  <label for="tipoAcceso">Tipo de acceso</label>
                  <select
                    id="tipoAcceso"
                    v-model="form.tipoAcceso"
                    :class="{ invalid: errors.tipoAcceso }"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="facil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                  <p v-if="errors.tipoAcceso" class="error-text">{{ errors.tipoAcceso }}</p>
                </div>

                <div class="field-group">
                  <label for="condicionTerreno">Condición del terreno</label>
                  <select
                    id="condicionTerreno"
                    v-model="form.condicionTerreno"
                    :class="{ invalid: errors.condicionTerreno }"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="limpio">Limpio</option>
                    <option value="con_malezas">Con malezas</option>
                    <option value="con_construccion_previa">Con construcción previa</option>
                    <option value="con_escombro">Con escombro</option>
                    <option value="mixto">Mixto</option>
                  </select>
                  <p v-if="errors.condicionTerreno" class="error-text">{{ errors.condicionTerreno }}</p>
                </div>

                <div class="field-group">
                  <label for="topografia">Topografía</label>
                  <select
                    id="topografia"
                    v-model="form.topografia"
                    :class="{ invalid: errors.topografia }"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="plana">Plana</option>
                    <option value="semiplana">Semiplana</option>
                    <option value="accidentada">Accidentada</option>
                    <option value="con_pendiente">Con pendiente</option>
                  </select>
                  <p v-if="errors.topografia" class="error-text">{{ errors.topografia }}</p>
                </div>

                <div v-if="form.topografia === 'con_pendiente'" class="field-group">
                  <label for="pendienteProfundidadM">Profundidad por pendiente (m)</label>
                  <input
                    id="pendienteProfundidadM"
                    v-model="form.pendienteProfundidadM"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Ej. 0.30"
                    :class="{ invalid: errors.pendienteProfundidadM }"
                  />
                  <p v-if="errors.pendienteProfundidadM" class="error-text">{{ errors.pendienteProfundidadM }}</p>
                </div>
              </div>
            </div>

            <div v-if="showDemolitionBlock" class="section-block demolition-block">
              <div class="section-title-row">
                <h3>Subbloque de demolición</h3>
                <span class="section-badge demolition">Condicional</span>
              </div>

              <div class="grid-form">
                <div class="field-group">
                  <label for="tipoDemolicion">Tipo de demolición</label>
                  <select
                    id="tipoDemolicion"
                    v-model="form.demolicion.tipoDemolicion"
                    :class="{ invalid: errors.tipoDemolicion }"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="manual">Manual</option>
                    <option value="mecanica">Mecánica</option>
                  </select>
                  <p v-if="errors.tipoDemolicion" class="error-text">{{ errors.tipoDemolicion }}</p>
                </div>

                <div class="field-group">
                  <label for="tipoEstructuraExistente">Tipo de estructura existente</label>
                  <select
                    id="tipoEstructuraExistente"
                    v-model="form.demolicion.tipoEstructuraExistente"
                    :class="{ invalid: errors.tipoEstructuraExistente }"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="precaria">Precaria (Madera, mamposterías)</option>
                    <option value="construccion_previa">Construcción previa (Elemento de concreto y muros existentes)</option>
                  </select>
                  <p v-if="errors.tipoEstructuraExistente" class="error-text">{{ errors.tipoEstructuraExistente }}</p>
                </div>

                <div class="field-group">
                  <label for="nivelesExistentes">Niveles existentes</label>
                  <input
                    id="nivelesExistentes"
                    v-model="form.demolicion.nivelesExistentes"
                    type="number"
                    min="1"
                    placeholder="Ej. 1"
                    :class="{ invalid: errors.nivelesExistentes }"
                  />
                  <p v-if="errors.nivelesExistentes" class="error-text">{{ errors.nivelesExistentes }}</p>
                </div>

                <div class="field-group">
                  <label for="anchoDemolicionM">Ancho de demolición (m)</label>
                  <input
                    id="anchoDemolicionM"
                    v-model="form.demolicion.anchoDemolicionM"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 6"
                    :class="{ invalid: errors.anchoDemolicionM }"
                  />
                  <p v-if="errors.anchoDemolicionM" class="error-text">{{ errors.anchoDemolicionM }}</p>
                </div>

                <div class="field-group">
                  <label for="largoDemolicionM">Largo de demolición (m)</label>
                  <input
                    id="largoDemolicionM"
                    v-model="form.demolicion.largoDemolicionM"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 4"
                    :class="{ invalid: errors.largoDemolicionM }"
                  />
                  <p v-if="errors.largoDemolicionM" class="error-text">{{ errors.largoDemolicionM }}</p>
                </div>

                <div class="field-group">
                  <label>Área de demolición calculada (m²)</label>
                  <input :value="areaDemolicionCalculada.toFixed(2)" type="text" readonly />
                </div>
              </div>

              <div v-if="demolitionWarning" class="warning-box">
                <span>Advertencia</span>
                <p>{{ demolitionWarning }}</p>
              </div>
            </div>

            <div class="flow-note">
              <span class="note-badge">Lógica</span>
              <p>
                Los conceptos visibles cambian según la condición del terreno, el acceso, la topografía y la presencia de demolición.
              </p>
            </div>

            <div class="actions">
              <button type="button" class="btn btn-secondary" @click="goAlcance">
                Regresar
              </button>

              <button type="submit" class="btn btn-primary">
                Guardar y continuar
              </button>
            </div>
          </form>
        </article>

      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import LogoQuantia from "@/components/common/LogoQuantia.vue";
import { useAuthStore } from "@/stores/authStore";
import { useViviendaStore } from "@/modules/vivienda/store/viviendaStore";
import { simularPreliminaresBackend } from "@/modules/vivienda/services/motorApiService";

const router = useRouter();
const authStore = useAuthStore();
const viviendaStore = useViviendaStore();

const storedPreliminares = viviendaStore.preliminares;
const areaTerrenoInfo = computed(() => Number(viviendaStore.datosGeneralesObra.areaTerrenoM2 || 0));
const areaTerrenoInfoLabel = computed(() =>
  areaTerrenoInfo.value > 0 ? `${areaTerrenoInfo.value.toFixed(2)} m²` : "Sin capturar"
);

const form = reactive({
  tipoIntervencion:
    viviendaStore.clasificacion.tipoIntervencion ||
    viviendaStore.alcance.tipoIntervencion ||
    storedPreliminares.tipoIntervencion ||
    "obra_nueva",
  alcanceSeleccionado:
    viviendaStore.alcance.alcance ||
    storedPreliminares.alcanceSeleccionado ||
    "",
  areaPreliminares:
    storedPreliminares.areaPreliminares || storedPreliminares.superficiePreliminar || "",
  tipoAcceso: storedPreliminares.tipoAcceso || "",
  condicionTerreno: storedPreliminares.condicionTerreno || "",
  topografia: storedPreliminares.topografia || "",
  pendienteProfundidadM: storedPreliminares.pendienteProfundidadM || "",
  servicios: {
    agua: true,
    energia: true,
    drenaje: true,
  },
  demolicion: {
    tipoDemolicion: storedPreliminares.demolicion?.tipoDemolicion || "",
    tipoEstructuraExistente:
      storedPreliminares.demolicion?.tipoEstructuraExistente || "",
    nivelesExistentes: storedPreliminares.demolicion?.nivelesExistentes || "",
    anchoDemolicionM: storedPreliminares.demolicion?.anchoDemolicionM || "",
    largoDemolicionM: storedPreliminares.demolicion?.largoDemolicionM || "",
  },
});

const errors = reactive({
  areaPreliminares: "",
  tipoAcceso: "",
  condicionTerreno: "",
  topografia: "",
  pendienteProfundidadM: "",
  tipoDemolicion: "",
  tipoEstructuraExistente: "",
  nivelesExistentes: "",
  anchoDemolicionM: "",
  largoDemolicionM: "",
});

const simulatedCost = reactive({
  total: 0,
});
const catalogState = reactive({
  loading: false,
  source: "local",
  error: "",
});
const backendPreview = reactive({
  activeConcepts: [],
  technicalConcepts: [],
  officialSummary: [],
  costoEstimado: 0,
  pendingDefinitions: [],
});
let previewDebounceTimer = null;

const profileLabel = computed(() => {
  if (authStore.accessProfile === "tecnico") return "Técnico";
  if (authStore.accessProfile === "oficial") return "Oficial / General";
  return "Sin definir";
});

const userName = computed(() => authStore.user?.nombre || "Usuario Demo");

const clasificacionLabel = computed(() => {
  const map = {
    obra_nueva: "Obra nueva",
    remodelacion: "Remodelación",
    complementaria: "Complementaria",
  };
  return map[form.tipoIntervencion] || "Obra nueva";
});

const alcanceLabel = computed(() => {
  const map = {
    obra_negra: "Obra negra",
    obra_gris: "Obra gris",
    obra_completa: "Obra completa",
    obra_blanca: "Obra completa",
    remodelacion_por_etapas: "Remodelación por etapas",
    complementaria_por_etapas: "Complementaria por etapas",
  };
  return map[form.alcanceSeleccionado] || "Sin definir";
});

const showDemolitionBlock = computed(() => {
  return form.condicionTerreno === "con_construccion_previa";
});
const areaDemolicionCalculada = computed(() => {
  const ancho = Number(form.demolicion.anchoDemolicionM || 0);
  const largo = Number(form.demolicion.largoDemolicionM || 0);
  if (ancho <= 0 || largo <= 0) return 0;
  return Number((ancho * largo).toFixed(2));
});

const accessLabel = computed(() => {
  const map = {
    facil: "Fácil",
    medio: "Medio",
    dificil: "Difícil",
  };
  return map[form.tipoAcceso] || "Sin capturar";
});

const terrainLabel = computed(() => {
  const map = {
    limpio: "Limpio",
    con_malezas: "Con malezas",
    con_construccion_previa: "Con construcción previa",
    con_escombro: "Con escombro",
    mixto: "Mixto",
  };
  return map[form.condicionTerreno] || "Sin capturar";
});

const topographyLabel = computed(() => {
  const map = {
    plana: "Plana",
    semiplana: "Semiplana",
    accidentada: "Accidentada",
    con_pendiente: "Con pendiente",
  };
  return map[form.topografia] || "Sin capturar";
});

const topographyDepthLabel = computed(() => {
  const depth = Number(form.pendienteProfundidadM || 0);
  if (depth > 0) return `${depth.toFixed(2)} m`;
  if (form.topografia === "con_pendiente") return "Pendiente por definir";
  if (form.topografia === "accidentada") return "0.25 m";
  if (form.topografia === "semiplana") return "0.20 m";
  if (form.topografia === "plana") return "0.15 m";
  return "Sin capturar";
});

const demolitionWarning = computed(() => {
  if (
    form.demolicion.tipoDemolicion === "mecanica" &&
    form.tipoAcceso === "dificil"
  ) {
    return "La demolición mecánica puede ser incompatible con un acceso difícil. Esta combinación deberá validarse en la lógica real.";
  }
  return "";
});

const activeConceptsLocal = computed(() => {
  const concepts = [];

  if (!form.condicionTerreno && !form.topografia && !form.tipoAcceso) {
    return concepts;
  }

  concepts.push({
    key: "trazo_nivelacion_base",
    title: "Trazo y nivelación base",
    description: "Preparación inicial del frente de trabajo para arranque de actividades.",
    group: "Preparación",
  });

  if (form.condicionTerreno === "limpio") {
    concepts.push({
      key: "limpieza_superficial",
      title: conceptTitle("Limpieza inicial de terreno", "Limpieza de terreno"),
      description: conceptDesc(
        "Limpieza superficial del área de intervención para habilitar el arranque de obra.",
        "Limpieza inicial del área para comenzar el trabajo."
      ),
      group: "Limpieza",
    });
  }

  if (form.condicionTerreno === "con_malezas") {
    concepts.push({
      key: "retiro_maleza",
      title: conceptTitle("Retiro de maleza", "Retiro de maleza"),
      description: conceptDesc(
        "Retiro y limpieza de maleza en la superficie de intervención.",
        "Limpieza de maleza en el terreno."
      ),
      group: "Limpieza",
    });
  }

  if (form.condicionTerreno === "con_escombro" || form.condicionTerreno === "mixto") {
    concepts.push({
      key: "retiro_escombro_superficial",
      title: conceptTitle(
        "Retiro de escombro superficial en área de trabajo",
        "Retiro de escombro"
      ),
      description: conceptDesc(
        "Retiro manual de escombro superficial y material suelto en el área de intervención.",
        "Limpieza de restos y material sobrante del área de trabajo."
      ),
      group: "Retiro y acarreo",
    });
  }

  if (showDemolitionBlock.value) {
    concepts.push({
      key: "demolicion",
      title: conceptTitle("Demolición de construcción existente", "Demolición"),
      description: conceptDesc(
        "Proceso de demolición según sistema y estructura existente declarada.",
        "Retiro de construcción previa existente."
      ),
      group: "Demolición",
    });

    concepts.push({
      key: "acarreo_material_demolido",
      title: conceptTitle("Acarreo de material producto de demolición", "Acarreo de material demolido"),
      description: conceptDesc(
        "Carga, retiro y movimiento del material resultante de demolición.",
        "Retiro del material generado por demolición."
      ),
      group: "Retiro y acarreo",
    });
  }

  return concepts;
});

const activeConcepts = computed(() => {
  if (Array.isArray(backendPreview.activeConcepts) && backendPreview.activeConcepts.length) {
    return backendPreview.activeConcepts.map((concept) => ({
      key: String(concept?.key || ""),
      title: String(concept?.title || "Concepto preliminar"),
      description: String(concept?.description || "Concepto generado por motor backend."),
      group: String(concept?.group || concept?.partida || "Preliminares"),
      unit: String(concept?.unit || "u"),
      quantity: Number(concept?.quantity || 0),
      unitPrice: Number(concept?.unitPrice || 0),
      total: Number(
        concept?.total || Number(concept?.quantity || 0) * Number(concept?.unitPrice || 0)
      ),
    }));
  }
  return activeConceptsLocal.value;
});

const acumuladoGlobalOficial = computed(() => Number(viviendaStore.acumuladoGlobal || 0));

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}

const formattedCost = computed(() => formatCurrency(acumuladoGlobalOficial.value));
const formattedLocalCost = computed(() => formatCurrency(simulatedCost.total || 0));

function conceptTitle(tecnico, oficial) {
  return profileLabel.value === "Técnico" ? tecnico : oficial;
}

function conceptDesc(tecnica, oficial) {
  return profileLabel.value === "Técnico" ? tecnica : oficial;
}

function resetErrors() {
  errors.areaPreliminares = "";
  errors.tipoAcceso = "";
  errors.condicionTerreno = "";
  errors.topografia = "";
  errors.pendienteProfundidadM = "";
  errors.tipoDemolicion = "";
  errors.tipoEstructuraExistente = "";
  errors.nivelesExistentes = "";
  errors.anchoDemolicionM = "";
  errors.largoDemolicionM = "";
}

function validateForm() {
  resetErrors();
  let valid = true;

  if (!form.areaPreliminares || Number(form.areaPreliminares) <= 0) {
    errors.areaPreliminares = "El área de preliminares es obligatoria.";
    valid = false;
  }

  if (!form.tipoAcceso) {
    errors.tipoAcceso = "Selecciona el tipo de acceso.";
    valid = false;
  }

  if (!form.condicionTerreno) {
    errors.condicionTerreno = "Selecciona la condición del terreno.";
    valid = false;
  }

  if (!form.topografia) {
    errors.topografia = "Selecciona la topografía.";
    valid = false;
  }

  if (form.topografia === "con_pendiente" && Number(form.pendienteProfundidadM || 0) <= 0) {
    errors.pendienteProfundidadM =
      "En topografía con pendiente debes capturar la profundidad de corte.";
    valid = false;
  }

  if (showDemolitionBlock.value) {
    if (!form.demolicion.tipoDemolicion) {
      errors.tipoDemolicion = "Selecciona el tipo de demolición.";
      valid = false;
    }

    if (!form.demolicion.tipoEstructuraExistente) {
      errors.tipoEstructuraExistente = "Selecciona el tipo de estructura existente.";
      valid = false;
    }

    if (!form.demolicion.nivelesExistentes || Number(form.demolicion.nivelesExistentes) <= 0) {
      errors.nivelesExistentes = "Indica los niveles existentes.";
      valid = false;
    }

    if (!form.demolicion.anchoDemolicionM || Number(form.demolicion.anchoDemolicionM) <= 0) {
      errors.anchoDemolicionM = "Indica el ancho de demolición.";
      valid = false;
    }

    if (!form.demolicion.largoDemolicionM || Number(form.demolicion.largoDemolicionM) <= 0) {
      errors.largoDemolicionM = "Indica el largo de demolición.";
      valid = false;
    }
  }

  return valid;
}

function updateSimulatedCost() {
  let total = 0;
  const area = Number(form.areaPreliminares || 0);

  if (area > 0) total += area * 18;

  if (form.tipoAcceso === "medio") total += 1200;
  if (form.tipoAcceso === "dificil") total += 2800;

  if (form.condicionTerreno === "con_malezas") total += 1400;
  if (form.condicionTerreno === "con_escombro") total += 2200;
  if (form.condicionTerreno === "mixto") total += 3000;
  if (form.condicionTerreno === "con_construccion_previa") total += 4500;

  if (form.topografia === "semiplana") total += 900;
  if (form.topografia === "accidentada") total += 2200;
  if (form.topografia === "con_pendiente") total += 2600;

  if (showDemolitionBlock.value) {
    total += Number(areaDemolicionCalculada.value || 0) * 120;
    if (form.demolicion.tipoDemolicion === "mecanica") total += 1800;
    if (form.demolicion.tipoDemolicion === "manual") total += 900;
  }

  simulatedCost.total = total;
}

watch(
  () => [
    form.areaPreliminares,
    form.tipoAcceso,
    form.condicionTerreno,
    form.topografia,
    form.pendienteProfundidadM,
    form.demolicion.tipoDemolicion,
    form.demolicion.tipoEstructuraExistente,
    form.demolicion.nivelesExistentes,
    form.demolicion.anchoDemolicionM,
    form.demolicion.largoDemolicionM,
  ],
  () => {
    updateSimulatedCost();
    scheduleBackendPreview();
  },
  { immediate: true }
);

watch(
  () => form.topografia,
  (value) => {
    if (value === "con_pendiente") return;
    form.pendienteProfundidadM = "";
  }
);

watch(
  () => showDemolitionBlock.value,
  (visible) => {
    if (visible) return;
    form.demolicion.tipoDemolicion = "";
    form.demolicion.tipoEstructuraExistente = "";
    form.demolicion.nivelesExistentes = "";
    form.demolicion.anchoDemolicionM = "";
    form.demolicion.largoDemolicionM = "";
  }
);

function buildPrelimPayloadForBackend() {
  return {
    ...JSON.parse(JSON.stringify(form)),
    superficiePreliminar: form.areaPreliminares,
    demolicion: {
      ...JSON.parse(JSON.stringify(form.demolicion)),
      areaDemolicionM2: areaDemolicionCalculada.value,
      volumenDemolicion: areaDemolicionCalculada.value,
    },
    areaDemolicionM2: areaDemolicionCalculada.value,
  };
}

async function refreshBackendPreview() {
  catalogState.loading = true;
  catalogState.error = "";
  catalogState.source = "local";
  backendPreview.activeConcepts = [];
  backendPreview.technicalConcepts = [];
  backendPreview.officialSummary = [];
  backendPreview.costoEstimado = 0;
  backendPreview.pendingDefinitions = [];

  try {
    const response = await simularPreliminaresBackend({
      preliminares: buildPrelimPayloadForBackend(),
      datosGeneralesObra: viviendaStore.datosGeneralesObra,
      estructuraEspacial: viviendaStore.estructuraEspacial,
      colindanciasRecorrido: viviendaStore.colindanciasRecorrido,
    });
    if (Array.isArray(response?.activeConcepts) && response.activeConcepts.length) {
      backendPreview.activeConcepts = response.activeConcepts.map((item) => ({ ...item }));
      backendPreview.technicalConcepts = Array.isArray(response?.technicalConcepts)
        ? response.technicalConcepts.map((item) => ({ ...item }))
        : [];
      backendPreview.officialSummary = Array.isArray(response?.officialSummary)
        ? response.officialSummary.map((item) => ({ ...item }))
        : [];
      backendPreview.costoEstimado = Number(response?.costoEstimado || 0);
      backendPreview.pendingDefinitions = Array.isArray(response?.pendingDefinitions)
        ? [...response.pendingDefinitions]
        : [];
      catalogState.source = "bd";
    }
  } catch (error) {
    catalogState.error = String(error?.message || "No se pudo simular preliminares en backend.");
  } finally {
    catalogState.loading = false;
  }
}

function scheduleBackendPreview() {
  if (previewDebounceTimer) {
    clearTimeout(previewDebounceTimer);
  }
  previewDebounceTimer = setTimeout(() => {
    refreshBackendPreview();
  }, 350);
}

async function handleContinue() {
  if (!validateForm()) return;

  updateSimulatedCost();
  const prelimPayload = buildPrelimPayloadForBackend();
  let backendSalida = null;
  try {
    backendSalida = await simularPreliminaresBackend({
      preliminares: prelimPayload,
      datosGeneralesObra: viviendaStore.datosGeneralesObra,
      estructuraEspacial: viviendaStore.estructuraEspacial,
      colindanciasRecorrido: viviendaStore.colindanciasRecorrido,
    });
  } catch (backendError) {
    errors.areaPreliminares = String(
      backendError?.message || "No fue posible simular preliminares en backend."
    );
    return;
  }
  const technicalConcepts = Array.isArray(backendSalida?.technicalConcepts)
    ? backendSalida.technicalConcepts
    : [];
  const technicalTotal = technicalConcepts.reduce((acc, item) => acc + Number(item?.total || 0), 0);
  const normalizedCost = Number(Math.max(Number(backendSalida?.costoEstimado || 0), technicalTotal).toFixed(2));
  const backendOfficialSummary = Array.isArray(backendSalida?.officialSummary)
    ? backendSalida.officialSummary
    : [];
  if (!technicalConcepts.length || !backendOfficialSummary.length || normalizedCost <= 0) {
    errors.areaPreliminares =
      "No fue posible consolidar conceptos tecnicos de preliminares. Verifica la captura e intenta de nuevo.";
    return;
  }

  viviendaStore.setPreliminares({
    ...prelimPayload,
    conceptosActivos: Array.isArray(backendSalida?.activeConcepts) ? backendSalida.activeConcepts : [],
    technicalConcepts,
    officialSummary: backendOfficialSummary,
    pendingDefinitions: Array.isArray(backendSalida?.pendingDefinitions)
      ? backendSalida.pendingDefinitions
      : [],
    costoEstimado: normalizedCost,
    observaciones: demolitionWarning.value || "",
  });

  const requiredModules = viviendaStore.getRequiredModuleOrder();
  console.info("[TRACE][PRELIMINARES][CONTINUE]", {
    conceptosTecnicos: technicalConcepts.length,
    partidas: backendOfficialSummary.length,
    costoBloque: normalizedCost,
    acumuladoGlobal: Number(viviendaStore.acumuladoGlobal || 0),
    source: "backend",
    siguiente: requiredModules.length
      ? viviendaStore.getRouteForModule(requiredModules[0])
      : "/vivienda/cotizacion/revision-inferencia",
  });
  if (requiredModules.length) {
    router.push(viviendaStore.getRouteForModule(requiredModules[0]));
    return;
  }

  router.push("/vivienda/cotizacion/revision-inferencia");
}

function goDashboard() {
  router.push("/vivienda/dashboard");
}

function goAlcance() {
  router.push("/vivienda/cotizacion/modelo-espacial");
}

onMounted(() => {
  refreshBackendPreview();
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

.preliminares-shell {
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
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.12);
}

.user-pill span {
  display: block;
  font-size: 0.8rem;
  color: rgba(242,242,255,0.75);
  margin-bottom: 4px;
}

.user-pill strong {
  font-size: 1rem;
}

.hero-card {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08));
  backdrop-filter: blur(18px);
  border-radius: 30px;
  box-shadow: 0 24px 80px rgba(13, 19, 72, 0.42);
  overflow: hidden;
  margin-bottom: 26px;
  padding: 34px;
}

.module-tag {
  margin: 0 0 10px;
  color: #84efff;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.hero-left h1 {
  font-size: 3rem;
  line-height: 1.05;
  margin: 0 0 16px;
  font-weight: 800;
}

.hero-text {
  margin: 0;
  max-width: 620px;
  color: rgba(245, 245, 255, 0.88);
  font-size: 1.08rem;
  line-height: 1.6;
}

.flow-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.flow-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
}

.flow-item.done {
  background: rgba(255,255,255,0.12);
}

.flow-item.active {
  background: linear-gradient(180deg, rgba(143,232,255,0.14), rgba(156,123,255,0.12));
  border-color: rgba(143, 232, 255, 0.28);
}

.flow-item span {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: rgba(255,255,255,0.14);
}

.flow-line {
  width: 24px;
  height: 2px;
  background: rgba(255,255,255,0.2);
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
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.12);
}

.cost-box span {
  display: block;
  color: rgba(235, 235, 255, 0.8);
  margin-bottom: 6px;
}

.cost-box strong {
  font-size: 1.8rem;
}

.cost-note {
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: rgba(235, 242, 255, 0.82);
}

.resume-box {
  width: 100%;
  max-width: 330px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
}

.resume-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
}

.resume-item + .resume-item {
  border-top: 1px solid rgba(255,255,255,0.08);
}

.resume-item span {
  color: rgba(239,239,255,0.78);
}

.preliminares-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 22px;
}

.main-card,
.side-card {
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(18px);
  border-radius: 26px;
  box-shadow: 0 20px 60px rgba(10, 17, 68, 0.28);
  padding: 26px;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 22px;
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

.card-header h2,
.card-header h3 {
  margin: 0 0 8px;
}

.card-header p {
  margin: 0;
  color: rgba(245,245,255,0.82);
  line-height: 1.55;
}

.preliminares-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-block {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.section-title-row h3 {
  margin: 0;
  font-size: 1.15rem;
}

.section-badge {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  background: rgba(143,232,255,0.18);
  color: #8fe8ff;
  font-weight: 700;
}

.section-badge.services {
  background: rgba(139,92,246,0.18);
  color: #c9b4ff;
}

.section-badge.demolition {
  background: rgba(255,121,153,0.18);
  color: #ffb0c4;
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

.field-group input,
.field-group select {
  height: 54px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.08);
  color: white;
  border-radius: 16px;
  padding: 0 16px;
  outline: none;
  font-size: 1rem;
}

.field-group input::placeholder {
  color: rgba(228,228,255,0.46);
}

.field-group select option {
  color: #111827;
}

.field-group input.invalid,
.field-group select.invalid {
  border-color: #ff7fa7;
}

.error-text {
  margin: 0;
  color: #ff96b6;
  font-size: 0.88rem;
}

.helper-text {
  margin: 0 0 10px;
  font-size: 0.86rem;
  color: rgba(236, 241, 255, 0.84);
}

.helper-text.success {
  color: #91f7dc;
}

.helper-text.warning {
  color: #ffc6d7;
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.service-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border-radius: 18px;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
  background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08));
  transition: 0.22s ease;
}

.service-card.selected {
  border-color: rgba(143, 232, 255, 0.48);
  box-shadow: 0 0 0 1px rgba(143, 232, 255, 0.18);
  background: linear-gradient(180deg, rgba(143,232,255,0.14), rgba(156,123,255,0.12));
}

.service-card input {
  display: none;
}

.service-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.14);
}

.quantia-mini-icon {
  gap: 2px;
  align-items: flex-end;
}

.mini-bar {
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #8fe8ff 0%, #8b5cf6 100%);
}

.mini-bar-1 { height: 9px; }
.mini-bar-2 { height: 13px; }
.mini-bar-3 { height: 17px; }
.mini-bar-4 { height: 21px; }

.service-text strong {
  display: block;
  margin-bottom: 4px;
}

.service-text p {
  margin: 0;
  color: rgba(240,240,255,0.82);
  line-height: 1.4;
}

.demolition-block {
  border-color: rgba(255, 158, 184, 0.18);
}

.warning-box {
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255,121,153,0.12);
  border: 1px solid rgba(255,121,153,0.2);
}

.warning-box span {
  display: block;
  font-weight: 800;
  color: #ffb0c4;
  margin-bottom: 6px;
}

.warning-box p {
  margin: 0;
  color: rgba(255,230,236,0.92);
  line-height: 1.5;
}

.flow-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
}

.note-badge {
  min-width: fit-content;
  font-weight: 800;
  color: #8fe8ff;
}

.flow-note p {
  margin: 0;
  color: rgba(243,243,255,0.84);
  line-height: 1.55;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.concepts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.concept-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
}

.concept-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.concept-top span {
  color: #8fe8ff;
  font-size: 0.85rem;
  font-weight: 700;
}

.concept-item p {
  margin: 0;
  color: rgba(242,242,255,0.84);
  line-height: 1.5;
}

.concept-empty {
  padding: 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.05);
  color: rgba(242,242,255,0.72);
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 0;
}

.summary-item + .summary-item {
  border-top: 1px solid rgba(255,255,255,0.08);
}

.summary-item span {
  color: rgba(239,239,255,0.76);
  font-size: 0.92rem;
}

.summary-item strong {
  font-size: 1rem;
}

.cost-preview-box {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
}

.cost-preview-box span {
  display: block;
  color: rgba(239,239,255,0.76);
  margin-bottom: 8px;
}

.cost-preview-box strong {
  display: block;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.cost-preview-box p {
  margin: 0;
  color: rgba(242,242,255,0.84);
  line-height: 1.5;
}

.btn {
  border: none;
  border-radius: 18px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #2fc4ff 0%, #6a52ff 55%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 16px 32px rgba(62, 85, 255, 0.28);
}

.btn-secondary {
  background: rgba(255,255,255,0.14);
  color: #ffffff;
}

@media (max-width: 1100px) {
  .hero-card,
  .preliminares-grid,
  .grid-form,
  .services-grid {
    grid-template-columns: 1fr;
  }

  .hero-right {
    align-items: stretch;
  }

  .resume-box {
    max-width: none;
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

  .topnav {
    justify-content: center;
    flex-wrap: wrap;
    gap: 18px;
  }

  .hero-card,
  .main-card,
  .side-card {
    padding: 20px;
  }

  .hero-left h1 {
    font-size: 2.3rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .user-pill {
    text-align: center;
  }

  .flow-line {
    display: none;
  }
}
</style>

