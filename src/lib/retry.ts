/**
 * Retry an async call a few times with a growing pause. Pure (the pause is
 * injectable) so the policy is unit-tested.
 */
export type RetryOptions = {
  attempts: number;
  /** Pause before attempt n+1 is `delayMs * n`. */
  delayMs: number;
  /** Return false to give up at once (e.g. Telegram refused the token). */
  retryable?: (error: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(fn: (attempt: number) => Promise<T>, opts: RetryOptions): Promise<T> {
  const sleep = opts.sleep ?? wait;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (e) {
      if (attempt >= opts.attempts || (opts.retryable && !opts.retryable(e))) throw e;
      await sleep(opts.delayMs * attempt);
    }
  }
}

/**
 * Run calls one after another (single server instance): Telegram answers 409
 * when two getUpdates requests overlap.
 */
export function createSerial() {
  let tail: Promise<unknown> = Promise.resolve();
  return function serial<T>(fn: () => Promise<T>): Promise<T> {
    const run = tail.then(fn, fn);
    tail = run.catch(() => undefined);
    return run;
  };
}
