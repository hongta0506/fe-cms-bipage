import "server-only";

import { assembleConfig, CONTRACT_VERSION, type RewardConfigSnapshot } from "./assembler";
import { assertFastSchemaAdmin, createRelease, readReleases, readRewardRows, updateRelease } from "./fastschema-server";

const NAKAMA_URL = process.env.NAKAMA_SERVER_URL ?? "http://localhost:7350";
const NAKAMA_HTTP_KEY = process.env.NAKAMA_HTTP_KEY;
const ADMIN_SECRET = process.env.REWARD_CONFIG_ADMIN_SECRET;
const CAMPAIGN_ID = process.env.REWARD_CAMPAIGN_ID ?? "default";

export class RewardBridgeError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
  }
}

// Nakama runtime returns camelCase JSON via Go json tags
interface NakamaVersion {
  version: number;
  hash: string;
  config: RewardConfigSnapshot;
  publishedAt: string;
  active: boolean;
}
interface NakamaAdminResult {
  active?: NakamaVersion;
  versions?: NakamaVersion[];
}
interface NakamaMutationResult {
  contractVersion: string;
  version: number;
  hash: string;
}
interface NakamaValidateResult {
  valid: boolean;
  errors?: string[];
}

async function nakamaRpc<T>(name: string, payload: Record<string, unknown>): Promise<T> {
  if (!NAKAMA_HTTP_KEY || !ADMIN_SECRET) throw new RewardBridgeError("Nakama server secrets are not configured", 503);
  const response = await fetch(`${NAKAMA_URL}/v2/rpc/${name}?http_key=${encodeURIComponent(NAKAMA_HTTP_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Nakama HTTP RPC requires double-encoded JSON string payload
    body: JSON.stringify(JSON.stringify({ contractVersion: CONTRACT_VERSION, adminSecret: ADMIN_SECRET, ...payload })),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const body = await response.text();
  if (!response.ok)
    throw new RewardBridgeError(`Nakama RPC ${name} failed: ${response.status} ${body.slice(0, 200)}`, response.status);
  try {
    const parsed = JSON.parse(body) as { payload?: string };
    return (typeof parsed.payload === "string" ? JSON.parse(parsed.payload) : (parsed.payload ?? parsed)) as T;
  } catch {
    throw new RewardBridgeError(`Nakama RPC ${name} returned invalid JSON`);
  }
}

async function assemble(): Promise<RewardConfigSnapshot> {
  const [tiers, prizes, tasks] = await Promise.all([
    readRewardRows<Parameters<typeof assembleConfig>[0][number]>("reward_tier"),
    readRewardRows<Parameters<typeof assembleConfig>[1][number]>("reward_prize"),
    readRewardRows<Parameters<typeof assembleConfig>[2][number]>("reward_task"),
  ]);
  return assembleConfig(tiers, prizes, tasks);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function currentRewardRelease() {
  await assertFastSchemaAdmin();
  return nakamaRpc<NakamaAdminResult>("reward_config_get_admin_v1", {});
}

export async function publishRewardConfig(): Promise<{ version: number; hash: string }> {
  const admin = await assertFastSchemaAdmin();
  const config = await assemble();

  // Validate first
  const validation = await nakamaRpc<NakamaValidateResult>("reward_config_validate_v1", { config });
  if (!validation.valid)
    throw new RewardBridgeError(`Config validation failed: ${(validation.errors ?? []).join("; ")}`, 422);

  // Publish to runtime
  const result = await nakamaRpc<NakamaMutationResult>("reward_config_publish_v1", { config });
  if (!result.version || !result.hash) throw new RewardBridgeError("Nakama publish returned incomplete result");

  // Record metadata in FastSchema — after runtime success
  try {
    await createRelease({
      campaign_id: CAMPAIGN_ID,
      version: result.version,
      status: "active",
      config,
      config_hash: result.hash,
      published_by: admin.username ?? admin.email ?? String(admin.id),
      published_at: new Date().toISOString(),
    });
  } catch {
    throw new RewardBridgeError(
      `Runtime publish succeeded (v${result.version}), but FastSchema metadata reconciliation failed. Manual fix needed.`,
      502,
    );
  }

  return { version: result.version, hash: result.hash };
}

export async function rollbackRewardConfig(version: number): Promise<{ version: number; hash: string }> {
  await assertFastSchemaAdmin();
  if (!Number.isSafeInteger(version) || version < 1)
    throw new RewardBridgeError("version must be a positive integer", 400);

  // Verify version exists in FastSchema metadata
  const known = await readReleases<{ id: number; version: number }>();
  const release = known.find((item) => item.version === version);
  if (!release) throw new RewardBridgeError("release version not found in metadata", 404);

  // Rollback in runtime
  const result = await nakamaRpc<NakamaMutationResult>("reward_config_rollback_v1", { version });
  if (!result.version || !result.hash) throw new RewardBridgeError("Nakama rollback returned incomplete result");

  // Update FastSchema metadata — after runtime success
  try {
    await Promise.all(
      known.map((item) => updateRelease(item.id, { status: item.version === version ? "active" : "retired" })),
    );
  } catch {
    throw new RewardBridgeError(
      `Runtime rollback succeeded (v${version}), but FastSchema metadata reconciliation failed. Manual fix needed.`,
      502,
    );
  }

  return { version: result.version, hash: result.hash };
}
