import { NextResponse } from "next/server";

import { FastSchemaBridgeError } from "@/lib/reward-bridge/fastschema-server";
import { publishRewardConfig, RewardBridgeError } from "@/lib/reward-bridge/service";

export async function POST() {
  try {
    return NextResponse.json(await publishRewardConfig(), { status: 201 });
  } catch (e) {
    const status = e instanceof FastSchemaBridgeError || e instanceof RewardBridgeError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Publish failed" }, { status });
  }
}
