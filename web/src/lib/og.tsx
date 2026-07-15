import { ImageResponse } from "next/og";

// Shared Open Graph / Twitter card renderer. Uses next/og's built-in font only
// (no external fetch) so images pre-render reliably in offline build/preview
// environments. Every marketing route's opengraph-image.tsx calls this.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function renderOgImage({
  title,
  eyebrow = "FlipLocker",
  footer = "fliplocker.app · documented card deals",
}: {
  title: string;
  eyebrow?: string;
  footer?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(1200px 600px at 12% -20%, rgba(45,99,209,0.55), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(79,140,252,0.35), transparent 55%), linear-gradient(150deg, #09203f 0%, #050e1d 100%)",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Header row: mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(160deg,#4f8cfc,#2d63d1)",
              boxShadow: "0 10px 30px rgba(45,99,209,0.5)",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            F
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: "#ffffff" }}>FLIP</span>
            <span style={{ color: "#7fb1ff" }}>LOCKER</span>
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              textTransform: "uppercase",
              letterSpacing: 4,
              fontSize: 24,
              fontWeight: 700,
              color: "#7fb1ff",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 52 ? 62 : 76,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            color: "rgba(220,231,253,0.85)",
          }}
        >
          <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: "#4f8cfc" }} />
          {footer}
        </div>
      </div>
    ),
    OG_SIZE
  );
}
