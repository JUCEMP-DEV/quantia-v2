import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./styles/global.css";

const app = createApp(App);
const pinia = createPinia();
const PERSISTED_STORE_IDS = new Set(["auth", "vivienda"]);
const STORAGE_VERSION = "v2";

pinia.use(({ store }) => {
  if (typeof window === "undefined") return;
  if (!PERSISTED_STORE_IDS.has(store.$id)) return;

  const key = `quantia_${store.$id}_state_${STORAGE_VERSION}`;
  const legacyKey = `quantia_${store.$id}_state_v1`;

  try {
    window.localStorage.removeItem(legacyKey);
  } catch {
    // Ignore cleanup errors.
  }

  try {
    const saved = window.localStorage.getItem(key);
    if (saved) {
      store.$patch(JSON.parse(saved));
      if (store.$id === "vivienda" && typeof store.sanitizeHydratedState === "function") {
        store.sanitizeHydratedState();
      }
    }
  } catch {
    // Ignore malformed or unavailable localStorage.
  }

  store.$subscribe(
    (_mutation, state) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // Ignore storage write errors.
      }
    },
    { detached: true }
  );
});

app.use(pinia);
app.use(router);

app.mount("#app");
