<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="landing-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goLanding">Inicio</a>
          <a href="#" @click.prevent="goLogin">Iniciar sesion</a>
          <a href="#" @click.prevent="goRegister">Crear cuenta</a>
        </nav>

        <div class="user-pill">
          <span>Estado</span>
          <strong>{{ sessionLabel }}</strong>
        </div>
      </header>

      <section class="hero-card">
        <div class="hero-left">
          <p class="module-tag">Quantia · Vivienda</p>
          <h1>Entrada del flujo</h1>
          <p class="hero-text">
            Punto inicial del modulo vivienda. Desde aqui puedes autenticarte y continuar la simulacion con estado consistente entre interfaces.
          </p>

          <div class="quick-actions">
            <button class="btn btn-primary" @click="goLogin">Iniciar sesion</button>
            <button class="btn btn-secondary" @click="goRegister">Crear cuenta</button>
          </div>
        </div>

        <div class="hero-right">
          <div class="resume-box">
            <div class="resume-item">
              <span>Ruta sugerida</span>
              <strong>{{ nextLabel }}</strong>
            </div>
            <div class="resume-item">
              <span>Modulo</span>
              <strong>Vivienda</strong>
            </div>
            <div class="resume-item">
              <span>Flujo</span>
              <strong>v4</strong>
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

const sessionLabel = computed(() => (authStore.user ? "Sesion activa" : "Sin sesion"));

const nextLabel = computed(() => {
  if (!authStore.user) return "Login";
  return viviendaStore.nextPendingRoute.includes("cotizacion")
    ? "Continuar cotizacion"
    : "Dashboard";
});

function goLanding() {
  router.push("/vivienda/landing");
}

function goLogin() {
  router.push("/vivienda/login");
}

function goRegister() {
  router.push("/vivienda/registro");
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

.orb-1 { width: 240px; height: 240px; background: rgba(68, 228, 255, 0.14); top: 60px; left: -20px; }
.orb-2 { width: 300px; height: 300px; background: rgba(194, 93, 255, 0.14); top: 0; right: -40px; }
.orb-3 { width: 260px; height: 260px; background: rgba(104, 91, 255, 0.12); bottom: 30px; left: 30%; }

.landing-shell { position: relative; z-index: 1; max-width: 1380px; margin: 0 auto; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.brand-wrap { display: flex; align-items: center; }
.topnav { display: flex; gap: 30px; align-items: center; }
.topnav a { color: rgba(255, 255, 255, 0.92); text-decoration: none; font-weight: 500; }
.user-pill { min-width: 200px; padding: 12px 16px; border-radius: 16px; text-align: right; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.12); }
.user-pill span { display: block; font-size: 0.8rem; color: rgba(242, 242, 255, 0.75); margin-bottom: 4px; }

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

.module-tag { margin: 0 0 10px; color: #84efff; font-size: 0.95rem; font-weight: 700; }
.hero-left h1 { font-size: 3rem; line-height: 1.05; margin: 0 0 16px; font-weight: 800; }
.hero-text { margin: 0; max-width: 620px; color: rgba(245, 245, 255, 0.88); font-size: 1.08rem; line-height: 1.6; }
.quick-actions { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
.resume-box { width: 100%; max-width: 330px; padding: 18px; border-radius: 20px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); }
.resume-item { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; }
.resume-item + .resume-item { border-top: 1px solid rgba(255, 255, 255, 0.08); }

.btn { border: none; border-radius: 18px; padding: 14px 20px; font-size: 0.95rem; font-weight: 800; cursor: pointer; }
.btn-primary { background: linear-gradient(135deg, #2fc4ff 0%, #6a52ff 55%, #8b5cf6 100%); color: white; }
.btn-secondary { background: rgba(255, 255, 255, 0.14); color: #ffffff; }

@media (max-width: 1100px) {
  .hero-card { grid-template-columns: 1fr; }
}

@media (max-width: 780px) {
  .quantia-page { padding: 18px; }
  .topbar { flex-direction: column; align-items: stretch; }
  .topnav { justify-content: center; flex-wrap: wrap; gap: 18px; }
  .hero-card { padding: 20px; }
  .hero-left h1 { font-size: 2.3rem; }
  .user-pill { text-align: center; }
}
</style>
