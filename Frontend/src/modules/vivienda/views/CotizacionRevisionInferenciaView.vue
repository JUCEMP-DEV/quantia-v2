<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="stage-shell">
      <header class="topbar">
        <div class="brand-wrap"><LogoQuantia /></div>
        <nav class="topnav">
          <a href="#" @click.prevent="goDashboard">Inicio</a>
          <a href="#" @click.prevent="goDocuments">Documentos</a>
          <a href="#" @click.prevent="goBack">Anterior</a>
          <a href="#" @click.prevent>Ayuda</a>
        </nav>
        <div class="user-pill"><span>{{ profileLabel }}</span><strong>{{ userName }}</strong></div>
      </header>

      <section class="hero-card">
        <div class="hero-left">
          <p class="module-tag">Quantia · Control del motor</p>
          <h1>Revisión de inferencia</h1>
          <p class="hero-text">Valida qué se activó, por qué se activó y qué pendientes quedan antes de cerrar y generar resultados.</p>
        </div>
        <div class="hero-right">
          <div class="resume-box">
            <div class="resume-item"><span>Conceptos técnicos</span><strong>{{ technicalCount }}</strong></div>
            <div class="resume-item"><span>Agrupadores oficiales</span><strong>{{ officialCount }}</strong></div>
            <div class="resume-item"><span>Total estimado</span><strong>{{ formattedTotal }}</strong></div>
          </div>
        </div>
      </section>

      <section class="stage-grid">
        <article class="main-card">
          <div class="card-header">
            <p class="card-tag">Paso de revisión</p>
            <h2>Trazabilidad de activación</h2>
          </div>

          <div class="summary-list">
            <div class="summary-item">
              <span>Intervención</span>
              <strong>{{ intervencionLabel }}</strong>
            </div>
            <div class="summary-item">
              <span>Alcance</span>
              <strong>{{ alcanceLabel }}</strong>
            </div>
            <div class="summary-item">
              <span>Módulos activos</span>
              <strong>{{ modulosActivos }}</strong>
            </div>
            <div class="summary-item">
              <span>Total estimado</span>
              <strong>{{ formattedTotal }}</strong>
            </div>
          </div>

          <div class="pending-box">
            <strong>Presupuesto técnico completo (previo a resultados)</strong>
            <div class="table-wrap">
              <table class="result-table">
                <thead>
                  <tr>
                    <th>Clave</th>
                    <th>Concepto</th>
                    <th>Unidad</th>
                    <th>Cantidad</th>
                    <th>P.U.</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in technicalConcepts" :key="item.key">
                    <td>{{ item.key }}</td>
                    <td>{{ item.title }}</td>
                    <td>{{ item.unit }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.unitPrice) }}</td>
                    <td>{{ formatCurrency(item.total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="pending-box">
            <strong>Resumen oficial por partida</strong>
            <div class="official-grid">
              <div v-for="item in officialSummary" :key="item.group" class="official-item">
                <span>{{ item.title }}</span>
                <strong>{{ formatCurrency(item.total) }}</strong>
              </div>
            </div>
          </div>

          <label class="confirm-row">
            <input v-model="revisado" type="checkbox" />
            <span>Confirmo que la inferencia está lista para generar resultados.</span>
          </label>

          <p v-if="loadingPreview" class="sync-text">Generando inferencia desde backend...</p>
          <p v-if="error" class="error-text">{{ error }}</p>
          <p v-if="syncMessage" class="sync-text">{{ syncMessage }}</p>

          <div class="actions">
            <button type="button" class="btn btn-secondary" @click="goBack">Regresar</button>
            <button type="button" class="btn btn-secondary" @click="goDocuments">Consultar documentos</button>
            <button type="button" class="btn btn-primary" :disabled="loadingPreview" @click="handleContinue">Confirmar y continuar</button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import LogoQuantia from "@/components/common/LogoQuantia.vue";
import { useAuthStore } from "@/stores/authStore";
import { useViviendaStore } from "@/modules/vivienda/store/viviendaStore";
import { saveCotizacionSnapshot } from "@/modules/vivienda/services/cotizacionPersistService";
import { inferirResultadoV4 } from "@/modules/vivienda/services/resultadosApiService";

const router = useRouter();
const authStore = useAuthStore();
const viviendaStore = useViviendaStore();

const revisado = ref(Boolean(viviendaStore.revisionInferencia.revisado));
const error = ref("");
const syncMessage = ref("");
const loadingPreview = ref(false);

const preview = ref({
  resultadoFinal: 0,
  desglose: {
    technicalConcepts: [],
    officialSummary: [],
  },
  estadoResultado: "pendiente",
  metadata: {
    perfilSalida: "",
    motorVersion: "",
    factorAjusteAplicado: 1,
    pendingDefinitions: [],
  },
});

const profileLabel = computed(() => {
  if (authStore.accessProfile === "tecnico") return "Tecnico";
  if (authStore.accessProfile === "oficial") return "Oficial / General";
  return "Sin definir";
});
const userName = computed(() => authStore.user?.nombre || "Usuario Demo");
const technicalConcepts = computed(() => preview.value.desglose?.technicalConcepts || []);
const officialSummary = computed(() => preview.value.desglose?.officialSummary || []);

const technicalCount = computed(() => technicalConcepts.value.length);
const officialCount = computed(() => officialSummary.value.length);
const requiredModules = computed(() => viviendaStore.getRequiredModuleOrder());
const formattedTotal = computed(() =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(preview.value.resultadoFinal || 0)
  )
);

const intervencionLabel = computed(() => {
  const value = viviendaStore.clasificacion.tipoIntervencion;
  if (value === "obra_nueva") return "Obra nueva";
  if (value === "remodelacion") return "Remodelacion";
  if (value === "complementaria") return "Complementaria";
  return "Sin capturar";
});

const alcanceLabel = computed(() => viviendaStore.alcance.alcance || "Sin capturar");
const modulosActivos = computed(() => (viviendaStore.alcance.modulosActivos || []).length || 0);

async function loadPreview() {
  loadingPreview.value = true;
  error.value = "";
  try {
    console.info("[TRACE][REVISION][PREVIEW_REQUEST]", {
      requiredModules: requiredModules.value,
      preliminaresConcepts: Array.isArray(viviendaStore.preliminares?.technicalConcepts)
        ? viviendaStore.preliminares.technicalConcepts.length
        : 0,
      modulosConcepts: Object.values(viviendaStore.modulos || {}).reduce((acc, row) => {
        const list = Array.isArray(row?.selectedConcepts) ? row.selectedConcepts : [];
        return acc + list.length;
      }, 0),
      acumuladoGlobal: Number(viviendaStore.acumuladoGlobal || 0),
    });
    preview.value = await inferirResultadoV4({
      preliminares: viviendaStore.preliminares,
      modulos: viviendaStore.modulos,
      datosGeneralesObra: viviendaStore.datosGeneralesObra,
      variablesEntrada: viviendaStore.variablesEntrada,
      estructuraEspacial: viviendaStore.estructuraEspacial,
      colindanciasRecorrido: viviendaStore.colindanciasRecorrido,
      validacionEspacial: viviendaStore.validacionEspacial,
      perfil: authStore.accessProfile || "oficial",
      requiredModuleKeys: requiredModules.value,
    });
    console.info("[TRACE][REVISION][PREVIEW_RESPONSE]", {
      technicalConcepts: Array.isArray(preview.value?.desglose?.technicalConcepts)
        ? preview.value.desglose.technicalConcepts.length
        : 0,
      officialSummary: Array.isArray(preview.value?.desglose?.officialSummary)
        ? preview.value.desglose.officialSummary.length
        : 0,
      total: Number(preview.value?.resultadoFinal || 0),
    });
  } catch (previewError) {
    error.value = String(
      previewError?.message || "No se pudo generar la inferencia en backend."
    );
  } finally {
    loadingPreview.value = false;
  }
}

onMounted(() => {
  loadPreview();
});

async function handleContinue() {
  error.value = "";
  syncMessage.value = "";
  if (loadingPreview.value) {
    error.value = "La inferencia aun se esta generando en backend.";
    return;
  }
  if (!technicalConcepts.value.length && Number(preview.value.resultadoFinal || 0) <= 0) {
    error.value = "No hay resultado de inferencia disponible para continuar.";
    return;
  }
  if (!revisado.value) {
    error.value = "Debes confirmar la revisión de inferencia para continuar.";
    return;
  }

  try {
    console.info("[TRACE][REVISION][SAVE_REQUEST]", {
      technicalConcepts: technicalCount.value,
      officialSummary: officialCount.value,
      total: Number(preview.value?.resultadoFinal || 0),
    });
    const sync = await saveCotizacionSnapshot({
      authUser: authStore.user,
      viviendaStore,
      status: "reviewed",
      resultPreview: preview.value,
    });

    const quoteId = sync?.quote?.id || "";
    if (quoteId) {
      syncMessage.value = `Cotización guardada con ID ${quoteId.slice(0, 8)}...`;
    }

    viviendaStore.setResultado({
      ...preview.value,
      metadata: {
        ...(preview.value.metadata || {}),
        quoteId,
        persistedAt: sync?.quote?.updated_at || new Date().toISOString(),
      },
    });
    viviendaStore.setRevisionInferencia({
      revisado: true,
      observaciones: "",
      snapshot: {
        conceptosActivados: technicalCount.value,
        reglasAplicadas: officialCount.value,
        pendientes: [],
      },
    });
    console.info("[TRACE][REVISION][SAVE_RESPONSE]", {
      quoteId: quoteId || "",
      persistedAt: sync?.quote?.updated_at || "",
      total: Number(preview.value?.resultadoFinal || 0),
    });
  } catch (saveError) {
    error.value = String(saveError?.message || "No se pudo guardar la cotización en BD.");
    return;
  }
  viviendaStore.confirmResumen();

  router.push("/vivienda/cotizacion/imprimible");
}

function goDashboard() {
  router.push("/vivienda/dashboard");
}

function goDocuments() {
  router.push("/vivienda/documentos");
}

function goBack() {
  if (requiredModules.value.length) {
    const last = requiredModules.value[requiredModules.value.length - 1];
    router.push(viviendaStore.getRouteForModule(last));
    return;
  }
  router.push("/vivienda/cotizacion/preliminares");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}
</script>

<style scoped>
.quantia-page { min-height: 100vh; position: relative; overflow: hidden; background: radial-gradient(circle at 15% 20%, rgba(84, 212, 255, 0.22), transparent 20%), radial-gradient(circle at 85% 15%, rgba(170, 92, 255, 0.24), transparent 22%), radial-gradient(circle at 50% 80%, rgba(122, 71, 255, 0.18), transparent 25%), linear-gradient(135deg, #151d6b 0%, #2b1d83 32%, #4523a6 58%, #6a39cc 100%); color: #f8f7ff; padding: 36px; }
.bg-orb { position: absolute; border-radius: 999px; filter: blur(60px); pointer-events: none; }
.orb-1 { width: 240px; height: 240px; background: rgba(68, 228, 255, 0.14); top: 60px; left: -20px; }
.orb-2 { width: 300px; height: 300px; background: rgba(194, 93, 255, 0.14); top: 0; right: -40px; }
.orb-3 { width: 260px; height: 260px; background: rgba(104, 91, 255, 0.12); bottom: 30px; left: 30%; }
.stage-shell { position: relative; z-index: 1; max-width: 1380px; margin: 0 auto; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.brand-wrap { display: flex; align-items: center; }
.topnav { display: flex; gap: 30px; align-items: center; }
.topnav a { color: rgba(255, 255, 255, 0.92); text-decoration: none; font-weight: 500; }
.user-pill { min-width: 200px; padding: 12px 16px; border-radius: 16px; text-align: right; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12); }
.user-pill span { display: block; font-size: 0.8rem; color: rgba(242,242,255,0.75); margin-bottom: 4px; }
.hero-card { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; border: 1px solid rgba(255,255,255,0.14); background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08)); backdrop-filter: blur(18px); border-radius: 30px; margin-bottom: 26px; padding: 34px; }
.module-tag { margin: 0 0 10px; color: #84efff; font-size: 0.95rem; font-weight: 700; }
.hero-left h1 { font-size: 2.8rem; line-height: 1.05; margin: 0 0 16px; font-weight: 800; }
.hero-text { margin: 0; max-width: 620px; color: rgba(245,245,255,0.88); }
.resume-box { width: 100%; max-width: 330px; padding: 18px; border-radius: 20px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); }
.resume-item { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; }
.resume-item + .resume-item { border-top: 1px solid rgba(255,255,255,0.08); }
.stage-grid { display: grid; grid-template-columns: 1fr; gap: 22px; }
.main-card { border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.1); backdrop-filter: blur(18px); border-radius: 26px; padding: 26px; }
.card-tag { margin: 0 0 8px; color: #8fe8ff; font-size: 0.88rem; font-weight: 700; }
.summary-list { display: flex; flex-direction: column; gap: 0; margin-bottom: 16px; }
.summary-item { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; }
.summary-item + .summary-item { border-top: 1px solid rgba(255,255,255,0.08); }
.pending-box { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px; margin-bottom: 14px; }
.pending-box ul { margin: 8px 0 0; padding-left: 18px; }
.official-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.official-item { display: flex; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); }
.table-wrap { overflow-x: auto; margin-top: 10px; }
.result-table { width: 100%; border-collapse: collapse; }
.result-table th,
.result-table td { text-align: left; padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.12); }
.result-table th { color: #8fe8ff; font-size: 0.86rem; }
.confirm-row { margin-top: 14px; display: flex; gap: 10px; align-items: flex-start; }
.error-text { color: #ff9dbb; margin-top: 8px; }
.sync-text { color: #8fe8ff; margin-top: 8px; }
.actions { display: flex; justify-content: space-between; gap: 14px; margin-top: 18px; }
.btn { border: none; border-radius: 18px; padding: 12px 20px; font-size: 0.95rem; font-weight: 800; cursor: pointer; }
.btn-primary { background: linear-gradient(135deg, #2fc4ff 0%, #6a52ff 55%, #8b5cf6 100%); color: white; }
.btn-secondary { background: rgba(255,255,255,0.14); color: #fff; }
@media (max-width: 1100px) { .hero-card { grid-template-columns: 1fr; } }
@media (max-width: 980px) { .official-grid { grid-template-columns: 1fr; } }
@media (max-width: 780px) { .quantia-page { padding: 18px; } .topbar { flex-direction: column; align-items: stretch; } .topnav { justify-content: center; flex-wrap: wrap; gap: 18px; } .hero-card, .main-card { padding: 20px; } .hero-left h1 { font-size: 2.2rem; } .actions { flex-direction: column; } .btn { width: 100%; } .user-pill { text-align: center; } }
</style>
