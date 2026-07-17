import type {
  ArtistProfile,
  Comment,
  Track,
  TracksResponse,
  WebProfile,
} from "../../shared/types";
import type { Env } from "./env";

export type { Env };

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

interface SoundCloudUser {
  id: number;
  username: string;
  permalink_url: string;
  avatar_url: string | null;
  description: string | null;
  city: string | null;
  country: string | null;
  followers_count?: number;
  track_count?: number;
  created_at?: string;
  website?: string | null;
  website_title?: string | null;
}

interface SoundCloudWebProfile {
  service: string;
  title: string | null;
  url: string;
  username: string | null;
}

interface SoundCloudTrack {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  playback_count: number;
  favoritings_count?: number;
  likes_count?: number;
  permalink_url: string;
  artwork_url: string | null;
  created_at: string;
  genre?: string | null;
  tag_list?: string | null;
  user: {
    username: string;
    permalink_url: string;
  };
}

interface SoundCloudComment {
  id: number;
  body: string;
  created_at: string;
  timestamp: number | null;
  user: {
    username: string;
    avatar_url: string | null;
    permalink_url: string;
  };
}

interface PaginatedCollection<T> {
  collection: T[];
  next_href?: string | null;
}

interface CachedToken {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
}

interface StoredTokenRow {
  access_token: string;
  refresh_token: string | null;
  expires_at: number;
}

const SOUNDCLOUD_FETCH_TIMEOUT_MS = 8_000;
const TRACKS_CACHE_FRESH_MS = 2 * 60 * 1000;

let cachedToken: CachedToken | null = null;
let tokenInFlight: Promise<string> | null = null;
let tracksRefreshInFlight: Promise<TracksResponse> | null = null;

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
  label: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("aborted"))
    ) {
      throw new Error(`${label} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function isTokenFresh(expiresAt: number, now = Date.now()): boolean {
  return expiresAt > now + 60_000;
}

function setCachedToken(token: CachedToken): string {
  cachedToken = token;
  return token.accessToken;
}

async function loadStoredToken(env: Env): Promise<CachedToken | null> {
  const row = await env.DB.prepare(
    `SELECT access_token, refresh_token, expires_at FROM soundcloud_tokens WHERE id = 1`,
  ).first<StoredTokenRow>();

  if (!row) {
    return null;
  }

  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
  };
}

async function saveStoredToken(env: Env, token: CachedToken): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO soundcloud_tokens (id, access_token, refresh_token, expires_at)
     VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       access_token = excluded.access_token,
       refresh_token = excluded.refresh_token,
       expires_at = excluded.expires_at`,
  )
    .bind(token.accessToken, token.refreshToken, token.expiresAt)
    .run();
}

async function exchangeToken(
  env: Env,
  body: URLSearchParams,
  auth?: "basic",
): Promise<CachedToken> {
  const headers: Record<string, string> = {
    accept: "application/json; charset=utf-8",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (auth === "basic") {
    headers.Authorization = `Basic ${btoa(
      `${env.SOUNDCLOUD_CLIENT_ID}:${env.SOUNDCLOUD_CLIENT_SECRET}`,
    )}`;
  }

  const response = await fetchWithTimeout(
    "https://secure.soundcloud.com/oauth/token",
    {
      method: "POST",
      headers,
      body,
    },
    SOUNDCLOUD_FETCH_TIMEOUT_MS,
    "SoundCloud auth",
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`SoundCloud auth failed (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as TokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

async function requestClientCredentials(env: Env): Promise<CachedToken> {
  return exchangeToken(
    env,
    new URLSearchParams({ grant_type: "client_credentials" }),
    "basic",
  );
}

async function requestRefreshToken(
  env: Env,
  refreshToken: string,
): Promise<CachedToken> {
  return exchangeToken(
    env,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: env.SOUNDCLOUD_CLIENT_ID,
      client_secret: env.SOUNDCLOUD_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  );
}

async function getAccessToken(env: Env): Promise<string> {
  if (cachedToken && isTokenFresh(cachedToken.expiresAt)) {
    return cachedToken.accessToken;
  }

  if (tokenInFlight) {
    return tokenInFlight;
  }

  tokenInFlight = (async () => {
    try {
      if (cachedToken && isTokenFresh(cachedToken.expiresAt)) {
        return cachedToken.accessToken;
      }

      const stored = await loadStoredToken(env);
      if (stored && isTokenFresh(stored.expiresAt)) {
        return setCachedToken(stored);
      }

      if (stored?.refreshToken) {
        try {
          const refreshed = await requestRefreshToken(env, stored.refreshToken);
          await saveStoredToken(env, refreshed);
          return setCachedToken(refreshed);
        } catch (error) {
          // Another isolate may have already consumed the single-use refresh token.
          const raced = await loadStoredToken(env);
          if (raced && isTokenFresh(raced.expiresAt)) {
            return setCachedToken(raced);
          }
          console.error("SoundCloud token refresh failed, falling back:", error);
        }
      }

      const minted = await requestClientCredentials(env);
      await saveStoredToken(env, minted);
      return setCachedToken(minted);
    } finally {
      tokenInFlight = null;
    }
  })();

  return tokenInFlight;
}

async function soundCloudFetch<T>(env: Env, path: string): Promise<T> {
  const accessToken = await getAccessToken(env);
  const response = await fetchWithTimeout(
    `https://api.soundcloud.com${path}`,
    {
      headers: {
        accept: "application/json; charset=utf-8",
        Authorization: `OAuth ${accessToken}`,
      },
    },
    SOUNDCLOUD_FETCH_TIMEOUT_MS,
    `SoundCloud ${path.split("?")[0] ?? path}`,
  );

  if (!response.ok) {
    const body = await response.text();
    console.error(body);
    throw new Error(`SoundCloud API error (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

async function resolveUser(
  env: Env,
  username: string,
): Promise<SoundCloudUser> {
  const profileUrl = `https://soundcloud.com/${username}`;
  return soundCloudFetch<SoundCloudUser>(
    env,
    `/resolve?url=${encodeURIComponent(profileUrl)}`,
  );
}

async function fetchAllUserTracks(
  env: Env,
  userId: number,
): Promise<SoundCloudTrack[]> {
  const tracks: SoundCloudTrack[] = [];
  let nextPath: string | null =
    `/users/${userId}/tracks?linked_partitioning=true&limit=50`;

  while (nextPath) {
    const page: PaginatedCollection<SoundCloudTrack> | SoundCloudTrack[] =
      await soundCloudFetch<
        PaginatedCollection<SoundCloudTrack> | SoundCloudTrack[]
      >(env, nextPath);

    if (Array.isArray(page)) {
      tracks.push(...page);
      break;
    }

    tracks.push(...page.collection);

    if (page.next_href) {
      const nextHref: string = page.next_href;
      const nextUrl = new URL(nextHref);
      nextPath = `${nextUrl.pathname}${nextUrl.search}`;
    } else {
      nextPath = null;
    }
  }

  return tracks;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatArtworkUrl(artworkUrl: string | null): string {
  if (!artworkUrl) {
    return "";
  }

  return artworkUrl.replace("-large", "-t500x500");
}

function isRecentlyCreated(createdAt: string, days = 30): boolean {
  const created = new Date(createdAt).getTime();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return created >= cutoff;
}

function calculateStars(likes: number, listens: number): number {
  if (listens === 0) {
    return 0;
  }

  // 1 like per 10 listens = 5 stars
  const stars = Math.round((likes / listens) * 50);
  return Math.min(5, Math.max(0, stars));
}

/** Parse SoundCloud's space/quote-delimited tag_list into unique tags. */
function parseTagList(tagList: string): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();
  const pattern = /"([^"]+)"|(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(tagList)) !== null) {
    const raw = (match[1] ?? match[2] ?? "").trim();
    if (!raw) {
      continue;
    }
    const key = raw.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    tags.push(raw);
  }

  return tags;
}

function formatAvatarUrl(avatarUrl: string | null): string {
  if (!avatarUrl) {
    return "";
  }

  return avatarUrl.replace("-large", "-t200x200");
}

async function fetchUserWebProfiles(
  env: Env,
  userId: number,
): Promise<SoundCloudWebProfile[]> {
  return soundCloudFetch<SoundCloudWebProfile[]>(
    env,
    `/users/${userId}/web-profiles`,
  );
}

function toWebProfile(profile: SoundCloudWebProfile): WebProfile {
  return {
    service: profile.service,
    title: profile.title?.trim() ?? "",
    url: profile.url,
    username: profile.username?.trim() ?? "",
  };
}

function isDownloadMoreBassUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return (
      hostname === "downloadmorebass.com" ||
      hostname.endsWith(".downloadmorebass.com")
    );
  } catch {
    return false;
  }
}

function buildWebProfiles(
  user: SoundCloudUser,
  apiProfiles: SoundCloudWebProfile[],
): WebProfile[] {
  const profiles = apiProfiles
    .map(toWebProfile)
    .filter((profile) => !isDownloadMoreBassUrl(profile.url));
  const website = user.website?.trim();

  if (
    website &&
    !isDownloadMoreBassUrl(website) &&
    !profiles.some((profile) => profile.url === website)
  ) {
    profiles.unshift({
      service: "website",
      title: user.website_title?.trim() ?? "",
      url: website,
      username: "",
    });
  }

  return profiles;
}

function toArtistProfile(
  user: SoundCloudUser,
  trackCount: number,
  webProfiles: WebProfile[],
): ArtistProfile {
  return {
    username: user.username,
    permalinkUrl: user.permalink_url,
    avatarUrl: formatAvatarUrl(user.avatar_url),
    description: user.description?.trim() ?? "",
    city: user.city ?? "",
    country: user.country ?? "",
    followersCount: user.followers_count ?? 0,
    trackCount,
    createdAt: user.created_at ?? "",
    webProfiles,
  };
}

function toTrack(track: SoundCloudTrack): Track {
  const listens = track.playback_count;
  const likes = track.likes_count ?? track.favoritings_count ?? 0;

  return {
    id: track.id,
    cover: formatArtworkUrl(track.artwork_url),
    title: track.title,
    description: track.description?.trim() ?? "",
    duration: formatDuration(track.duration),
    artist: track.user.username,
    listens,
    likes,
    artistUrl: track.user.permalink_url,
    url: track.permalink_url,
    stars: calculateStars(likes, listens),
    isNew: isRecentlyCreated(track.created_at),
    publishedAt: track.created_at,
    genre: track.genre?.trim() ?? "",
    tags: parseTagList(track.tag_list ?? ""),
  };
}

interface TracksCacheEntry {
  data: TracksResponse;
  updatedAtMs: number;
}

function parseSqliteUtc(datetime: string): number {
  const trimmed = datetime.trim();
  if (!trimmed) {
    return Number.NaN;
  }
  // D1/SQLite datetime('now') is UTC without a timezone suffix.
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)
    ? trimmed
    : `${trimmed.replace(" ", "T")}Z`;
  return Date.parse(normalized);
}

async function loadTracksCache(env: Env): Promise<TracksCacheEntry | null> {
  const row = await env.DB.prepare(
    `SELECT payload, updated_at FROM soundcloud_tracks_cache WHERE soundcloud_user = ?`,
  )
    .bind(env.SOUNDCLOUD_USER)
    .first<{ payload: string; updated_at: string }>();

  if (!row) {
    return null;
  }

  try {
    return {
      data: JSON.parse(row.payload) as TracksResponse,
      updatedAtMs: parseSqliteUtc(row.updated_at),
    };
  } catch {
    return null;
  }
}

async function saveTracksCache(
  env: Env,
  data: TracksResponse,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO soundcloud_tracks_cache (soundcloud_user, payload, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(soundcloud_user) DO UPDATE SET
       payload = excluded.payload,
       updated_at = excluded.updated_at`,
  )
    .bind(env.SOUNDCLOUD_USER, JSON.stringify(data))
    .run();
}

async function refreshTracksFromSoundCloud(env: Env): Promise<TracksResponse> {
  const user = await resolveUser(env, env.SOUNDCLOUD_USER);
  const [rawTracks, rawWebProfiles] = await Promise.all([
    fetchAllUserTracks(env, user.id),
    fetchUserWebProfiles(env, user.id),
  ]);
  const data: TracksResponse = {
    user: toArtistProfile(
      user,
      rawTracks.length,
      buildWebProfiles(user, rawWebProfiles),
    ),
    tracks: rawTracks.map(toTrack),
  };
  await saveTracksCache(env, data);
  return data;
}

function refreshTracksInBackground(env: Env): Promise<TracksResponse> {
  if (tracksRefreshInFlight) {
    return tracksRefreshInFlight;
  }

  tracksRefreshInFlight = refreshTracksFromSoundCloud(env)
    .catch((error: unknown) => {
      console.error("Background SoundCloud tracks refresh failed:", error);
      throw error;
    })
    .finally(() => {
      tracksRefreshInFlight = null;
    });

  return tracksRefreshInFlight;
}

export async function fetchUserTracks(
  env: Env,
  waitUntil?: (promise: Promise<unknown>) => void,
): Promise<TracksResponse> {
  const cached = await loadTracksCache(env);

  if (cached) {
    const ageMs = Number.isFinite(cached.updatedAtMs)
      ? Date.now() - cached.updatedAtMs
      : Number.POSITIVE_INFINITY;
    const isFresh = ageMs < TRACKS_CACHE_FRESH_MS;

    if (!isFresh) {
      waitUntil?.(
        refreshTracksInBackground(env).catch(() => {
          // Errors are logged in refreshTracksInBackground.
        }),
      );
    }

    return cached.data;
  }

  try {
    return await withTimeout(
      refreshTracksInBackground(env),
      SOUNDCLOUD_FETCH_TIMEOUT_MS * 3,
      "SoundCloud tracks fetch",
    );
  } catch (error) {
    const fallback = await loadTracksCache(env);
    if (fallback) {
      console.error("SoundCloud tracks fetch failed, serving cache:", error);
      return fallback.data;
    }
    throw error;
  }
}

async function fetchAllTrackComments(
  env: Env,
  trackId: number,
): Promise<SoundCloudComment[]> {
  const comments: SoundCloudComment[] = [];
  let nextPath: string | null =
    `/tracks/${trackId}/comments?linked_partitioning=true&limit=50`;

  while (nextPath) {
    const page: PaginatedCollection<SoundCloudComment> | SoundCloudComment[] =
      await soundCloudFetch<
        PaginatedCollection<SoundCloudComment> | SoundCloudComment[]
      >(env, nextPath);

    if (Array.isArray(page)) {
      comments.push(...page);
      break;
    }

    comments.push(...page.collection);

    if (page.next_href) {
      const nextHref: string = page.next_href;
      const nextUrl = new URL(nextHref);
      nextPath = `${nextUrl.pathname}${nextUrl.search}`;
    } else {
      nextPath = null;
    }
  }

  return comments;
}

function toComment(comment: SoundCloudComment): Comment {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.created_at,
    timestamp: comment.timestamp,
    user: {
      username: comment.user.username,
      avatarUrl: comment.user.avatar_url ?? "",
      profileUrl: comment.user.permalink_url,
    },
  };
}

export async function fetchTrackComments(env: Env, trackId: number) {
  const rawComments = await fetchAllTrackComments(env, trackId);

  return {
    comments: rawComments.map(toComment),
  };
}

interface TrackStreams {
  http_mp3_128_url?: string;
  preview_mp3_128_url?: string;
  hls_aac_160_url?: string;
  hls_aac_96_url?: string;
}

async function resolvePlayableUrl(
  env: Env,
  streamUrl: string,
): Promise<string> {
  const accessToken = await getAccessToken(env);
  const response = await fetch(streamUrl, {
    method: "HEAD",
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
    redirect: "manual",
  });

  if (response.status === 301 || response.status === 302) {
    const location = response.headers.get("Location");
    if (location) {
      return location;
    }
  }

  return streamUrl;
}

export async function fetchTrackStream(env: Env, trackId: number) {
  const streams = await soundCloudFetch<TrackStreams>(
    env,
    `/tracks/${trackId}/streams`,
  );

  const candidates: Array<{ url: string; format: "mp3" | "hls" }> = [];

  if (streams.http_mp3_128_url) {
    candidates.push({ url: streams.http_mp3_128_url, format: "mp3" });
  }
  if (streams.preview_mp3_128_url) {
    candidates.push({ url: streams.preview_mp3_128_url, format: "mp3" });
  }
  if (streams.hls_aac_160_url) {
    candidates.push({ url: streams.hls_aac_160_url, format: "hls" });
  }
  if (streams.hls_aac_96_url) {
    candidates.push({ url: streams.hls_aac_96_url, format: "hls" });
  }

  if (candidates.length === 0) {
    throw new Error("No stream available for this track");
  }

  const chosen = candidates[0];
  const url = await resolvePlayableUrl(env, chosen.url);

  return {
    url,
    format: chosen.format,
  };
}
