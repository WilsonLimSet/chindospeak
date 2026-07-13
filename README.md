# ChindoSpeak

This repo is two things:

1. **The marketing site** at [chindospeak.com](https://www.chindospeak.com) — a static landing page plus Support, Terms, and Privacy. Hosted on Vercel.
2. **The API backend** for the ChindoSpeak iOS app — `/api/video/process`, `/api/translate`, `/api/tts`, `/api/pinyin`. Hosted on Cloud Run.

The product itself is a native iOS app ([App Store](https://apps.apple.com/us/app/chindospeak-mandarin-indo/id6770179868)) that turns TikToks, Instagram Reels, and YouTube Shorts into Mandarin and Indonesian flashcards. The iOS source lives in a separate repo (`~/chindospeak-ios`).

There used to be a PWA web app here — flashcards, listening, speaking, drive mode. It has been removed in favour of the native app. Only the landing page and the API remain.

## Structure

```
chindospeak/
├── app/
│   ├── page.tsx            # Landing page (server component)
│   ├── support|terms|privacy/
│   ├── robots.ts, sitemap.ts, opengraph-image.tsx
│   └── api/                # Backend for the iOS app
│       ├── video/process/  # yt-dlp + Whisper + GPT-4o-mini pipeline
│       ├── translate/      # Baidu (Chinese), Google (Indonesian)
│       ├── tts/            # msedge-tts
│       └── pinyin/
├── shared/utils/           # Google translation client
├── cookies/                # yt-dlp cookies (gitignored, shipped to Cloud Run)
└── Dockerfile              # Cloud Run image
```

`public/sw.js` is a kill-switch service worker: it unregisters the old PWA's
service worker and clears its caches. Browsers that visited the old site still
have that worker registered and would otherwise serve the stale cached app
forever. Leave the file in place until it has drained from the wild.

## Getting started

```bash
npm install
brew install yt-dlp ffmpeg   # only needed to run the video API locally
cp .env.example .env.local   # add OPENAI_API_KEY
npm run dev
```

`OPENAI_API_KEY` powers video transcription, OCR, and vocab extraction. Baidu and
Google translation keys are optional — each provider falls back to a mock
response when its key is absent.

## Deploying the backend (Cloud Run)

The iOS app calls the API on the Cloud Run service
`chindospeak-backend-1004724780099.asia-southeast1.run.app`. The marketing site
stays on Vercel; Cloud Run runs the same code for the API routes because
yt-dlp + ffmpeg + a JS runtime are needed for video processing and Vercel's
serverless runtime can't ship those. Vercel can optionally proxy
`/api/video/process` to Cloud Run by setting `VIDEO_SERVICE_URL` (see the top of
`app/api/video/process/route.ts`).

### One-time setup

```bash
gcloud auth login
gcloud config set project chindospeak-backend
```

### Drop cookies in place (required for IG Reels + YouTube Shorts)

Both Instagram and YouTube block requests from Cloud Run IPs unless
authenticated. See `cookies/README.txt` for the export commands — easiest is:

```bash
yt-dlp --cookies-from-browser chrome --cookies cookies/youtube_cookies.txt \
    --skip-download 'https://www.youtube.com/'
yt-dlp --cookies-from-browser chrome --cookies cookies/instagram_cookies.txt \
    --skip-download 'https://www.instagram.com/'
```

Then filter each to just the relevant domains (per `cookies/README.txt`). The
files are gitignored and re-included in `.gcloudignore` so they ship to Cloud Run
without ever landing on GitHub.

### Deploy

```bash
gcloud run deploy chindospeak-backend \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 90
```

Cloud Run reads the `Dockerfile`, builds the image, pushes it to Artifact
Registry, and rolls out a new revision. First deploy ~5 min; subsequent deploys
reuse cached layers and take ~2 min.

### Refreshing cookies

When imports start failing with "needs fresh login cookies", re-run the
extraction commands above and redeploy.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind
- **OpenAI Whisper + GPT-4o-mini** — transcription, OCR reconciliation, vocab extraction
- **yt-dlp + ffmpeg** — short-form video processing
- **Baidu / Google** — translation
- **msedge-tts** — text-to-speech

## License

Private.
