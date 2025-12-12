import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// Import authService for token validation
// Note: Using dynamic import to avoid circular dependency
let authService: any = null;

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token and validate it
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          // Lazy load authService to avoid circular dependency
          if (!authService) {
            const module = await import("../services/authService");
            authService = module.authService;
          }

          // Check if token is valid before making request
          if (!authService.isTokenValid()) {
            // Token is expired, clear it and redirect
            authService.removeToken();
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
            return Promise.reject(new Error("Token expired"));
          }

          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401 errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Lazy load authService to avoid circular dependency
          if (!authService) {
            const module = await import("../services/authService");
            authService = module.authService;
          }

          authService.removeToken();
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async fetch<T = any>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    const response = await this.axiosInstance.request<T>({
      url,
      ...options,
    });
    return response.data;
  }
}

const api = new ApiClient();
export default api;
