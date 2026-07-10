import type { CommentsResponse, TracksResponse } from "../../shared/types";

const apiBase = import.meta.env.VITE_API_URL ?? "";

async function parseError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
    ? body.error
    : `${fallback} (${response.status})`;
}

export async function fetchTracks(): Promise<TracksResponse> {
  const response = await fetch(`${apiBase}/api/tracks`);

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to load tracks"));
  }

  return response.json();
}

export async function fetchComments(trackId: number): Promise<CommentsResponse> {
  const response = await fetch(`${apiBase}/api/tracks/${trackId}/comments`);

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to load comments"));
  }

  return response.json();
}
