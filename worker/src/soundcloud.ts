import type { Track } from "../../shared/types";

export interface Env {
  SOUNDCLOUD_CLIENT_ID: string;
  SOUNDCLOUD_CLIENT_SECRET: string;
  SOUNDCLOUD_USER: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

interface SoundCloudUser {
  id: number;
  username: string;
  permalink_url: string;
}

interface SoundCloudTrack {
  title: string;
  description: string | null;
  duration: number;
  playback_count: number;
  permalink_url: string;
  artwork_url: string | null;
  created_at: string;
  user: {
    username: string;
    permalink_url: string;
  };
}

interface PaginatedCollection<T> {
  collection: T[];
  next_href?: string | null;
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(env: Env): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.accessToken;
  }

  const credentials = btoa(
    `${env.SOUNDCLOUD_CLIENT_ID}:${env.SOUNDCLOUD_CLIENT_SECRET}`,
  );

  const response = await fetch("https://secure.soundcloud.com/oauth/token", {
    method: "POST",
    headers: {
      accept: "application/json; charset=utf-8",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SoundCloud auth failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as TokenResponse;
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

async function soundCloudFetch<T>(env: Env, path: string): Promise<T> {
  const accessToken = await getAccessToken(env);
  const response = await fetch(`https://api.soundcloud.com${path}`, {
    headers: {
      accept: "application/json; charset=utf-8",
      Authorization: `OAuth ${accessToken}`,
    },
  });

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

function toTrack(track: SoundCloudTrack): Track {
  return {
    cover: formatArtworkUrl(track.artwork_url),
    title: track.title,
    description: track.description?.trim() ?? "",
    duration: formatDuration(track.duration),
    artist: track.user.username,
    listens: track.playback_count,
    artistUrl: track.user.permalink_url,
    url: track.permalink_url,
    stars: 3,
    isNew: isRecentlyCreated(track.created_at),
  };
}

export async function fetchUserTracks(env: Env) {
  const user = await resolveUser(env, env.SOUNDCLOUD_USER);
  const rawTracks = await fetchAllUserTracks(env, user.id);

  return {
    user: {
      username: user.username,
      permalinkUrl: user.permalink_url,
    },
    tracks: rawTracks.map(toTrack),
  };
}
