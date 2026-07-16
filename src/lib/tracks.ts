import { fetchTracks } from "./api";
import type { Track, TracksResponse } from "../../shared/types";

let cache: TracksResponse | null = null;

export function trackSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export async function getTracks(): Promise<TracksResponse> {
  if (!cache) {
    cache = await fetchTracks();
  }

  return cache;
}

export function getArtistProfile() {
  return cache?.user;
}

export function findTrackBySlug(slug: string): Track | undefined {
  const normalized = normalizeSlug(slug);
  return cache?.tracks.find((track) => trackSlug(track.url) === normalized);
}

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
