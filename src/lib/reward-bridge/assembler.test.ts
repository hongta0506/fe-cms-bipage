import { assembleConfig, CONTRACT_VERSION, type FsPrize, type FsTask, type FsTier } from "./assembler";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("reward assembler", () => {
  it("assembles config correctly", () => {
    const tier: FsTier = { tier_id: "t1", tier_name: "Basic", cost_per_spin: 10, enabled: true, sort_order: 1 };
    const prize: FsPrize = {
      tier_id: "t1",
      prize_id: "p1",
      name: "100pt",
      points: 100,
      weight: 50,
      enabled: true,
      sort_order: 1,
    };
    const task: FsTask = {
      task_id: "visit_home",
      title: "Visit Home",
      task_type: "visit",
      action_type: "navigate",
      target_route: "/",
      reward_points: 5,
      enabled: true,
      sort_order: 1,
    };

    const config = assembleConfig([tier], [prize], [task]);
    assert.equal(config.spin.tiers[0].tierId, "t1");
    assert.equal(config.spin.tiers[0].prizes[0].id, "p1");
    assert.equal(config.tasks.tasks[0].id, "visit_home");

    const disabled = assembleConfig([{ ...tier, enabled: false }], [prize], [{ ...task, enabled: false }]);
    assert.equal(disabled.spin.tiers.length, 0);
    assert.equal(disabled.tasks.tasks.length, 0);

    const sorted = assembleConfig([tier, { ...tier, tier_id: "t2", tier_name: "VIP", sort_order: 0 }], [], []);
    assert.equal(sorted.spin.tiers[0].tierId, "t2");

    const scheduled = assembleConfig(
      [tier],
      [{ ...prize, schedule_date: "2026-08-10", schedule_start: "09:00", schedule_end: "21:00" }],
      [],
    );
    assert.deepEqual(scheduled.spin.tiers[0].prizes[0].schedule, {
      date: "2026-08-10",
      startTime: "09:00",
      endTime: "21:00",
    });
    assert.equal(config.spin.tiers[0].period, undefined);
    assert.equal(CONTRACT_VERSION, "1");
  });
});
