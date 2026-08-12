<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="login-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goRegister">Registro</a>
          <a href="#" @click.prevent>Ayuda</a>
          <a href="#" @click.prevent>Contacto</a>
        </nav>

        <div class="profile-pill">
          <span>Perfil</span>
          <strong>{{ profileLabel }}</strong>
        </div>
      </header>

      <section class="login-card">
        <div class="login-left">
          <p class="module-tag">Quantia · Módulo Vivienda</p>
          <h1>Inicia sesión para continuar</h1>
          <p class="login-text">
            Accede a tu cuenta para continuar con el flujo de cotización. El tipo de acceso seleccionado se mantendrá durante el proceso.
          </p>

          <div class="benefits">
            <div class="benefit-item">Flujo continuo hasta resultados</div>
            <div class="benefit-item">Resumen acumulado visible</div>
            <div class="benefit-item">Salida técnica y oficial según perfil</div>
          </div>

          <div class="summary-box">
            <div class="summary-row">
              <span>Perfil actual</span>
              <strong>{{ profileLabel }}</strong>
            </div>
            <div class="summary-row">
              <span>Acumulado</span>
              <strong>$0.00 MXN</strong>
            </div>
            <div class="summary-row">
              <span>Módulo activo</span>
              <strong>Autenticación</strong>
            </div>
          </div>
        </div>

        <div class="login-right">
          <div class="form-shell">
            <div class="form-header">
              <p class="form-step">Paso 1 de 7</p>
              <h2>Acceso a plataforma</h2>
              <p class="form-subtitle">
                Ingresa tus datos para acceder a Quantia y continuar con tu cotización.
              </p>
            </div>

            <form class="login-form" @submit.prevent="handleContinue">
              <div class="field-group">
                <label for="email">Correo electrónico</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="usuario@correo.com"
                  :class="{ invalid: errors.email }"
                />
                <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
              </div>

              <div class="field-group">
                <label for="password">Contraseña</label>
                <div class="password-wrap">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Ingresa tu contraseña"
                    :class="{ invalid: errors.password }"
                  />
                  <button type="button" class="toggle-btn" @click="showPassword = !showPassword">
                    {{ showPassword ? "Ocultar" : "Ver" }}
                  </button>
                </div>
                <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
              </div>

              <div class="options-row">
                <label class="remember-box">
                  <input v-model="form.remember" type="checkbox" />
                  <span>Recordar acceso</span>
                </label>

                <a href="#" class="helper-link" @click.prevent>¿Olvidaste tu contraseña?</a>
              </div>

              <div class="flow-note">
                <span class="note-badge">Aviso</span>
                <p>
                  Puedes regresar sin bloqueo. Para continuar, el sistema validará que los datos mínimos estén completos.
                </p>
              </div>

              <p v-if="serverMessage" class="error-text">{{ serverMessage }}</p>

              <div class="actions">
                <button type="button" class="btn btn-secondary" @click="goRegister">
                  Crear cuenta
                </button>

                <button type="submit" class="btn btn-primary" :disabled="loading">
                  {{ loading ? "Validando..." : "Iniciar sesión" }}
                </button>
              </div>
            </form>

            <div class="register-box">
              <span>¿Aún no tienes cuenta?</span>
              <button class="register-link" @click="goRegister">
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import LogoQuantia from "@/components/common/LogoQuantia.vue";
import { useAuthStore } from "@/stores/authStore";
import { useViviendaStore } from "@/modules/vivienda/store/viviendaStore";
import { API_BASE_URL } from "@/config/apiBaseUrl";

const router = useRouter();
const authStore = useAuthStore();
const viviendaStore = useViviendaStore();

const showPassword = ref(false);
const loading = ref(false);
const serverMessage = ref("");

const form = reactive({
  email: "",
  password: "",
  remember: false,
});

const errors = reactive({
  email: "",
  password: "",
});

const profileLabel = computed(() => {
  if (authStore.accessProfile === "tecnico") return "Técnico";
  if (authStore.accessProfile === "oficial") return "Oficial / General";
  return "Sin definir";
});

function validateForm() {
  errors.email = "";
  errors.password = "";
  serverMessage.value = "";
  let valid = true;

  if (!form.email.trim()) {
    errors.email = "El correo electrónico es obligatorio.";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Ingresa un correo válido.";
    valid = false;
  }

  if (!form.password.trim()) {
    errors.password = "La contraseña es obligatoria.";
    valid = false;
  } else if (form.password.trim().length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
    valid = false;
  }

  return valid;
}

function getProfileFromSource(raw = "") {
  const value = String(raw || "").toLowerCase();
  if (value === "tecnico" || value === "tecnico_profesional") return "tecnico";
  return "oficial";
}

function normalizeAuthenticatedUser(source, fallbackEmail, fallbackProfile) {
  const profile = getProfileFromSource(source?.perfil || source?.tipo_usuario || fallbackProfile);
  return {
    id: source?.id || "",
    email: source?.email || fallbackEmail,
    nombre: source?.nombre || source?.name || "Usuario Quantia",
    telefono: source?.telefono || source?.phone || "",
    profesion: source?.profesion || "",
    alias: source?.alias || "",
    direccion: source?.direccion || "",
    perfil: profile,
  };
}

async function authenticateAgainstBackend() {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: form.email.trim(),
      password: form.password,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.detail || "Credenciales inválidas.";
    throw new Error(String(message));
  }

  const user = payload?.user || payload?.data || payload;
  return {
    user: normalizeAuthenticatedUser(user, form.email.trim(), authStore.accessProfile),
    accessToken: payload?.access_token || "",
    tokenType: payload?.token_type || "bearer",
  };
}

function authenticateAgainstLocalFallback() {
  const localUsers = JSON.parse(localStorage.getItem("quantia_users") || "[]");
  const matchedUser = localUsers.find((item) => {
    const sameEmail =
      String(item.email || "").toLowerCase() === form.email.trim().toLowerCase();
    const samePassword = String(item.password || "") === form.password;
    return sameEmail && samePassword;
  });

  if (!matchedUser) {
    throw new Error("No fue posible autenticar con esas credenciales.");
  }

  return normalizeAuthenticatedUser(matchedUser, form.email.trim(), matchedUser?.perfil);
}

async function handleContinue() {
  if (!validateForm()) return;

  loading.value = true;
  serverMessage.value = "";

  try {
    const session = await authenticateAgainstBackend();
    const authenticatedUser = session.user;
    authStore.setAccessProfile(authenticatedUser.perfil);
    authStore.setSession(session);
    viviendaStore.startSimulation({
      modulo: "vivienda",
      subtipo: authenticatedUser.perfil,
    });
    router.push("/vivienda/cotizacion/registro");
  } catch (error) {
    serverMessage.value = String(error?.message || "No se pudo iniciar sesión.");
  } finally {
    loading.value = false;
  }
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

.login-shell {
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

.profile-pill {
  min-width: 180px;
  padding: 12px 16px;
  border-radius: 16px;
  text-align: right;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.12);
}

.profile-pill span {
  display: block;
  font-size: 0.8rem;
  color: rgba(242,242,255,0.75);
  margin-bottom: 4px;
}

.profile-pill strong {
  font-size: 1rem;
}

.login-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 26px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08));
  backdrop-filter: blur(18px);
  border-radius: 30px;
  box-shadow: 0 24px 80px rgba(13, 19, 72, 0.42);
  overflow: hidden;
}

.login-left,
.login-right {
  padding: 34px;
}

.module-tag {
  margin: 0 0 10px;
  color: #84efff;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.login-left h1 {
  font-size: 3rem;
  line-height: 1.05;
  margin: 0 0 16px;
  font-weight: 800;
}

.login-text {
  margin: 0;
  max-width: 560px;
  color: rgba(245, 245, 255, 0.88);
  font-size: 1.08rem;
  line-height: 1.6;
}

.benefits {
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.benefit-item {
  width: fit-content;
  padding: 10px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.08);
  color: #eef0ff;
  font-weight: 600;
  border: 1px solid rgba(255,255,255,0.08);
}

.summary-box {
  margin-top: 28px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
}

.summary-row + .summary-row {
  border-top: 1px solid rgba(255,255,255,0.08);
}

.summary-row span {
  color: rgba(239,239,255,0.78);
}

.form-shell {
  height: 100%;
  border-radius: 26px;
  padding: 26px;
  background: rgba(14, 17, 61, 0.45);
  border: 1px solid rgba(255,255,255,0.1);
}

.form-header {
  margin-bottom: 22px;
}

.form-step {
  margin: 0 0 6px;
  color: #8fe8ff;
  font-weight: 700;
  font-size: 0.9rem;
}

.form-header h2 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.form-subtitle {
  margin: 0;
  color: rgba(245,245,255,0.84);
  line-height: 1.55;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.field-group input {
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

.field-group input.invalid {
  border-color: #ff7fa7;
}

.password-wrap {
  position: relative;
}

.password-wrap input {
  width: 100%;
  padding-right: 92px;
}

.toggle-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  height: 38px;
  border: none;
  border-radius: 12px;
  padding: 0 14px;
  background: rgba(255,255,255,0.14);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.error-text {
  margin: 0;
  color: #ff96b6;
  font-size: 0.88rem;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.remember-box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(245,245,255,0.88);
}

.helper-link {
  color: #8fe8ff;
  text-decoration: none;
  font-weight: 600;
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
  margin-top: 4px;
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

.btn-secondary {
  background: rgba(255,255,255,0.14);
  color: #ffffff;
}

.btn-primary {
  background: linear-gradient(135deg, #2fc4ff 0%, #6a52ff 55%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 16px 32px rgba(62, 85, 255, 0.28);
}

.register-box {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: center;
  gap: 8px;
  color: rgba(245,245,255,0.85);
}

.register-link {
  border: none;
  background: none;
  color: #8fe8ff;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 1080px) {
  .login-card {
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

  .topnav {
    justify-content: center;
    flex-wrap: wrap;
    gap: 18px;
  }

  .login-left,
  .login-right,
  .form-shell {
    padding: 20px;
  }

  .login-left h1 {
    font-size: 2.3rem;
  }

  .actions,
  .options-row,
  .register-box {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }

  .profile-pill {
    text-align: center;
  }
}
</style>

