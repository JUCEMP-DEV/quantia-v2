<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="registro-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goDashboard">Inicio</a>
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
          <h1>Registro y validación</h1>
          <p class="hero-text">
            Captura los datos base del prestador y cliente para iniciar correctamente la cotización del módulo vivienda.
          </p>

          <div class="flow-box">
            <div class="flow-item active">
              <span>1</span>
              <strong>Registro</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item">
              <span>2</span>
              <strong>Clasificación</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item">
              <span>3</span>
              <strong>Alcance</strong>
            </div>
            <div class="flow-line"></div>
            <div class="flow-item">
              <span>4</span>
              <strong>Datos generales</strong>
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
              <span>Perfil activo</span>
              <strong>{{ profileLabel }}</strong>
            </div>
            <div class="resume-item">
              <span>Módulo</span>
              <strong>Vivienda</strong>
            </div>
            <div class="resume-item">
              <span>Etapa actual</span>
              <strong>Registro</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="registro-grid">
        <article class="main-card">
          <div class="card-header">
            <div>
              <p class="card-tag">Paso 1 de 13</p>
              <h2>Datos de la cotización</h2>
              <p>
                Completa los campos obligatorios para continuar. Podrás regresar sin bloqueo, pero no avanzar si faltan datos requeridos.
              </p>
            </div>
          </div>

          <form class="registro-form" @submit.prevent="handleContinue">
            <div class="section-block">
              <div class="section-title-row">
                <h3>Prestador</h3>
                <span class="section-badge">Autorrellenable</span>
              </div>

              <div class="grid-form">
                <div class="field-group full">
                  <label for="prestadorNombre">Nombre del prestador</label>
                  <input
                    id="prestadorNombre"
                    v-model="form.prestador.nombre"
                    type="text"
                    placeholder="Nombre completo del prestador"
                    :class="{ invalid: errors.prestador.nombre }"
                  />
                  <p v-if="errors.prestador.nombre" class="error-text">{{ errors.prestador.nombre }}</p>
                </div>

                <div class="field-group">
                  <label for="prestadorTelefono">Teléfono</label>
                  <input
                    id="prestadorTelefono"
                    v-model="form.prestador.telefono"
                    type="text"
                    placeholder="Número de contacto"
                    :class="{ invalid: errors.prestador.telefono }"
                  />
                  <p v-if="errors.prestador.telefono" class="error-text">{{ errors.prestador.telefono }}</p>
                </div>

                <div class="field-group">
                  <label for="prestadorProfesion">Profesión</label>
                  <input
                    id="prestadorProfesion"
                    v-model="form.prestador.profesion"
                    type="text"
                    placeholder="Ej. Arquitecto, Técnico, Maestro"
                    :class="{ invalid: errors.prestador.profesion }"
                  />
                  <p v-if="errors.prestador.profesion" class="error-text">{{ errors.prestador.profesion }}</p>
                </div>

                <div class="field-group full">
                  <label for="prestadorAlias">Alias o nombre comercial</label>
                  <input
                    id="prestadorAlias"
                    v-model="form.prestador.alias"
                    type="text"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            <div class="section-block">
              <div class="section-title-row">
                <h3>Cliente</h3>
                <span class="section-badge manual">Captura manual</span>
              </div>

              <div class="grid-form">
                <div class="field-group full">
                  <label for="clienteNombre">Nombre del cliente</label>
                  <input
                    id="clienteNombre"
                    v-model="form.cliente.nombre"
                    type="text"
                    placeholder="Nombre completo del cliente"
                    :class="{ invalid: errors.cliente.nombre }"
                  />
                  <p v-if="errors.cliente.nombre" class="error-text">{{ errors.cliente.nombre }}</p>
                </div>

                <div class="field-group">
                  <label for="clienteTelefono">Teléfono</label>
                  <input
                    id="clienteTelefono"
                    v-model="form.cliente.telefono"
                    type="text"
                    placeholder="Número de contacto"
                    :class="{ invalid: errors.cliente.telefono }"
                  />
                  <p v-if="errors.cliente.telefono" class="error-text">{{ errors.cliente.telefono }}</p>
                </div>

                <div class="field-group">
                  <label for="clienteUbicacion">Ubicación</label>
                  <input
                    id="clienteUbicacion"
                    v-model="form.cliente.ubicacion"
                    type="text"
                    placeholder="Municipio o comunidad"
                    :class="{ invalid: errors.cliente.ubicacion }"
                  />
                  <p v-if="errors.cliente.ubicacion" class="error-text">{{ errors.cliente.ubicacion }}</p>
                </div>
              </div>
            </div>

            <div class="terms-box">
              <label class="terms-label">
                <input v-model="form.terminosAceptados" type="checkbox" />
                <span>Acepto los términos y condiciones de la cotización</span>
              </label>
              <p class="terms-summary">
                Resumen: autorizas uso de datos para simular costos, revisar resultados y generar salida imprimible.
              </p>
              <p v-if="errors.terminos" class="error-text">{{ errors.terminos }}</p>
            </div>

            <div class="actions">
              <button type="button" class="btn btn-secondary" @click="goDashboard">
                Regresar
              </button>

              <button type="submit" class="btn btn-primary">
                Guardar y continuar
              </button>
            </div>
          </form>
        </article>

        <aside class="side-column">
          <article class="side-card">
            <div class="card-header small">
              <div>
                <p class="card-tag">Vista previa</p>
                <h3>Resumen de captura</h3>
              </div>
            </div>

            <div class="summary-list">
              <div class="summary-item">
                <span>Prestador</span>
                <strong>{{ form.prestador.nombre || "Sin capturar" }}</strong>
              </div>

              <div class="summary-item">
                <span>Cliente</span>
                <strong>{{ form.cliente.nombre || "Sin capturar" }}</strong>
              </div>

              <div class="summary-item">
                <span>Ubicación</span>
                <strong>{{ form.cliente.ubicacion || "Sin capturar" }}</strong>
              </div>
            </div>
          </article>

          <article class="side-card">
            <div class="card-header small">
              <div>
                <p class="card-tag">Control del flujo</p>
                <h3>Reglas activas</h3>
              </div>
            </div>

            <div class="rules-box">
              <div class="rule-item">Puedes regresar libremente al dashboard.</div>
              <div class="rule-item">No podrás avanzar a clasificación si faltan datos obligatorios.</div>
              <div class="rule-item">El tipo de intervención y clasificación del proyecto se define en el paso siguiente.</div>
            </div>
          </article>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import LogoQuantia from "@/components/common/LogoQuantia.vue";
import { useAuthStore } from "@/stores/authStore";
import { useViviendaStore } from "@/modules/vivienda/store/viviendaStore";

const router = useRouter();
const authStore = useAuthStore();
const viviendaStore = useViviendaStore();

const form = reactive({
  prestador: {
    nombre: viviendaStore.registro.prestador.nombre || authStore.user?.nombre || "",
    telefono: viviendaStore.registro.prestador.telefono || authStore.user?.telefono || "",
    profesion: viviendaStore.registro.prestador.profesion || authStore.user?.profesion || "",
    alias: viviendaStore.registro.prestador.alias || authStore.user?.alias || "",
  },
  cliente: {
    nombre: viviendaStore.registro.cliente.nombre || "",
    telefono: viviendaStore.registro.cliente.telefono || "",
    ubicacion: viviendaStore.registro.cliente.ubicacion || "",
  },
  terminosAceptados: viviendaStore.registro.terminosAceptados || false,
});

const errors = reactive({
  prestador: {
    nombre: "",
    telefono: "",
    profesion: "",
  },
  cliente: {
    nombre: "",
    telefono: "",
    ubicacion: "",
  },
  terminos: "",
});

const profileLabel = computed(() => {
  if (authStore.accessProfile === "tecnico") return "Técnico";
  if (authStore.accessProfile === "oficial") return "Oficial / General";
  return "Sin definir";
});

const userName = computed(() => {
  return authStore.user?.nombre || "Usuario Demo";
});

function resetErrors() {
  errors.prestador.nombre = "";
  errors.prestador.telefono = "";
  errors.prestador.profesion = "";
  errors.cliente.nombre = "";
  errors.cliente.telefono = "";
  errors.cliente.ubicacion = "";
  errors.terminos = "";
}

function validateForm() {
  resetErrors();
  let valid = true;

  if (!form.prestador.nombre.trim()) {
    errors.prestador.nombre = "El nombre del prestador es obligatorio.";
    valid = false;
  }

  if (!form.prestador.telefono.trim()) {
    errors.prestador.telefono = "El teléfono del prestador es obligatorio.";
    valid = false;
  }

  if (!form.prestador.profesion.trim()) {
    errors.prestador.profesion = "La profesión del prestador es obligatoria.";
    valid = false;
  }

  if (!form.cliente.nombre.trim()) {
    errors.cliente.nombre = "El nombre del cliente es obligatorio.";
    valid = false;
  }

  if (!form.cliente.telefono.trim()) {
    errors.cliente.telefono = "El teléfono del cliente es obligatorio.";
    valid = false;
  }

  if (!form.cliente.ubicacion.trim()) {
    errors.cliente.ubicacion = "La ubicación es obligatoria.";
    valid = false;
  }

  if (!form.terminosAceptados) {
    errors.terminos = "Debes aceptar los términos y condiciones.";
    valid = false;
  }

  return valid;
}

function handleContinue() {
  if (!validateForm()) return;
  viviendaStore.setRegistro(JSON.parse(JSON.stringify(form)));

  if (authStore.user) {
    authStore.setUser({
      ...authStore.user,
      nombre: form.prestador.nombre,
      telefono: form.prestador.telefono,
      profesion: form.prestador.profesion,
      alias: form.prestador.alias,
    });
  }

  router.push("/vivienda/cotizacion/clasificacion");
}

function goDashboard() {
  router.push("/vivienda/dashboard");
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

.registro-shell {
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

.registro-grid {
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

.registro-form {
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

.section-badge.manual {
  background: rgba(139,92,246,0.18);
  color: #c9b4ff;
}

.section-badge.project {
  background: rgba(255,255,255,0.12);
  color: #f0f2ff;
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

.field-group.full {
  grid-column: 1 / -1;
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

.helper-text {
  margin: 6px 0 0;
  color: rgba(234,235,255,0.72);
  font-size: 0.82rem;
}

.error-text {
  margin: 0;
  color: #ff96b6;
  font-size: 0.88rem;
}

.terms-box {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
}

.terms-label {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  color: rgba(245,245,255,0.88);
}

.terms-summary {
  margin: 10px 0 0;
  color: rgba(242,242,255,0.82);
  line-height: 1.45;
  font-size: 0.9rem;
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
  .registro-grid {
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

  .grid-form {
    grid-template-columns: 1fr;
  }

  .field-group.full {
    grid-column: auto;
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



