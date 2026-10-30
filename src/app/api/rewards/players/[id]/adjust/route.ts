import { NextResponse } from "next/server";
import { adjustPointsAdmin, RewardBridgeError } from "@/lib/reward-bridge/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { amount: number; reason: string };
    const data = await adjustPointsAdmin(id, body.amount, body.reason);
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof RewardBridgeError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status });
  }
}
