import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Leadsmith — Leads, forged from evidence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand social card, rendered at build time with the real display face
// (Instrument Serif, OFL — bundled in assets/fonts so no network is needed).
export default async function OpengraphImage() {
  const assets = path.join(process.cwd(), "assets");
  const [regular, italic, mark] = await Promise.all([
    readFile(path.join(assets, "fonts", "InstrumentSerif-Regular.ttf")),
    readFile(path.join(assets, "fonts", "InstrumentSerif-Italic.ttf")),
    readFile(path.join(assets, "brand", "mark-dark.png")),
  ]);
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

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
          backgroundImage: "radial-gradient(900px 420px at 50% 120%, rgba(255,106,51,0.55), transparent)",
          color: "#f4f0e8",
          fontFamily: "Instrument Serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img src={markSrc} width={72} height={72} alt="" />
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
