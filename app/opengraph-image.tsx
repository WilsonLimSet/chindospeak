import { ImageResponse } from "next/og";

export const alt = "ChindoSpeak — Learn Mandarin and Indonesian from the reels you already watch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#ffffff",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            borderRadius: 24,
            background: "#111827",
            color: "#ffffff",
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 48,
          }}
        >
          C
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          Mandarin and Indonesian, from the reels you already watch.
        </div>
        <div style={{ fontSize: 30, color: "#6b7280", marginTop: 32 }}>
          ChindoSpeak — free on iPhone
        </div>
      </div>
    ),
    size
  );
}
