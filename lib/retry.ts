/**
 * Retry a function with exponential back-off.
 * Retries only on transient network errors (fetch failures, timeouts).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelay?: number; label?: string } = {}
): Promise<T> {
  const { retries = 2, baseDelay = 1000, label = "operation" } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLastAttempt = attempt === retries;
      const isRetryable = isTransientError(error);

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(
        `⚠️ [Retry] ${label} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  // Unreachable, but TypeScript needs it
  throw new Error(`${label} failed after ${retries + 1} attempts`);
}

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  // Network timeouts, DNS failures, connection resets
  return (
    msg.includes("fetch failed") ||
    msg.includes("connect timeout") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("network") ||
    msg.includes("socket hang up") ||
    msg.includes("abort")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
