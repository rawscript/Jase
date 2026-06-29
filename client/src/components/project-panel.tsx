import { typeColor, latLngToXY } from "@/lib/world-data";
import type { PROJECTS } from "@/lib/world-data";

type Project = (typeof PROJECTS)[number];

interface ProjectPanelProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectPanel({ project, onClose }: ProjectPanelProps) {
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 100vw)",
          background: "#fff",
          borderLeft: "1px solid #E5E7EB",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'IBM Plex Mono', monospace",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.08)",
          animation: "slideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 32px 24px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: typeColor(project.type),
              }}
            >
              {project.type.toUpperCase()}
            </p>
            <h3
              style={{
                margin: 0,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: "#111",
                letterSpacing: "-0.02em",
              }}
            >
              {project.name}
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                color: "#9CA3AF",
                letterSpacing: "0.05em",
              }}
            >
              {project.region} · {project.year}
            </p>
          </div>

          <button
            onClick={onClose}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "#111")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "#9CA3AF")
            }
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              color: "#9CA3AF",
              lineHeight: 1,
              transition: "color 0.2s",
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
          }}
        >
          {/* Impact box */}
          <div
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              padding: "16px 20px",
              marginBottom: 28,
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "#9CA3AF",
              }}
            >
              IMPACT
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: typeColor(project.type),
                fontWeight: 600,
                lineHeight: 1.6,
              }}
            >
              {project.impact}
            </p>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.85,
              color: "#4B5563",
              margin: "0 0 28px",
            }}
          >
            {project.description}
          </p>

          {/* Stack */}
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "#9CA3AF",
            }}
          >
            STACK
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {project.stack.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "#374151",
                  border: "1px solid #D1D5DB",
                  padding: "5px 12px",
                  background: "#fff",
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Link */}
          {project.link && (
            <div style={{ marginTop: 32 }}>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  background: "#111",
                  color: "#FAF8F4",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#374151")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#111")
                }
              >
                VISIT PROJECT ↗
              </a>
            </div>
          )}

          {/* Coordinates */}
          <p
            style={{
              marginTop: 36,
              fontSize: 10,
              color: "#D1D5DB",
              letterSpacing: "0.1em",
            }}
          >
            {Math.abs(project.lat).toFixed(4)}°
            {project.lat >= 0 ? "N" : "S"}{" "}
            {Math.abs(project.lng).toFixed(4)}°
            {project.lng >= 0 ? "E" : "W"}
          </p>
        </div>
      </div>
    </>
  );
}
