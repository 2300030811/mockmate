import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;
