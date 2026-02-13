/**
 * KeyManager — singleton-cached key provider for AI API keys.
 * 
 * Supports comma-separated keys in env vars for rotation.
 * Instances are cached per env var name so we don't re-parse 
 * process.env on every call (was creating a new instance each time).
 */
export class KeyManager {
  private keys: string[];

  constructor(envVarName: string) {
    const envValue = process.env[envVarName] || "";
    this.keys = envValue
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  public getKey(): string {
    if (this.keys.length === 0) return "";
    // Random selection — avoids hot spots in serverless where 
    // multiple instances would all start at index 0
    return this.keys[Math.floor(Math.random() * this.keys.length)];
  }

  public hasKeys(): boolean {
    return this.keys.length > 0;
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
