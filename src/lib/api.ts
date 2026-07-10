import type {
  CommentsResponse,
  StreamResponse,
  TracksResponse,
} from "../../shared/types";

const apiBase = import.meta.env.VITE_API_URL ?? "";

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `Unexpected non-JSON response (${response.status}): ${text.slice(0, 120).trim()}`,
    );
  }
}

function errorMessage(body: unknown, fallback: string, status: number): string {
  return typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
    ? body.error
    : `${fallback} (${status})`;
}

async function parseResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const body = await readBody(response);

  if (!response.ok) {
    throw new Error(errorMessage(body, fallback, response.status));
  }

  return body as T;
}

export async function fetchTracks(): Promise<TracksResponse> {
  const response = await fetch(`${apiBase}/api/tracks`);
  return parseResponse(response, "Failed to load tracks");
}

export async function fetchComments(trackId: number): Promise<CommentsResponse> {
  const response = await fetch(`${apiBase}/api/tracks/${trackId}/comments`);
  return parseResponse(response, "Failed to load comments");
}

export async function fetchStreamUrl(trackId: number): Promise<StreamResponse> {
  const response = await fetch(`${apiBase}/api/tracks/${trackId}/stream`);
  return parseResponse(response, "Failed to load stream");
}
