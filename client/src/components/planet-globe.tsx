import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars, useFBX, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { PROJECTS, typeColor } from "@/lib/world-data";
import ProjectPanel from "@/components/project-panel";

type Project = (typeof PROJECTS)[number];

// ─── CONFIG ──────────────────────────────────────────────────────────
const RADIUS = 4;
// If the generated planet's texture doesn't line up with real-world
// longitudes, nudge this value (in degrees) until markers sit correctly.
const LNG_OFFSET = 0;

function createCityLightsTexture(surfaceImage: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = surfaceImage.width;
  canvas.height = surfaceImage.height;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.drawImage(surfaceImage, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  context.clearRect(0, 0, canvas.width, canvas.height);

  const step = 4;
  for (let y = step; y < canvas.height - step; y += step) {
    for (let x = step; x < canvas.width - step; x += step) {
      const pixel = (y * canvas.width + x) * 4;
      const red = pixels[pixel];
      const green = pixels[pixel + 1];
      const blue = pixels[pixel + 2];

      // Keep the blue night-side presence on the ocean surface itself. City
      // lights are added only after the land mask rejects ocean pixels.
      if (blue > red * 1.2 && blue > green * 1.08) {
        context.fillStyle = "#061a38";
        context.fillRect(x, y, step, step);
        continue;
      }

      const regionalDensity =
        0.5 +
        0.25 * Math.sin(x * 0.008 + 1.8 * Math.sin(y * 0.005)) +
        0.25 * Math.cos(y * 0.009 + 1.4 * Math.cos(x * 0.004));
      if (regionalDensity < 0.39) continue;

      const pointHash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const pointDensity = pointHash - Math.floor(pointHash);
      if (pointDensity > 0.09) continue;

      const radius = 1.5 + pointDensity * 5;
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, "rgba(255, 230, 178, 0.76)");
      glow.addColorStop(0.28, "rgba(255, 183, 96, 0.38)");
      glow.addColorStop(1, "rgba(255, 159, 67, 0)");
      context.fillStyle = glow;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// ─── FIXED GLOBE (No rotation, just planet mesh) ──────────────────────────────
function PlanetMesh({ isDay }: { isDay: boolean }) {
  const sunDirection = useRef(new THREE.Vector3(4, 3, 5).normalize());
  const shaderUniforms = useRef({ sunDirectionView: new THREE.Vector3(4, 3, 5).normalize() });
  const { camera } = useThree();
  const fbx = useFBX("/planet/planet.fbx");
  const albedo = useTexture("/planet/albedo.webp");
  const orm = useTexture("/planet/orm.webp");
  const cityLights = useMemo(
    () => createCityLightsTexture(albedo.image as HTMLImageElement),
    [albedo]
  );

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
        const material = new THREE.MeshStandardMaterial({
          map: albedo,
          emissiveMap: cityLights ?? undefined,
          emissive: new THREE.Color("#ffc77d"),
          emissiveIntensity: isDay ? 0 : 1.8,
          roughnessMap: orm,
          roughness: 0.76,
          metalness: 0,
        });
        material.onBeforeCompile = (shader) => {
          shader.uniforms.uSunDirectionView = {
            value: shaderUniforms.current.sunDirectionView,
          };
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <emissivemap_fragment>",
            `#include <emissivemap_fragment>
              float surfaceSunlight = dot(normalize(vNormal), normalize(uSunDirectionView));
              float nightSide = 1.0 - smoothstep(-0.08, 0.12, surfaceSunlight);
              totalEmissiveRadiance *= nightSide;`
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <common>",
            `#include <common>
              uniform vec3 uSunDirectionView;`
          );
        };
        material.customProgramCacheKey = () => "planet-city-lights-terminator-v1";
        mesh.material = material;
      }
    });

    return clone;
  }, [fbx, albedo, orm, cityLights, isDay]);

  useFrame(() => {
    shaderUniforms.current.sunDirectionView
      .copy(sunDirection.current)
      .transformDirection(camera.matrixWorldInverse);
  });

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

// ─── ASTEROID MODEL LOADER ───────────────────────────────────────────────────
function AsteroidModel({ scale }: { scale: number }) {
  const fbx = useFBX("/asteroids/output.fbx");
  const texture = useTexture("/asteroids/textured_mesh.jpg");
  
  const model = useMemo(() => {
    const clone = fbx.clone(true);
    
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if ((mesh as THREE.Mesh).isMesh) {
        mesh.material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.8,
          metalness: 0.2,
        });
      }
    });
    
    return clone;
  }, [fbx, texture]);
  
  // Shrink asteroids to 1% of their already shrunk size (0.0077 * 0.01 = 0.000077)
  return <primitive object={model} scale={scale * 0.0027} />;
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
  isDay,
}: {
  params: OrbitParams;
  hovered: boolean;
  active: boolean;
  dimmed: boolean;
  onHover: (p: Project | null) => void;
  onClick: (proj: Project) => void;
  registry: React.MutableRefObject<Map<string, THREE.Vector3>>;
  isDay: boolean;
}) {
  const { project, inclination, nodeLongitude, orbitRadius, speed, phase } = params;
  const col = typeColor(project.type);
  const revolveRef = useRef<THREE.Group>(null!);
  const rockMoonRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (revolveRef.current) {
      const targetSpeed = active ? speed * 0.08 : speed;
      const currentSpeed = revolveRef.current.userData.orbitSpeed ?? speed;
      const easedSpeed = THREE.MathUtils.damp(currentSpeed, targetSpeed, 5, delta);
      revolveRef.current.userData.orbitSpeed = easedSpeed;
      revolveRef.current.rotation.y += delta * easedSpeed;
    }
    if (rockMoonRef.current) {
      const worldPos = new THREE.Vector3();
      rockMoonRef.current.getWorldPosition(worldPos);
      registry.current.set(project.id, worldPos);
    }
  });

  const scale = active ? 1.7 : hovered ? 1.35 : 1;

  // Small movement threshold to distinguish click vs drag (in pixels)
  const CLICK_MOVE_THRESHOLD = 6;
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  // helper to set cursor only for mouse pointers
  const setPointerCursorIfMouse = (e: any, cursor: string) => {
    try {
      if (e && e.pointerType === "mouse") {
        document.body.style.cursor = cursor;
      }
    } catch {
      // ignore - defensive
    }
  };

  return (
    <group rotation={[0, nodeLongitude, 0]}>
      <group rotation={[inclination, 0, 0]}>
        {/* Orbit path - Clickable */}
        <group>
          {/* Main orbit ring */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerDown={(e) => {
              e.stopPropagation();
              pointerDownRef.current = { x: (e as any).clientX, y: (e as any).clientY };
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              const pd = pointerDownRef.current;
              pointerDownRef.current = null;
              if (!pd || Math.hypot((e as any).clientX - pd.x, (e as any).clientY - pd.y) < CLICK_MOVE_THRESHOLD) {
                onClick(project);
              }
            }}
            onPointerEnter={(e) => {
              e.stopPropagation();
              onHover(project);
              setPointerCursorIfMouse(e, "pointer");
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              onHover(null);
              setPointerCursorIfMouse(e, "auto");
            }}
          >
            <ringGeometry args={[orbitRadius - 0.014, orbitRadius + 0.014, 160]} />
            <meshBasicMaterial
              color={col}
              transparent
              opacity={dimmed ? 0.05 : active ? 0.9 : hovered ? 0.78 : isDay ? 0.24 : 0.68}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
            <ringGeometry args={[orbitRadius - 0.045, orbitRadius + 0.045, 160]} />
            <meshBasicMaterial
              color={col}
              transparent
              opacity={dimmed ? 0.01 : active ? 0.22 : isDay ? 0.035 : 0.14}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
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
            <group
              onPointerDown={(e) => {
                e.stopPropagation();
                pointerDownRef.current = { x: (e as any).clientX, y: (e as any).clientY };
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                const pd = pointerDownRef.current;
                pointerDownRef.current = null;
                if (!pd || Math.hypot((e as any).clientX - pd.x, (e as any).clientY - pd.y) < CLICK_MOVE_THRESHOLD) {
                  onClick(project);
                }
              }}
              onPointerEnter={(e) => {
                e.stopPropagation();
                onHover(project);
                setPointerCursorIfMouse(e, "pointer");
              }}
              onPointerLeave={(e) => {
                e.stopPropagation();
                onHover(null);
                setPointerCursorIfMouse(e, "auto");
              }}
            >
              <Suspense fallback={null}>
                <AsteroidModel scale={scale} />
              </Suspense>
              {/* Larger transparent shell makes the moving asteroid dependable to tap or click. */}
              <mesh>
                <sphereGeometry args={[0.3, 20, 20]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
              </mesh>
            </group>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={scale * 1.1}>
              <ringGeometry args={[0.13, 0.165, 32]} />
              <meshBasicMaterial
                color={col}
                transparent
                opacity={active ? 0.8 : hovered ? 0.6 : isDay ? 0.25 : 0.5}
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
            {active && (
              <Html position={[0, 0, 0]} style={{ pointerEvents: "none" }}>
                <div className="asteroid-card-beam" />
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
  controlsRef,
  isDay,
  destroyedAsteroids,
}: {
  activeProject: Project | null;
  onSelectProject: (p: Project | null) => void;
  hoveredPin: Project | null;
  setHoveredPin: (p: Project | null) => void;
  controlsRef: React.MutableRefObject<any>;
  isDay: boolean;
  destroyedAsteroids: Set<string>;
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
      <ambientLight intensity={isDay ? 0.16 : 0.035} color={isDay ? "#b8c8df" : "#22305c"} />
      <directionalLight position={[7, 4, 6]} intensity={isDay ? 2.8 : 0.75} color={isDay ? "#fff4d6" : "#b9cbff"} />
      <directionalLight position={[-5, -2, -4]} intensity={isDay ? 0.05 : 0.025} color="#263a77" />
      {!isDay && <Stars radius={120} depth={60} count={7000} factor={3.2} saturation={0.15} fade speed={0.18} />}
      <Suspense fallback={<LoadingFallback />}>
        {/* Globe is fixed on its axis - rotation controlled only by OrbitControls */}
        <PlanetMesh isDay={isDay} />
        {/* Projects orbit the planet as satellites */}
        {orbitParams.map((op) => (
          !destroyedAsteroids.has(op.project.id) &&
          <RockMoonMarker
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
            isDay={isDay}
          />
        ))}
      </Suspense>
    </>
  );
}

// ─── ZOOM CONTROLS ────────────────────────────────────────────────────────
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

// ─── MAIN EXPORT ────────────────────────────────────────────────────────
interface PlanetGlobeProps {
  onSelectProject: (p: Project | null) => void;
  activeProject: Project | null;
  isContactOpen?: boolean;
  isDay?: boolean;
}

export default function PlanetGlobe({
  onSelectProject,
  activeProject,
  isContactOpen = false,
  isDay = true,
}: PlanetGlobeProps) {
  const [hoveredPin, setHoveredPin] = useState<Project | null>(null);
  const [dragging, setDragging] = useState(false);
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);
  const [destroyedAsteroids, setDestroyedAsteroids] = useState<Set<string>>(() => new Set());
  const previousProjectId = useRef<string | null>(null);

  useEffect(() => {
    const previousId = previousProjectId.current;
    if (previousId && previousId !== activeProject?.id) {
      setDestroyedAsteroids((current) => new Set(current).add(previousId));
    }
    previousProjectId.current = activeProject?.id ?? null;
  }, [activeProject?.id]);

  // Responsive container sizing - updates on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
      setIsMobile(window.innerWidth <= 768);
    };

    updateDimensions();
    
    // Use ResizeObserver for responsive updates like RevolverMaps
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateDimensions);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
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

  // Calculate responsive FOV based on aspect ratio (like RevolverMaps)
  const getResponsiveFOV = () => {
    if (dimensions.width === 0 || dimensions.height === 0) return 42;
    const aspectRatio = dimensions.width / dimensions.height;
    // Adjust FOV based on aspect ratio for optimal viewing
    if (aspectRatio > 1.5) return 38; // Wide screens
    if (aspectRatio < 0.8) return 48; // Tall/mobile screens
    return 42; // Default
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: "relative", 
        width: "100%", 
        height: "100%",
        overflow: "hidden" // Prevent scrollbars like RevolverMaps
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          cursor: isContactOpen ? "default" : dragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onPointerDown={() => {
          setDragging(true);
          setUserInteracting(true);
        }}
        onPointerUp={() => {
          setDragging(false);
          // Delay resetting user interaction to allow momentum to finish
          setTimeout(() => setUserInteracting(false), 3000);
        }}
        onPointerLeave={() => {
          setDragging(false);
          setTimeout(() => setUserInteracting(false), 3000);
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: getResponsiveFOV() }}
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
            controlsRef={controlsRef}
            isDay={isDay}
            destroyedAsteroids={destroyedAsteroids}
          />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={RADIUS * 1.15}
            maxDistance={RADIUS * 4.5}
            rotateSpeed={isMobile ? 0.5 : 0.7}
            zoomSpeed={isMobile ? 0.6 : 0.8}
            dampingFactor={0.05}
            enableDamping={true}
            enabled={!isContactOpen}
            // Allow full rotation in all directions like RevolverMaps
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            target={[0, 0, 0]}
            autoRotate={!activeProject && !hoveredPin && !dragging && !isContactOpen && !userInteracting}
            autoRotateSpeed={0.5}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_ROTATE
            }}
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

      {/* Hint text - Responsive positioning */}
      {!isContactOpen && !activeProject && (
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? 20 : 38,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: isMobile ? 9 : 11,
            color: "#9CA3AF",
            letterSpacing: "0.12em",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 20,
            background: isMobile ? "rgba(0, 0, 0, 0.75)" : "transparent",
            padding: isMobile ? "10px 16px" : "0",
            borderRadius: isMobile ? "24px" : "0",
            backdropFilter: isMobile ? "blur(8px)" : "none",
            textAlign: "center",
            maxWidth: isMobile ? "90%" : "100%",
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
        <ProjectPanel project={activeProject} onClose={() => onSelectProject(null)} isDay={isDay} />
      )}

      {/* Add CSS for pulse animation */}
      <style>{`
        .asteroid-card-beam {
          position: absolute;
          left: 50%;
          top: 0;
          width: max(0px, calc(50vw - 210px));
          height: 2px;
          transform-origin: left center;
          background: linear-gradient(90deg, rgba(125,211,252,.95), rgba(125,211,252,.2), transparent);
          box-shadow: 0 0 10px #7dd3fc;
          animation: beamPulse 1.8s ease-in-out infinite;
        }
        @keyframes beamPulse { 50% { opacity: .45; } }
        @keyframes pulse {
          0% { opacity: 0.9; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
          100% { opacity: 0.9; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
