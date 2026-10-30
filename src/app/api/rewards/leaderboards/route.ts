import { NextResponse } from "next/server";
import { getLeaderboardAdmin, RewardBridgeError } from "@/lib/reward-bridge/service";

export async function GET() {
  try {
    const data = await getLeaderboardAdmin();
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof RewardBridgeError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status });
  }
}
