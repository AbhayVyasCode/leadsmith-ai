import { ImageResponse } from "next/og";

export const alt = "Leadsmith AI — Plain English to pipeline";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social card. ASCII-only text + explicit flex on every multi-child node
// so it renders deterministically with next/og's embedded font (no network fetch).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#15171F",
          backgroundImage:
            "radial-gradient(900px 520px at 80% -12%, rgba(56,182,217,0.30), transparent), radial-gradient(700px 520px at -5% 118%, rgba(56,182,217,0.12), transparent)",
          color: "#F4F6F8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              width: 60,
              height: 60,
              borderRadius: 16,
              backgroundImage: "linear-gradient(180deg, #3FB6D9, #0E86B8)",
            }}
          />
          <div style={{ display: "flex", marginLeft: 20, fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>
            Leadsmith AI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              maxWidth: 960,
            }}
          >
            Find your next customers in plain English.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 30,
              lineHeight: 1.35,
              color: "#9AA7B4",
              letterSpacing: -0.4,
              maxWidth: 900,
            }}
          >
            A team of AI agents discovers, qualifies, and ranks real leads, with the
            evidence behind every score.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#9AA7B4" }}>
          <div style={{ display: "flex" }}>getleadsmith.ai</div>
          <div style={{ display: "flex" }}>Evidence-backed prospecting</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
