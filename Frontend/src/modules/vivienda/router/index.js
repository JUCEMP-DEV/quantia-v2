import LandingView from "@/modules/vivienda/views/LandingView.vue";
import LoginView from "@/modules/vivienda/views/LoginView.vue";
import RegisterView from "@/modules/vivienda/views/RegisterView.vue";
import DashboardView from "@/modules/vivienda/views/DashboardView.vue";
import DocumentosView from "@/modules/vivienda/views/DocumentosView.vue";
import ProfileSettingsView from "@/modules/vivienda/views/ProfileSettingsView.vue";
import CotizacionRegistroView from "@/modules/vivienda/views/CotizacionRegistroView.vue";
import CotizacionClasificacionView from "@/modules/vivienda/views/CotizacionClasificacionView.vue";
import CotizacionModeloEspacialView from "@/modules/vivienda/views/CotizacionModeloEspacialView.vue";
import CotizacionPreliminaresView from "@/modules/vivienda/views/CotizacionPreliminaresView.vue";
import CotizacionModuloView from "@/modules/vivienda/views/CotizacionModuloView.vue";
import CotizacionRevisionInferenciaView from "@/modules/vivienda/views/CotizacionRevisionInferenciaView.vue";
import CotizacionImprimibleView from "@/modules/vivienda/views/CotizacionImprimibleView.vue";

const BASE_FLOW = ["registro", "clasificacion", "alcance", "modelo_espacial", "preliminares"];

const viviendaRoutes = [
  {
    path: "/vivienda",
    redirect: "/vivienda/landing",
  },
  {
    path: "/vivienda/landing",
    name: "vivienda-landing",
    component: LandingView,
    meta: {
      title: "Quantia Vivienda",
      step: 0,
    },
  },
  {
    path: "/vivienda/acceso",
    redirect: "/vivienda/login",
    meta: {
      title: "Login | Quantia Vivienda",
      step: 0,
    },
  },
  {
    path: "/vivienda/login",
    name: "vivienda-login",
    component: LoginView,
    meta: {
      title: "Login | Quantia Vivienda",
      step: 1,
    },
  },
  {
    path: "/vivienda/registro",
    name: "vivienda-registro-usuario",
    component: RegisterView,
    meta: {
      title: "Registro | Quantia Vivienda",
      step: 1,
    },
  },
  {
    path: "/vivienda/dashboard",
    name: "vivienda-dashboard",
    component: DashboardView,
    meta: {
      title: "Dashboard | Quantia Vivienda",
      step: 2,
      requiresAuth: true,
    },
  },
  {
    path: "/vivienda/documentos",
    name: "vivienda-documentos",
    component: DocumentosView,
    meta: {
      title: "Documentos | Quantia Vivienda",
      step: 2,
      requiresAuth: true,
    },
  },
  {
    path: "/vivienda/perfil",
    name: "vivienda-perfil",
    component: ProfileSettingsView,
    meta: {
      title: "Perfil de usuario | Quantia Vivienda",
      step: 2,
      requiresAuth: true,
    },
  },
  {
    path: "/vivienda/cotizacion/registro",
    name: "cotizacion-registro",
    component: CotizacionRegistroView,
    meta: {
      title: "Registro de cotizacion | Quantia Vivienda",
      step: 3,
      requiresAuth: true,
    },
  },
  {
    path: "/vivienda/cotizacion/clasificacion",
    name: "cotizacion-clasificacion",
    component: CotizacionClasificacionView,
    meta: {
      title: "Clasificacion de cotizacion | Quantia Vivienda",
      step: 4,
      requiresAuth: true,
      requiresFlow: ["registro"],
    },
  },
  {
    path: "/vivienda/cotizacion/alcance",
    name: "cotizacion-alcance",
    redirect: "/vivienda/cotizacion/clasificacion",
    meta: {
      title: "Alcance de cotizacion | Quantia Vivienda",
      step: 5,
      requiresAuth: true,
      requiresFlow: ["registro", "clasificacion"],
    },
  },
  {
    path: "/vivienda/cotizacion/modelo-espacial",
    name: "cotizacion-modelo-espacial",
    component: CotizacionModeloEspacialView,
    meta: {
      title: "Distribucion Arquitectonica | Quantia Vivienda",
      step: 6,
      requiresAuth: true,
      requiresFlow: ["registro", "clasificacion", "alcance"],
    },
  },
  {
    path: "/vivienda/cotizacion/datos-generales",
    redirect: "/vivienda/cotizacion/modelo-espacial",
  },
  {
    path: "/vivienda/cotizacion/estructura-espacial",
    redirect: "/vivienda/cotizacion/modelo-espacial",
  },
  {
    path: "/vivienda/cotizacion/colindancias",
    redirect: "/vivienda/cotizacion/modelo-espacial",
  },
  {
    path: "/vivienda/cotizacion/validacion-espacial",
    redirect: "/vivienda/cotizacion/modelo-espacial",
  },
  {
    path: "/vivienda/cotizacion/preliminares",
    name: "cotizacion-preliminares",
    component: CotizacionPreliminaresView,
    meta: {
      title: "Preliminares | Quantia Vivienda",
      step: 7,
      requiresAuth: true,
      requiresFlow: ["registro", "clasificacion", "alcance", "modelo_espacial"],
    },
  },
  {
    path: "/vivienda/cotizacion/cimentacion",
    name: "cotizacion-cimentacion",
    component: CotizacionModuloView,
    meta: {
      title: "Cimentacion | Quantia Vivienda",
      step: 8,
      moduleKey: "cimentacion",
      requiresAuth: true,
      requiresFlow: [...BASE_FLOW],
    },
  },
  {
    path: "/vivienda/cotizacion/estructura",
    name: "cotizacion-estructura",
    component: CotizacionModuloView,
    meta: {
      title: "Estructura | Quantia Vivienda",
      step: 9,
      moduleKey: "estructura",
      requiresAuth: true,
      requiresFlow: [...BASE_FLOW, "cimentacion"],
    },
  },
  {
    path: "/vivienda/cotizacion/albanileria",
    name: "cotizacion-albanileria",
    component: CotizacionModuloView,
    meta: {
      title: "Albanileria | Quantia Vivienda",
      step: 10,
      moduleKey: "albanileria",
      requiresAuth: true,
      requiresFlow: [...BASE_FLOW, "cimentacion", "estructura"],
    },
  },
  {
    path: "/vivienda/cotizacion/instalaciones",
    name: "cotizacion-instalaciones",
    component: CotizacionModuloView,
    meta: {
      title: "Instalaciones | Quantia Vivienda",
      step: 11,
      moduleKey: "instalaciones",
      requiresAuth: true,
      requiresFlow: [...BASE_FLOW, "cimentacion", "estructura", "albanileria"],
    },
  },
  {
    path: "/vivienda/cotizacion/acabados",
    name: "cotizacion-acabados",
    component: CotizacionModuloView,
    meta: {
      title: "Acabados | Quantia Vivienda",
      step: 12,
      moduleKey: "acabados",
      requiresAuth: true,
      requiresFlow: [...BASE_FLOW, "cimentacion", "estructura", "albanileria", "instalaciones"],
    },
  },
  {
    path: "/vivienda/cotizacion/complementarios",
    name: "cotizacion-complementarios",
    component: CotizacionModuloView,
    meta: {
      title: "Complementarios y equipamiento | Quantia Vivienda",
      step: 13,
      moduleKey: "complementarios_y_equipamiento",
      requiresAuth: true,
      requiresFlow: [
        ...BASE_FLOW,
        "cimentacion",
        "estructura",
        "albanileria",
        "instalaciones",
        "acabados",
      ],
    },
  },
  {
    path: "/vivienda/cotizacion/revision-inferencia",
    name: "cotizacion-revision-inferencia",
    component: CotizacionRevisionInferenciaView,
    meta: {
      title: "Revision de inferencia | Quantia Vivienda",
      step: 14,
      requiresAuth: true,
      requiresFlow: [
        ...BASE_FLOW,
        "cimentacion",
        "estructura",
        "albanileria",
        "instalaciones",
        "acabados",
        "complementarios",
      ],
    },
  },
  {
    path: "/vivienda/cotizacion/variables",
    redirect: "/vivienda/cotizacion/modelo-espacial",
  },
  {
    path: "/vivienda/cotizacion/parametros",
    redirect: "/vivienda/cotizacion/modelo-espacial",
  },
  {
    path: "/vivienda/cotizacion/resumen",
    redirect: "/vivienda/cotizacion/revision-inferencia",
  },
  {
    path: "/vivienda/cotizacion/resultados",
    redirect: "/vivienda/cotizacion/imprimible",
  },
  {
    path: "/vivienda/cotizacion/imprimible",
    name: "cotizacion-imprimible",
    component: CotizacionImprimibleView,
    meta: {
      title: "Imprimible | Quantia Vivienda",
      step: 16,
      requiresAuth: true,
      requiresFlow: ["resultado"],
    },
  },
];

export default viviendaRoutes;
