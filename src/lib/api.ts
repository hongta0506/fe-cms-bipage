const API_BASE = process.env.NEXT_PUBLIC_FASTSCHEMA_URL || "https://api.bipage.net";

// Default token for development (avoids login screen on load)
const DEFAULT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODI2MjA1OTEsInVzZXIiOnsiaWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGZhc3RzY2hlbWEuY29tIiwiYWN0aXZlIjp0cnVlLCJwcm92aWRlciI6ImxvY2FsIiwicm9sZV9pZHMiOlsxXX19.HR_wivFwx75pZuFQjWUgNAqr0ph0IhXrnppVXu3a4is";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: { code: string; message: string };
}

class ApiClient {
  private token: string | null = DEFAULT_TOKEN;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const json: ApiResponse<T> = await res.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    return json.data as T;
  }

  async login(login: string, password: string) {
    return this.request<{ token: string }>("/api/auth/local/login", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    });
  }

  async getMe() {
    return this.request<{ id: number; name: string; email: string; username: string; role: string; avatar?: string }>(
      "/api/auth/me",
    );
  }

  async getSchemas() {
    return this.request<
      Array<{ name: string; label: string; icon?: string; fields: Array<{ name: string; type: string }> }>
    >("/api/schema");
  }

  async getContent(
    schema: string,
    options?: { page?: number; pageSize?: number; filter?: string; sort?: string; domainId?: number | null },
  ) {
    const params = new URLSearchParams();
    if (options?.page != null && options.page > 0) params.set("page", String(options.page));
    if (options?.pageSize != null && options.pageSize > 0) params.set("limit", String(options.pageSize));
    if (options?.filter) params.set("filter", options.filter);
    if (options?.sort) params.set("sort", options.sort);
    if (options?.domainId) {
      params.set("filter", JSON.stringify({ domain_id: options.domainId }));
    }
    const query = params.toString();
    return this.request<{ items: unknown[]; total: number; per_page: number; current_page: number; last_page: number }>(
      `/api/content/${schema}${query ? `?${query}` : ""}`,
    );
  }

  async createContent(schema: string, data: Record<string, unknown>) {
    return this.request<unknown>(`/api/content/${schema}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateContent(schema: string, id: number, data: Record<string, unknown>) {
    return this.request<unknown>(`/api/content/${schema}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteContent(schema: string, id: number) {
    return this.request<unknown>(`/api/content/${schema}/${id}`, {
      method: "DELETE",
    });
  }

  async getStats() {
    return this.request<{ schemas: number; users: number; roles: number; files: number }>("/api/tool/stats");
  }
}

export const api = new ApiClient();
