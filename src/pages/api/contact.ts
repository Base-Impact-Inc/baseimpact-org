/**
 * /api/contact — general contact form (production endpoint).
 *
 * Plain HTML form POST. Contract: store the lead in D1 FIRST, then attempt
 * notification (with retry); failures are flagged on the row, never dropped.
 * The visitor always gets the same success redirect once the row is stored.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { submitContact, type ContactInput, type SendFn } from '../../lib/contact-submit';

export const prerender = false;

interface EmailBinding {
  send(message: {
    to: string;
    from: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
  }): Promise<{ messageId: string }>;
}

type CfEnv = {
  baseimpact_verify?: D1Database;
  TURNSTILE_SECRET?: string;
  EMAIL?: EmailBinding;
  CONTACT_NOTIFY_TO?: string;
  CONTACT_FROM?: string;
  NOTIFY_WEBHOOK_URL?: string;
};

const MAX_PER_HOUR = 10;
const NOTIFY_ATTEMPTS = 3;

async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function json(data: unknown, status = 200): Promise<Response> {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function checkTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

function errText(err: unknown): string {
  return err instanceof Error ? err.message || err.name : String(err);
}

/** Notification backends, tried in order inside each attempt. Never throws. */
function buildSend(cf: CfEnv): SendFn {
  return async (input: ContactInput) => {
    const to = cf.CONTACT_NOTIFY_TO || 'admin@baseimpact.org';
    const from = cf.CONTACT_FROM || 'info@baseimpact.org';
    const subject = `New contact form message from ${input.name}`;
    const text = [
      `Name: ${input.name}`,
      `Email: ${input.email || '(not provided)'}`,
      `Source page: ${input.sourcePage}`,
      `Submitted: ${new Date().toISOString()}`,
      '',
      input.message,
    ].join('\n');
    const html = [
      '<h2>New contact form message</h2>',
      `<p><strong>Name:</strong> ${input.name}</p>`,
      `<p><strong>Email:</strong> ${input.email || '(not provided)'}</p>`,
      `<p><strong>Source page:</strong> ${input.sourcePage}</p>`,
      `<p><strong>Submitted:</strong> ${new Date().toISOString()}</p>`,
      `<p>${input.message.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] ?? c).replace(/\n/g, '<br>')}</p>`,
    ].join('');
    const errors: string[] = [];

    // Backend 1: Cloudflare Email Sending binding (requires domain onboarding).
    if (cf.EMAIL && typeof cf.EMAIL.send === 'function') {
      try {
        await cf.EMAIL.send({ to, from, subject, text, html, replyTo: input.email || undefined });
        return;
      } catch (err) {
        errors.push(`email: ${errText(err)}`);
      }
    }

    // Backend 2: generic HTTPS webhook (e.g. an org-owned automation endpoint).
    if (cf.NOTIFY_WEBHOOK_URL) {
      try {
        const res = await fetch(cf.NOTIFY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...input, to, subject, submittedAt: new Date().toISOString() }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return;
      } catch (err) {
        errors.push(`webhook: ${errText(err)}`);
      }
    }

    throw new Error(
      errors.length
        ? errors.join(' | ')
        : 'no notification backend configured (set EMAIL binding or NOTIFY_WEBHOOK_URL)',
    );
  };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const cf = env as unknown as CfEnv;
  try {
    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const message = String(form.get('message') ?? '').trim();
    const turnstileToken = String(form.get('cf-turnstile-response') ?? '').trim();

    if (!name || !message) return json({ error: 'Name and message are required' }, 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Invalid email address' }, 400);
    }

    const db = cf.baseimpact_verify;
    if (!db) return json({ error: 'Server error' }, 500);

    // Source page: explicit hidden field wins, then Referer path, then /contact.
    let sourcePage = String(form.get('source_page') ?? '').trim();
    if (!sourcePage) {
      const ref = request.headers.get('referer');
      sourcePage = ref ? new URL(ref).pathname : '/contact';
    }
    sourcePage = sourcePage.slice(0, 200) || '/contact';

    const clientIp = clientAddress || request.headers.get('cf-connecting-ip') || 'unknown';

    if (cf.TURNSTILE_SECRET && !(await checkTurnstile(turnstileToken, cf.TURNSTILE_SECRET, clientIp))) {
      return json({ error: 'Verification failed' }, 403);
    }

    const ipHash = await hashIp(clientIp);
    const limitRow = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM rate_limits
         WHERE ip_hash = ? AND action = ? AND created_at > datetime('now', '-1 hour')`,
      )
      .bind(ipHash, 'contact')
      .first<{ count: number }>();
    if ((limitRow?.count ?? 0) >= MAX_PER_HOUR) {
      return json({ error: 'Too many messages. Please try again later.' }, 429);
    }

    // Store first, notify second. A notification failure cannot lose the lead.
    const { notification } = await submitContact(
      db,
      { name: name.slice(0, 200), email: email.slice(0, 200), message: message.slice(0, 4000), sourcePage },
      buildSend(cf),
      NOTIFY_ATTEMPTS,
    );

    // Rate-limit bookkeeping is best-effort — never fail a stored lead on it.
    try {
      await db.prepare('INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)').bind(ipHash, 'contact').run();
    } catch (err) {
      console.warn(`[contact] rate-limit bookkeeping failed: ${errText(err)}`);
    }

    if (!notification.sent) {
      // Diagnostic only — the row already carries the failed status.
      console.error(
        `[contact] notification failed for a stored submission after ${notification.attempts} attempts: ${notification.error}`,
      );
    }

    return new Response(null, { status: 303, headers: { Location: '/contact?sent=1' } });
  } catch (err) {
    console.error(`[contact] submission could not be stored: ${errText(err)}`);
    return json({ error: 'Server error' }, 500);
  }
};
