export const SITE_URL = "https://www.chindospeak.com";
export const APP_STORE_URL = "https://apps.apple.com/us/app/chindospeak-mandarin-indo/id6770179868";

// Setting openGraph/twitter on a page replaces the inherited objects, so the
// site-wide image from app/opengraph-image.tsx has to be named again.
export const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "ChindoSpeak — Learn Mandarin and Indonesian from the reels you already watch",
};

/** JSON for a <script type="application/ld+json">, with "<" escaped so no string can close the tag. */
export function jsonLdHtml(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
