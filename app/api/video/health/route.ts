import { access, copyFile, rm } from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";
import {
  classifyDownloadError,
  cookieCandidates,
  type DownloadFailure,
  type VideoHost,
} from "@/shared/utils/videoDownload";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Long-lived public videos used as canaries. If these stop resolving, the
// downloader (cookies, IP block, outdated yt-dlp) is broken for everyone.
const CANARIES: Record<"youtube" | "instagram", string> = {
  youtube: "https://www.youtube.com/shorts/Ia7kk6DuCcA",
  instagram: "https://www.instagram.com/reel/Chunk8-jurw/",
};

type ProbeResult = { ok: boolean; withCookies: boolean; failure?: DownloadFailure };

// Each probe spawns yt-dlp; cache so a burst of hits can't run up the bill.
const CACHE_MS = 10 * 60 * 1000;
// `?fresh=1` (used right after a cookie refresh) still can't probe more
// than once a minute.
const FRESH_MIN_MS = 60 * 1000;
let cached: { at: number; body: unknown } | null = null;

async function firstExisting(paths: string[]) {
  for (const p of paths) {
    try {
      await access(p);
      return p;
    } catch {}
  }
  return null;
}

async function probe(host: "youtube" | "instagram"): Promise<ProbeResult> {
  const source = await firstExisting(cookieCandidates(host as VideoHost, process.cwd()));
  // Scratch copy: yt-dlp rewrites the jar and the secret mount is read-only.
  const cookies = source ? path.join(os.tmpdir(), `${randomUUID()}-cookies.txt`) : null;
  if (source && cookies) await copyFile(source, cookies);
  try {
    return await runProbe(host, cookies);
  } finally {
    if (cookies) await rm(cookies, { force: true });
  }
}

async function runProbe(host: "youtube" | "instagram", cookies: string | null): Promise<ProbeResult> {
  const attempts = cookies ? [["--cookies", cookies], []] : [[]];
  let failure: DownloadFailure = "unknown";
  for (const extra of attempts) {
    try {
      await execFileAsync("yt-dlp", [...extra, "--simulate", "--no-playlist", "--print", "id", CANARIES[host]], {
        timeout: 40_000,
      });
      return { ok: true, withCookies: extra.length > 0 };
    } catch (err) {
      const stderr = typeof err === "object" && err !== null && "stderr" in err ? String(err.stderr) : String(err);
      failure = classifyDownloadError(stderr);
    }
  }
  return { ok: false, withCookies: Boolean(cookies), failure };
}

/// GET /api/video/health — is video import working right now? Returns 200
/// when both hosts resolve, 503 otherwise. Used by scripts/refresh-cookies.sh
/// to verify a refresh, and safe to point an uptime check at.
export async function GET(req: NextRequest) {
  const wantsFresh = req.nextUrl.searchParams.get("fresh") === "1";
  const maxAge = wantsFresh ? FRESH_MIN_MS : CACHE_MS;
  if (cached && Date.now() - cached.at < maxAge) {
    const body = cached.body as { ok: boolean };
    return NextResponse.json(body, { status: body.ok ? 200 : 503 });
  }
  const [youtube, instagram] = await Promise.all([probe("youtube"), probe("instagram")]);
  const body = { ok: youtube.ok && instagram.ok, youtube, instagram, checkedAt: new Date().toISOString() };
  cached = { at: Date.now(), body };
  return NextResponse.json(body, { status: body.ok ? 200 : 503 });
}
