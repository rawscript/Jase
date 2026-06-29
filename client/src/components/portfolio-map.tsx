import { useState, useRef, useEffect } from "react";
import { PROJECTS, LAND, typeColor, latLngToXY } from "@/lib/world-data";
import ProjectPanel from "@/components/project-panel";

type Project = (typeof PROJECTS)[number];

// ─── GRATICULE ────────────────────────────────────────────────────────────────
function Graticule() {
  const els: React.ReactNode[] = [];
  for (let lat = -60; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * 500;
    els.push(
      <line
        key={`la${lat}`}
        x1={0}
        y1={y}
        x2={1000}
        y2={y}
        stroke="#C8D4E0"
        strokeWidth={0.4}
      />
    );
  }
  for (let lng = -180; lng <= 180; lng += 20) {
    const x = ((lng + 180) / 360) * 1000;
    els.push(
      <line
        key={`ln${lng}`}
        x1={x}
        y1={0}
        x2={x}
        y2={500}
        stroke="#C8D4E0"
        strokeWidth={0.4}
      />
    );
  }
  // Equator
  els.push(
    <line
      key="eq"
      x1={0}
      y1={250}
      x2={1000}
      y2={250}
      stroke="#B0BEC5"
      strokeWidth={0.8}
      strokeDasharray="6,4"
    />
  );
  return <>{els}</>;
}

// ─── PIN TOOLTIP ──────────────────────────────────────────────────────────────
function PinTooltip({
  project,
  svgRef,
}: {
  project: Project;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const { x, y } = latLngToXY(project.lat, project.lng);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = (x / 1000) * rect.width + rect.left;
    const py = (y / 500) * rect.height + rect.top;
    setPos({ left: px, top: py });
  }, [x, y, svgRef]);

  return (
    <div
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        transform: "translate(-50%, calc(-100% - 18px))",
        background: "#111",
        color: "#FAF8F4",
        padding: "10px 16px",
        pointerEvents: "none",
        zIndex: 35,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "-0.01em",
        }}
      >
        {project.name}
      </p>
      <p
        style={{
          margin: "3px 0 0",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: "#9CA3AF",
          letterSpacing: "0.08em",
        }}
      >
        {project.region}
      </p>
      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid #111",
        }}
      />
    </div>
  );
}

// ─── WORLD MAP ────────────────────────────────────────────────────────────────
interface WorldMapProps {
  onSelectProject: (p: Project | null) => void;
  activeProject: Project | null;
}

export default function PortfolioMap({
  onSelectProject,
  activeProject,
}: WorldMapProps) {
  const [hoveredPin, setHoveredPin] = useState<Project | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.88 : 1.14;
    setZoom((z) => Math.min(Math.max(z * delta, 1), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  const handlePinClick = (e: React.MouseEvent, proj: Project) => {
    e.stopPropagation();
    onSelectProject(activeProject?.id === proj.id ? null : proj);
  };

  // Close panel when clicking blank map
  const handleMapClick = () => {
    if (activeProject) onSelectProject(null);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: dragging.current ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: dragging.current ? "none" : "transform 0.1s",
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <defs>
              <filter
                id="pinshadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx={0}
                  dy={2}
                  stdDeviation={3}
                  floodColor="#000"
                  floodOpacity={0.15}
                />
              </filter>
            </defs>

            {/* Ocean */}
            <rect width={1000} height={500} fill="#E8EEF5" />

            {/* Grid */}
            <Graticule />

            {/* Land masses */}
            {LAND.map((l) => (
              <path
                key={l.id}
                d={l.d}
                fill="#F5F2ED"
                stroke="#D0CCC4"
                strokeWidth={0.7}
              />
            ))}

            {/* Connection arcs between adjacent projects */}
            {PROJECTS.map((p1, i) =>
              PROJECTS.slice(i + 1, i + 3).map((p2) => {
                const a = latLngToXY(p1.lat, p1.lng);
                const b = latLngToXY(p2.lat, p2.lng);
                const mx = (a.x + b.x) / 2;
                const my = (a.y + b.y) / 2 - 40;
                return (
                  <path
                    key={`${p1.id}-${p2.id}`}
                    d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`}
                    fill="none"
                    stroke="#C8D4E0"
                    strokeWidth={0.6}
                    strokeDasharray="4,6"
                    opacity={0.7}
                  />
                );
              })
            )}

            {/* Pins */}
            {PROJECTS.map((proj) => {
              const { x, y } = latLngToXY(proj.lat, proj.lng);
              const col = typeColor(proj.type);
              const active = activeProject?.id === proj.id;
              const hov = hoveredPin?.id === proj.id;
              const scale = active ? 1.4 : hov ? 1.2 : 1;

              return (
                <g
                  key={proj.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => handlePinClick(e, proj)}
                  onMouseEnter={() => setHoveredPin(proj)}
                  onMouseLeave={() => setHoveredPin(null)}
                >
                  {/* Pulse ring */}
                  {(active || hov) && (
                    <circle
                      r={16 * scale}
                      fill={col}
                      opacity={0.12}
                      className="pin-pulse"
                    />
                  )}
                  {/* Outer ring */}
                  <circle
                    r={10 * scale}
                    fill="none"
                    stroke={col}
                    strokeWidth={1.2}
                    opacity={0.4}
                  />
                  {/* Pin body */}
                  <circle
                    r={6 * scale}
                    fill={active ? col : "#fff"}
                    stroke={active ? "none" : col}
                    strokeWidth={active ? 0 : 2}
                    filter="url(#pinshadow)"
                  />
                  {/* Inner dot */}
                  <circle r={2.5 * scale} fill={active ? "#fff" : col} />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredPin && !activeProject && (
        <PinTooltip project={hoveredPin} svgRef={svgRef} />
      )}

      {/* Project panel */}
      {activeProject && (
        <ProjectPanel
          project={activeProject}
          onClose={() => onSelectProject(null)}
        />
      )}
    </div>
  );
}