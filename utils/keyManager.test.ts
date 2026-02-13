import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { KeyManager, getNextKey } from "./keyManager";

describe("KeyManager", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
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

  it("randomly selects from comma-separated keys", () => {
    process.env.MULTI_KEY = "key1,key2,key3";
    const km = new KeyManager("MULTI_KEY");
    
    const selectedKeys = new Set<string>();
    // Run enough times to likely hit all keys
    for (let i = 0; i < 100; i++) {
      selectedKeys.add(km.getKey());
    }
    
    expect(selectedKeys.has("key1")).toBe(true);
    expect(selectedKeys.has("key2")).toBe(true);
    expect(selectedKeys.has("key3")).toBe(true);
    expect(selectedKeys.size).toBe(3); // No unexpected keys
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
});

describe("getNextKey", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
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
