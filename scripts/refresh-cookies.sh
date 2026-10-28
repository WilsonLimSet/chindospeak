#!/usr/bin/env bash
# Refreshes the yt-dlp cookies the video importer uses, without a rebuild.
#
# Cookies live in Secret Manager and are mounted into Cloud Run at
# /secrets/<host>/<host>_cookies.txt. This script exports them from a local
# Chrome profile, uploads them as new secret versions, rolls a new Cloud Run
# revision (no build — seconds, not minutes) and checks /api/video/health.
#
# Why cookies keep dying: Google and Instagram rotate a session's cookies
# while the browser that owns them stays in use. Export from a Chrome
# profile you use ONLY for this (signed into throwaway accounts) and don't
# browse in it afterwards, and the exported cookies last far longer.
#
# Usage: scripts/refresh-cookies.sh "Profile 3"     # chrome://version → Profile Path
#        scripts/refresh-cookies.sh "Profile 3" youtube   # just one host
set -euo pipefail

PROFILE="${1:?Chrome profile directory name, e.g. \"Profile 3\" (see chrome://version)}"
ONLY="${2:-all}"
PROJECT="chindospeak-backend"
REGION="asia-southeast1"
SERVICE="chindospeak-backend"
URL="https://chindospeak-backend-1004724780099.asia-southeast1.run.app"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

gcloud services enable secretmanager.googleapis.com --project "$PROJECT" >/dev/null

SA="$(gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" \
  --format='value(spec.template.spec.serviceAccountName)')"

export_host() {
  local host="$1" site="$2" domains="$3"
  local out="$WORK/${host}_cookies.txt"
  echo "→ Exporting $host cookies from Chrome \"$PROFILE\"…"
  yt-dlp --cookies-from-browser "chrome:$PROFILE" --cookies "$out" \
    --skip-download --no-warnings --flat-playlist "$site" >/dev/null 2>&1 || true
  # Keep only this host's cookies — never ship the whole browser jar.
  awk -v re="$domains" '/^#/ || /^$/ || $1 ~ re' "$out" > "$out.filtered"
  if ! grep -qvE '^(#|$)' "$out.filtered"; then
    echo "✗ No $host cookies found in that profile. Is it signed in to $site?" >&2
    exit 1
  fi

  local secret="${host}-cookies"
  if ! gcloud secrets describe "$secret" --project "$PROJECT" >/dev/null 2>&1; then
    gcloud secrets create "$secret" --project "$PROJECT" --replication-policy=automatic >/dev/null
    gcloud secrets add-iam-policy-binding "$secret" --project "$PROJECT" \
      --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor >/dev/null
  fi
  gcloud secrets versions add "$secret" --project "$PROJECT" --data-file="$out.filtered" >/dev/null

  # Secret Manager's free tier covers 6 active versions per month; destroy
  # all but the newest so refreshes never start costing money.
  gcloud secrets versions list "$secret" --project "$PROJECT" --filter='state=ENABLED' \
    --sort-by='~createTime' --format='value(name)' | tail -n +2 | while read -r v; do
      gcloud secrets versions destroy "$v" --secret "$secret" --project "$PROJECT" --quiet >/dev/null
    done
  echo "  ✓ $secret updated"
}

if [[ "$ONLY" == all || "$ONLY" == youtube ]]; then
  export_host youtube "https://www.youtube.com/" '(^\.youtube\.com$|^\.google\.com$|^accounts\.google\.com$|^\.googlevideo\.com$|^\.ytimg\.com$)'
fi
if [[ "$ONLY" == all || "$ONLY" == instagram ]]; then
  export_host instagram "https://www.instagram.com/" '(instagram\.com|facebook\.com|fbcdn\.net|cdninstagram\.com)'
fi

echo "→ Rolling a new revision to pick up the cookies (no rebuild)…"
MOUNTS=()
for host in youtube instagram; do
  if gcloud secrets describe "${host}-cookies" --project "$PROJECT" >/dev/null 2>&1; then
    MOUNTS+=("/secrets/${host}/${host}_cookies.txt=${host}-cookies:latest")
  fi
done
gcloud run services update "$SERVICE" --region "$REGION" --project "$PROJECT" --quiet \
  --update-secrets="$(IFS=,; echo "${MOUNTS[*]}")" >/dev/null

echo "→ Checking $URL/api/video/health …"
sleep 5
curl -s -m 120 "$URL/api/video/health?fresh=1"
echo
