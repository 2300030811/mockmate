export class KeyManager {
  private keys: string[];
  private currentIndex: number = 0;

  constructor(envVarName: string) {
    const envValue = process.env[envVarName] || "";
    // support comma separated keys
    this.keys = envValue.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
    
    if (this.keys.length === 0) {
      console.warn(`KeyManager: No keys found for ${envVarName}`);
    }
  }

  public getKey(): string {
    if (this.keys.length === 0) {
      return "";
    }
    // Simple rotation or random selection? 
    // Rotation ensures we use all keys evenly. 
    // Random reduces collision chance in serverless.
    // Let's go with simple rotation for now, but since serverless is stateless, 
    // random is actually better to avoid "hot spots" if many instances start at 0.
    const index = Math.floor(Math.random() * this.keys.length);
    return this.keys[index];
  }

  // Helper to retry a function with different keys if it fails with specific errors
  // This is complex to implement generically due to different error shapes.
  // For now, we will just provide the key rotation capability.
}

export const getNextKey = (envVarName: string): string => {
   const manager = new KeyManager(envVarName);
   return manager.getKey();
}
