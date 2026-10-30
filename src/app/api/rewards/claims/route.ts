import { NextResponse } from "next/server";
import { listRedemptionsAdmin, RewardBridgeError } from "@/lib/reward-bridge/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? undefined;
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const data = await listRedemptionsAdmin(status, limit, offset);
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof RewardBridgeError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status });
  }
}
