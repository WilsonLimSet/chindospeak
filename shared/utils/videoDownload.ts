// Pure helpers for the yt-dlp download step: which cookies file to use,
// which attempts to make, and what to tell the user when they all fail.
// Kept free of Next.js / child_process so they can be unit-tested with
// `node --test`.

export type VideoHost = "instagram" | "youtube" | "tiktok" | "other";

export function hostOf(url: string): VideoHost {
  let hostname = "";
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return "other";
  }
  if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) return "instagram";
  if (
    hostname === "youtu.be" ||
    hostname === "youtube.com" ||
    hostname.endsWith(".youtube.com")
  ) {
    return "youtube";
  }
  if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) return "tiktok";
  return "other";
}

/// Where a host's cookies file may live, most preferred first:
///   1. Secret Manager volume mount (refreshable without a rebuild, see
///      scripts/refresh-cookies.sh)
///   2. Baked into the image at /app/cookies (legacy)
///   3. Next to the repo root (local dev)
export function cookieCandidates(host: VideoHost, cwd: string): string[] {
  if (host !== "instagram" && host !== "youtube") return [];
  const basename = `${host}_cookies.txt`;
  return [`/secrets/${host}/${basename}`, `/app/cookies/${basename}`, `${cwd}/cookies/${basename}`];
}

/// The argument lists to try, in order. Cookies go first because Cloud Run's
/// IPs are usually blocked without them — but stale cookies make some
/// downloads fail that would succeed anonymously (Instagram rejects public
/// reels outright with a rotated session), so an anonymous attempt always
/// follows.
export function downloadAttempts(baseArgs: string[], cookiesPath: string | null): string[][] {
  const attempts: string[][] = [];
  if (cookiesPath) attempts.push(["--cookies", cookiesPath, ...baseArgs]);
  attempts.push(baseArgs);
  return attempts;
}

export type DownloadFailure =
  | "auth"
  | "unavailable"
  | "too_large"
  | "timeout"
  | "unsupported"
  | "missing_tool"
  | "no_audio"
  | "unknown";

/// Buckets yt-dlp's stderr. Pass stderr, not the exec error message — that
/// includes the command line, whose flags would match these patterns.
export function classifyDownloadError(message: string): DownloadFailure {
  const m = message.toLowerCase();
  if (m.includes("enoent") && (m.includes("yt-dlp") || m.includes("ffmpeg") || m.includes("ffprobe"))) {
    return "missing_tool";
  }
  if (m.includes("timed out") || m.includes("etimedout") || m.includes("sigterm")) return "timeout";
  if (m.includes("larger than max-filesize")) return "too_large";
  if (m.includes("unsupported url")) return "unsupported";
  if (
    m.includes("private") ||
    m.includes("video unavailable") ||
    m.includes("has been removed") ||
    m.includes("not available") ||
    m.includes("404")
  ) {
    return "unavailable";
  }
  if (
    m.includes("sign in to confirm") ||
    m.includes("not a bot") ||
    m.includes("login") ||
    m.includes("log in") ||
    m.includes("cookies") ||
    m.includes("rate-limit") ||
    m.includes("empty media response") ||
    m.includes("not granting access") ||
    m.includes("failed to parse json")
  ) {
    return "auth";
  }
  return "unknown";
}

/// What the app shows. Never leaks internals (command lines, cookie paths,
/// "ask Wilson") — the raw error goes to the server log instead.
export function userMessageFor(failure: DownloadFailure, host: VideoHost): string {
  const kind = host === "instagram" ? "Reel" : host === "youtube" ? "YouTube Short" : "video";
  switch (failure) {
    case "auth":
      return `We couldn't get this ${kind} — ${host === "instagram" ? "Instagram" : "YouTube"} is blocking our downloader right now. Please try again later, or try a different video.`;
    case "unavailable":
      return `This ${kind} is private, removed, or region-locked. Try a public one.`;
    case "too_large":
      return "That video is too long. Try a clip under about 3 minutes.";
    case "timeout":
      return "The download took too long. Try a shorter clip.";
    case "unsupported":
      return "That link isn't a video we can import. Share an Instagram Reel or YouTube Short.";
    case "no_audio":
      return "This video has no sound, so there's nothing to transcribe. Try one where someone is talking.";
    case "missing_tool":
    case "unknown":
      return "Something went wrong importing this video. Please try again, or try a different one.";
  }
}
