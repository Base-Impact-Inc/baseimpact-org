/**
 * Unit tests for the contact durability + failover core.
 * Run: npm run test:contact
 * (esbuild bundles this TS file; it runs on plain Node with no Cloudflare runtime.)
 */
import assert from 'node:assert/strict';
import { submitContact, notifyWithRetry, type D1Like } from '../src/lib/contact-submit';

function fakeDb() {
  const calls: { sql: string; args: unknown[] }[] = [];
  const db: D1Like = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return { run: async () => ({ meta: { last_row_id: 42 } }) };
        },
      };
    },
  };
  return { db, calls };
}

const input = {
  name: 'Test Submit',
  email: 'test@example.com',
  message: 'reliability check',
  sourcePage: '/contact',
};

// Case 1: notification succeeds -> row stored first, then flagged 'sent'.
{
  const { db, calls } = fakeDb();
  const result = await submitContact(db, input, async () => {});
  assert.equal(result.notification.sent, true);
  assert.equal(result.notification.attempts, 1);
  assert.equal(result.id, 42);
  assert.equal(calls.length, 2);
  assert.match(calls[0].sql, /INSERT INTO contact_messages/);
  assert.match(calls[1].sql, /UPDATE contact_messages/);
  assert.equal(calls[1].args[0], 'sent');
  console.log('PASS 1: successful notification stored as sent; insert precedes update');
}

// Case 2: notification always fails -> record persists, flagged 'failed' after 3 attempts.
{
  const { db, calls } = fakeDb();
  const result = await submitContact(db, input, async () => {
    throw new Error('simulated SMTP outage');
  }, 3);
  assert.equal(result.notification.sent, false);
  assert.equal(result.notification.attempts, 3);
  assert.match(result.notification.error ?? '', /SMTP outage/);
  assert.equal(calls.length, 2, 'failed notification must NOT prevent the update');
  assert.match(calls[0].sql, /INSERT INTO contact_messages/);
  assert.equal(calls[1].args[0], 'failed');
  assert.equal(calls[1].args[1], 3);
  assert.match(String(calls[1].args[2]), /SMTP outage/);
  console.log('PASS 2: notification failure never loses the record; flagged failed after 3 attempts');
}

// Case 3: transient failure then success -> retry works, status 'sent'.
{
  const { db, calls } = fakeDb();
  let n = 0;
  const result = await submitContact(db, input, async () => {
    n++;
    if (n < 3) throw new Error('transient');
  }, 3);
  assert.equal(result.notification.sent, true);
  assert.equal(result.notification.attempts, 3);
  assert.equal(calls[1].args[0], 'sent');
  console.log('PASS 3: retry succeeds on 3rd attempt; status sent');
}

// Case 4: notifyWithRetry never throws even if send throws non-Error values.
{
  const result = await notifyWithRetry(input, async () => {
    throw 'plain string failure'; // eslint-disable-line no-throw-literal
  }, 2, 0);
  assert.equal(result.sent, false);
  assert.equal(result.attempts, 2);
  assert.match(result.error ?? '', /plain string failure/);
  console.log('PASS 4: notifyWithRetry contains all errors');
}

console.log('\nAll contact reliability tests passed.');
