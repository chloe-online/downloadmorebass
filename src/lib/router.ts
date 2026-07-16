export type Route = "home" | "listen";

export interface Location {
  route: Route;
  slug: string | null;
  q: string | null;
}

type Listener = (location: Location) => void;

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function parseQuery(raw: string | null): string | null {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : null;
}

function parseLocation(): Location {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);

  if (pathname === "/listen" || pathname === "/watch") {
    const slug = params.get("v");
    return {
      route: "listen",
      slug: slug ? normalizeSlug(slug) : null,
      q: null,
    };
  }

  return { route: "home", slug: null, q: parseQuery(params.get("q")) };
}

let current = parseLocation();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(current));
}

export function getLocation(): Location {
  return current;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(current);
  return () => listeners.delete(listener);
}

export function navigate(path: string) {
  history.pushState({}, "", path);
  current = parseLocation();
  emit();
}

export function initRouter(): () => void {
  const onPopState = () => {
    current = parseLocation();
    emit();
  };

  window.addEventListener("popstate", onPopState);
  return () => window.removeEventListener("popstate", onPopState);
}

export function listenPath(slug: string): string {
  return `/listen?v=${encodeURIComponent(slug)}`;
}

export function homePath(q?: string | null): string {
  const query = parseQuery(q ?? null);
  if (!query) {
    return "/";
  }
  return `/?q=${encodeURIComponent(query)}`;
}
