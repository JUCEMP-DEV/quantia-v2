const runtimeEnv = import.meta.env || {};
const processEnv = typeof process !== "undefined" ? process.env || {} : {};

const envBaseUrl = String(
  runtimeEnv.VITE_BACKEND_URL ||
    runtimeEnv.VITE_API_URLBackend ||
    runtimeEnv.VITE_API_BASE_URL ||
    processEnv.VITE_BACKEND_URL ||
    processEnv.VITE_API_URLBackend ||
    processEnv.VITE_API_BASE_URL ||
    ""
)
  .trim()
  .replace(/\/+$/, "");

if (runtimeEnv.PROD && !envBaseUrl) {
  throw new Error("Define VITE_BACKEND_URL en produccion.");
}

export const API_BASE_URL = envBaseUrl;

export function buildApiUrl(path = "") {
  const normalizedPath = `/${String(path || "").replace(/^\/+/, "")}`;
  if (!API_BASE_URL) return normalizedPath;
  if (API_BASE_URL.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${API_BASE_URL}${normalizedPath.slice(4)}`;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}
