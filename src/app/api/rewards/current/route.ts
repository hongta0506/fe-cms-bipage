import { NextResponse } from "next/server";

import { FastSchemaBridgeError } from "@/lib/reward-bridge/fastschema-server";
import { currentRewardRelease, RewardBridgeError } from "@/lib/reward-bridge/service";

export async function GET() {
  try {
    return NextResponse.json(await currentRewardRelease());
  } catch (e) {
    const status = e instanceof FastSchemaBridgeError || e instanceof RewardBridgeError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Load failed" }, { status });
  }
}
