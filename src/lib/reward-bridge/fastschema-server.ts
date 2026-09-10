import "server-only";

import { cookies } from "next/headers";

const FASTSCHEMA_URL = process.env.NEXT_PUBLIC_FASTSCHEMA_URL ?? "https://api.bipage.net";

export class FastSchemaBridgeError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
  }
}

type ApiResponse<T> = { data?: T; error?: { message?: string } };
type ContentResponse<T> = { items: T[]; total: number };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) throw new FastSchemaBridgeError("Admin authentication required", 401);

  const response = await fetch(`${FASTSCHEMA_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || body.error) {
    throw new FastSchemaBridgeError(body.error?.message ?? "FastSchema request failed", response.status);
  }
  return body.data as T;
}

export async function assertFastSchemaAdmin(): Promise<{ id: number; username?: string; email?: string }> {
  return request("/api/auth/me");
}

export async function readRewardRows<T>(schema: string): Promise<T[]> {
  const result = await request<ContentResponse<T>>(`/api/content/${encodeURIComponent(schema)}?page=1&limit=1000`);
  return result.items;
}

export async function createRelease(data: Record<string, unknown>): Promise<void> {
  await request("/api/content/reward_config_release", { method: "POST", body: JSON.stringify(data) });
}

export async function readReleases<T>(): Promise<T[]> {
  return readRewardRows<T>("reward_config_release");
}

export async function updateRelease(id: number, data: Record<string, unknown>): Promise<void> {
  await request(`/api/content/reward_config_release/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
