import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const api = axios.create({ baseURL });

let accessToken = null;
let refreshToken = null;
let onAuthFailure = () => {};
let refreshRequest = null;

export function setTokens(tokens) {
  accessToken = tokens.access;
  refreshToken = tokens.refresh;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

export function hasAccessToken() {
  return Boolean(accessToken);
}

export function setAuthFailureHandler(handler) {
  onAuthFailure = handler;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !refreshToken ||
      originalRequest.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      refreshRequest ??= axios
        .post(`${baseURL}/auth/refresh/`, { refresh: refreshToken })
        .then(({ data }) => {
          accessToken = data.access;
          if (data.refresh) refreshToken = data.refresh;
          return accessToken;
        })
        .finally(() => {
          refreshRequest = null;
        });

      const newAccessToken = await refreshRequest;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      onAuthFailure();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
