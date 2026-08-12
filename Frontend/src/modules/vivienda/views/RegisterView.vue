<template>
  <div class="register-page">
    <div class="register-wrapper">
      <section class="register-card">
        <div class="brand-block">
          <LogoQuantia class="brand-logo" />
          <p>
            Crea tu cuenta para comenzar a generar cotizaciones y estimaciones
            de obra de forma más ordenada.
          </p>
        </div>

        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre completo</label>
              <input
                id="nombre"
                v-model.trim="form.nombre"
                type="text"
                placeholder="Ingresa tu nombre completo"
                :class="{ invalid: errors.nombre }"
              />
              <small v-if="errors.nombre" class="error-text">{{ errors.nombre }}</small>
            </div>

            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                placeholder="ejemplo@correo.com"
                :class="{ invalid: errors.email }"
              />
              <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
            </div>

            <div class="form-group">
              <label for="tipoUsuario">Tipo de usuario</label>
              <select
                id="tipoUsuario"
                v-model="form.tipoUsuario"
                :class="{ invalid: errors.tipoUsuario }"
              >
                <option disabled value="">Selecciona una opción</option>
                <option value="general">Usuario general</option>
                <option value="tecnico">Técnico / Profesional</option>
              </select>
              <small v-if="errors.tipoUsuario" class="error-text">{{ errors.tipoUsuario }}</small>
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input
                id="telefono"
                v-model.trim="form.telefono"
                type="text"
                placeholder="Número de contacto"
                :class="{ invalid: errors.telefono }"
              />
              <small v-if="errors.telefono" class="error-text">{{ errors.telefono }}</small>
            </div>

            <div class="form-group">
              <label for="profesion">Profesión</label>
              <input
                id="profesion"
                v-model.trim="form.profesion"
                type="text"
                placeholder="Ej. Arquitecto, técnico, ingeniero"
                :class="{ invalid: errors.profesion }"
              />
              <small v-if="errors.profesion" class="error-text">{{ errors.profesion }}</small>
            </div>

            <div class="form-group">
              <label for="alias">Alias o nombre comercial</label>
              <input
                id="alias"
                v-model.trim="form.alias"
                type="text"
                placeholder="Opcional"
              />
            </div>

            <div class="form-group full-width">
              <label for="direccion">Dirección</label>
              <input
                id="direccion"
                v-model.trim="form.direccion"
                type="text"
                placeholder="Calle, número, colonia, municipio"
                :class="{ invalid: errors.direccion }"
              />
              <small v-if="errors.direccion" class="error-text">{{ errors.direccion }}</small>
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <div class="password-box">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mínimo 8 caracteres"
                  :class="{ invalid: errors.password }"
                />
                <button
                  type="button"
                  class="toggle-btn"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
              <small v-if="errors.password" class="error-text">{{ errors.password }}</small>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar contraseña</label>
              <div class="password-box">
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Repite tu contraseña"
                  :class="{ invalid: errors.confirmPassword }"
                />
                <button
                  type="button"
                  class="toggle-btn"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
              <small v-if="errors.confirmPassword" class="error-text">
                {{ errors.confirmPassword }}
              </small>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="form.acceptTerms" type="checkbox" />
              <span>Acepto los términos y condiciones</span>
            </label>
            <small v-if="errors.acceptTerms" class="error-text">{{ errors.acceptTerms }}</small>
          </div>

          <div v-if="serverMessage.text" :class="['server-message', serverMessage.type]">
            {{ serverMessage.text }}
          </div>

          <button class="submit-btn" type="submit" :disabled="loading">
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>

          <p class="login-link">
            ¿Ya tienes cuenta?
            <RouterLink to="/vivienda/login">Inicia sesión</RouterLink>
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { API_BASE_URL } from "@/config/apiBaseUrl"
import LogoQuantia from "@/components/common/LogoQuantia.vue"

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  nombre: '',
  email: '',
  telefono: '',
  profesion: '',
  alias: '',
  direccion: '',
  tipoUsuario: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  nombre: '',
  email: '',
  telefono: '',
  profesion: '',
  direccion: '',
  tipoUsuario: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

const serverMessage = reactive({
  type: '',
  text: ''
})

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  serverMessage.type = ''
  serverMessage.text = ''
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  if (!phone) return true
  return /^[0-9+\-\s()]{8,20}$/.test(phone)
}

function validateForm() {
  resetErrors()
  let isValid = true

  if (!form.nombre) {
    errors.nombre = 'El nombre es obligatorio.'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'El correo es obligatorio.'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = 'Ingresa un correo válido.'
    isValid = false
  }

  if (!validatePhone(form.telefono)) {
    errors.telefono = 'Ingresa un teléfono válido.'
    isValid = false
  }

  if (!form.profesion) {
    errors.profesion = 'La profesión es obligatoria.'
    isValid = false
  }

  if (!form.direccion) {
    errors.direccion = 'La dirección es obligatoria.'
    isValid = false
  }

  if (!form.tipoUsuario) {
    errors.tipoUsuario = 'Selecciona el tipo de usuario.'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'La contraseña es obligatoria.'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
    isValid = false
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = 'Debes aceptar los términos y condiciones.'
    isValid = false
  }

  return isValid
}

function upsertLocalUser() {
  const users = JSON.parse(localStorage.getItem('quantia_users') || '[]')
  const perfil = form.tipoUsuario === 'tecnico' ? 'tecnico' : 'oficial'
  const next = {
    nombre: form.nombre,
    email: form.email,
    telefono: form.telefono,
    profesion: form.profesion,
    alias: form.alias,
    direccion: form.direccion,
    password: form.password,
    perfil
  }

  const index = users.findIndex(
    (item) => String(item.email || '').toLowerCase() === form.email.trim().toLowerCase()
  )

  if (index >= 0) {
    users[index] = { ...users[index], ...next }
  } else {
    users.push(next)
  }

  localStorage.setItem('quantia_users', JSON.stringify(users))
  authStore.setAccessProfile(perfil)
}

async function handleRegister() {
  if (!validateForm()) return

  loading.value = true
  resetErrors()

  try {
    const payload = {
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      profesion: form.profesion,
      alias: form.alias,
      direccion: form.direccion,
      tipo_usuario: form.tipoUsuario,
      password: form.password
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      serverMessage.type = 'error'
      serverMessage.text = data.detail || 'No se pudo completar el registro.'
      return
    }

    upsertLocalUser()
    serverMessage.type = 'success'
    serverMessage.text = 'Cuenta creada correctamente.'

    setTimeout(() => {
      router.push('/vivienda/login')
    }, 1200)
  } catch (error) {
    upsertLocalUser()
    serverMessage.type = 'success'
    serverMessage.text = 'Cuenta creada en modo local. Puedes iniciar sesión.'
    console.error('Register error:', error)

    setTimeout(() => {
      router.push('/vivienda/login')
    }, 1200)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: linear-gradient(135deg, #f4f7fb 0%, #e9eef7 100%);
}

.register-wrapper {
  width: 100%;
  max-width: 980px;
}

.register-card {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 32px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.brand-block {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  color: #ffffff;
  padding: 48px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}

.brand-logo {
  align-self: flex-start;
}

.brand-block p {
  font-size: 1rem;
  line-height: 1.7;
  opacity: 0.95;
}

.register-form {
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.95rem;
  outline: none;
  transition: 0.2s ease;
  background: #fff;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.password-box {
  display: flex;
  gap: 10px;
}

.password-box input {
  flex: 1;
}

.toggle-btn {
  border: none;
  border-radius: 12px;
  padding: 0 14px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.toggle-btn:hover {
  background: #dbeafe;
}

.checkbox-group {
  margin-top: 18px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 0.95rem;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
}

.submit-btn {
  margin-top: 22px;
  padding: 14px 18px;
  border: none;
  border-radius: 14px;
  background: #2563eb;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  margin-top: 16px;
  text-align: center;
  color: #475569;
  font-size: 0.95rem;
}

.login-link a {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.error-text {
  margin-top: 6px;
  font-size: 0.82rem;
  color: #dc2626;
}

.invalid {
  border-color: #dc2626 !important;
}

.server-message {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
}

.server-message.success {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.server-message.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

@media (max-width: 860px) {
  .register-card {
    grid-template-columns: 1fr;
  }

  .brand-block {
    padding: 36px 28px 24px;
  }

  .register-form {
    padding: 28px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: auto;
  }
}
</style>

