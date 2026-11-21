/**
 * Contact submission core — deliberately free of Cloudflare/Astro imports so
 * the durability + failover logic can be unit-tested with plain Node.
 *
 * Contract:
 *  1. The D1 record is written FIRST. If notification fails, the lead survives.
 *  2. Notification is retried; it never throws out of this module.
 *  3. The row is always updated with the final notification status, attempts
 *     and error, so nothing is ever silently dropped.
 */

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  sourcePage: string;
}

export interface NotifyResult {
  sent: boolean;
  attempts: number;
  error?: string;
}

export type SendFn = (input: ContactInput) => Promise<void>;

export interface D1RunResult {
  meta?: { last_row_id?: number };
}

/** Minimal structural type so a fake D1 object can be injected in tests. */
export interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): { run(): Promise<D1RunResult> };
  };
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return (err.message || err.name).slice(0, 1000);
  return String(err).slice(0, 1000);
}

/** Try `send` up to maxAttempts times with short linear backoff. Never throws. */
export async function notifyWithRetry(
  input: ContactInput,
  send: SendFn,
  maxAttempts = 3,
  delayMs = 200,
): Promise<NotifyResult> {
  let lastError = 'unknown notification error';
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await send(input);
      return { sent: true, attempts: attempt };
    } catch (err) {
      lastError = errorMessage(err);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  return { sent: false, attempts: maxAttempts, error: lastError };
}

/**
 * Store first, notify second, persist the outcome. Returns the row id and the
 * notification result. A failed notification is surfaced via console.error and
 * via the row's notification_status/error columns — never dropped.
 */
export async function submitContact(
  db: D1Like,
  input: ContactInput,
  send: SendFn,
  maxAttempts = 3,
): Promise<{ id: number; notification: NotifyResult }> {
  const inserted = await db
    .prepare(
      `INSERT INTO contact_messages
         (name, email, message, source_page, notification_status, notification_attempts)
       VALUES (?, ?, ?, ?, 'pending', 0)`,
    )
    .bind(input.name, input.email, input.message, input.sourcePage)
    .run();
  const id = Number(inserted.meta?.last_row_id ?? 0);

  let notification: NotifyResult;
  try {
    notification = await notifyWithRetry(input, send, maxAttempts);
  } catch (err) {
    // Defensive: notifyWithRetry already catches, but guarantee no throw.
    notification = { sent: false, attempts: 0, error: errorMessage(err) };
  }

  await db
    .prepare(
      `UPDATE contact_messages
          SET notification_status = ?,
              notification_attempts = ?,
              notification_error = ?,
              notified_at = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END
        WHERE id = ?`,
    )
    .bind(
      notification.sent ? 'sent' : 'failed',
      notification.attempts,
      notification.error ?? null,
      notification.sent ? 1 : 0,
      id,
    )
    .run();

  if (!notification.sent) {
    console.error(
      `[contact] submission #${id} recorded but NOTIFICATION FAILED after ` +
        `${notification.attempts} attempt(s): ${notification.error}`,
    );
  }

  return { id, notification };
}
