export interface KeyHealth {
  failures: number;
  cooldownUntil?: number;
}

// In-memory key health state cache
const keyHealthCache = new Map<string, KeyHealth>();

export const reportKeyFailure = (key: string): void => {
  if (!key) return;
  const health = keyHealthCache.get(key) || { failures: 0 };
  health.failures += 1;
  if (health.failures >= 3) {
    health.cooldownUntil = Date.now() + 5 * 60 * 1000; // 5 minute cooldown
  }
  keyHealthCache.set(key, health);
};

export const reportKeySuccess = (key: string): void => {
  if (!key) return;
  keyHealthCache.set(key, { failures: 0 });
};

/**
 * KeyManager — singleton-cached key provider for AI API keys.
 * 
 * Supports comma-separated keys in env vars for rotation.
 * Uses round-robin selection for even distribution across keys.
 * Instances are cached per env var name so we don't re-parse 
 * process.env on every call (was creating a new instance each time).
 */
export class KeyManager {
  private keys: string[];
  private index: number = 0;

  constructor(envVarName: string) {
    const envValue = process.env[envVarName] || "";
    this.keys = envValue
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  public getKey(): string {
    if (this.keys.length === 0) return "";

    const now = Date.now();
    // Filter healthy keys (not in cooldown)
    const healthyKeys = this.keys.filter((key) => {
      const health = keyHealthCache.get(key);
      if (!health) return true;
      if (health.cooldownUntil && health.cooldownUntil > now) {
        return false;
      }
      return true;
    });

    if (healthyKeys.length > 0) {
      // Rotate among healthy keys
      const key = healthyKeys[this.index % healthyKeys.length];
      this.index++;
      return key;
    }

    // Fallback: If ALL keys are in cooldown, find the one with the fewest failures
    let bestKey = this.keys[0];
    let minFailures = Infinity;

    for (const key of this.keys) {
      const health = keyHealthCache.get(key);
      const failures = health ? health.failures : 0;
      if (failures < minFailures) {
        minFailures = failures;
        bestKey = key;
      }
    }

    this.index++;
    return bestKey;
  }

  public hasKeys(): boolean {
    return this.keys.length > 0;
  }

  public getCount(): number {
    return this.keys.length;
  }
}

// Cache KeyManager instances per env var name (singleton pattern)
const instanceCache = new Map<string, KeyManager>();

export const getNextKey = (envVarName: string): string => {
  let manager = instanceCache.get(envVarName);
  if (!manager) {
    manager = new KeyManager(envVarName);
    instanceCache.set(envVarName, manager);
  }
  return manager.getKey();
};

export const getNumKeys = (envVarName: string): number => {
  let manager = instanceCache.get(envVarName);
  if (!manager) {
    manager = new KeyManager(envVarName);
    instanceCache.set(envVarName, manager);
  }
  return manager.getCount();
};

// Helper for testing purposes to reset the cache
export const resetKeyHealthCacheForTesting = (): void => {
  keyHealthCache.clear();
};
