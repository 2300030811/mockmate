import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { 
  KeyManager, 
  getNextKey, 
  reportKeyFailure, 
  reportKeySuccess, 
  resetKeyHealthCacheForTesting 
} from "./keyManager";

describe("KeyManager", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetKeyHealthCacheForTesting();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns empty string when env var has no value", () => {
    process.env.EMPTY_KEY = "";
    const km = new KeyManager("EMPTY_KEY");
    expect(km.getKey()).toBe("");
    expect(km.hasKeys()).toBe(false);
  });

  it("returns the key when env var has a single value", () => {
    process.env.SINGLE_KEY = "my-api-key";
    const km = new KeyManager("SINGLE_KEY");
    expect(km.getKey()).toBe("my-api-key");
    expect(km.hasKeys()).toBe(true);
  });

  it("cycles through comma-separated keys in round-robin order", () => {
    process.env.MULTI_KEY = "key1,key2,key3";
    const km = new KeyManager("MULTI_KEY");
    
    // Round-robin: should cycle key1 -> key2 -> key3 -> key1 -> ...
    expect(km.getKey()).toBe("key1");
    expect(km.getKey()).toBe("key2");
    expect(km.getKey()).toBe("key3");
    expect(km.getKey()).toBe("key1");
    expect(km.getKey()).toBe("key2");
  });

  it("trims whitespace from keys", () => {
    process.env.TRIM_KEY = " key1 , key2 ";
    const km = new KeyManager("TRIM_KEY");
    const key = km.getKey();
    expect(key === "key1" || key === "key2").toBe(true);
    expect(key).not.toContain(" "); // No whitespace
  });

  it("filters out empty keys after split", () => {
    process.env.GAPS_KEY = "key1,,key2,,,key3";
    const km = new KeyManager("GAPS_KEY");
    expect(km.hasKeys()).toBe(true);
    
    const selectedKeys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      selectedKeys.add(km.getKey());
    }
    // Should only have 3 valid keys, no empty strings
    expect(selectedKeys.size).toBe(3);
    expect(selectedKeys.has("")).toBe(false);
  });

  it("returns empty string when env var does not exist", () => {
    delete process.env.NONEXISTENT_KEY;
    const km = new KeyManager("NONEXISTENT_KEY");
    expect(km.getKey()).toBe("");
    expect(km.hasKeys()).toBe(false);
  });

  // --- HEALTH & COOLDOWN TESTS ---

  it("skips cooled down keys after 3 failures", () => {
    process.env.HEALTH_KEY = "key1,key2";
    const km = new KeyManager("HEALTH_KEY");

    // Initially both are selectable
    expect(km.getKey()).toBe("key1");
    expect(km.getKey()).toBe("key2");

    // Report failures for key1
    reportKeyFailure("key1");
    reportKeyFailure("key1");
    reportKeyFailure("key1"); // 3 failures, cooldown active

    // Now only key2 should be selected
    expect(km.getKey()).toBe("key2");
    expect(km.getKey()).toBe("key2");
  });

  it("falls back to the least-failed key when all keys are cooled down", () => {
    process.env.ALL_COOLDOWN = "key1,key2";
    const km = new KeyManager("ALL_COOLDOWN");

    // Failure reports
    reportKeyFailure("key1");
    reportKeyFailure("key1");
    reportKeyFailure("key1"); // 3 failures

    reportKeyFailure("key2");
    reportKeyFailure("key2");
    reportKeyFailure("key2");
    reportKeyFailure("key2"); // 4 failures

    // Both are cooled down, but key1 has 3 failures (less than key2's 4 failures).
    // It should pick key1.
    expect(km.getKey()).toBe("key1");
  });

  it("allows cooled down key to become selectable again when cooldown expires (Key Recovery)", () => {
    process.env.RECOVERY_KEY = "key1,key2";
    const km = new KeyManager("RECOVERY_KEY");

    reportKeyFailure("key1");
    reportKeyFailure("key1");
    reportKeyFailure("key1"); // 3 failures

    // Mock system time to advance 6 minutes
    const futureTime = Date.now() + 6 * 60 * 1000;
    const dateSpy = vi.spyOn(Date, "now").mockReturnValue(futureTime);

    // key1 should be selectable again, so round-robin cycles both
    const results = [km.getKey(), km.getKey(), km.getKey()];
    expect(results).toContain("key1");
    expect(results).toContain("key2");

    dateSpy.mockRestore();
  });

  it("resets failures on reporting success", () => {
    process.env.SUCCESS_RESET = "key1,key2";
    const km = new KeyManager("SUCCESS_RESET");

    reportKeyFailure("key1");
    reportKeyFailure("key1");
    reportKeySuccess("key1"); // reset failures

    reportKeyFailure("key1"); // failure 1 again
    reportKeyFailure("key1"); // failure 2 again

    // key1 should still be healthy since it has only 2 failures after success reset
    expect(km.getKey()).toBe("key1");
  });
});

describe("getNextKey", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetKeyHealthCacheForTesting();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns empty string when env var is not set", () => {
    delete process.env.MISSING_VAR;
    const result = getNextKey("MISSING_VAR");
    expect(result).toBe("");
  });

  it("returns the key when env var is set", () => {
    process.env.MY_API_KEY = "test-value";
    const result = getNextKey("MY_API_KEY");
    expect(result).toBe("test-value");
  });
});
