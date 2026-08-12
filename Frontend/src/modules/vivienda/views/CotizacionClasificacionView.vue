<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="clasificacion-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goDashboard">Inicio</a>
          <a href="#" @click.prevent="goRegistro">Registro</a>
          <a href="#" @click.prevent>Ayuda</a>
        </nav>

        <div class="user-pill">
          <span>{{ profileLabel }}</span>
          <strong>{{ userName }}</strong>
        </div>
      </header>

      <section class="hero-card">
        <div class="hero-left">
          <p class="module-tag">Quantia · Flujo de cotización</p>
          <h1>Clasificación y alcance</h1>
          <p class="hero-text">
            Define el tipo de cotización para que el sistema determine el comportamiento general del flujo, la activación de módulos y la forma de captura.
          </p>

          <div class="flow-box">
            <div class="flow-item done">
              <span>1</span>
              <strong>Registro</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item active">
              <span>2</span>
              <strong>Intervención + Alcance</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item">
              <span>3</span>
              <strong>Diseño arquitectónico</strong>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="cost-box">
            <span>Costo acumulado</span>
            <strong>$0.00 MXN</strong>
          </div>

          <div class="resume-box">
              <div class="resume-item">
                <span>Etapa actual</span>
                <strong>Intervención + alcance</strong>
              </div>
            <div class="resume-item">
              <span>Modo visible</span>
              <strong>{{ profileLabel }}</strong>
            </div>
            <div class="resume-item">
              <span>Salida prevista</span>
              <strong>{{ outputLabel }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="clasificacion-grid">
        <article class="main-card">
          <div class="card-header">
            <div>
              <p class="card-tag">Paso 2 de 13</p>
              <h2>Clasificación y Alcance</h2>
              <p>
                En esta misma pantalla se define tipo de intervención y alcance compatible para activar módulos.
              </p>
            </div>
          </div>

          <form class="clasificacion-form" @submit.prevent="handleContinue">
            <div class="dual-layout">
              <section class="section-card alcance-section">
                <div class="section-title-row">
                  <p class="card-tag">Sección Alcance</p>
                  <h3>Alcance</h3>
                </div>

                <div class="extra-grid">
                  <div class="field-group">
                    <label for="alcanceSelect">Alcance</label>
                    <select id="alcanceSelect" v-model="form.alcance" :class="{ invalid: errors.alcance }">
                      <option value="">Selecciona una opción</option>
                      <option v-for="option in alcanceOptions" :key="option.key" :value="option.key">
                        {{ option.title }}
                      </option>
                    </select>
                    <p v-if="errors.alcance" class="error-text">{{ errors.alcance }}</p>
                  </div>

                  <div class="field-group">
                    <label>Modo de activación</label>
                    <div class="rule-item">{{ alcanceModeLabel }}</div>
                  </div>
                </div>

                <div v-if="!isPartidaIndividual" class="rules-box">
                  <div class="rule-item" v-for="module in activeModules" :key="module.key">
                    <strong>{{ module.title }}</strong>
                    <div>{{ module.description }}</div>
                  </div>
                </div>

                <div v-else class="partidas-grid">
                  <label
                    v-for="partida in partidasDisponibles"
                    :key="partida.key"
                    class="partida-card"
                    :class="{ selected: form.partidasSeleccionadas.includes(partida.key) }"
                  >
                    <input
                      type="checkbox"
                      :value="partida.key"
                      v-model="form.partidasSeleccionadas"
                    />
                    <strong>{{ partida.title }}</strong>
                    <p>{{ partida.description }}</p>
                  </label>
                  <p v-if="errors.partidasSeleccionadas" class="error-text">{{ errors.partidasSeleccionadas }}</p>
                </div>
              </section>

              <section class="section-card clasificacion-section">
                <div class="section-title-row">
                  <p class="card-tag">Sección Clasificación</p>
                  <h3>Clasificación</h3>
                </div>

                <div class="options-grid">
                  <article
                    v-for="tipo in tiposIntervencion"
                    :key="tipo.key"
                    class="option-card"
                    :class="{ selected: form.tipoIntervencion === tipo.key }"
                    @click="form.tipoIntervencion = tipo.key"
                  >
                    <div class="option-top">
                      <div class="option-icon quantia-mini-icon">
                        <span class="mini-bar mini-bar-1"></span>
                        <span class="mini-bar mini-bar-2"></span>
                        <span class="mini-bar mini-bar-3"></span>
                        <span class="mini-bar mini-bar-4"></span>
                      </div>
                      <div class="radio-mark">
                        <div class="radio-dot" v-if="form.tipoIntervencion === tipo.key"></div>
                      </div>
                    </div>

                    <h3>{{ tipo.title }}</h3>
                    <p class="option-subtitle">{{ tipo.subtitle }}</p>
                    <p class="option-description">
                      {{ tipo.description }}
                    </p>

                    <ul class="feature-list">
                      <li v-for="point in tipo.highlights" :key="point">{{ point }}</li>
                    </ul>
                  </article>
                </div>
                <p v-if="errors.tipoIntervencion" class="error-text">{{ errors.tipoIntervencion }}</p>
              </section>
            </div>

            <div class="flow-note">
              <span class="note-badge">Regla</span>
              <p>
                Aquí se define todo: clasificación + alcance. Se elimina la pantalla duplicada de alcance.
              </p>
            </div>

            <div class="actions">
              <button type="button" class="btn btn-secondary" @click="goRegistro">
                Regresar
              </button>

              <button type="submit" class="btn btn-primary">
                Guardar y continuar
              </button>
            </div>
          </form>
        </article>
      </section>

      <section class="bottom-insights">
        <article class="side-card">
          <div class="card-header small">
            <div>
              <p class="card-tag">Resumen</p>
              <h3>Selección actual</h3>
            </div>
          </div>

          <div class="summary-list">
            <div class="summary-item">
              <span>Tipo de intervención</span>
              <strong>{{ intervencionLabel }}</strong>
            </div>

            <div class="summary-item">
              <span>Modo</span>
              <strong>{{ alcanceModeLabel }}</strong>
            </div>

            <div class="summary-item">
              <span>Elementos activos</span>
              <strong>{{ activeCountLabel }}</strong>
            </div>
          </div>
        </article>

        <article class="side-card">
          <div class="card-header small">
            <div>
              <p class="card-tag">Comportamiento</p>
              <h3>Vista previa del sistema</h3>
            </div>
          </div>

          <div class="rules-box">
            <div class="rule-item">{{ behaviorText }}</div>
            <div class="rule-item">
              El tipo de usuario no cambia el cálculo base, solo la interpretación y presentación de los conceptos.
            </div>
          </div>
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
import {
  getAlcancesPorTipoIntervencion,
  getModulosActivosV4,
  getPartidasDisponiblesV4,
  getTiposIntervencionV4,
  validateSeleccionAlcanceV4,
} from "@/modules/vivienda/services/viviendaService";

const router = useRouter();
const authStore = useAuthStore();
const viviendaStore = useViviendaStore();

const defaultTipoIntervencion =
  viviendaStore.clasificacion.tipoIntervencion ||
  viviendaStore.alcance.tipoIntervencion ||
  "";

const form = reactive({
  tipoIntervencion: defaultTipoIntervencion,
  alcance:
    viviendaStore.alcance.alcance === "obra_blanca"
      ? "obra_completa"
      : viviendaStore.alcance.alcance || "",
  partidasSeleccionadas: [...(viviendaStore.alcance.partidasSeleccionadas || [])],
});

const errors = reactive({
  tipoIntervencion: "",
  alcance: "",
  partidasSeleccionadas: "",
});

const partidasDisponibles = getPartidasDisponiblesV4();

const tiposIntervencion = getTiposIntervencionV4().map((item) => {
  if (item.key === "obra_nueva") {
    return {
      ...item,
      subtitle: "Arranque constructivo",
      highlights: ["Alcance por etapas", "Base técnica estructural", "Secuencia completa"],
    };
  }

  if (item.key === "remodelacion") {
    return {
      ...item,
      subtitle: "Intervención sobre existente",
      highlights: ["Permite demoliciones", "Reposiciones controladas", "Validación de etapas base"],
    };
  }

  return {
    ...item,
    subtitle: "Cierre o adición puntual",
    highlights: ["Selección flexible", "Sin demolición dominante", "Integración por etapas"],
  };
});

const profileLabel = computed(() => {
  if (authStore.accessProfile === "tecnico") return "Técnico";
  if (authStore.accessProfile === "oficial") return "Oficial / General";
  return "Sin definir";
});

const userName = computed(() => authStore.user?.nombre || "Usuario Demo");

const outputLabel = computed(() => {
  return profileLabel.value === "Técnico" ? "Técnica + resumen oficial" : "Resumen oficial";
});

const intervencionLabel = computed(() => {
  const map = {
    obra_nueva: "Obra nueva",
    remodelacion: "Remodelación",
    complementaria: "Complementaria",
    ampliacion: "Ampliación (pendiente de definición formal v4)",
  };
  return map[form.tipoIntervencion] || "Sin definir";
});

const isPartidaIndividual = computed(() => form.tipoIntervencion !== "obra_nueva");

const alcanceOptions = computed(() =>
  getAlcancesPorTipoIntervencion(form.tipoIntervencion)
);

const alcanceModeLabel = computed(() => {
  if (!form.alcance) return isPartidaIndividual.value ? "Selección manual" : "Activación automática";
  const selected = alcanceOptions.value.find((item) => item.key === form.alcance);
  if (!selected) return isPartidaIndividual.value ? "Selección manual" : "Activación automática";
  return selected.mode === "manual" ? "Selección manual" : "Activación automática";
});

const activeModules = computed(() => {
  const keys = getModulosActivosV4({
    tipoIntervencion: form.tipoIntervencion,
    alcance: form.alcance,
    partidasSeleccionadas: form.partidasSeleccionadas,
  });

  const labels = Object.fromEntries(partidasDisponibles.map((item) => [item.key, item]));
  return keys.map((key) => labels[key]).filter(Boolean);
});

const activeCountLabel = computed(() => {
  if (isPartidaIndividual.value) {
    return form.partidasSeleccionadas.length
      ? `${form.partidasSeleccionadas.length} partida(s)`
      : "Sin selección";
  }
  return `${activeModules.value.length} módulo(s)`;
});

const behaviorText = computed(() => {
  if (form.tipoIntervencion === "obra_nueva") {
    if (form.alcance === "obra_negra") {
      return "Se activan preliminares, cimentación, estructura y albañilería base.";
    }
    if (form.alcance === "obra_gris") {
      return "Se activa continuidad constructiva con instalaciones preparatorias.";
    }
    if (form.alcance === "obra_completa" || form.alcance === "obra_blanca") {
      return "Se activan todas las partidas del módulo.";
    }
    return "Selecciona un alcance de obra nueva para activar módulos automáticos.";
  }
  if (form.tipoIntervencion === "remodelacion") {
    return "Debes seleccionar etapas base para habilitar etapas posteriores sin romper trazabilidad.";
  }
  if (form.tipoIntervencion === "complementaria") {
    return "Puedes seleccionar etapas puntuales con activación manual.";
  }
  return "Aún no hay un tipo de intervención seleccionado.";
});

function resetErrors() {
  errors.tipoIntervencion = "";
  errors.alcance = "";
  errors.partidasSeleccionadas = "";
}

function validateForm() {
  resetErrors();
  if (!form.tipoIntervencion) {
    errors.tipoIntervencion = "Selecciona el tipo de intervención.";
    return false;
  }

  const result = validateSeleccionAlcanceV4({
    tipoIntervencion: form.tipoIntervencion,
    alcance: form.alcance,
    partidasSeleccionadas: form.partidasSeleccionadas,
  });

  if (!result.valid) {
    result.errors.forEach((message) => {
      if (message.toLowerCase().includes("alcance")) {
        errors.alcance = message;
      } else {
        errors.partidasSeleccionadas = message;
      }
    });
    return false;
  }

  return true;
}

watch(
  () => form.tipoIntervencion,
  (tipo) => {
    const options = getAlcancesPorTipoIntervencion(tipo);
    const exists = options.some((item) => item.key === form.alcance);
    if (!exists) {
      form.alcance = "";
    }
    if (tipo === "obra_nueva") {
      form.partidasSeleccionadas = [];
    }
  },
  { immediate: true }
);

function handleContinue() {
  if (!validateForm()) return;

  viviendaStore.setClasificacion({
    tipoIntervencion: form.tipoIntervencion,
    nivelAcabado: "",
    arquitecturaVersion: "v4",
  });

  const modulosActivos = getModulosActivosV4({
    tipoIntervencion: form.tipoIntervencion,
    alcance: form.alcance,
    partidasSeleccionadas: form.partidasSeleccionadas,
  });

  viviendaStore.setAlcance({
    tipoIntervencion: form.tipoIntervencion,
    alcance: form.alcance,
    subalcances: isPartidaIndividual.value
      ? [...form.partidasSeleccionadas]
      : [...modulosActivos],
    restricciones: {
      requiereSeleccionManual: isPartidaIndividual.value,
      pendienteReclasificacionComplementaria:
        form.tipoIntervencion === "complementaria",
    },
    partidasSeleccionadas: [...form.partidasSeleccionadas],
    modulosActivos,
    activacionModo: isPartidaIndividual.value
      ? "manual_por_etapas"
      : "automatico_por_alcance",
  });

  router.push("/vivienda/cotizacion/modelo-espacial");
}

function goDashboard() {
  router.push("/vivienda/dashboard");
}

function goRegistro() {
  router.push("/vivienda/cotizacion/registro");
}

onMounted(() => {
  if (!viviendaStore.reglasSnapshot.loaded) {
    viviendaStore.loadReglasSnapshot();
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

.clasificacion-shell {
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
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;
}

.flow-item {
  display: inline-flex;
  flex: 0 0 auto;
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

.clasificacion-grid {
  display: grid;
  grid-template-columns: 1fr;
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

.dual-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.section-card {
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 16px;
  min-width: 0;
}

.clasificacion-section {
  order: 1;
}

.alcance-section {
  order: 2;
}

.section-title-row {
  margin-bottom: 12px;
}

.section-title-row h3 {
  margin: 0;
}

.bottom-insights {
  margin-top: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.clasificacion-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.option-card {
  position: relative;
  padding: clamp(14px, 1.4vw, 22px);
  border-radius: 24px;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
  background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08));
  transition: 0.22s ease;
}

.option-card:hover {
  transform: translateY(-3px);
  border-color: rgba(143, 232, 255, 0.35);
}

.option-card.selected {
  border-color: rgba(143, 232, 255, 0.48);
  box-shadow: 0 0 0 1px rgba(143, 232, 255, 0.18);
  background: linear-gradient(180deg, rgba(143,232,255,0.14), rgba(156,123,255,0.12));
}

.option-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.option-icon {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.14);
}

.quantia-mini-icon {
  gap: 3px;
  align-items: flex-end;
}

.mini-bar {
  width: 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, #8fe8ff 0%, #8b5cf6 100%);
}

.mini-bar-1 { height: 12px; }
.mini-bar-2 { height: 18px; }
.mini-bar-3 { height: 24px; }
.mini-bar-4 { height: 30px; }

.radio-mark {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 2px solid rgba(255,255,255,0.45);
  display: grid;
  place-items: center;
}

.radio-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #8fe8ff;
}

.option-card h3 {
  margin: 0 0 6px;
  font-size: clamp(1.05rem, 1.45vw, 1.3rem);
}

.option-subtitle {
  margin: 0 0 10px;
  color: #8fe8ff;
  font-weight: 700;
}

.option-description {
  margin: 0 0 14px;
  line-height: 1.45;
  font-size: 0.95rem;
  color: rgba(245,245,255,0.88);
}

.feature-list {
  margin: 0;
  padding-left: 18px;
  color: rgba(240,240,255,0.9);
  font-size: 0.92rem;
}

.feature-list li + li {
  margin-top: 6px;
}

.extra-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.partidas-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.partida-card {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.partida-card.selected {
  border-color: rgba(143, 232, 255, 0.42);
  background: rgba(143,232,255,0.12);
}

.partida-card input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.partida-card p {
  margin: 0;
  color: rgba(242,242,255,0.82);
  font-size: 0.9rem;
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

.field-group select {
  min-height: 48px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.08);
  color: white;
  border-radius: 16px;
  padding: 10px 14px;
  outline: none;
  font-size: 0.96rem;
  line-height: 1.2;
}

.field-group select option {
  color: #111827;
}

.field-group select.invalid {
  border-color: #ff7fa7;
}

.error-text {
  margin: 0;
  color: #ff96b6;
  font-size: 0.88rem;
}

.hint-text {
  margin: 8px 0 0;
  color: rgba(243, 243, 255, 0.78);
  font-size: 0.84rem;
  line-height: 1.45;
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

.rules-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(242,242,255,0.85);
  line-height: 1.45;
  font-size: 0.95rem;
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

@media (max-width: 1380px) {
  .options-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .hero-card,
  .dual-layout,
  .bottom-insights,
  .options-grid,
  .extra-grid,
  .partidas-grid {
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
}
</style>



