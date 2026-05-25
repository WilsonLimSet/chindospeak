# Chindospeak backend — Next.js app with the video pipeline (yt-dlp + ffmpeg).
# Built for Google Cloud Run. Vercel can't run the binaries; this image can.

# ---- deps: install node modules ----
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compile the Next.js standalone output ----
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: minimal image + video tooling ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

# Video pipeline tooling:
#   - ffmpeg: audio extraction + frame OCR for subtitle reconciliation
#   - yt-dlp: video download (binary direct from GitHub for newest extractor)
#   - deno: yt-dlp's required JS runtime for YouTube extraction (since 2025+)
RUN apt-get update && apt-get install -y --no-install-recommends \
      ffmpeg python3 ca-certificates curl unzip \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
      -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp
RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s -- -y

# Next.js standalone output: a pruned server + only the deps it needs.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# yt-dlp cookies for Instagram + YouTube. The .txt files are gitignored
# (and re-included as exceptions in .gcloudignore) so they upload to Cloud
# Run but never end up on GitHub. See cookies/README.txt for refresh flow.
COPY cookies ./cookies

EXPOSE 8080
CMD ["node", "server.js"]
