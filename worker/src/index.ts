import type {
  CommentsResponse,
  StreamResponse,
  TracksResponse,
} from "../../shared/types";
import {
  fetchTrackComments,
  fetchTrackStream,
  fetchUserTracks,
  type Env,
} from "./soundcloud";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
      if (url.pathname === "/api/health") {
        return jsonResponse({ ok: true });
      }

      if (url.pathname === "/api/tracks") {
        const data: TracksResponse = await fetchUserTracks(env);
        return jsonResponse(data);
      }

      const commentsMatch = url.pathname.match(/^\/api\/tracks\/(\d+)\/comments$/);
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
