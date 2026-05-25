yt-dlp cookies for Instagram and YouTube
========================================

Why this exists
---------------
Both Instagram and YouTube now require an authenticated session for
requests originating from data-center IPs (Cloud Run, AWS, etc.) — their
anti-bot systems block unauthenticated scrape-shaped traffic.

`yt-dlp` reads cookies from a Netscape-format file to authenticate. We
maintain two files, one per host:

    cookies/instagram_cookies.txt   — used for instagram.com URLs
    cookies/youtube_cookies.txt     — used for youtube.com and youtu.be URLs

Both files are .gitignored so they never end up on GitHub, but are
re-included in .gcloudignore so they DO upload to Cloud Run.

How to refresh
--------------
Easiest: yt-dlp can extract them directly from your local Chrome.

  cd ~/chindospeak
  yt-dlp --cookies-from-browser chrome --cookies cookies/youtube_cookies.txt \
      --skip-download --no-warnings 'https://www.youtube.com/'
  yt-dlp --cookies-from-browser chrome --cookies cookies/instagram_cookies.txt \
      --skip-download --no-warnings 'https://www.instagram.com/'

Then filter to just the relevant domains so we don't ship every Chrome
cookie to Cloud Run:

  awk '/^#/ || /^$/ || $1 ~ /(^\.youtube\.com$|^\.google\.com$|^accounts\.google\.com$|^\.googlevideo\.com$|^\.ytimg\.com$)/' \
      cookies/youtube_cookies.txt > /tmp/yt && mv /tmp/yt cookies/youtube_cookies.txt
  awk '/^#/ || /^$/ || $1 ~ /(instagram\.com|facebook\.com|fbcdn\.net|cdninstagram\.com)/' \
      cookies/instagram_cookies.txt > /tmp/ig && mv /tmp/ig cookies/instagram_cookies.txt

Then redeploy:

  gcloud run deploy chindospeak-backend --source . --region asia-southeast1 --quiet

Alternative: install the "Get cookies.txt LOCALLY" Chrome extension and
export from each site's tab manually.

When to refresh
---------------
Sessions typically last weeks to months. If imports start returning
"needs fresh login cookies", re-extract and redeploy.

Security note
-------------
These cookies grant full access to the accounts they came from. Use
throwaway accounts, not your personal ones. The container image is
private to your GCP project, but treat the files like passwords.
