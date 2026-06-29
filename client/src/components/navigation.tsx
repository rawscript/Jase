import { typeColor } from "@/lib/world-data";

// ─── TYPE LEGEND DATA ─────────────────────────────────────────────────────────
const LEGEND_TYPES = [
  "Cloud Infrastructure",
  "Data Engineering",
  "Full-Stack + AI",
  "Backend Engineering",
];

interface NavigationProps {
  onOpenTerminal: () => void;
  onOpenContact: () => void;
}

export default function Navigation({
  onOpenTerminal,
  onOpenContact,
}: NavigationProps) {
  return (
    <>
      {/* ── Top floating nav ─────────────────────────────── */}
      <nav
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 32px",
          zIndex: 20,
          background:
            "linear-gradient(to bottom, rgba(250,248,244,0.95) 70%, transparent)",
          pointerEvents: "none",
        }}
      >
        {/* Logo */}
        <div style={{ pointerEvents: "auto" }}>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 17,
              color: "#111",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            JAMES MWAURA
          </p>
          <p
            style={{
              fontSize: 9,
              color: "#9CA3AF",
              letterSpacing: "0.2em",
              marginTop: 2,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            FULL-STACK · CLOUD · DATA
          </p>
        </div>

        {/* Action buttons */}
        <div
          style={{ display: "flex", gap: 8, pointerEvents: "auto" }}
        >
          <NavButton onClick={onOpenTerminal}>_ TERMINAL</NavButton>
          <NavButton onClick={onOpenContact}>REACH OUT</NavButton>
        </div>
      </nav>

      {/* ── Bottom-left hint ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 32,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.18em",
            color: "#9CA3AF",
            margin: 0,
          }}
        >
          SCROLL TO ZOOM · DRAG TO PAN · CLICK PINS
        </p>
      </div>

      {/* ── Bottom-right legend ──────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 32,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignItems: "flex-end",
          pointerEvents: "none",
        }}
      >
        {LEGEND_TYPES.map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.12em",
                color: "#9CA3AF",
              }}
            >
              {t}
            </span>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: typeColor(t),
                border: `2px solid ${typeColor(t)}`,
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

// ─── NAV BUTTON ───────────────────────────────────────────────────────────────
function NavButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#111";
        e.currentTarget.style.color = "#111";
        e.currentTarget.style.background = "rgba(0,0,0,0.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#D1D5DB";
        e.currentTarget.style.color = "#6B7280";
        e.currentTarget.style.background = "none";
      }}
      style={{
        background: "none",
        border: "1px solid #D1D5DB",
        color: "#6B7280",
        padding: "9px 18px",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.18em",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}
