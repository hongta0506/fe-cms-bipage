import { NextResponse } from "next/server";
import { listSpinsAdmin, RewardBridgeError } from "@/lib/reward-bridge/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const playerId = url.searchParams.get("playerId") ?? undefined;
    const data = await listSpinsAdmin(limit, offset, playerId);
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof RewardBridgeError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status });
  }
}
