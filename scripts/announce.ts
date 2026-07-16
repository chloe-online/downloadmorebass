#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDevVars(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {};
  }

  const vars: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    vars[key] = value;
  }
  return vars;
}

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

function usage(): never {
  console.error(`Usage:
  npm run announce -- --title "Song Title" --url "https://soundcloud.com/..." [--message "..."] [--subject "..."] [--api "https://downloadmorebass.com"]`);
  process.exit(1);
  throw new Error("unreachable");
}

const title = getArg("title");
const url = getArg("url");
const message = getArg("message") ?? "";
const subject = getArg("subject");
const apiBase =
  getArg("api") ??
  process.env.ANNOUNCE_API_URL ??
  "https://downloadmorebass.com";

if (!title || !url) {
  usage();
}

const devVars = loadDevVars(resolve(process.cwd(), ".dev.vars"));
const adminSecret =
  process.env.ADMIN_SECRET ?? devVars.ADMIN_SECRET ?? "";

if (!adminSecret) {
  console.error(
    "Missing ADMIN_SECRET. Set it in the environment or .dev.vars",
  );
  process.exit(1);
}

const body: Record<string, string> = {
  title,
  url,
};
if (message) {
  body.message = message;
}
if (subject) {
  body.subject = subject;
}

const response = await fetch(`${apiBase.replace(/\/$/, "")}/api/admin/announce`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminSecret}`,
  },
  body: JSON.stringify(body),
});

const text = await response.text();
let parsed: unknown = null;
try {
  parsed = text ? JSON.parse(text) : null;
} catch {
  parsed = text;
}

if (!response.ok) {
  console.error("Announce failed:", response.status, parsed);
  process.exit(1);
}

console.log("Announce result:", parsed);
