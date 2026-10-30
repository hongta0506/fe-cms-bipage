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

// ── Extended Admin Nakama RPCs ─────────────────────────────────────────────────

export interface AdminSpinRecord {
  postingId: string;
  playerId: string;
  amount: number;
  metadata: {
    prizeId?: string;
    prizeName?: string;
    tierId?: string;
    spinCost?: number;
    pointsAwarded?: number;
  };
  createdAt: number;
}

export interface SpinsListResponse {
  contractVersion: string;
  total: number;
  spins: AdminSpinRecord[];
}

export async function listSpinsAdmin(limit = 50, offset = 0, playerId?: string): Promise<SpinsListResponse> {
  await assertFastSchemaAdmin();
  return nakamaRpc<SpinsListResponse>("reward_spins_list_admin_v1", { limit, offset, playerId: playerId || undefined });
}

export interface AdminPlayerItem {
  id: string;
  username: string;
  email: string;
  balance: number;
  version: number;
  createTime: number;
}

export interface PlayersListResponse {
  contractVersion: string;
  total: number;
  players: AdminPlayerItem[];
}

export async function listPlayersAdmin(query = "", limit = 50, offset = 0): Promise<PlayersListResponse> {
  await assertFastSchemaAdmin();
  return nakamaRpc<PlayersListResponse>("reward_players_list_admin_v1", {
    query: query || undefined,
    limit,
    offset,
  });
}

export interface PlayerAdminResponse {
  contractVersion: string;
  playerId: string;
  username?: string;
  email?: string;
  balance: number;
  version: number;
  referralCode: string;
  recentLedger: Array<{
    postingId: string;
    amount: number;
    balanceAfter: number;
    postingType: string;
    sourceReference: string;
    metadata: string;
    createdAt: string;
  }>;
}

export async function getPlayerAdmin(playerId: string, limit = 20): Promise<PlayerAdminResponse> {
  await assertFastSchemaAdmin();
  return nakamaRpc<PlayerAdminResponse>("reward_player_get_admin_v1", { playerId, limit });
}

export async function adjustPointsAdmin(playerId: string, amount: number, reason: string) {
  await assertFastSchemaAdmin();
  return nakamaRpc<{ contractVersion: string; success: boolean; newBalance: number; postingId: string }>(
    "reward_points_adjust_admin_v1",
    { playerId, amount, reason },
  );
}

export interface RedemptionAdminRecord {
  redemptionId: string;
  playerId: string;
  postingId: string;
  itemId: string;
  itemName: string;
  pointsCost: number;
  recipientName: string;
  phone: string;
  address: string;
  note: string;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface RedemptionsAdminResponse {
  contractVersion: string;
  total: number;
  items: RedemptionAdminRecord[];
}

export async function listRedemptionsAdmin(status?: string, limit = 50, offset = 0): Promise<RedemptionsAdminResponse> {
  await assertFastSchemaAdmin();
  return nakamaRpc<RedemptionsAdminResponse>("reward_redemptions_admin_v1", { action: "list", status: status || undefined, limit, offset });
}

export async function updateRedemptionAdmin(redemptionId: string, newStatus: string, reason?: string, trackingCode?: string) {
  await assertFastSchemaAdmin();
  return nakamaRpc<{ contractVersion: string; success: boolean; redemptionId: string; status: string; pointsRefunded?: number }>(
    "reward_redemptions_admin_v1",
    { action: "update_status", redemptionId, newStatus, reason: reason || undefined, trackingCode: trackingCode || undefined },
  );
}

export interface LeaderboardAdminResponse {
  contractVersion: string;
  topPoints: Array<{ username: string; score: number; rank: number; numScore: number; updatedAt: number }>;
  topSpins: Array<{ username: string; score: number; rank: number; numScore: number; updatedAt: number }>;
}

export async function getLeaderboardAdmin(): Promise<LeaderboardAdminResponse> {
  await assertFastSchemaAdmin();
  return nakamaRpc<LeaderboardAdminResponse>("leaderboard_get_v1", {});
}
