import { CONSTANT } from "@/lib/constant";
import { getBasePath } from "@/lib/utils";
import type { apiResponseType, BasePathType, IParams } from "@/types";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
// Build base URL - use relative URLs in development for Vite proxy
const isDev = (import.meta as any).env?.DEV;
let baseURL;

if (isDev) {
  // In development, use relative URLs to work with Vite proxy
  baseURL = "/api";
} else {
  // In production, use full URLs
  const apiProtocol = (import.meta as any).env?.VITE_API_PROTOCOL || "http";
  const apiHost = (import.meta as any).env?.VITE_API_HOST || "localhost";
  const apiPort = (import.meta as any).env?.VITE_API_PORT ?? "3000";
  const apiPrefix = (import.meta as any).env?.VITE_API_PREFIX || "/api";
  baseURL = `${apiProtocol}://${apiHost}${apiPort ? `:${apiPort}` : ""}${apiPrefix}`;
}

console.log('API Base URL:', baseURL, '(isDev:', isDev, ')');

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const tokenHeaderInterceptor = (
  config: AxiosRequestConfig
): AxiosRequestConfig => {
  const token = localStorage.getItem(CONSTANT.TOKEN_SESSION_KEY);
  if (!token || !config?.headers) return config;
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
};

axiosInstance.interceptors.request.use(tokenHeaderInterceptor as never);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    switch (status) {
      case 401:
        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        localStorage.removeItem("regionId");
        
        // Dispatch custom event to notify auth context
        window.dispatchEvent(new CustomEvent('auth-logout'));
        
        // Navigate to login page
        window.location.href = "/login";
        break;
      case 403:
        console.error("Forbidden access");
        break;
      case 500:
        console.error("Internal server error");
        break;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

export const saveAuthTokenToAxios = () => {
  const token = localStorage.getItem(CONSTANT.TOKEN_SESSION_KEY);
  if (token) {
    axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
  }
}

const extractor = <T>(response: AxiosResponse<apiResponseType<T>>) => {
  if (response?.status == undefined) throw new Error(response.statusText);
  const { status } = response;
  // Accept both 200 and 201 as success status codes
  if (status !== 200 && status !== 201) throw new Error(response.statusText);
  return { ...response.data };
};

export const Get = async <T>(
  base: BasePathType,
  path: string,
  params?: IParams,
  signal?: AbortSignal
) => {
  axiosInstance.defaults.baseURL = getBasePath(base);
  const response = await axiosInstance
    .get<apiResponseType<T>>(path, {
      params,
      signal,
    });
  return extractor(response);
};

export const Post = async <T>(
  base: BasePathType,
  path: string,
  payload?: IParams,
  signal?: AbortSignal
) => {
  axiosInstance.defaults.baseURL = getBasePath(base);
  const response = await axiosInstance
    .post<apiResponseType<T>>(path, payload, { signal });
  return extractor(response);
};

export const Put = async <T>(
  base: BasePathType,
  path: string,
  payload?: IParams,
  signal?: AbortSignal
) => {
  axiosInstance.defaults.baseURL = getBasePath(base);
  const response = await axiosInstance
    .post<apiResponseType<T>>(path, payload, { signal });
  return extractor(response);
};

export const Patch = async <T>(
  base: BasePathType,
  path: string,
  payload?: IParams,
  signal?: AbortSignal
) => {
  axiosInstance.defaults.baseURL = getBasePath(base);
  const response = await axiosInstance
    .post<apiResponseType<T>>(path, payload, { signal });
  return extractor(response);
};
