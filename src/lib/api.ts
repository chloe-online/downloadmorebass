import type {
  CommentsResponse,
  StreamResponse,
  SubscribeResponse,
  TracksResponse,
  UnsubscribeResponse,
} from "../../shared/types";

const apiBase = import.meta.env.VITE_API_URL ?? "";
const FETCH_TIMEOUT_MS = 10_000;

function errorMessage(body: unknown, fallback: string, status: number): string {
  return typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
    ? body.error
    : `${fallback} (${status})`;
}

/**
 * Prefer XHR over fetch for JSON APIs. Instagram's in-app browser is known to
 * complete requests server-side (200) while leaving fetch()/body read hanging
 * so the SPA never settles and never shows an error. XHR's native `timeout`
 * and onload path are more reliable there.
 */
function requestJson<T>(
  url: string,
  fallback: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open((init?.method ?? "GET").toUpperCase(), url);
    xhr.timeout = timeoutMs;
    xhr.responseType = "text";

    if (init?.headers) {
      for (const [key, value] of Object.entries(init.headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    xhr.onload = () => {
      let body: unknown = null;
      const text = xhr.responseText;
      if (text) {
        try {
          body = JSON.parse(text) as unknown;
        } catch {
          reject(
            new Error(
              `Unexpected non-JSON response (${xhr.status}): ${text.slice(0, 120).trim()}`,
            ),
          );
          return;
        }
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(errorMessage(body, fallback, xhr.status)));
        return;
      }

      resolve(body as T);
    };

    xhr.ontimeout = () => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    };

    xhr.onerror = () => {
      reject(new Error(fallback));
    };

    xhr.send(init?.body ?? null);
  });
}

export async function fetchTracks(): Promise<TracksResponse> {
  return requestJson(`${apiBase}/api/tracks`, "Failed to load tracks");
}

export async function fetchComments(trackId: number): Promise<CommentsResponse> {
  return requestJson(
    `${apiBase}/api/tracks/${trackId}/comments`,
    "Failed to load comments",
  );
}

export async function fetchStreamUrl(trackId: number): Promise<StreamResponse> {
  return requestJson(
    `${apiBase}/api/tracks/${trackId}/stream`,
    "Failed to load stream",
  );
}

export async function subscribeEmail(
  email: string,
  turnstileToken: string,
  website = "",
): Promise<SubscribeResponse> {
  return requestJson(`${apiBase}/api/subscribe`, "Failed to subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, turnstileToken, website }),
  });
}

export async function unsubscribeEmail(
  token: string,
): Promise<UnsubscribeResponse> {
  return requestJson(`${apiBase}/api/unsubscribe`, "Failed to unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}
