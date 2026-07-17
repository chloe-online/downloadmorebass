import { fetchTracks } from "./api";
import type { Track, TracksResponse } from "../../shared/types";

let cache: TracksResponse | null = null;
let inflight: Promise<TracksResponse> | null = null;

export function trackSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export async function getTracks(): Promise<TracksResponse> {
  if (cache) {
    return cache;
  }

  if (!inflight) {
    inflight = fetchTracks()
      .then((data) => {
        cache = data;
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

export function getArtistProfile() {
  return cache?.user;
}

export function findTrackBySlug(slug: string): Track | undefined {
  const normalized = normalizeSlug(slug);
  return cache?.tracks.find((track) => trackSlug(track.url) === normalized);
}

export function popularTags(
  tracks: Track[],
): { tag: string; count: number; isGenre: boolean }[] {
  const counts = new Map<
    string,
    { tag: string; count: number; isGenre: boolean }
  >();

  function add(label: string, isGenre: boolean) {
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }
    const key = trimmed.toLowerCase();
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
      existing.isGenre = existing.isGenre || isGenre;
    } else {
      counts.set(key, { tag: trimmed, count: 1, isGenre });
    }
  }

  for (const track of tracks) {
    add(track.genre, true);
    for (const tag of track.tags) {
      add(tag, false);
    }
  }

  return [...counts.values()].sort(
    (a, b) =>
      b.count - a.count ||
      a.tag.localeCompare(b.tag, undefined, { sensitivity: "base" }),
  );
}

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
