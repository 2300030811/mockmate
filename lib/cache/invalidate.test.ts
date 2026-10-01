import { beforeEach, describe, expect, it, vi } from "vitest";
import { invalidateLeaderboardCache } from "./invalidate";
import * as redisModule from "./redis";

vi.mock("./redis", () => ({
  redis: {
    del: vi.fn(),
  },
}));

describe("invalidateLeaderboardCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes leaderboard keys in redis when redis client is available", async () => {
    await invalidateLeaderboardCache("react");

    expect(redisModule.redis!.del).toHaveBeenCalledWith(
      "leaderboard:react:all-time",
      "leaderboard:react:weekly"
    );
  });

  it("handles redis deletion error without throwing", async () => {
    vi.mocked(redisModule.redis!.del).mockRejectedValueOnce(new Error("Redis down"));

    await expect(invalidateLeaderboardCache("python")).resolves.not.toThrow();
  });
});
