import type { TracksResponse } from "../../shared/types";

const apiBase = import.meta.env.VITE_API_URL ?? "";

export async function fetchTracks(): Promise<TracksResponse> {
  const response = await fetch(`${apiBase}/api/tracks`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : `Failed to load tracks (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}
