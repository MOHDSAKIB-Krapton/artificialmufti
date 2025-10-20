import { getStoredToken } from "@/utils/token";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ApiResponse, BackendEnvelope } from "./types";

/**
 * HttpClient class provides consistent HTTP request methods with unified error and response handling.
 */
class HttpClient {
  private axiosInstance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BACKEND_BASE_URL!,
    timeout: 15000,
  });

  constructor() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await getStoredToken();
        console.log("Base url => ", process.env.EXPO_PUBLIC_BACKEND_BASE_URL);
        console.log("Retrieved token:", token);
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        config.headers["Content-Type"] = "application/json";
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private async handleResponse<T>(
    request: Promise<AxiosResponse<BackendEnvelope<T>>>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await request;

      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error: any) {
      const formatted = this.formatError(error);

      return {
        success: false,
        data: null,
        error: formatted,
      };
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.handleResponse(this.axiosInstance.get(url));
  }

  // async getMany<T>(urls: string[]): Promise<ApiResponse<T>[]> {
  //   const promises = urls.map((url) => this.get<T>(url));
  //   const results = await Promise.allSettled(promises);

  //   return results.map((result) =>
  //     result.status === "fulfilled"
  //       ? result.value
  //       : createErrorResponse(result.reason, 500)
  //   );
  // }

  async post<T, R>(url: string, data: T): Promise<ApiResponse<R>> {
    return this.handleResponse(this.axiosInstance.post(url, data));
  }

  async patch<T, R>(url: string, data: T): Promise<ApiResponse<R>> {
    return this.handleResponse(this.axiosInstance.patch(url, data));
  }

  async put<T, R>(url: string, data: T): Promise<ApiResponse<R>> {
    return this.handleResponse(this.axiosInstance.put(url, data));
  }

  async delete<R>(url: string): Promise<ApiResponse<R>> {
    return this.handleResponse(this.axiosInstance.delete(url));
  }

  /**
   * Formats Axios error messages for logging/debugging.
   */
  private formatError(error: AxiosError): string {
    if (error.response) {
      const data = error.response.data as any;
      const message =
        data?.message || error.response.statusText || "Unknown server error";
      return `${error.response.status}: ${message}`;
    } else if (error.request) {
      return "Network error: No response received from server";
    } else {
      return `Request setup error: ${error.message}`;
    }
  }
}

const Http = new HttpClient();
export default Http;
