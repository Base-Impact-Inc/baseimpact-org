// scripts/test-contact-submit.ts
import assert from "node:assert/strict";

// src/lib/contact-submit.ts
function errorMessage(err) {
  if (err instanceof Error) return (err.message || err.name).slice(0, 1e3);
  return String(err).slice(0, 1e3);
}
async function notifyWithRetry(input2, send, maxAttempts = 3, delayMs = 200) {
  let lastError = "unknown notification error";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await send(input2);
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
async function submitContact(db, input2, send, maxAttempts = 3) {
  const inserted = await db.prepare(
    `INSERT INTO contact_messages
         (name, email, message, source_page, notification_status, notification_attempts)
       VALUES (?, ?, ?, ?, 'pending', 0)`
  ).bind(input2.name, input2.email, input2.message, input2.sourcePage).run();
  const id = Number(inserted.meta?.last_row_id ?? 0);
  let notification;
  try {
    notification = await notifyWithRetry(input2, send, maxAttempts);
  } catch (err) {
    notification = { sent: false, attempts: 0, error: errorMessage(err) };
  }
  await db.prepare(
    `UPDATE contact_messages
          SET notification_status = ?,
              notification_attempts = ?,
              notification_error = ?,
              notified_at = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END
        WHERE id = ?`
  ).bind(
    notification.sent ? "sent" : "failed",
    notification.attempts,
    notification.error ?? null,
    notification.sent ? 1 : 0,
    id
  ).run();
  if (!notification.sent) {
    console.error(
      `[contact] submission #${id} recorded but NOTIFICATION FAILED after ${notification.attempts} attempt(s): ${notification.error}`
    );
  }
  return { id, notification };
}

// scripts/test-contact-submit.ts
function fakeDb() {
  const calls = [];
  const db = {
    prepare(sql) {
      return {
        bind(...args) {
          calls.push({ sql, args });
          return { run: async () => ({ meta: { last_row_id: 42 } }) };
        }
      };
    }
  };
  return { db, calls };
}
var input = {
  name: "Test Submit",
  email: "test@example.com",
  message: "reliability check",
  sourcePage: "/contact"
};
{
  const { db, calls } = fakeDb();
  const result = await submitContact(db, input, async () => {
  });
  assert.equal(result.notification.sent, true);
  assert.equal(result.notification.attempts, 1);
  assert.equal(result.id, 42);
  assert.equal(calls.length, 2);
  assert.match(calls[0].sql, /INSERT INTO contact_messages/);
  assert.match(calls[1].sql, /UPDATE contact_messages/);
  assert.equal(calls[1].args[0], "sent");
  console.log("PASS 1: successful notification stored as sent; insert precedes update");
}
{
  const { db, calls } = fakeDb();
  const result = await submitContact(db, input, async () => {
    throw new Error("simulated SMTP outage");
  }, 3);
  assert.equal(result.notification.sent, false);
  assert.equal(result.notification.attempts, 3);
  assert.match(result.notification.error ?? "", /SMTP outage/);
  assert.equal(calls.length, 2, "failed notification must NOT prevent the update");
  assert.match(calls[0].sql, /INSERT INTO contact_messages/);
  assert.equal(calls[1].args[0], "failed");
  assert.equal(calls[1].args[1], 3);
  assert.match(String(calls[1].args[2]), /SMTP outage/);
  console.log("PASS 2: notification failure never loses the record; flagged failed after 3 attempts");
}
{
  const { db, calls } = fakeDb();
  let n = 0;
  const result = await submitContact(db, input, async () => {
    n++;
    if (n < 3) throw new Error("transient");
  }, 3);
  assert.equal(result.notification.sent, true);
  assert.equal(result.notification.attempts, 3);
  assert.equal(calls[1].args[0], "sent");
  console.log("PASS 3: retry succeeds on 3rd attempt; status sent");
}
{
  const result = await notifyWithRetry(input, async () => {
    throw "plain string failure";
  }, 2, 0);
  assert.equal(result.sent, false);
  assert.equal(result.attempts, 2);
  assert.match(result.error ?? "", /plain string failure/);
  console.log("PASS 4: notifyWithRetry contains all errors");
}
console.log("\nAll contact reliability tests passed.");
