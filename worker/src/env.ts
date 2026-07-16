export interface Env {
  SOUNDCLOUD_CLIENT_ID: string;
  SOUNDCLOUD_CLIENT_SECRET: string;
  SOUNDCLOUD_USER: string;
  DB: D1Database;
  ADMIN_SECRET: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  FROM_EMAIL: string;
  SUBSCRIBE_RATE_LIMITER: RateLimit;
}
