<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>

    <main class="imprimible-shell">
      <header class="topbar no-print">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goDashboard">Inicio</a>
          <a href="#" @click.prevent="goDocuments">Documentos</a>
          <a href="#" @click.prevent="goResumen">Revision</a>
          <a href="#" @click.prevent="goImprimible">Imprimible</a>
        </nav>

        <div class="user-pill">
          <span>{{ profileLabel }}</span>
          <strong>{{ userName }}</strong>
        </div>
      </header>

      <section class="print-toolbar no-print">
        <div class="toolbar-left">
          <p class="module-tag">Quantia · Cierre documental</p>
          <h1>{{ isTechnical ? "Informe técnico imprimible" : "Resumen oficial imprimible" }}</h1>
          <p class="toolbar-text">
            Documento final de la simulación para revisión, entrega y exportación.
          </p>
        </div>

        <div class="toolbar-right">
          <div class="cost-box">
            <span>Total de la simulación</span>
            <strong>{{ formattedTotal }}</strong>
          </div>

          <div class="toolbar-actions">
            <button class="btn btn-secondary" @click="goResumen">Regresar</button>
            <button class="btn btn-secondary" @click="goDocuments">Consultar documentos</button>
            <button class="btn btn-primary" @click="printDocument">Imprimir</button>
          </div>
        </div>
      </section>

      <section class="print-sheet">
        <div class="sheet-header">
          <div class="sheet-brand">
            <LogoQuantia />
            <div class="sheet-brand-text">
              <strong>Quantia</strong>
              <span>Módulo Vivienda · {{ isTechnical ? "Salida técnica" : "Salida oficial" }}</span>
            </div>
          </div>

          <div class="sheet-meta">
            <div class="meta-item">
              <label>Fecha</label>
              <span>{{ todayLabel }}</span>
            </div>
            <div class="meta-item">
              <label>Partida</label>
              <span>Preliminares</span>
            </div>
            <div class="meta-item">
              <label>Perfil</label>
              <span>{{ profileLabel }}</span>
            </div>
          </div>
        </div>

        <div class="sheet-title-block">
          <h2>{{ isTechnical ? "Documento técnico de presupuesto" : "Documento oficial de presupuesto" }}</h2>
          <p>
            Este documento se genera desde el estado global de la simulación y conserva trazabilidad con el flujo capturado.
          </p>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h3>Prestador</h3>
            <div class="info-row">
              <span>Nombre</span>
              <strong>{{ prestador.nombre }}</strong>
            </div>
            <div class="info-row">
              <span>Teléfono</span>
              <strong>{{ prestador.telefono }}</strong>
            </div>
            <div class="info-row">
              <span>Profesión</span>
              <strong>{{ prestador.profesion }}</strong>
            </div>
          </div>

          <div class="info-card">
            <h3>Cliente / proyecto</h3>
            <div class="info-row">
              <span>Cliente</span>
              <strong>{{ cliente.nombre }}</strong>
            </div>
            <div class="info-row">
              <span>Ubicación</span>
              <strong>{{ cliente.ubicacion }}</strong>
            </div>
            <div class="info-row">
              <span>Proyecto</span>
              <strong>{{ proyecto.nombre }}</strong>
            </div>
          </div>

          <div class="info-card">
            <h3>Intervención y alcance</h3>
            <div class="info-row">
              <span>Intervención</span>
              <strong>{{ clasificacion.tipo }}</strong>
            </div>
            <div class="info-row">
              <span>Alcance</span>
              <strong>{{ clasificacion.alcance }}</strong>
            </div>
            <div class="info-row">
              <span>Acabado</span>
              <strong>{{ clasificacion.acabado }}</strong>
            </div>
          </div>
        </div>

        <template v-if="isTechnical">
          <div class="section-title">
            <h3>Resumen técnico por actividad</h3>
            <span>Total: {{ formattedTotal }}</span>
          </div>

          <div class="official-table-wrap">
            <table class="official-table">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Descripción técnica</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in technicalRows" :key="item.key">
                  <td>{{ item.activity }}</td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.unit }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="operational-annex no-print">
            <div class="section-title">
              <h3>Anexo operativo (solo visual)</h3>
              <span>No se imprime</span>
            </div>

            <p class="annex-note">
              Este bloque muestra sugerencias operativas de mano de obra y materiales para revisión técnica interna.
            </p>

            <h4 class="subsection-title">Mano de obra sugerida</h4>
            <div class="official-table-wrap">
              <table class="official-table">
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Descripción operativa</th>
                    <th>Mano de obra</th>
                    <th>Cantidad</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in operationalLaborRows" :key="item.key">
                    <td>{{ item.activity }}</td>
                    <td>{{ item.description }}</td>
                    <td>{{ item.labor }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 class="subsection-title">Materiales sugeridos</h4>
            <div class="official-table-wrap">
              <table class="official-table">
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Descripción material</th>
                    <th>Unidad</th>
                    <th>Cantidad</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in operationalMaterialRows" :key="item.key">
                    <td>{{ item.activity }}</td>
                    <td>{{ item.material }}</td>
                    <td>{{ item.unit }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="section-title">
            <h3>Resumen oficial por actividad · Mano de obra</h3>
            <span>{{ officialLaborRows.length }} actividades</span>
          </div>

          <div class="official-table-wrap">
            <table class="official-table">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Descripción</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  <th>M. Obra</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in officialLaborRows" :key="item.key">
                  <td>{{ item.activity }}</td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.unit }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.labor }}</td>
                  <td>{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section-title">
            <h3>Materiales que intervienen</h3>
            <span>{{ officialMaterialRows.length }} actividades</span>
          </div>

          <div class="official-table-wrap">
            <table class="official-table">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Descripción material</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in officialMaterialRows" :key="item.key">
                  <td>{{ item.activity }}</td>
                  <td>{{ item.material }}</td>
                  <td>{{ item.unit }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <div class="totals-block">
          <div class="totals-box">
            <div class="total-row">
              <span>Subtotal</span>
              <strong>{{ formattedTotal }}</strong>
            </div>
            <div class="total-row grand">
              <span>Total final</span>
              <strong>{{ formattedTotal }}</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import LogoQuantia from "@/components/common/LogoQuantia.vue";
import { useAuthStore } from "@/stores/authStore";
import { useViviendaStore } from "@/modules/vivienda/store/viviendaStore";

const router = useRouter();
const authStore = useAuthStore();
const viviendaStore = useViviendaStore();

const technicalConcepts = computed(
  () => viviendaStore.resultado.desglose.technicalConcepts || []
);

const officialSummary = computed(
  () => viviendaStore.resultado.desglose.officialSummary || []
);

const total = computed(() => {
  if (Number(viviendaStore.resultado.resultadoFinal || 0) > 0) {
    return Number(viviendaStore.resultado.resultadoFinal || 0);
  }
  return technicalConcepts.value.reduce((acc, item) => acc + Number(item.total || 0), 0);
});

const formattedTotal = computed(() => formatCurrency(total.value));

const profileLabel = computed(() => {
  if (authStore.accessProfile === "tecnico") return "Técnico";
  if (authStore.accessProfile === "oficial") return "Oficial / General";
  return "Sin definir";
});

const isTechnical = computed(() => authStore.accessProfile === "tecnico");
const userName = computed(() => authStore.user?.nombre || "Usuario Demo");

const prestador = computed(() => ({
  nombre: viviendaStore.registro.prestador.nombre || authStore.user?.nombre || "Sin capturar",
  telefono: viviendaStore.registro.prestador.telefono || authStore.user?.telefono || "Sin capturar",
  profesion: viviendaStore.registro.prestador.profesion || authStore.user?.profesion || "Sin capturar",
}));

const cliente = computed(() => ({
  nombre: viviendaStore.registro.cliente.nombre || "Sin capturar",
  ubicacion: viviendaStore.registro.cliente.ubicacion || "Sin capturar",
}));

const proyecto = computed(() => ({
  nombre: viviendaStore.registro.proyecto.nombreProyecto || "Sin capturar",
}));

const clasificacion = computed(() => ({
  tipo: viviendaStore.clasificacion.tipoIntervencion || "Sin capturar",
  alcance: viviendaStore.alcance.alcance || "Sin capturar",
  intervencion: viviendaStore.clasificacion.tipoIntervencion || "Sin capturar",
  acabado: viviendaStore.clasificacion.nivelAcabado || "Sin capturar",
}));

const technicalRows = computed(() => {
  if (technicalConcepts.value.length > 0) {
    return technicalConcepts.value.map((item, index) => ({
      key: item.key || `TEC-${index + 1}`,
      activity: item.group || item.title || "General",
      description: item.description || item.title || "Sin descripción técnica",
      unit: item.unit || "pza",
      quantity: Number(item.quantity || 1),
      amount: Number(item.total || 0),
    }));
  }

  return officialSummary.value.map((item, index) => ({
    key: `TEC-FALLBACK-${index + 1}`,
    activity: item.title || "General",
    description: item.description || "Sin descripción técnica",
    unit: "pza",
    quantity: 1,
    amount: Number(item.total || 0),
  }));
});

const officialLaborRows = computed(() =>
  officialSummary.value.map((item, index) => {
    const totalItem = Number(item.total || 0);
    const amount = Number((totalItem * 0.55).toFixed(2));
    return {
      key: `LAB-${index + 1}`,
      activity: item.title || "General",
      description: item.description || "Sin descripción",
      unit: "jornada",
      quantity: 1,
      labor: item.labor || "Cuadrilla de apoyo",
      amount,
    };
  })
);

const officialMaterialRows = computed(() =>
  officialSummary.value.map((item, index) => {
    const totalItem = Number(item.total || 0);
    const laborAmount = Number((totalItem * 0.55).toFixed(2));
    const amount = Number((totalItem - laborAmount).toFixed(2));
    return {
      key: `MAT-${index + 1}`,
      activity: item.title || "General",
      material: item.materials || "Material menor",
      unit: "pza",
      quantity: 1,
      amount: amount > 0 ? amount : 0,
    };
  })
);

const operationalLaborRows = computed(() =>
  technicalRows.value.map((item, index) => ({
    key: `OP-LAB-${index + 1}`,
    activity: item.activity,
    description: `Ejecución operativa de ${item.activity.toLowerCase()}.`,
    labor: "Cuadrilla de apoyo",
    quantity: item.quantity,
    amount: item.amount,
  }))
);

const operationalMaterialRows = computed(() =>
  technicalRows.value.map((item, index) => ({
    key: `OP-MAT-${index + 1}`,
    activity: item.activity,
    material: "Material menor y consumibles de proceso",
    unit: item.unit,
    quantity: item.quantity,
    amount: Number((item.amount * 0.45).toFixed(2)),
  }))
);

const todayLabel = computed(() =>
  new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date())
);

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}

function printDocument() {
  window.print();
}

function goDashboard() {
  router.push("/vivienda/dashboard");
}

function goDocuments() {
  router.push("/vivienda/documentos");
}

function goResumen() {
  router.push("/vivienda/cotizacion/revision-inferencia");
}

function goImprimible() {
  router.push("/vivienda/cotizacion/imprimible");
}
</script>

<style scoped>
.quantia-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 20%, rgba(84, 212, 255, 0.16), transparent 20%),
    radial-gradient(circle at 85% 15%, rgba(170, 92, 255, 0.18), transparent 22%),
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
  background: rgba(68, 228, 255, 0.12);
  top: 60px;
  left: -20px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: rgba(194, 93, 255, 0.12);
  top: 0;
  right: -40px;
}

.imprimible-shell {
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
  margin-bottom: 24px;
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

.print-toolbar {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.08));
  backdrop-filter: blur(18px);
  border-radius: 30px;
  box-shadow: 0 24px 80px rgba(13, 19, 72, 0.42);
  padding: 30px;
  margin-bottom: 24px;
}

.module-tag {
  margin: 0 0 10px;
  color: #84efff;
  font-size: 0.95rem;
  font-weight: 700;
}

.toolbar-left h1 {
  margin: 0 0 14px;
  font-size: 2.3rem;
  line-height: 1.05;
}

.toolbar-text {
  margin: 0;
  color: rgba(245, 245, 255, 0.88);
  line-height: 1.6;
}

.toolbar-right {
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

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.print-sheet {
  background: #ffffff;
  color: #1f2937;
  border-radius: 30px;
  padding: 38px;
  box-shadow: 0 30px 90px rgba(10, 17, 68, 0.28);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 22px;
}

.sheet-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sheet-brand-text {
  display: flex;
  flex-direction: column;
}

.sheet-brand-text strong {
  font-size: 1.6rem;
  color: #111827;
}

.sheet-brand-text span {
  color: #4b5563;
}

.sheet-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  min-width: 240px;
}

.meta-item label {
  color: #6b7280;
  font-weight: 600;
}

.meta-item span {
  color: #111827;
  font-weight: 700;
}

.sheet-title-block {
  padding: 24px 0 16px;
}

.sheet-title-block h2 {
  margin: 0 0 8px;
  font-size: 2rem;
  color: #111827;
}

.sheet-title-block p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-top: 10px;
}

.info-card {
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 18px;
  background: #fafafa;
}

.info-card h3 {
  margin: 0 0 14px;
  font-size: 1rem;
  color: #111827;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
}

.info-row span {
  color: #6b7280;
  font-size: 0.9rem;
}

.info-row strong {
  color: #111827;
}

.section-title {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  margin-top: 28px;
  margin-bottom: 14px;
}

.section-title h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #111827;
}

.section-title span {
  color: #4f46e5;
  font-weight: 800;
}

.subsection-title {
  margin: 20px 0 10px;
  font-size: 1.05rem;
  color: #111827;
}

.annex-note {
  margin: 0;
  color: #4b5563;
}

.official-table-wrap {
  overflow-x: auto;
}

.official-table {
  width: 100%;
  border-collapse: collapse;
}

.official-table th,
.official-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: top;
}

.official-table th {
  color: #374151;
  font-weight: 700;
  background: #f8fafc;
}

.operational-annex {
  margin-top: 24px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fcfcff;
}

.totals-block {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.totals-box {
  width: 100%;
  max-width: 420px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 18px;
  background: #fafafa;
}

.total-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
}

.total-row + .total-row {
  border-top: 1px solid #e5e7eb;
}

.total-row span {
  color: #4b5563;
}

.total-row strong {
  color: #111827;
}

.total-row.grand strong {
  color: #4f46e5;
  font-size: 1.1rem;
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
  .print-toolbar,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-right {
    align-items: stretch;
  }

  .toolbar-actions {
    flex-direction: column;
  }

  .sheet-header {
    flex-direction: column;
  }

  .meta-item {
    min-width: 0;
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

  .print-toolbar,
  .print-sheet {
    padding: 20px;
  }

  .toolbar-left h1 {
    font-size: 2rem;
  }

  .btn,
  .toolbar-actions {
    width: 100%;
  }

  .user-pill {
    text-align: center;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  .quantia-page {
    background: #ffffff !important;
    padding: 0 !important;
  }

  .no-print,
  .bg-orb {
    display: none !important;
  }

  .imprimible-shell {
    max-width: 100%;
    margin: 0;
  }

  .print-sheet {
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }

  .info-grid {
    grid-template-columns: 1fr 1fr 1fr !important;
    gap: 10px;
  }

  .official-table-wrap {
    overflow: visible;
  }

  .section-title,
  .info-card,
  .official-table-wrap,
  .totals-block {
    break-inside: avoid-page;
    page-break-inside: avoid;
  }

  .official-table thead {
    display: table-header-group;
  }

  .official-table tr {
    break-inside: avoid-page;
    page-break-inside: avoid;
  }
}
</style>
