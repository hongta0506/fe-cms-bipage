import { NextResponse } from "next/server";
import { updateRedemptionAdmin, RewardBridgeError } from "@/lib/reward-bridge/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { newStatus: string; reason?: string; trackingCode?: string };
    const data = await updateRedemptionAdmin(id, body.newStatus, body.reason, body.trackingCode);
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof RewardBridgeError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status });
  }
}
