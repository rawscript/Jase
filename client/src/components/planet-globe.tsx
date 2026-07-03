import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useFBX, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { PROJECTS, typeColor } from "@/lib/world-data";
import ProjectPanel from "@/components/project-panel";

type Project = (typeof PROJECTS)[number];

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const RADIUS = 2;
// If the generated planet's texture doesn't line up with real-world
// longitudes, nudge this value (in degrees) until markers sit correctly.
const LNG_OFFSET = 0;

// ─── HELPERS ────────────────────────────────────────────────────────────────
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180 + LNG_OFFSET) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// ─── PLANET MESH ────────────────────────────────────────────────────────────
function PlanetMesh() {
  const fbx = useFBX("/planet/planet.fbx");
  const albedo = useTexture("/planet/albedo.webp");
  const orm = useTexture("/planet/orm.webp");

  const model = useMemo(() => {
    const clone = fbx.clone(true);

    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.wrapS = albedo.wrapT = THREE.RepeatWrapping;
    orm.wrapS = orm.wrapT = THREE.RepeatWrapping;
    albedo.anisotropy = 4;
    orm.anisotropy = 4;

    // Center + normalize scale so the model always reads as a fixed-size sphere
    const box = new THREE.Box3().setFromObject(clone);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    clone.position.sub(sphere.center);
    clone.scale.setScalar(RADIUS / sphere.radius);

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if ((mesh as THREE.Mesh).isMesh) {
        mesh.material = new THREE.MeshStandardMaterial({
          map: albedo,
          roughnessMap: orm,
          metalnessMap: orm,
          roughness: 1,
          metalness: 1,
        });
      }
    });

    return clone;
  }, [fbx, albedo, orm]);

  return <primitive object={model} />;
}

function LoadingFallback() {
  return (
    <Html center>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "#9CA3AF",
          whiteSpace: "nowrap",
        }}
      >
        LOADING PLANET…
      </div>
    </Html>
  );
}

// ─── MARKER ─────────────────────────────────────────────────────────────────
function Marker({
  project,
  hovered,
  active,
  dimmed,
  onHover,
  onClick,
}: {
  project: Project;
  hovered: boolean;
  active: boolean;
  dimmed: boolean;
  onHover: (p: Project | null) => void;
  onClick: (proj: Project) => void;
}) {
  const pos = useMemo(
    () => latLngToVector3(project.lat, project.lng, RADIUS * 1.012),
    [project]
  );
  const col = typeColor(project.type);
  const scale = active ? 1.5 : hovered ? 1.25 : 1;

  return (
    <Html position={pos} occlude distanceFactor={7} style={{ pointerEvents: "none" }}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick(project);
        }}
        onPointerEnter={() => onHover(project)}
        onPointerLeave={() => onHover(null)}
        style={{
          position: "relative",
          width: 0,
          height: 0,
          cursor: "pointer",
          pointerEvents: "auto",
          opacity: dimmed ? 0.35 : 1,
          transition: "opacity .2s",
        }}
      >
        {/* Pulse ring */}
        {(active || hovered) && (
          <div
            className="pin-pulse"
            style={{
              position: "absolute",
              left: -20 * scale,
              top: -20 * scale,
              width: 40 * scale,
              height: 40 * scale,
              borderRadius: "50%",
              background: col,
              opacity: 0.12,
            }}
          />
        )}
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            left: -12 * scale,
            top: -12 * scale,
            width: 24 * scale,
            height: 24 * scale,
            borderRadius: "50%",
            border: `1.5px solid ${col}`,
            opacity: 0.35,
            transition: "all .2s",
          }}
        />
        {/* Pin body */}
        <div
          style={{
            position: "absolute",
            left: -7 * scale,
            top: -7 * scale,
            width: 14 * scale,
            height: 14 * scale,
            borderRadius: "50%",
            background: active ? col : "#fff",
            border: active ? "none" : `2px solid ${col}`,
            boxShadow: "0 2px 6px rgba(0,0,0,.25)",
            transition: "all .2s",
          }}
        />
        {/* Inner dot */}
        <div
          style={{
            position: "absolute",
            left: -3 * scale,
            top: -3 * scale,
            width: 6 * scale,
            height: 6 * scale,
            borderRadius: "50%",
            background: active ? "#fff" : col,
          }}
        />
        {/* Tooltip */}
        {hovered && !active && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 26,
              transform: "translateX(-50%)",
              background: "#111",
              color: "#FAF8F4",
              padding: "10px 16px",
              whiteSpace: "nowrap",
              zIndex: 35,
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
          </div>
        )}
      </div>
    </Html>
  );
}

// ─── SCENE ──────────────────────────────────────────────────────────────────
function Scene({
  activeProject,
  onSelectProject,
  hoveredPin,
  setHoveredPin,
  isContactOpen,
  controlsRef,
}: {
  activeProject: Project | null;
  onSelectProject: (p: Project | null) => void;
  hoveredPin: Project | null;
  setHoveredPin: (p: Project | null) => void;
  isContactOpen: boolean;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { camera } = useThree();
  const focusTarget = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (activeProject) {
      const dir = latLngToVector3(activeProject.lat, activeProject.lng, 1).normalize();
      const dist = camera.position.length();
      focusTarget.current = dir.multiplyScalar(dist);
    } else {
      focusTarget.current = null;
    }
  }, [activeProject, camera]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    // AutoRotate is disabled - globe stays fixed on vertical axis
    if (focusTarget.current) {
      camera.position.lerp(focusTarget.current, Math.min(1, delta * 2.2));
      controls?.update();
      if (camera.position.distanceTo(focusTarget.current) < 0.02) {
        focusTarget.current = null;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 3, 5]} intensity={1.35} />
      <directionalLight position={[-5, -2, -4]} intensity={0.25} />
      <Suspense fallback={<LoadingFallback />}>
        <PlanetMesh />
        {PROJECTS.map((p) => (
          <Marker
            key={p.id}
            project={p}
            hovered={hoveredPin?.id === p.id}
            active={activeProject?.id === p.id}
            dimmed={!!activeProject && activeProject.id !== p.id}
            onHover={setHoveredPin}
            onClick={(proj) =>
              onSelectProject(activeProject?.id === proj.id ? null : proj)
            }
          />
        ))}
      </Suspense>
    </>
  );
}

// ─── ZOOM CONTROLS ──────────────────────────────────────────────────────────
function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const btn = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 36,
        height: 36,
        background: "#fff",
        border: "1px solid #E5E7EB",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        color: "#111",
        transition: "background 0.15s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        lineHeight: 1,
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff")}
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
      {btn("+", onZoomIn)}
      {btn("−", onZoomOut)}
      {btn("⌖", onReset)}
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
interface PlanetGlobeProps {
  onSelectProject: (p: Project | null) => void;
  activeProject: Project | null;
  isContactOpen?: boolean;
}

export default function PlanetGlobe({
  onSelectProject,
  activeProject,
  isContactOpen = false,
}: PlanetGlobeProps) {
  const [hoveredPin, setHoveredPin] = useState<Project | null>(null);
  const [dragging, setDragging] = useState(false);
  const controlsRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isContactOpen;
    }
  }, [isContactOpen]);

  const zoomBy = (factor: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object as THREE.PerspectiveCamera;
    const dir = camera.position.clone().sub(controls.target);
    const newLen = THREE.MathUtils.clamp(
      dir.length() / factor,
      controls.minDistance,
      controls.maxDistance
    );
    dir.setLength(newLen);
    camera.position.copy(controls.target).add(dir);
    controls.update();
  };

  const handleReset = () => {
    onSelectProject(null);
    controlsRef.current?.reset();
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        @keyframes pinPulse {
          0% { transform: scale(0.8); opacity: 0.25; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .pin-pulse { animation: pinPulse 1.8s ease-out infinite; }
      `}</style>
      <div
        style={{
          width: "100%",
          height: "100%",
          cursor: isContactOpen ? "default" : dragging ? "grabbing" : "grab",
        }}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => {
            if (activeProject) onSelectProject(null);
          }}
        >
          <Scene
            activeProject={activeProject}
            onSelectProject={onSelectProject}
            hoveredPin={hoveredPin}
            setHoveredPin={setHoveredPin}
            isContactOpen={isContactOpen}
            controlsRef={controlsRef}
          />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={!isMobile}
            minDistance={RADIUS * 1.5}
            maxDistance={RADIUS * 4.5}
            autoRotate={false}
            rotateSpeed={0.5}
            enabled={!isContactOpen}
            // Lock vertical axis - prevent tilting up/down
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Zoom Controls */}
      {!isContactOpen && !isMobile && (
        <ZoomControls
          onZoomIn={() => zoomBy(1.3)}
          onZoomOut={() => zoomBy(1 / 1.3)}
          onReset={handleReset}
        />
      )}

      {/* Hint text */}
      {!isContactOpen && !activeProject && (
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
          DRAG TO ROTATE · SCROLL TO ZOOM · CLICK A PIN
        </div>
      )}

      {/* Project panel */}
      {activeProject && (
        <ProjectPanel project={activeProject} onClose={() => onSelectProject(null)} />
      )}
    </div>
  );
}
