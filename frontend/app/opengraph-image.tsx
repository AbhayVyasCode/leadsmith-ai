import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Leadsmith — Leads, forged from evidence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand social card, rendered at build time with the real display face
// (Instrument Serif, OFL — bundled in assets/fonts so no network is needed).
export default async function OpengraphImage() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const [regular, italic] = await Promise.all([
    readFile(path.join(dir, "InstrumentSerif-Regular.ttf")),
    readFile(path.join(dir, "InstrumentSerif-Italic.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0f0e0d",
          backgroundImage:
            "radial-gradient(900px 420px at 50% 120%, rgba(255,106,51,0.55), transparent), linear-gradient(rgba(244,240,232,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,240,232,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 56px 56px, 56px 56px",
          color: "#f4f0e8",
          fontFamily: "Instrument Serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d="M9.2 14.2h13.6l5.4 12.3H3.8z" fill="#f4f0e8" />
            <path
              d="M22.5 2.4c.45 3.1 1.6 4.3 4.7 4.75-3.1.45-4.25 1.65-4.7 4.75-.45-3.1-1.6-4.3-4.7-4.75 3.1-.45 4.25-1.65 4.7-4.75z"
              fill="#ff6a33"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 44 }}>Leadsmith</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 128, lineHeight: 0.92, letterSpacing: -3 }}>
          <div style={{ display: "flex" }}>Leads, forged</div>
          <div style={{ display: "flex", gap: 28 }}>
            <span>from</span>
            <span style={{ fontStyle: "italic", color: "#ff8a5b" }}>evidence.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: 22,
            letterSpacing: 2,
            color: "#bcb4a7",
            textTransform: "uppercase",
          }}
        >
          <span>Multi-agent lead research</span>
          <span>getleadsmith.ai</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: regular, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}
