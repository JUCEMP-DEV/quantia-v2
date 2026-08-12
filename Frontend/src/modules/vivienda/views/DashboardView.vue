<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="dashboard-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goDashboard">Inicio</a>
          <a href="#" @click.prevent="goProfile">Perfil</a>
          <a href="#" @click.prevent="goRegister">Crear cuenta</a>
        </nav>

        <div class="user-pill">
          <span>{{ profileLabel }}</span>
          <strong>{{ userName }}</strong>
        </div>
      </header>

      <section class="hero-card">
        <div class="hero-left">
          <p class="module-tag">Quantia · Centro de control</p>
          <h1>Panel principal</h1>
          <p class="hero-text">
            Desde este centro puedes autenticarte, crear tu cuenta y continuar de forma ordenada al flujo de cotizacion de vivienda.
          </p>

          <div class="quick-actions">
            <button class="btn btn-primary" @click="goLogin">Iniciar sesion</button>
            <button class="btn btn-secondary" @click="goProfile">Editar perfil</button>
            <button class="btn btn-secondary" @click="goRegister">Crear cuenta</button>
          </div>
        </div>

        <div class="hero-right">
          <div class="cost-box">
            <span>Costo acumulado</span>
            <strong>$0.00 MXN</strong>
          </div>

          <div class="resume-box">
            <div class="resume-item">
              <span>Perfil</span>
              <strong>{{ profileLabel }}</strong>
            </div>
            <div class="resume-item">
              <span>Modulo activo</span>
              <strong>Vivienda</strong>
            </div>
            <div class="resume-item">
              <span>Proximo paso</span>
              <strong>{{ nextStepLabel }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard-grid">
        <article class="main-card project-card">
          <div class="card-header">
            <div>
              <p class="card-tag">Centro de control</p>
              <h2>Ingreso al flujo de cotizacion</h2>
              <p>
                El flujo permite regreso libre, pero protege el avance cuando faltan datos obligatorios para mantener consistencia entre pantallas.
              </p>
            </div>
          </div>

          <div class="steps-preview">
            <div class="step-item active">
              <span class="step-number">1</span>
              <div>
                <strong>Registro y validacion</strong>
                <p>Prestador, cliente y terminos.</p>
              </div>
            </div>

            <div class="step-item">
              <span class="step-number">2</span>
              <div>
                <strong>Clasificacion</strong>
                <p>Tipo de intervencion y nivel de acabado segun flujo v4.</p>
              </div>
            </div>

            <div class="step-item">
              <span class="step-number">3</span>
              <div>
                <strong>Alcance</strong>
                <p>Activacion automatica de modulos o seleccion de partidas.</p>
              </div>
            </div>

            <div class="step-item">
              <span class="step-number">4</span>
              <div>
                <strong>Preliminares</strong>
                <p>Condiciones del sitio, acceso, topografia, servicios y demolicion.</p>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-primary" @click="continueFlow">Continuar simulacion</button>
          </div>
        </article>

        <article class="side-card concepts-card">
          <div class="card-header small">
            <div>
              <p class="card-tag">Vista del sistema</p>
              <h3>Diferencia entre perfiles</h3>
            </div>
          </div>

          <div class="concept-view">
            <div class="concept-box perfil-box">
              <span>Perfil Oficial / General</span>
              <strong>Salida resumida</strong>
              <p>Presenta actividades con lenguaje simple y enfoque en mano de obra y materiales.</p>
            </div>

            <div class="concept-box perfil-box">
              <span>Perfil Tecnico</span>
              <strong>Salida tecnica + oficial</strong>
              <p>Muestra conceptos detallados por unidad, cantidad y P.U., con resumen oficial derivado.</p>
            </div>
          </div>
        </article>
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

const profileLabel = computed(() => {
  if (authStore.accessProfile === "tecnico") return "Tecnico";
  if (authStore.accessProfile === "oficial") return "Oficial / General";
  return "Sin definir";
});

const userName = computed(() => {
  return authStore.user?.nombre || "Usuario Demo";
});

const nextStepLabel = computed(() => {
  if (!authStore.user) return "Iniciar sesión";
  const route = viviendaStore.nextPendingRoute || "";
  if (route.includes("/cotizacion/registro")) return "Registro servidor-cliente";
  if (route.includes("/cotizacion/clasificacion")) return "Clasificación";
  if (route.includes("/cotizacion/alcance")) return "Alcance";
  if (route.includes("/cotizacion/modelo-espacial")) return "Distribucion Arquitectonica";
  if (route.includes("/cotizacion/preliminares")) return "Preliminares";
  if (route.includes("/cotizacion/cimentacion")) return "Cimentación";
  if (route.includes("/cotizacion/estructura")) return "Estructura";
  if (route.includes("/cotizacion/albanileria")) return "Albañilería";
  if (route.includes("/cotizacion/instalaciones")) return "Instalaciones";
  if (route.includes("/cotizacion/acabados")) return "Acabados";
  if (route.includes("/cotizacion/complementarios")) return "Complementarios";
  if (route.includes("/cotizacion/revision-inferencia")) return "Revisión de inferencia";
  if (route.includes("/cotizacion/resultados")) return "Imprimible";
  if (route.includes("/cotizacion/imprimible")) return "Imprimible";
  return "Registro servidor-cliente";
});

function goDashboard() {
  router.push("/vivienda/dashboard");
}

function goLogin() {
  router.push("/vivienda/login");
}

function goRegister() {
  router.push("/vivienda/registro");
}

function goProfile() {
  if (!authStore.user) {
    router.push("/vivienda/login");
    return;
  }
  router.push("/vivienda/perfil");
}

function continueFlow() {
  viviendaStore.startSimulation({ modulo: "vivienda" });
  router.push(viviendaStore.nextPendingRoute);
}
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

.dashboard-shell {
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

.user-pill strong {
  font-size: 1rem;
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

.quick-actions {
  display: flex;
  gap: 14px;
  margin-top: 28px;
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

.resume-item span {
  color: rgba(239, 239, 255, 0.78);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
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
  color: rgba(245, 245, 255, 0.82);
  line-height: 1.55;
}

.steps-preview {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.step-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.step-item.active {
  background: linear-gradient(180deg, rgba(143, 232, 255, 0.14), rgba(156, 123, 255, 0.12));
  border-color: rgba(143, 232, 255, 0.28);
}

.step-number {
  width: 34px;
  min-width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.14);
}

.step-item strong {
  display: block;
  margin-bottom: 5px;
}

.step-item p {
  margin: 0;
  color: rgba(240, 240, 255, 0.82);
  line-height: 1.45;
}

.card-actions {
  margin-top: 20px;
}

.concept-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.concept-box {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.concept-box span {
  display: block;
  color: rgba(235, 235, 255, 0.75);
  margin-bottom: 6px;
}

.concept-box p {
  margin: 8px 0 0;
  color: rgba(242, 242, 255, 0.85);
  line-height: 1.55;
}

.perfil-box strong {
  display: block;
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
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

@media (max-width: 1100px) {
  .hero-card,
  .dashboard-grid {
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

  .quick-actions {
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
