import axios from "axios";

const TOKEN_KEY = "fund_tracker_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLogin) onUnauthorized?.();
    return Promise.reject(error);
  }
);

/** Turn any API/network error into a short, readable sentence. */
export function errorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (!err.response) return "Cannot reach the server. Check that the backend is running.";
  const detail = err.response.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = d.loc?.[d.loc.length - 1];
        const msg = String(d.msg || "").replace(/^Value error, /, "");
        return field && field !== "body" ? `${field}: ${msg}` : msg;
      })
      .join(" ");
  }
  return fallback;
}

export default api;
