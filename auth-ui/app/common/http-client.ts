import type { BackendResponse } from "./response";

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    // The backend returns a wrapper with ok, data, and error fields
    return data as BackendResponse<T>;
  }

  async get<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  async post<T>(
    url: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    url: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }
}

export const httpClient = new HttpClient();
export { HttpClient };
