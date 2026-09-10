import { NextResponse } from "next/server";

import { FastSchemaBridgeError } from "@/lib/reward-bridge/fastschema-server";
import { RewardBridgeError, rollbackRewardConfig } from "@/lib/reward-bridge/service";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("version" in body) || Object.keys(body).length !== 1) {
      return NextResponse.json({ error: "body must contain only { version }" }, { status: 400 });
    }
    const version = (body as { version: unknown }).version;
    if (typeof version !== "number" || !Number.isSafeInteger(version) || version < 1) {
      return NextResponse.json({ error: "version must be a positive integer" }, { status: 400 });
    }
    return NextResponse.json(await rollbackRewardConfig(version));
  } catch (e) {
    if (e instanceof SyntaxError) return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
    const status = e instanceof FastSchemaBridgeError || e instanceof RewardBridgeError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Rollback failed" }, { status });
  }
}
