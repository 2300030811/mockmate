import { describe, expect, it, vi } from "vitest";
import { profileRepository } from "./profile-repository";

describe("profileRepository", () => {
  it("getProfile queries profiles table correctly", async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: "user-1", nickname: "Bob" }, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockDb = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any;

    const res = await profileRepository.getProfile(mockDb, "user-1");
    expect(mockDb.from).toHaveBeenCalledWith("profiles");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "user-1");
    expect(res).toEqual({ id: "user-1", nickname: "Bob" });
  });

  it("updateProfile updates profiles table correctly", async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockDb = {
      from: vi.fn().mockReturnValue({ update: mockUpdate }),
    } as any;

    await profileRepository.updateProfile(mockDb, "user-1", { nickname: "Alice" });
    expect(mockDb.from).toHaveBeenCalledWith("profiles");
    expect(mockUpdate).toHaveBeenCalledWith({ nickname: "Alice" });
    expect(mockEq).toHaveBeenCalledWith("id", "user-1");
  });
});
