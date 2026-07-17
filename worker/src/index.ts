import type {
  CommentsResponse,
  StreamResponse,
  TracksResponse,
} from "../../shared/types";
import type { Env } from "./env";
import {
  fetchTrackComments,
  fetchTrackStream,
  fetchUserTracks,
} from "./soundcloud";
import {
  corsHeaders,
  handleAnnounce,
  handleConfirm,
  handleSubscribe,
  handleUnsubscribe,
  jsonResponse,
} from "./subscribers";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === "/api/subscribe" && request.method === "POST") {
        return await handleSubscribe(request, env);
      }

      if (url.pathname === "/api/confirm" && request.method === "GET") {
        return await handleConfirm(request, env);
      }

      if (url.pathname === "/api/unsubscribe" && request.method === "POST") {
        return await handleUnsubscribe(request, env);
      }

      if (url.pathname === "/api/admin/announce" && request.method === "POST") {
        return await handleAnnounce(request, env);
      }

      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405);
      }

      if (url.pathname === "/api/health") {
        return jsonResponse({ ok: true });
      }

      if (url.pathname === "/api/tracks") {
        const data: TracksResponse = await fetchUserTracks(env, (promise) =>
          ctx.waitUntil(promise),
        );
        return jsonResponse(data);
      }

      const commentsMatch = url.pathname.match(
        /^\/api\/tracks\/(\d+)\/comments$/,
      );
      if (commentsMatch) {
        const trackId = Number(commentsMatch[1]);
        const data: CommentsResponse = await fetchTrackComments(env, trackId);
        return jsonResponse(data);
      }

      const streamMatch = url.pathname.match(/^\/api\/tracks\/(\d+)\/stream$/);
      if (streamMatch) {
        const trackId = Number(streamMatch[1]);
        const data: StreamResponse = await fetchTrackStream(env, trackId);
        return jsonResponse(data);
      }

      return jsonResponse({ error: "Not found" }, 404);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return jsonResponse({ error: message }, 500);
    }
  },
};
