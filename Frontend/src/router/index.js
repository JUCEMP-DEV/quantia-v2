import { createRouter, createWebHistory } from "vue-router";
import viviendaRoutes from "@/modules/vivienda/router";
import { useAuthStore } from "@/stores/authStore";
import { useViviendaStore } from "@/modules/vivienda/store/viviendaStore";

const routes = [
  {
    path: "/",
    redirect: "/vivienda/landing",
  },
  ...viviendaRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const FLOW_REDIRECTS = {
  registro: "/vivienda/cotizacion/registro",
  clasificacion: "/vivienda/cotizacion/clasificacion",
  alcance: "/vivienda/cotizacion/alcance",
  modelo_espacial: "/vivienda/cotizacion/modelo-espacial",
  preliminares: "/vivienda/cotizacion/preliminares",
  cimentacion: "/vivienda/cotizacion/cimentacion",
  estructura: "/vivienda/cotizacion/estructura",
  albanileria: "/vivienda/cotizacion/albanileria",
  instalaciones: "/vivienda/cotizacion/instalaciones",
  acabados: "/vivienda/cotizacion/acabados",
  complementarios: "/vivienda/cotizacion/complementarios",
  datos_generales: "/vivienda/cotizacion/modelo-espacial",
  estructura_espacial: "/vivienda/cotizacion/modelo-espacial",
  colindancias: "/vivienda/cotizacion/modelo-espacial",
  validacion_espacial: "/vivienda/cotizacion/modelo-espacial",
  revision_inferencia: "/vivienda/cotizacion/revision-inferencia",
  variables: "/vivienda/cotizacion/modelo-espacial",
  resumen: "/vivienda/cotizacion/revision-inferencia",
  resultado: "/vivienda/cotizacion/revision-inferencia",
};

function hasFlowData(viviendaStore, key) {
  if (key === "registro") return viviendaStore.hasRegistroData;
  if (key === "clasificacion") return viviendaStore.hasClasificacionData;
  if (key === "alcance") return viviendaStore.hasAlcanceData;
  if (key === "modelo_espacial") return viviendaStore.hasModeloEspacialData;
  if (key === "preliminares") return viviendaStore.hasPreliminaresData;
  if (key === "cimentacion") return viviendaStore.hasCimentacionData;
  if (key === "estructura") return viviendaStore.hasEstructuraData;
  if (key === "albanileria") return viviendaStore.hasAlbanileriaData;
  if (key === "instalaciones") return viviendaStore.hasInstalacionesData;
  if (key === "acabados") return viviendaStore.hasAcabadosData;
  if (key === "complementarios") return viviendaStore.hasComplementariosData;
  if (key === "datos_generales") return viviendaStore.hasDatosGeneralesData;
  if (key === "estructura_espacial") return viviendaStore.hasEstructuraEspacialData;
  if (key === "colindancias") return viviendaStore.hasColindanciasData;
  if (key === "validacion_espacial") return viviendaStore.hasValidacionEspacialData;
  if (key === "revision_inferencia") return viviendaStore.hasRevisionInferenciaData;
  if (key === "variables") return viviendaStore.hasVariablesData;
  if (key === "resumen") return viviendaStore.hasRevisionInferenciaData;
  if (key === "resultado") return viviendaStore.hasResultadoData;
  return true;
}

router.beforeEach((to) => {
  const authStore = useAuthStore();
  const viviendaStore = useViviendaStore();

  if (to.meta?.requiresAuth && !authStore.user) {
    if (to.path === "/vivienda/login" || to.path === "/vivienda/landing") return true;
    return { path: "/vivienda/login" };
  }

  const requiredFlow = Array.isArray(to.meta?.requiresFlow) ? to.meta.requiresFlow : [];

  for (const stepKey of requiredFlow) {
    if (!hasFlowData(viviendaStore, stepKey)) {
      const fallbackPath = FLOW_REDIRECTS[stepKey] || "/vivienda/dashboard";
      if (fallbackPath === to.path) return true;
      return { path: fallbackPath };
    }
  }

  return true;
});

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title;
  } else {
    document.title = "Quantia";
  }
});

export default router;
