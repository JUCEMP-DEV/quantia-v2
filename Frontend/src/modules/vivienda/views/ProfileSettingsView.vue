<template>
  <div class="quantia-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <main class="profile-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <LogoQuantia />
        </div>

        <nav class="topnav">
          <a href="#" @click.prevent="goDashboard">Inicio</a>
          <a href="#" @click.prevent="goBack">Volver</a>
        </nav>

        <div class="user-pill">
          <span>Perfil actual</span>
          <strong>{{ profileLabel }}</strong>
        </div>
      </header>

      <section class="profile-card">
        <div class="card-header">
          <p class="card-tag">Configuracion de usuario</p>
          <h1>Editar perfil</h1>
          <p>Actualiza tus datos y cambia el tipo de perfil de salida (Oficial / General o Tecnico).</p>
        </div>

        <form class="profile-form" @submit.prevent="handleSave">
          <div class="grid-form">
            <div class="field-group">
              <label for="nombre">Nombre</label>
              <input id="nombre" v-model="form.nombre" type="text" :class="{ invalid: errors.nombre }" />
              <p v-if="errors.nombre" class="error-text">{{ errors.nombre }}</p>
            </div>

            <div class="field-group">
              <label for="email">Correo</label>
              <input id="email" :value="form.email" type="email" readonly />
            </div>

            <div class="field-group">
              <label for="telefono">Telefono</label>
              <input id="telefono" v-model="form.telefono" type="text" />
            </div>

            <div class="field-group">
              <label for="profesion">Profesion</label>
              <input id="profesion" v-model="form.profesion" type="text" />
            </div>

            <div class="field-group">
              <label for="alias">Alias</label>
              <input id="alias" v-model="form.alias" type="text" />
            </div>

            <div class="field-group">
              <label for="direccion">Direccion</label>
              <input id="direccion" v-model="form.direccion" type="text" />
            </div>

            <div class="field-group full">
              <label for="tipoUsuario">Tipo de perfil</label>
              <select id="tipoUsuario" v-model="form.tipoUsuario" :class="{ invalid: errors.tipoUsuario }">
                <option value="general">Oficial / General</option>
                <option value="tecnico">Tecnico</option>
              </select>
              <p v-if="errors.tipoUsuario" class="error-text">{{ errors.tipoUsuario }}</p>
            </div>
          </div>

          <p v-if="serverMessage" class="server-text">{{ serverMessage }}</p>

          <div class="actions">
            <button type="button" class="btn btn-secondary" @click="goBack">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? "Guardando..." : "Guardar cambios" }}
            </button>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import LogoQuantia from "@/components/common/LogoQuantia.vue";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL } from "@/config/apiBaseUrl";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const serverMessage = ref("");

const form = reactive({
  nombre: authStore.user?.nombre || "",
  email: authStore.user?.email || "",
  telefono: authStore.user?.telefono || "",
  profesion: authStore.user?.profesion || "",
  alias: authStore.user?.alias || "",
  direccion: authStore.user?.direccion || "",
  tipoUsuario: authStore.accessProfile === "tecnico" ? "tecnico" : "general",
});

const errors = reactive({
  nombre: "",
  tipoUsuario: "",
});

const profileLabel = computed(() => (form.tipoUsuario === "tecnico" ? "Tecnico" : "Oficial / General"));

function validateForm() {
  errors.nombre = "";
  errors.tipoUsuario = "";
  let valid = true;

  if (!String(form.nombre || "").trim() || String(form.nombre || "").trim().length < 2) {
    errors.nombre = "Ingresa un nombre valido.";
    valid = false;
  }
  if (!form.tipoUsuario) {
    errors.tipoUsuario = "Selecciona el tipo de perfil.";
    valid = false;
  }
  return valid;
}

function updateLocalFallback(userData) {
  const users = JSON.parse(localStorage.getItem("quantia_users") || "[]");
  const email = String(userData?.email || "").trim().toLowerCase();
  if (!email) return;

  const idx = users.findIndex((item) => String(item?.email || "").trim().toLowerCase() === email);
  if (idx < 0) return;

  users[idx] = {
    ...users[idx],
    nombre: userData?.nombre || users[idx].nombre,
    telefono: userData?.telefono || "",
    profesion: userData?.profesion || "",
    alias: userData?.alias || "",
    direccion: userData?.direccion || "",
    perfil: userData?.perfil || users[idx].perfil,
  };
  localStorage.setItem("quantia_users", JSON.stringify(users));
}

async function saveAgainstBackend() {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: authStore.user?.id || null,
      email: form.email || authStore.user?.email || null,
      nombre: String(form.nombre || "").trim(),
      telefono: String(form.telefono || "").trim(),
      profesion: String(form.profesion || "").trim(),
      alias: String(form.alias || "").trim(),
      direccion: String(form.direccion || "").trim(),
      tipo_usuario: form.tipoUsuario,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || "No se pudo actualizar el perfil en backend.");
  }
  return payload?.user || payload?.data || payload;
}

async function handleSave() {
  serverMessage.value = "";
  if (!validateForm()) return;

  loading.value = true;
  const nextProfile = form.tipoUsuario === "tecnico" ? "tecnico" : "oficial";
  const fallbackUser = {
    ...(authStore.user || {}),
    nombre: String(form.nombre || "").trim(),
    email: form.email || authStore.user?.email || "",
    telefono: String(form.telefono || "").trim(),
    profesion: String(form.profesion || "").trim(),
    alias: String(form.alias || "").trim(),
    direccion: String(form.direccion || "").trim(),
    perfil: nextProfile,
  };

  try {
    const backendUser = await saveAgainstBackend();
    const normalized = {
      id: backendUser?.id || fallbackUser.id || "",
      nombre: backendUser?.nombre || fallbackUser.nombre,
      email: backendUser?.email || fallbackUser.email,
      telefono: backendUser?.telefono || "",
      profesion: backendUser?.profesion || "",
      alias: backendUser?.alias || "",
      direccion: backendUser?.direccion || "",
      perfil: backendUser?.perfil || nextProfile,
    };
    authStore.setUser(normalized);
    authStore.setAccessProfile(normalized.perfil);
    updateLocalFallback(normalized);
    serverMessage.value = "Perfil actualizado correctamente.";
  } catch (error) {
    authStore.setUser(fallbackUser);
    authStore.setAccessProfile(nextProfile);
    updateLocalFallback(fallbackUser);
    serverMessage.value = `${String(error?.message || "Sin conexion con backend.")} Se aplico respaldo local.`;
  } finally {
    loading.value = false;
  }
}

function goDashboard() {
  router.push("/vivienda/dashboard");
}

function goBack() {
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

.bg-orb { position: absolute; border-radius: 999px; filter: blur(60px); pointer-events: none; }
.orb-1 { width: 240px; height: 240px; background: rgba(68, 228, 255, 0.14); top: 60px; left: -20px; }
.orb-2 { width: 300px; height: 300px; background: rgba(194, 93, 255, 0.14); top: 0; right: -40px; }
.orb-3 { width: 260px; height: 260px; background: rgba(104, 91, 255, 0.12); bottom: 30px; left: 30%; }

.profile-shell { position: relative; z-index: 1; max-width: 1120px; margin: 0 auto; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
.topnav { display: flex; gap: 28px; align-items: center; }
.topnav a { color: rgba(255, 255, 255, 0.92); text-decoration: none; font-weight: 500; }
.user-pill { min-width: 200px; padding: 12px 16px; border-radius: 16px; text-align: right; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12); }
.user-pill span { display: block; font-size: 0.8rem; color: rgba(242,242,255,0.75); margin-bottom: 4px; }

.profile-card { border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.1); backdrop-filter: blur(18px); border-radius: 24px; padding: 26px; }
.card-tag { margin: 0 0 8px; color: #8fe8ff; font-size: 0.88rem; font-weight: 700; }
.card-header h1 { margin: 0 0 8px; }
.card-header p { margin: 0 0 18px; color: rgba(245,245,255,0.88); }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-group { display: flex; flex-direction: column; gap: 8px; }
.field-group.full { grid-column: 1 / -1; }
input, select {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.09);
  color: #fff;
  border-radius: 12px;
  padding: 11px 12px;
}
input[readonly] { opacity: 0.8; }
.invalid { border-color: rgba(255, 130, 154, 0.9); }
.error-text { color: #ff9dbb; margin: 0; font-size: 0.86rem; }
.server-text { margin-top: 12px; color: #8fe8ff; }
.actions { display: flex; justify-content: space-between; gap: 14px; margin-top: 18px; }
.btn { border: none; border-radius: 18px; padding: 12px 20px; font-size: 0.95rem; font-weight: 800; cursor: pointer; }
.btn-primary { background: linear-gradient(135deg, #2fc4ff 0%, #6a52ff 55%, #8b5cf6 100%); color: white; }
.btn-secondary { background: rgba(255,255,255,0.14); color: #fff; }

@media (max-width: 900px) {
  .grid-form { grid-template-columns: 1fr; }
}

@media (max-width: 780px) {
  .quantia-page { padding: 18px; }
  .topbar { flex-direction: column; align-items: stretch; }
  .topnav { justify-content: center; flex-wrap: wrap; gap: 16px; }
  .profile-card { padding: 20px; }
  .actions { flex-direction: column; }
  .btn { width: 100%; }
  .user-pill { text-align: center; }
}
</style>
