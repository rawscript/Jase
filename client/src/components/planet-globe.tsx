import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useFBX, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { PROJECTS, typeColor } from "@/lib/world-data";
import ProjectPanel from "@/components/project-panel";

type Project = (typeof PROJECTS)[number];

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const RADIUS = 4;
// If the generated planet's texture doesn't line up with real-world
// longitudes, nudge this value (in degrees) until markers sit correctly.
const LNG_OFFSET = 0;

// ─── FIXED GLOBE (No rotation, just planet mesh) ──────────────────────────────
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

// ─── ORBIT PARAMETERS ───────────────────────────────────────────────────────
// Each project's lat/lng seeds a distinct orbital plane so rocks/moons read as
// a deliberate constellation rather than random floating dots: latitude sets
// the orbital inclination, longitude sets which way that plane faces.
interface OrbitParams {
  project: Project;
  inclination: number;
  nodeLongitude: number;
  orbitRadius: number;
  speed: number;
  phase: number;
}

function buildOrbitParams(projects: Project[]): OrbitParams[] {
  return projects.map((project, i) => ({
    project,
    inclination: THREE.MathUtils.degToRad(project.lat),
    nodeLongitude: THREE.MathUtils.degToRad(project.lng + 180 + LNG_OFFSET),
    orbitRadius: RADIUS * (1.35 + (i % 4) * 0.14),
    speed: 0.12 + (i % 5) * 0.025,
    phase: THREE.MathUtils.degToRad((i * 53) % 360),
  }));
}

// ─── ROCK/MOON MARKER ───────────────────────────────────────────────────────
function RockMoonMarker({
  params,
  hovered,
  active,
  dimmed,
  onHover,
  onClick,
  registry,
}: {
  params: OrbitParams;
  hovered: boolean;
  active: boolean;
  dimmed: boolean;
  onHover: (p: Project | null) => void;
  onClick: (proj: Project) => void;
  registry: React.MutableRefObject<Map<string, THREE.Vector3>>;
}) {
  const { project, inclination, nodeLongitude, orbitRadius, speed, phase } = params;
  const col = typeColor(project.type);
  const revolveRef = useRef<THREE.Group>(null!);
  const rockMoonRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (revolveRef.current) {
      revolveRef.current.rotation.y += delta * speed;
    }
    if (rockMoonRef.current) {
      const worldPos = new THREE.Vector3();
      rockMoonRef.current.getWorldPosition(worldPos);
      registry.current.set(project.id, worldPos);
    }
  });

  const scale = active ? 1.7 : hovered ? 1.35 : 1;

  return (
    <group rotation={[0, nodeLongitude, 0]}>
      <group rotation={[inclination, 0, 0]}>
        {/* Orbit path - Clickable - Made to look like scattered rocks/moons along the path */}
        <group>
          {/* Main orbit ring */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onClick(project);
            }}
            onPointerEnter={(e) => {
              e.stopPropagation();
              onHover(project);
              document.body.style.cursor = "pointer";
            }}
            onPointerLeave={() => {
              onHover(null);
              document.body.style.cursor = "auto";
            }}
          >
            <ringGeometry args={[orbitRadius - 0.008, orbitRadius + 0.008, 128]} />
            <meshBasicMaterial
              color={col}
              transparent
              opacity={dimmed ? 0.02 : active ? 0.6 : hovered ? 0.4 : 0.2}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          {/* Scattered "rocks/moons" along the orbit - each clickable */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const rockSize = 0.04 + Math.random() * 0.02;
            const rockX = Math.cos(angle) * orbitRadius;
            const rockZ = Math.sin(angle) * orbitRadius;
            
            return (
              <mesh
                key={`rock-${i}`}
                position={[rockX, 0, rockZ]}
                rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
                scale={[rockSize, rockSize * 0.8, rockSize]}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(project);
                }}
                onPointerEnter={(e) => {
                  e.stopPropagation();
                  onHover(project);
                  document.body.style.cursor = "pointer";
                }}
                onPointerLeave={() => {
                  onHover(null);
                  document.body.style.cursor = "auto";
                }}
              >
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color={col}
                  emissive={col}
                  emissiveIntensity={active ? 0.8 : hovered ? 0.5 : 0.2}
                  metalness={0.7}
                  roughness={0.8}
                />
              </mesh>
            );
          })}
        </group>
        
        {/* Enhanced orbit visualization when active */}
        {active && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[orbitRadius - 0.012, orbitRadius + 0.012, 64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
        {/* Revolving rock/moon */}
        <group ref={revolveRef} rotation={[0, phase, 0]}>
          <group ref={rockMoonRef} position={[orbitRadius, 0, 0]}>
            <mesh
              scale={scale}
              onClick={(e) => {
                e.stopPropagation();
                onClick(project);
              }}
              onPointerEnter={(e) => {
                e.stopPropagation();
                onHover(project);
                document.body.style.cursor = "pointer";
              }}
              onPointerLeave={() => {
                onHover(null);
                document.body.style.cursor = "auto";
              }}
            >
              <octahedronGeometry args={[0.11, 0]} />
              <meshStandardMaterial
                color={active ? col : "#ffffff"}
                emissive={col}
                emissiveIntensity={active ? 2.0 : hovered ? 1.3 : 0.8} {/* Increased intensity */}
                metalness={0.9} {/* More metallic */}
                roughness={0.1} {/* Shinier */}
                emissiveMap={null}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={scale * 1.1}> {/* Larger ring */}
              <ringGeometry args={[0.13, 0.165, 32]} />
              <meshBasicMaterial
                color={col}
                transparent
                opacity={active ? 0.8 : hovered ? 0.6 : 0.4} {/* More visible */}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {/* Enhanced glowing aura for active rock/moon with pulsing */}
            {active && (
              <>
                <mesh scale={2.0}>
                  <sphereGeometry args={[0.08, 16, 16]} />
                  <meshBasicMaterial
                    color={col}
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
                {/* Pulsing outer ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.5}>
                  <ringGeometry args={[0.2, 0.25, 32]} />
                  <meshBasicMaterial
                    color={col}
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              </>
            )}

            {(hovered || active) && (
              <Html distanceFactor={7} occlude style={{ pointerEvents: "none" }}>
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
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: "-0.01em",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    animation: active ? "pulse 2s infinite" : "none",
                  }}
                >
                  {project.name}
                  <div
                    style={{
                      marginTop: 3,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 400,
                      fontSize: 10,
                      color: "#9CA3AF",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {project.region}
                  </div>
                </div>
              </Html>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

// ─── STATIC GLOBE SCENE (Globe fixed, rotation controlled by OrbitControls) ─
function GlobeScene({
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
  const prevActiveId = useRef<string | null>(null);
  const rockMoonPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const orbitParams = useMemo(() => buildOrbitParams(PROJECTS), []);

  // Smooth camera movement toward whichever satellite was just selected.
  // Position is read from the live registry (satellites keep moving), so the
  // camera settles on wherever that satellite actually is at selection time.
  useFrame((_, delta) => {
    if (activeProject && activeProject.id !== prevActiveId.current) {
      const pos = rockMoonPositions.current.get(activeProject.id);
      if (pos) {
        const dir = pos.clone().normalize();
        const dist = Math.max(camera.position.length(), RADIUS * 1.9);
        focusTarget.current = dir.multiplyScalar(dist);
      }
      prevActiveId.current = activeProject.id;
    } else if (!activeProject) {
      prevActiveId.current = null;
    }

    if (focusTarget.current) {
      camera.position.lerp(focusTarget.current, Math.min(1, delta * 2.2));
      controlsRef.current?.update();
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
        {/* Globe is fixed on its axis - rotation controlled only by OrbitControls */}
        <PlanetMesh />
        {/* Projects orbit the planet as satellites */}
        {orbitParams.map((op) => (
          <SatelliteMarker
            key={op.project.id}
            params={op}
            hovered={hoveredPin?.id === op.project.id}
            active={activeProject?.id === op.project.id}
            dimmed={!!activeProject && activeProject.id !== op.project.id}
            onHover={setHoveredPin}
            onClick={(proj) =>
              onSelectProject(activeProject?.id === proj.id ? null : proj)
            }
            registry={rockMoonPositions}
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
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          onError={(error) => {
            console.error("WebGL error:", error);
          }}
          onPointerMissed={() => {
            if (activeProject) onSelectProject(null);
          }}
        >
          <GlobeScene
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
            enableZoom={true}
            minDistance={RADIUS * 1.15}
            maxDistance={RADIUS * 4.5}
            rotateSpeed={1.2} // Smoother rotation
            zoomSpeed={1.2} // Smoother zoom
            dampingFactor={0.08} // Add damping for smoother controls
            enableDamping={true} // Enable momentum-based controls
            enabled={!isContactOpen}
            // Allow horizontal rotation around the globe
            // Fixed vertical angle (no tilting up/down)
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            // Orbit around the globe center
            target={[0, 0, 0]}
            // Add auto-rotation when not interacting
            autoRotate={!activeProject && !hoveredPin && !dragging && !isContactOpen}
            autoRotateSpeed={0.3} // Gentle auto-rotation
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

      {/* Hint text - Always show on mobile, conditionally on desktop */}
      {!isContactOpen && !activeProject && (
        <div
          style={{
            position: "absolute",
            bottom: 38,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: isMobile ? 8 : 9,
            color: "#9CA3AF",
            letterSpacing: "0.14em",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 20,
            background: isMobile ? "rgba(0, 0, 0, 0.7)" : "transparent",
            padding: isMobile ? "8px 12px" : "0",
            borderRadius: isMobile ? "20px" : "0",
            backdropFilter: isMobile ? "blur(4px)" : "none",
            textAlign: "center",
          }}
        >
          {isMobile ? (
            <>
              DRAG TO SPIN · PINCH TO ZOOM<br />
              TAP SATELLITES OR ROCKS FOR DETAILS
            </>
          ) : (
            "DRAG TO SPIN GLOBE · SCROLL TO ZOOM · CLICK SATELLITES OR ROCKS"
          )}
        </div>
      )}

      {/* Project panel */}
      {activeProject && (
        <ProjectPanel project={activeProject} onClose={() => onSelectProject(null)} />
      )}

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.9; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
          100% { opacity: 0.9; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </div>
  );
}