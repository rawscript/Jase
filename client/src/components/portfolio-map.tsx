import { useState, useRef, useEffect, useCallback } from "react";
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

// ─── ZOOM CONTROLS ────────────────────────────────────────────────────────────
function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const btn = (label: string, onClick: () => void, disabled?: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        width: 36,
        height: 36,
        background: "#fff",
        border: "1px solid #E5E7EB",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        color: disabled ? "#D1D5DB" : "#111",
        transition: "background 0.15s, color 0.15s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        lineHeight: 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#fff";
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        right: 32,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "center",
      }}
    >
      {btn("+", onZoomIn, zoom >= 8)}
      {btn("−", onZoomOut, zoom <= 1)}
      {/* Zoom level indicator */}
      <div
        style={{
          width: 36,
          height: 28,
          background: "#fff",
          border: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 8,
          letterSpacing: "0.05em",
          color: "#9CA3AF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {Math.round(zoom * 100)}%
      </div>
      {btn("⌖", onReset)}
    </div>
  );
}

// ─── MINI MAP ─────────────────────────────────────────────────────────────────
function MiniMap({
  zoom,
  pan,
  containerSize,
}: {
  zoom: number;
  pan: { x: number; y: number };
  containerSize: { w: number; h: number };
}) {
  const W = 130;
  const H = 65;
  // The viewport rect in the SVG coordinate space (0–1000 × 0–500)
  const svgW = containerSize.w / zoom;
  const svgH = containerSize.h / zoom;
  // origin of the viewport in SVG coords
  const ox = (500 - pan.x / zoom) - svgW / 2;
  const oy = (250 - pan.y / zoom) - svgH / 2;
  // Scale to mini-map
  const rx = (ox / 1000) * W;
  const ry = (oy / 500) * H;
  const rw = (svgW / 1000) * W;
  const rh = (svgH / 500) * H;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: 20,
        zIndex: 30,
        background: "#fff",
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        width: W,
        height: H,
      }}
      title="Mini-map: shows current viewport"
    >
      <svg viewBox="0 0 1000 500" style={{ width: W, height: H, display: "block" }}>
        <rect width={1000} height={500} fill="#E8EEF5" />
        {LAND.map((l) => (
          <path key={l.id} d={l.d} fill="#D4CFC8" stroke="none" />
        ))}
        {/* viewport rect */}
        <rect
          x={Math.max(0, ox)}
          y={Math.max(0, oy)}
          width={Math.min(rw * (1000 / W), 1000)}
          height={Math.min(rh * (500 / H), 500)}
          fill="rgba(0,0,0,0.08)"
          stroke="#111"
          strokeWidth={4}
        />
        {/* Project dots */}
        {PROJECTS.map((p) => {
          const { x, y } = latLngToXY(p.lat, p.lng);
          return (
            <circle key={p.id} cx={x} cy={y} r={8} fill={typeColor(p.type)} opacity={0.8} />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: 3,
          right: 5,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 7,
          color: "#9CA3AF",
          letterSpacing: "0.05em",
          pointerEvents: "none",
        }}
      >
        OVERVIEW
      </div>
    </div>
  );
}

// ─── WORLD MAP ────────────────────────────────────────────────────────────────
interface WorldMapProps {
  onSelectProject: (p: Project | null) => void;
  activeProject: Project | null;
  isContactOpen?: boolean;
}

export default function PortfolioMap({
  onSelectProject,
  activeProject,
  isContactOpen = false,
}: WorldMapProps) {
  const [hoveredPin, setHoveredPin] = useState<Project | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const [isMobile, setIsMobile] = useState(false);

  // ── Touch pinch state ────────────────────────────────────────────────────
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchMid = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        setContainerSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isContactOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isContactOpen]);

  useEffect(() => {
    if (activeProject) {
      const { x, y } = latLngToXY(activeProject.lat, activeProject.lng);
      const targetZoom = 3;
      setZoom(targetZoom);
      setPan({
        x: targetZoom * (500 - x),
        y: targetZoom * (250 - y),
      });
    }
  }, [activeProject]);

  // ── Zoom toward cursor position ──────────────────────────────────────────
  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // cursor relative to container center
      const cx = clientX - rect.left - rect.width / 2;
      const cy = clientY - rect.top - rect.height / 2;
      setZoom((z) => {
        const newZ = Math.min(Math.max(z * factor, 1), 8);
        const ratio = newZ / z;
        setPan((p) => ({
          x: cx + ratio * (p.x - cx),
          y: cy + ratio * (p.y - cy),
        }));
        return newZ;
      });
    },
    []
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isContactOpen) return;
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.88 : 1.14;
      zoomAtPoint(e.clientX, e.clientY, factor);
    },
    [isContactOpen, zoomAtPoint]
  );

  // Attach non-passive wheel listener
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isContactOpen) return;
    dragging.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isContactOpen) return;
    if (!dragging.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  // ── Double-click to zoom in ──────────────────────────────────────────────
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isContactOpen) return;
    zoomAtPoint(e.clientX, e.clientY, 1.8);
  };

  // ── Touch events ────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isContactOpen) return;
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPt.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchMid.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isContactOpen) return;
    e.preventDefault();
    if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPt.current.x;
      const dy = e.touches[0].clientY - lastPt.current.y;
      lastPt.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    } else if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / lastTouchDist.current;
      const mid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      zoomAtPoint(mid.x, mid.y, factor);
      lastTouchDist.current = dist;
      lastTouchMid.current = mid;
    }
  };

  const handleTouchEnd = () => {
    dragging.current = false;
    lastTouchDist.current = null;
    lastTouchMid.current = null;
  };

  const handlePinClick = (e: React.MouseEvent, proj: Project) => {
    e.stopPropagation();
    onSelectProject(activeProject?.id === proj.id ? null : proj);
  };

  // Close panel when clicking blank map
  const handleMapClick = () => {
    if (activeProject) onSelectProject(null);
  };

  const handleZoomIn = () => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    zoomAtPoint(r.left + r.width / 2, r.top + r.height / 2, 1.4);
  };
  const handleZoomOut = () => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    zoomAtPoint(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.4);
  };
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: isContactOpen ? "default" : dragging.current ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onClick={handleMapClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: dragging.current ? "none" : "transform 0.08s ease-out",
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 1000 500"
            preserveAspectRatio={isMobile ? "xMidYMid slice" : "xMidYMid meet"}
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
              <filter id="pinshadow-active" x="-80%" y="-80%" width="260%" height="260%">
                <feDropShadow dx={0} dy={4} stdDeviation={8} floodColor="#000" floodOpacity={0.25} />
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
              const scale = active ? 1.5 : hov ? 1.25 : 1;

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
                      r={20 * scale}
                      fill={col}
                      opacity={0.1}
                      className="pin-pulse"
                    />
                  )}
                  {/* Outer ring */}
                  <circle
                    r={12 * scale}
                    fill="none"
                    stroke={col}
                    strokeWidth={1.5}
                    opacity={0.35}
                  />
                  {/* Pin body */}
                  <circle
                    r={7 * scale}
                    fill={active ? col : "#fff"}
                    stroke={active ? "none" : col}
                    strokeWidth={active ? 0 : 2}
                    filter={active ? "url(#pinshadow-active)" : "url(#pinshadow)"}
                    style={{ transition: "r 0.2s" }}
                  />
                  {/* Inner dot */}
                  <circle r={3 * scale} fill={active ? "#fff" : col} />
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

      {/* Zoom Controls */}
      {!isContactOpen && (
        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      )}

      {/* Mini-map */}
      {!isContactOpen && !isMobile && zoom > 1.5 && (
        <MiniMap zoom={zoom} pan={pan} containerSize={containerSize} />
      )}

      {/* Hint text */}
      {!isContactOpen && zoom === 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 38,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            color: "#9CA3AF",
            letterSpacing: "0.14em",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 20,
          }}
        >
          SCROLL OR PINCH TO ZOOM · DRAG TO PAN · DOUBLE-CLICK TO ZOOM IN
        </div>
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