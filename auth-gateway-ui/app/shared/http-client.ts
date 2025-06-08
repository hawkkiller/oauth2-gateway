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
    // join baseUrl and url, but if url starts with /, remove it
    const fullUrl = this.baseUrl.endsWith("/")
      ? this.baseUrl + url.slice(1)
      : this.baseUrl + url;

    console.log(fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      ...options,
      credentials: options.credentials ?? "include",
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
