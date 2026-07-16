import type {
  ArtistProfile,
  Comment,
  Track,
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

function calculateStars(likes: number, listens: number): number {
  if (listens === 0) {
    return 0;
  }

  // 1 like per 10 listens = 5 stars
  const stars = Math.round((likes / listens) * 50);
  return Math.min(5, Math.max(0, stars));
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
  };
}

export async function fetchUserTracks(env: Env) {
  const user = await resolveUser(env, env.SOUNDCLOUD_USER);
  const [rawTracks, rawWebProfiles] = await Promise.all([
    fetchAllUserTracks(env, user.id),
    fetchUserWebProfiles(env, user.id),
  ]);
  return {
    user: toArtistProfile(
      user,
      rawTracks.length,
      buildWebProfiles(user, rawWebProfiles),
    ),
    tracks: rawTracks.map(toTrack),
  };
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
