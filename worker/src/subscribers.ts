import type {
  AnnounceRequest,
  AnnounceResponse,
  SubscribeResponse,
  UnsubscribeResponse,
} from "../../shared/types";
import {
  buildAnnounceEmail,
  buildConfirmEmail,
  sendResendEmail,
  stripNewlines,
} from "./email";
import type { Env } from "./env";

const MAX_BODY_BYTES = 1024;
const MAX_ANNOUNCE_BODY_BYTES = 4096;
const CONFIRM_TTL_HOURS = 24;
const CONFIRM_COOLDOWN_MINUTES = 15;
const TOKEN_HEX_RE = /^[a-f0-9]{64}$/;
const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const ALLOWED_ANNOUNCE_HOSTS = new Set([
  "soundcloud.com",
  "www.soundcloud.com",
  "on.soundcloud.com",
  "downloadmorebass.com",
  "www.downloadmorebass.com",
]);

const ALLOWED_TURNSTILE_HOSTS = new Set([
  "downloadmorebass.com",
  "www.downloadmorebass.com",
  "localhost",
  "127.0.0.1",
]);

type SubscriberStatus = "pending" | "active" | "unsubscribed";

interface SubscriberRow {
  id: number;
  email: string;
  status: SubscriberStatus;
  confirm_token: string | null;
  confirm_expires_at: string | null;
  unsubscribe_token: string | null;
  confirmation_sent_at: string | null;
}

interface TurnstileSiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function htmlPage(title: string, body: string, status = 200): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtmlLite(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #333; max-width: 32rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.5; }
      a { color: #222; }
    </style>
  </head>
  <body>
    ${body}
    <p><a href="/">Back to downloadmorebass</a></p>
  </body>
</html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

function escapeHtmlLite(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isValidToken(token: string): boolean {
  return TOKEN_HEX_RE.test(token);
}

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254 || /[\r\n]/.test(email)) {
    return null;
  }
  if (!EMAIL_RE.test(email)) {
    return null;
  }
  return email;
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, "");
}

function nowSqlite(): string {
  return new Date()
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, "");
}

function withinCooldown(sentAt: string | null): boolean {
  if (!sentAt) {
    return false;
  }
  const sentMs = Date.parse(sentAt.includes("T") ? sentAt : `${sentAt}Z`);
  if (Number.isNaN(sentMs)) {
    return false;
  }
  return Date.now() - sentMs < CONFIRM_COOLDOWN_MINUTES * 60 * 1000;
}

function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

/** Site origin for links in outbound email — never derived from the request Host. */
function publicOrigin(env: Env): string | null {
  const raw = env.PUBLIC_ORIGIN?.trim() ?? "";
  if (!raw) {
    return null;
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

async function readJsonBody(
  request: Request,
  maxBytes = MAX_BODY_BYTES,
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      response: jsonResponse({ error: "Expected application/json" }, 415),
    };
  }

  const contentLength = request.headers.get("Content-Length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return {
      ok: false,
      response: jsonResponse({ error: "Request too large" }, 413),
    };
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    return {
      ok: false,
      response: jsonResponse({ error: "Request too large" }, 413),
    };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: jsonResponse({ error: "Invalid JSON" }, 400),
    };
  }
}

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) {
    return false;
  }
  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

async function verifyTurnstile(
  env: Env,
  token: string,
  remoteip: string,
): Promise<boolean> {
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  if (remoteip !== "unknown") {
    form.append("remoteip", remoteip);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: form,
        signal: controller.signal,
      },
    );
    const result = (await response.json()) as TurnstileSiteverifyResponse;
    if (!result.success) {
      return false;
    }
    if (result.action !== "subscribe") {
      return false;
    }
    if (!result.hostname || !ALLOWED_TURNSTILE_HOSTS.has(result.hostname)) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Turnstile siteverify failed", error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function validateAnnounceUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  if (isLocalHost) {
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  }

  if (parsed.protocol !== "https:") {
    return null;
  }
  if (!ALLOWED_ANNOUNCE_HOSTS.has(host)) {
    return null;
  }
  return parsed.toString();
}

async function getSubscriberByEmail(
  env: Env,
  email: string,
): Promise<SubscriberRow | null> {
  return env.DB.prepare(
    `SELECT id, email, status, confirm_token, confirm_expires_at,
            unsubscribe_token, confirmation_sent_at
     FROM subscribers WHERE email = ?`,
  )
    .bind(email)
    .first<SubscriberRow>();
}

async function sendConfirm(
  env: Env,
  email: string,
  token: string,
  origin: string,
): Promise<boolean> {
  const confirmUrl = `${origin}/api/confirm?token=${encodeURIComponent(token)}`;
  const content = buildConfirmEmail(confirmUrl);
  return sendResendEmail(env, {
    to: email,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

/** Stamp cooldown only after a successful send so failed sends stay retryable. */
async function markConfirmationSent(env: Env, id: number): Promise<void> {
  await env.DB.prepare(
    `UPDATE subscribers SET confirmation_sent_at = ? WHERE id = ?`,
  )
    .bind(nowSqlite(), id)
    .run();
}

export async function handleSubscribe(
  request: Request,
  env: Env,
): Promise<Response> {
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  if (
    typeof bodyResult.value !== "object" ||
    bodyResult.value === null ||
    Array.isArray(bodyResult.value)
  ) {
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  const payload = bodyResult.value as Record<string, unknown>;
  const honeypot =
    typeof payload.website === "string" ? payload.website.trim() : "";
  if (honeypot) {
    const ok: SubscribeResponse = { ok: true };
    return jsonResponse(ok);
  }

  const email = normalizeEmail(payload.email);
  if (!email) {
    return jsonResponse({ error: "Invalid email" }, 400);
  }

  const turnstileToken =
    typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
  if (!turnstileToken || turnstileToken.length > 2048) {
    return jsonResponse({ error: "Verification required" }, 400);
  }

  const ip = clientIp(request);
  const { success: underLimit } = await env.SUBSCRIBE_RATE_LIMITER.limit({
    key: ip,
  });
  if (!underLimit) {
    return jsonResponse({ error: "Too many requests" }, 429, {
      "Retry-After": "60",
    });
  }

  const turnstileOk = await verifyTurnstile(env, turnstileToken, ip);
  if (!turnstileOk) {
    return jsonResponse({ error: "Verification failed" }, 400);
  }

  const origin = publicOrigin(env);
  if (!origin) {
    console.error("PUBLIC_ORIGIN is missing or invalid");
    return jsonResponse({ error: "Subscribe unavailable" }, 503);
  }

  const existing = await getSubscriberByEmail(env, email);
  const ok: SubscribeResponse = { ok: true };

  if (!existing) {
    const token = generateToken();
    const expires = hoursFromNow(CONFIRM_TTL_HOURS);
    const inserted = await env.DB.prepare(
      `INSERT INTO subscribers
        (email, status, confirm_token, confirm_expires_at)
       VALUES (?, 'pending', ?, ?)
       RETURNING id`,
    )
      .bind(email, token, expires)
      .first<{ id: number }>();
    if (inserted && (await sendConfirm(env, email, token, origin))) {
      await markConfirmationSent(env, inserted.id);
    }
    return jsonResponse(ok);
  }

  if (existing.status === "active") {
    return jsonResponse(ok);
  }

  if (
    existing.status === "pending" &&
    withinCooldown(existing.confirmation_sent_at)
  ) {
    return jsonResponse(ok);
  }

  const token = generateToken();
  const expires = hoursFromNow(CONFIRM_TTL_HOURS);
  await env.DB.prepare(
    `UPDATE subscribers
     SET status = 'pending',
         confirm_token = ?,
         confirm_expires_at = ?,
         unsubscribe_token = NULL,
         confirmed_at = NULL,
         unsubscribed_at = NULL
     WHERE id = ?`,
  )
    .bind(token, expires, existing.id)
    .run();
  if (await sendConfirm(env, email, token, origin)) {
    await markConfirmationSent(env, existing.id);
  }
  return jsonResponse(ok);
}

export async function handleConfirm(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  if (!isValidToken(token)) {
    return htmlPage(
      "Invalid confirmation link",
      "<h1>Invalid confirmation link</h1><p>This link is missing or malformed.</p>",
      400,
    );
  }

  const row = await env.DB.prepare(
    `SELECT id FROM subscribers
     WHERE confirm_token = ?
       AND status = 'pending'
       AND confirm_expires_at > datetime('now')`,
  )
    .bind(token)
    .first<{ id: number }>();

  if (!row) {
    return htmlPage(
      "Confirmation link expired",
      "<h1>This confirmation link is invalid or expired</h1><p>Please subscribe and enter your email address again for a new link.</p>",
      400,
    );
  }

  const unsubscribeToken = generateToken();
  await env.DB.prepare(
    `UPDATE subscribers
     SET status = 'active',
         confirmed_at = datetime('now'),
         confirm_token = NULL,
         confirm_expires_at = NULL,
         unsubscribe_token = ?
     WHERE id = ?`,
  )
    .bind(unsubscribeToken, row.id)
    .run();

  return htmlPage(
    "You're on the list",
    "<h1>You're on the list</h1><p>You'll get an email when new songs drop.</p>",
  );
}

export async function handleUnsubscribe(
  request: Request,
  env: Env,
): Promise<Response> {
  const contentType = (request.headers.get("Content-Type") ?? "").toLowerCase();
  const url = new URL(request.url);
  let token = "";

  // RFC 8058 one-click: POST to List-Unsubscribe URL with
  // Content-Type: application/x-www-form-urlencoded and body List-Unsubscribe=One-Click
  if (contentType.includes("application/json")) {
    const bodyResult = await readJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    if (
      typeof bodyResult.value !== "object" ||
      bodyResult.value === null ||
      Array.isArray(bodyResult.value)
    ) {
      return jsonResponse({ error: "Invalid request" }, 400);
    }

    token =
      typeof (bodyResult.value as Record<string, unknown>).token === "string"
        ? ((bodyResult.value as Record<string, unknown>).token as string)
        : "";
  } else {
    token = url.searchParams.get("token") ?? "";
    // Consume body so the request is fully read (ignore contents beyond size sanity).
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return jsonResponse({ error: "Request too large" }, 413);
    }
  }

  if (!isValidToken(token)) {
    return jsonResponse({ error: "Invalid or expired link" }, 404);
  }

  const row = await env.DB.prepare(
    `SELECT id, status FROM subscribers WHERE unsubscribe_token = ?`,
  )
    .bind(token)
    .first<{ id: number; status: SubscriberStatus }>();

  if (!row) {
    return jsonResponse({ error: "Invalid or expired link" }, 404);
  }

  if (row.status === "active") {
    await env.DB.prepare(
      `UPDATE subscribers
       SET status = 'unsubscribed', unsubscribed_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(row.id)
      .run();
  }

  const ok: UnsubscribeResponse = { ok: true };
  return jsonResponse(ok);
}

export async function handleAnnounce(
  request: Request,
  env: Env,
): Promise<Response> {
  const auth = request.headers.get("Authorization") ?? "";
  const expected = `Bearer ${env.ADMIN_SECRET}`;
  if (!(await timingSafeEqual(auth, expected))) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const bodyResult = await readJsonBody(request, MAX_ANNOUNCE_BODY_BYTES);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  if (
    typeof bodyResult.value !== "object" ||
    bodyResult.value === null ||
    Array.isArray(bodyResult.value)
  ) {
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  const payload = bodyResult.value as Partial<AnnounceRequest>;
  const title =
    typeof payload.title === "string" ? stripNewlines(payload.title) : "";
  const subjectRaw =
    typeof payload.subject === "string"
      ? stripNewlines(payload.subject)
      : title
        ? `New track: ${title}`
        : "";
  const message =
    typeof payload.message === "string" ? stripNewlines(payload.message) : "";
  const urlRaw = typeof payload.url === "string" ? payload.url.trim() : "";

  if (!title || title.length > 200) {
    return jsonResponse({ error: "Invalid title" }, 400);
  }
  if (!subjectRaw || subjectRaw.length > 200) {
    return jsonResponse({ error: "Invalid subject" }, 400);
  }
  if (message.length > 500) {
    return jsonResponse({ error: "Invalid message" }, 400);
  }

  const url = validateAnnounceUrl(urlRaw);
  if (!url) {
    return jsonResponse({ error: "Invalid url" }, 400);
  }

  const origin = publicOrigin(env);
  if (!origin) {
    console.error("PUBLIC_ORIGIN is missing or invalid");
    return jsonResponse({ error: "Announce unavailable" }, 503);
  }

  const { results } = await env.DB.prepare(
    `SELECT email, unsubscribe_token FROM subscribers WHERE status = ?`,
  )
    .bind("active")
    .all<{ email: string; unsubscribe_token: string | null }>();

  let sent = 0;
  let failed = 0;
  const chunkSize = 50;

  for (let i = 0; i < results.length; i += chunkSize) {
    const chunk = results.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (row) => {
        if (!row.unsubscribe_token) {
          failed += 1;
          return;
        }
        // Human-facing page in the email body
        const unsubscribeUrl = `${origin}/unsubscribe?token=${encodeURIComponent(row.unsubscribe_token)}`;
        // One-click / List-Unsubscribe must hit the API directly (RFC 8058)
        const listUnsubscribeUrl = `${origin}/api/unsubscribe?token=${encodeURIComponent(row.unsubscribe_token)}`;
        const content = buildAnnounceEmail({
          title,
          message,
          url,
          unsubscribeUrl,
        });
        const ok = await sendResendEmail(env, {
          to: row.email,
          subject: subjectRaw,
          html: content.html,
          text: content.text,
          headers: {
            "List-Unsubscribe": `<${listUnsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        if (ok) {
          sent += 1;
        } else {
          failed += 1;
        }
      }),
    );
  }

  const response: AnnounceResponse = { sent, failed };
  return jsonResponse(response);
}
