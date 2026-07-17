import type {
  CommentsResponse,
  StreamResponse,
  SubscribeResponse,
  TracksResponse,
  UnsubscribeResponse,
} from "../../shared/types";

const apiBase = import.meta.env.VITE_API_URL ?? "";
const FETCH_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // Race a timer as well as AbortSignal — some in-app browsers (esp. Instagram)
  // hang forever on aborted fetch instead of rejecting.
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      fetch(input, {
        ...init,
        signal: controller.signal,
      }),
      timeoutPromise,
    ]);
  } catch (error) {
    if (
      error instanceof DOMException ||
      (error instanceof Error &&
        (error.name === "AbortError" || error.message.includes("timed out")))
    ) {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

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
  const response = await fetchWithTimeout(`${apiBase}/api/tracks`);
  return parseResponse(response, "Failed to load tracks");
}

export async function fetchComments(trackId: number): Promise<CommentsResponse> {
  const response = await fetchWithTimeout(
    `${apiBase}/api/tracks/${trackId}/comments`,
  );
  return parseResponse(response, "Failed to load comments");
}

export async function fetchStreamUrl(trackId: number): Promise<StreamResponse> {
  const response = await fetchWithTimeout(
    `${apiBase}/api/tracks/${trackId}/stream`,
  );
  return parseResponse(response, "Failed to load stream");
}

export async function subscribeEmail(
  email: string,
  turnstileToken: string,
  website = "",
): Promise<SubscribeResponse> {
  const response = await fetchWithTimeout(`${apiBase}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, turnstileToken, website }),
  });
  return parseResponse(response, "Failed to subscribe");
}

export async function unsubscribeEmail(
  token: string,
): Promise<UnsubscribeResponse> {
  const response = await fetchWithTimeout(`${apiBase}/api/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return parseResponse(response, "Failed to unsubscribe");
}
