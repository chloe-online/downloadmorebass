export type Route = "home" | "listen";

export interface Location {
  route: Route;
  slug: string | null;
}

type Listener = (location: Location) => void;

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function parseLocation(): Location {
  const { pathname, search } = window.location;

  if (pathname === "/listen" || pathname === "/watch") {
    const slug = new URLSearchParams(search).get("v");
    return { route: "listen", slug: slug ? normalizeSlug(slug) : null };
  }

  return { route: "home", slug: null };
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
