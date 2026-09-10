/**
 * Reward publish bridge – assembler
 * Maps FastSchema snake_case CMS rows to exact Nakama config contract (contractVersion "1").
 * Server-only: imported only by route handlers. No client import.
 */

export const CONTRACT_VERSION = "1";

// ── FastSchema row shapes ────────────────────────────────────────────────────

export interface FsTier {
  tier_id: string;
  tier_name: string;
  cost_per_spin: number;
  max_spins?: number | null;
  period?: string | null;
  allowed_days?: number[] | null;
  enabled: boolean;
  sort_order: number;
}

export interface FsPrize {
  tier_id: string;
  prize_id: string;
  name: string;
  points: number;
  weight: number;
  schedule_date?: string | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
  enabled: boolean;
  sort_order: number;
}

export interface FsTask {
  task_id: string;
  title: string;
  description?: string | null;
  task_type: string;
  action_type: string;
  target_route?: string | null;
  required_count?: number | null;
  reward_points: number;
  max_daily_claims?: number | null;
  cooldown_sec?: number | null;
  prerequisites?: string[] | null;
  starts_at?: string | null;
  ends_at?: string | null;
  enabled: boolean;
  sort_order: number;
}

// ── Nakama runtime config contract ────────────────────────────────────────────

export interface SpinPrize {
  id: string;
  name: string;
  weight: number;
  points: number;
  schedule?: { date?: string; startTime?: string; endTime?: string };
}

export interface SpinTier {
  tierId: string;
  tierName: string;
  costPerSpin: number;
  prizes: SpinPrize[];
  period?: string;
  maxSpins?: number;
  allowedDays?: number[];
}

export interface SpinMatrix {
  tiers: SpinTier[];
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  type: string;
  actionType: string;
  prerequisites: string[];
  targetRoute?: string;
  requiredCount?: number;
  maxDailyClaims?: number;
  cooldownSec?: number;
}

export interface TaskChain {
  tasks: TaskItem[];
}

export interface RewardConfigSnapshot {
  spin: SpinMatrix;
  tasks: TaskChain;
}

// ── Assembly ─────────────────────────────────────────────────────────────────

export function assembleConfig(tiers: FsTier[], prizes: FsPrize[], tasks: FsTask[]): RewardConfigSnapshot {
  const enabledTiers = tiers.filter((t) => t.enabled).sort((a, b) => a.sort_order - b.sort_order);

  const prizesByTier = new Map<string, FsPrize[]>();
  for (const p of prizes) {
    if (!p.enabled) continue;
    const list = prizesByTier.get(p.tier_id) ?? [];
    list.push(p);
    prizesByTier.set(p.tier_id, list);
  }

  const spinTiers: SpinTier[] = enabledTiers.map((t) => {
    const tierPrizes = (prizesByTier.get(t.tier_id) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p): SpinPrize => {
        const prize: SpinPrize = {
          id: p.prize_id,
          name: p.name,
          weight: p.weight,
          points: p.points,
        };
        if (p.schedule_date || p.schedule_start || p.schedule_end) {
          prize.schedule = {
            ...(p.schedule_date ? { date: p.schedule_date } : {}),
            ...(p.schedule_start ? { startTime: p.schedule_start } : {}),
            ...(p.schedule_end ? { endTime: p.schedule_end } : {}),
          };
        }
        return prize;
      });

    const tier: SpinTier = {
      tierId: t.tier_id,
      tierName: t.tier_name,
      costPerSpin: t.cost_per_spin,
      prizes: tierPrizes,
    };
    if (t.period) tier.period = t.period;
    if (t.max_spins) tier.maxSpins = t.max_spins;
    if (t.allowed_days?.length) tier.allowedDays = t.allowed_days;
    return tier;
  });

  const taskItems: TaskItem[] = tasks
    .filter((t) => t.enabled)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((t): TaskItem => {
      const item: TaskItem = {
        id: t.task_id,
        title: t.title,
        description: t.description ?? "",
        rewardPoints: t.reward_points,
        type: t.task_type,
        actionType: t.action_type,
        prerequisites: t.prerequisites ?? [],
      };
      if (t.target_route) item.targetRoute = t.target_route;
      if (t.required_count) item.requiredCount = t.required_count;
      if (t.max_daily_claims) item.maxDailyClaims = t.max_daily_claims;
      if (t.cooldown_sec) item.cooldownSec = t.cooldown_sec;
      return item;
    });

  return {
    spin: { tiers: spinTiers },
    tasks: { tasks: taskItems },
  };
}
