import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncProfileStats } from "./profile-sync";
import { profileRepository } from "@/lib/db/profile-repository";
import * as adminSupabase from "@/utils/supabase/admin";

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({})),
}));

vi.mock("@/lib/db/profile-repository", () => ({
  profileRepository: {
    getStats: vi.fn(),
    updateStats: vi.fn(),
  },
}));

describe("syncProfileStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("syncs stats for a standard quiz completion", async () => {
    vi.mocked(profileRepository.getStats).mockResolvedValue({
      xp: 100,
      streak: 2,
      elo: 1000,
      last_activity_at: new Date().toISOString(),
    } as any);

    await syncProfileStats({
      userId: "user-1",
      type: "quiz",
      score: 8,
      totalQuestions: 10,
    });

    expect(profileRepository.updateStats).toHaveBeenCalledWith(
      expect.anything(),
      "user-1",
      expect.objectContaining({
        xp: expect.any(Number),
        level: expect.any(Number),
        streak: expect.any(Number),
        elo: 1000,
      })
    );
  });

  it("syncs stats and updates Elo for an arena battle", async () => {
    vi.mocked(profileRepository.getStats).mockResolvedValue({
      xp: 50,
      streak: 1,
      elo: 1200,
      last_activity_at: null,
    } as any);

    await syncProfileStats({
      userId: "user-2",
      type: "arena",
      score: 5,
      totalQuestions: 5,
      arenaStatus: "win",
      arenaUserScore: 500,
      arenaOpponentScore: 300,
    });

    expect(profileRepository.updateStats).toHaveBeenCalledWith(
      expect.anything(),
      "user-2",
      expect.objectContaining({
        xp: expect.any(Number),
        elo: expect.any(Number),
      })
    );
  });

  it("syncs stats for daily challenge", async () => {
    vi.mocked(profileRepository.getStats).mockResolvedValue({
      xp: 200,
      streak: 5,
      elo: 1000,
      last_activity_at: new Date().toISOString(),
    } as any);

    await syncProfileStats({
      userId: "user-3",
      type: "daily-challenge",
      score: 50,
      totalQuestions: 1,
      dailyPoints: 100,
    });

    expect(profileRepository.updateStats).toHaveBeenCalledWith(
      expect.anything(),
      "user-3",
      expect.objectContaining({
        xp: expect.any(Number),
      })
    );
  });

  it("handles repository failure gracefully without throwing", async () => {
    vi.mocked(profileRepository.getStats).mockRejectedValue(new Error("DB offline"));

    await expect(
      syncProfileStats({
        userId: "user-4",
        type: "quiz",
        score: 10,
        totalQuestions: 10,
      })
    ).resolves.not.toThrow();
  });
});
