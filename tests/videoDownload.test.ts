import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyDownloadError,
  cookieCandidates,
  downloadAttempts,
  hostOf,
  userMessageFor,
} from "../shared/utils/videoDownload.ts";

test("hostOf recognises hosts by hostname, not substring", () => {
  assert.equal(hostOf("https://www.instagram.com/reel/abc/"), "instagram");
  assert.equal(hostOf("https://youtu.be/abc"), "youtube");
  assert.equal(hostOf("https://m.youtube.com/shorts/abc"), "youtube");
  assert.equal(hostOf("https://www.tiktok.com/@a/video/1"), "tiktok");
  assert.equal(hostOf("https://evil.com/?u=instagram.com"), "other");
  assert.equal(hostOf("not a url"), "other");
});

test("cookie candidates prefer the Secret Manager mount", () => {
  assert.deepEqual(cookieCandidates("youtube", "/repo"), [
    "/secrets/youtube/youtube_cookies.txt",
    "/app/cookies/youtube_cookies.txt",
    "/repo/cookies/youtube_cookies.txt",
  ]);
  assert.deepEqual(cookieCandidates("other", "/repo"), []);
});

test("an anonymous attempt always follows the cookie attempt", () => {
  const base = ["--no-playlist", "URL"];
  assert.deepEqual(downloadAttempts(base, "/c.txt"), [["--cookies", "/c.txt", ...base], base]);
  assert.deepEqual(downloadAttempts(base, null), [base]);
});

test("real yt-dlp errors are classified", () => {
  assert.equal(classifyDownloadError("ERROR: [youtube] abc: Sign in to confirm you're not a bot."), "auth");
  assert.equal(classifyDownloadError("ERROR: [Instagram] x: Instagram sent an empty media response."), "auth");
  assert.equal(classifyDownloadError("ERROR: [Instagram] x: Failed to parse JSON (caused by JSONDecodeError)"), "auth");
  assert.equal(classifyDownloadError("ERROR: [youtube] abc: Video unavailable. This video is private"), "unavailable");
  assert.equal(classifyDownloadError("File is larger than max-filesize (90000000 bytes > 83886080 bytes)"), "too_large");
  assert.equal(classifyDownloadError("WARNING: slow (timed out)"), "timeout");
  // A file that merely *mentions* the flag isn't too large.
  assert.equal(classifyDownloadError("ERROR: unexpected --max-filesize value"), "unknown");
  assert.equal(classifyDownloadError("spawn yt-dlp ENOENT"), "missing_tool");
  assert.equal(classifyDownloadError("something odd"), "unknown");
});

test("user messages never leak internals", () => {
  for (const failure of ["auth", "unavailable", "too_large", "timeout", "unsupported", "missing_tool", "no_audio", "unknown"] as const) {
    for (const host of ["instagram", "youtube", "other"] as const) {
      const msg = userMessageFor(failure, host);
      assert.ok(msg.length > 0);
      assert.doesNotMatch(msg, /wilson|cookie|yt-dlp|command/i);
    }
  }
});

test("TikTok's IP block reads as a blocked download, named for TikTok", () => {
  const failure = classifyDownloadError(
    "ERROR: [TikTok] 6748451240264420610: Your IP address is blocked from accessing this post"
  );
  assert.equal(failure, "auth");
  const message = userMessageFor(failure, hostOf("https://www.tiktok.com/@a/video/1"));
  assert.match(message, /TikTok is blocking/);
  assert.doesNotMatch(message, /YouTube/);
});
