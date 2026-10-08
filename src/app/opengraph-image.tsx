import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name}: pickleball courts, clubs and events in the Philippines`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#173f31",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            background: "#d4f04a",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 40, fontWeight: 700 }}>{siteConfig.name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
          Find your next pickleball game.
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.75)" }}>
          {`Courts, clubs and events across ${siteConfig.initialRegion}, ${siteConfig.country}`}
        </div>
      </div>
    </div>,
    size,
  );
}
