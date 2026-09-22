import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Linkedin,
  Instagram,
  Twitter,
  Download,
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import PlanetGlobe from "@/components/planet-globe";
import Footer from "@/components/footer";
import { PUBLICATIONS } from "@/lib/publications-data";
import { PROJECTS } from "@/lib/world-data";

type Project = (typeof PROJECTS)[number];
type Section = "about-me" | "projects-globe" | "publications";

export default function About() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("about-me");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Deck Shuffling State
  const [projectDeck, setProjectDeck] = useState<Project[]>(PROJECTS);
  const [deckIndex, setDeckIndex] = useState(0);

  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/in/jase-mwaura/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/raw.script/", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/JaseMwaura", label: "Twitter" },
  ];

  // ─── Scroll tracking for nav dots & active sections ─────────────────────
  const sectionRefs = useRef<Record<Section, HTMLElement | null>>({
    "about-me": null,
    "projects-globe": null,
    publications: null,
  });

  const setRef = useCallback(
    (id: Section) => (el: HTMLElement | null) => {
      sectionRefs.current[id] = el;
    },
    []
  );

  useEffect(() => {
    const sections: Section[] = ["about-me", "projects-globe", "publications"];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -20% 0px",
      threshold: [0.1, 0.3, 0.5, 0.8],
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id as Section;
          setActiveSection(id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth scroll
  const scrollToSection = (id: Section) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
    setMobileNavOpen(false);
  };

  // ─── Card Deck Shuffling Functionality ───────────────────────────────────
  const shuffleDeck = useCallback(() => {
    setProjectDeck((prev) => {
      if (prev.length <= 1) return prev;
      const [topCard, ...rest] = prev;
      return [...rest, topCard];
    });
  }, []);

  const shuffleBack = useCallback(() => {
    setProjectDeck((prev) => {
      if (prev.length <= 1) return prev;
      const lastCard = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [lastCard, ...rest];
    });
  }, []);

  // Mouse Wheel / Trackpad Scroll interaction over project cards
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!cardContainerRef.current) return;
      if (cardContainerRef.current.contains(e.target as Node)) {
        if (Math.abs(e.deltaY) > 20) {
          e.preventDefault();
          if (e.deltaY > 0) {
            shuffleDeck();
          } else {
            shuffleBack();
          }
        }
      }
    },
    [shuffleDeck, shuffleBack]
  );

  useEffect(() => {
    const cardEl = cardContainerRef.current;
    if (cardEl) {
      cardEl.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (cardEl) {
        cardEl.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleWheel]);

  // Handle orbit click
  const handleOrbitClick = (project: Project) => {
    setActiveProject(project);
    // Move selected project to top of deck
    setProjectDeck((prev) => {
      const filtered = prev.filter((p) => p.name !== project.name);
      return [project, ...filtered];
    });
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>
      {/* ─── Sticky Navigation ────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "rgba(250,248,244,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ padding: isMobile ? "12px 16px" : "16px 32px" }}
        >
          {/* Left: Back */}
          <a
            href="/"
            className="text-gray-500 hover:text-black transition-colors"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: isMobile ? 10 : 11,
              letterSpacing: "0.18em",
            }}
          >
            ← BACK
          </a>

          {/* Center: Name */}
          <div className="text-center">
            <p
              className="font-bold"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: isMobile ? 13 : 17,
                letterSpacing: "-0.02em",
              }}
            >
              JAMES MWAURA
            </p>
            {!isMobile && (
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "#9CA3AF",
                  marginTop: 2,
                }}
              >
                FULL-STACK · CLOUD · DATA
              </p>
            )}
          </div>

          {/* Right: Nav buttons (desktop) / hamburger (mobile) */}
          {isMobile ? (
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#6B7280",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {mobileNavOpen ? "CLOSE" : "MENU"}
            </button>
          ) : (
            <div className="flex gap-6">
              {(["about-me", "projects-globe", "publications"] as Section[]).map(
                (id) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      color: activeSection === id ? "#111" : "#9CA3AF",
                      fontWeight: activeSection === id ? 600 : 400,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      borderBottom:
                        activeSection === id ? "2px solid #111" : "2px solid transparent",
                      paddingBottom: 2,
                    }}
                  >
                    {id === "about-me"
                      ? "ABOUT"
                      : id === "projects-globe"
                      ? "PROJECTS"
                      : "PUBLICATIONS"}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Mobile dropdown nav */}
        {isMobile && mobileNavOpen && (
          <div
            style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {(["about-me", "projects-globe", "publications"] as Section[]).map(
              (id) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    color: activeSection === id ? "#111" : "#6B7280",
                    fontWeight: activeSection === id ? 600 : 400,
                    background: activeSection === id ? "rgba(0,0,0,0.04)" : "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    transition: "all 0.2s",
                  }}
                >
                  {id === "about-me"
                    ? "ABOUT"
                    : id === "projects-globe"
                    ? "PROJECTS"
                    : "PUBLICATIONS"}
                </button>
              )
            )}
          </div>
        )}
      </nav>

      {/* ─── Scroll indicator dots (Fixed & Centered, Non-clipped) ──────────────── */}
      <div
        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 bg-white/60 backdrop-blur-md p-2 rounded-full border border-black/5 shadow-sm"
        style={{ pointerEvents: "auto" }}
      >
        {(["about-me", "projects-globe", "publications"] as Section[]).map((id) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            title={
              id === "about-me"
                ? "About"
                : id === "projects-globe"
                ? "Projects"
                : "Publications"
            }
            className="transition-all duration-300 relative group flex items-center justify-center"
            style={{
              width: 14,
              height: 14,
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: activeSection === id ? 10 : 6,
                height: activeSection === id ? 10 : 6,
                borderRadius: "50%",
                backgroundColor: activeSection === id ? "#111" : "#9CA3AF",
                transition: "all 0.3s ease",
              }}
            />
            {/* Tooltip on hover */}
            <span className="absolute right-6 px-2 py-1 bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest font-mono">
              {id.replace("-globe", "").replace("-", " ")}
            </span>
          </button>
        ))}
      </div>

      {/* ─── About Me Section ─────────────────────────────────────────── */}
      <section
        ref={setRef("about-me")}
        id="about-me"
        style={{ padding: isMobile ? "40px 20px 60px" : "80px 48px 100px" }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 32 : 64,
            }}
          >
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: isMobile ? 32 : "clamp(36px, 5vw, 56px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  marginBottom: isMobile ? 16 : 24,
                }}
              >
                About{" "}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Me
                </span>
              </h1>
              <div className="w-12 h-1 bg-black" style={{ marginBottom: isMobile ? 20 : 32 }} />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? 14 : 20,
                  fontSize: isMobile ? 15 : 17,
                  lineHeight: 1.7,
                  color: "#374151",
                }}
              >
                <p>
                  I'm a passionate <strong>Geo Spatial Data Engineer</strong> and{" "}
                  <strong>Cloud Systems Architect</strong> with a deep fascination for
                  bridging the gap between complex data infrastructure and meaningful user
                  experiences.
                </p>
                <p>
                  My journey began with a fascination for technology and spatial data systems.
                  Over the years, I've developed expertise in cloud infrastructure, data
                  engineering, and full-stack development. I specialize in building scalable
                  systems that turn raw data into actionable insights.
                </p>
                {!isMobile && (
                  <>
                    <p>
                      I'm driven by the challenge of solving problems that require both
                      technical depth and creative thinking. Whether it's architecting cloud
                      solutions, optimizing data pipelines, or building intuitive interfaces,
                      I approach every project with meticulous attention to detail.
                    </p>
                    <p>
                      Outside of work, I'm constantly exploring new technologies,
                      contributing to open-source projects, and sharing knowledge with the
                      developer community.
                    </p>
                  </>
                )}
              </div>

              {/* Social + Resume */}
              <div
                className="flex items-center flex-wrap"
                style={{ gap: isMobile ? 12 : 20, marginTop: isMobile ? 24 : 32 }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    color: "#9CA3AF",
                  }}
                >
                  CONNECT
                </span>
                {socialLinks.map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-black transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <s.icon size={isMobile ? 20 : 24} />
                  </motion.a>
                ))}
              </div>

              <div style={{ marginTop: isMobile ? 16 : 20 }}>
                <motion.a
                  href="/resume.pdf"
                  download
                  className="inline-flex items-center gap-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: isMobile ? 10 : 11,
                    letterSpacing: "0.18em",
                    padding: isMobile ? "10px 20px" : "12px 24px",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={14} />
                  DOWNLOAD RESUME
                </motion.a>
              </div>
            </motion.div>

            {/* Right: Photo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex justify-center"
            >
              <div
                className="relative"
                style={{
                  width: "100%",
                  maxWidth: isMobile ? 280 : 400,
                }}
              >
                <div
                  className="bg-white border-2 border-black"
                  style={{ aspectRatio: "3/4", padding: isMobile ? 12 : 24 }}
                >
                  <img
                    src="https://i.postimg.cc/zfgcwZHv/IMG-20251129-173707.jpg"
                    alt="James Mwaura"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                {!isMobile && (
                  <>
                    <div className="absolute -top-6 -right-6 w-12 h-12 border-2 border-black" />
                    <div className="absolute -bottom-6 -left-6 w-12 h-12 border-2 border-black" />
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Projects Globe & Shuffling Cards Section ────────────────── */}
      <section
        ref={setRef("projects-globe")}
        id="projects-globe"
        style={{
          padding: isMobile ? "40px 16px 60px" : "80px 48px 100px",
          background: "linear-gradient(to bottom, #FAF8F4, #F3F1EC)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-center"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: isMobile ? 24 : "clamp(28px, 4vw, 36px)",
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Project Constellation
            </h2>
            <div className="w-12 h-1 bg-black mx-auto" style={{ marginBottom: isMobile ? 16 : 32 }} />

            <p
              className="text-center text-gray-600 mx-auto"
              style={{
                maxWidth: 560,
                fontSize: isMobile ? 14 : 16,
                lineHeight: 1.6,
                marginBottom: isMobile ? 12 : 24,
              }}
            >
              Explore my projects orbiting the planet. Click on any satellite, orbit
              path, or scattered rocks to view details.
            </p>

            <p
              className="text-center text-gray-500 mx-auto"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: isMobile ? 10 : 11,
                maxWidth: 480,
                marginBottom: isMobile ? 20 : 32,
              }}
            >
              The planet is drag-to-rotate — interactive elements are the orbiting satellites and rocks.
            </p>
          </motion.div>

          {/* Globe */}
          <div
            className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl"
            style={{ height: isMobile ? 360 : 500 }}
          >
            <PlanetGlobe
              activeProject={activeProject}
              onSelectProject={handleOrbitClick}
              isContactOpen={false}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-black/80 text-white px-3 py-1.5 rounded-full backdrop-blur-sm">
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: isMobile ? 8 : 10,
                    letterSpacing: "0.15em",
                    whiteSpace: "nowrap",
                  }}
                >
                  CLICK SATELLITES OR ROCKS TO VIEW DETAILS
                </p>
              </div>
            </div>
          </div>

          {/* ─── Shuffling Deck Project Section ───────────────────────────── */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: isMobile ? 18 : 22,
                  }}
                >
                  Project Deck
                </h3>
                <p
                  className="text-gray-500"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                  }}
                >
                  SWIPE, SCROLL MOUSE UP/DOWN, OR DRAG CARDS TO SHUFFLE
                </p>
              </div>

              {/* Shuffle Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={shuffleBack}
                  className="p-2 border border-black/20 rounded-full hover:bg-black hover:text-white transition-colors"
                  title="Previous Card"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={shuffleDeck}
                  className="p-2 border border-black/20 rounded-full hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                  title="Shuffle Deck"
                >
                  <RotateCw size={14} />
                  <span className="font-mono text-[10px] hidden sm:inline">SHUFFLE</span>
                </button>
                <button
                  onClick={shuffleDeck}
                  className="p-2 border border-black/20 rounded-full hover:bg-black hover:text-white transition-colors"
                  title="Next Card"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Postal Card Stack Container */}
            <div
              ref={cardContainerRef}
              className="relative w-full flex justify-center items-center py-6 select-none"
              style={{ minHeight: isMobile ? 380 : 420 }}
            >
              <AnimatePresence mode="popLayout">
                {projectDeck.slice(0, 4).map((project, index) => {
                  const isTop = index === 0;
                  // Card stacking offset math
                  const offsetScale = 1 - index * 0.04;
                  const offsetY = index * 12;
                  const rotation = isTop ? 0 : (index % 2 === 0 ? 1 : -1) * (index * 3);

                  return (
                    <motion.div
                      key={project.name}
                      style={{
                        position: index === 0 ? "relative" : "absolute",
                        width: "100%",
                        maxWidth: 620,
                        zIndex: projectDeck.length - index,
                        cursor: isTop ? "grab" : "pointer",
                      }}
                      initial={{ scale: 0.9, y: 30, opacity: 0 }}
                      animate={{
                        scale: offsetScale,
                        y: offsetY,
                        rotate: rotation,
                        opacity: 1 - index * 0.15,
                      }}
                      exit={{
                        x: 300,
                        opacity: 0,
                        rotate: 20,
                        transition: { duration: 0.35 },
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      drag={isTop ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.7}
                      onDragEnd={(_, info) => {
                        if (Math.abs(info.offset.x) > 100) {
                          shuffleDeck();
                        }
                      }}
                      onClick={() => {
                        if (!isTop) {
                          // Bring clicked card to top
                          setProjectDeck((prev) => {
                            const found = prev.find((p) => p.name === project.name);
                            if (!found) return prev;
                            return [found, ...prev.filter((p) => p.name !== project.name)];
                          });
                        }
                      }}
                    >
                      <div className="bg-white border-2 border-black rounded-xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                        {/* Stamp/Postal Accent */}
                        <div className="absolute top-4 right-4 border border-black/20 p-1.5 rounded text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                          CARD #{PROJECTS.findIndex((p) => p.name === project.name) + 1}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{
                              backgroundColor:
                                project.type === "Cloud Infrastructure"
                                  ? "#D4500A"
                                  : project.type === "Data Engineering"
                                  ? "#1A6B3C"
                                  : project.type === "Full-Stack + AI"
                                  ? "#1A3F7A"
                                  : "#6B21A8",
                            }}
                          />
                          <div>
                            <h4
                              className="font-bold"
                              style={{
                                fontFamily: "'Syne', sans-serif",
                                fontSize: isMobile ? 17 : 20,
                              }}
                            >
                              {project.name}
                            </h4>
                            <p
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 10,
                                letterSpacing: "0.15em",
                                color: "#9CA3AF",
                              }}
                            >
                              {project.region} · {project.year}
                            </p>
                          </div>
                        </div>

                        <p
                          className="text-gray-700 leading-relaxed mb-4"
                          style={{ fontSize: isMobile ? 13 : 14 }}
                        >
                          {project.description}
                        </p>

                        <div className="mb-4">
                          <p
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 9,
                              letterSpacing: "0.2em",
                              color: "#9CA3AF",
                              marginBottom: 2,
                            }}
                          >
                            IMPACT
                          </p>
                          <p className="text-gray-900 font-semibold text-xs md:text-sm">
                            {project.impact}
                          </p>
                        </div>

                        <div className="mb-5">
                          <p
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 9,
                              letterSpacing: "0.2em",
                              color: "#9CA3AF",
                              marginBottom: 6,
                            }}
                          >
                            TECH STACK
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.stack.map((tech) => (
                              <span
                                key={tech}
                                className="bg-gray-100 text-gray-800 rounded-full border border-black/5"
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: 9,
                                  letterSpacing: "0.08em",
                                  padding: "3px 8px",
                                }}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-full"
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 10,
                              letterSpacing: "0.15em",
                              padding: "8px 16px",
                            }}
                          >
                            VISIT PROJECT <ArrowUpRight size={12} />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Publications ─────────────────────────────────────────────── */}
      {PUBLICATIONS.length > 0 && (
        <section
          ref={setRef("publications")}
          id="publications"
          style={{ padding: isMobile ? "40px 20px 60px" : "80px 48px 100px" }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: isMobile ? 24 : "clamp(28px, 4vw, 36px)",
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                Publications
              </h2>
              <div className="w-12 h-1 bg-black" style={{ marginBottom: isMobile ? 20 : 32 }} />

              <div className="divide-y divide-black/10 border-t border-b border-black/10">
                {PUBLICATIONS.map((pub) => (
                  <a
                    key={pub.id}
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between hover:bg-black/[0.02] transition-colors"
                    style={{
                      gap: isMobile ? 12 : 24,
                      padding: isMobile ? "14px 4px" : "20px 4px",
                    }}
                  >
                    <div>
                      <p
                        className="font-semibold group-hover:underline"
                        style={{
                          fontFamily: "'Syne', sans-serif",
                          fontSize: isMobile ? 15 : 18,
                        }}
                      >
                        {pub.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: isMobile ? 9 : 11,
                          letterSpacing: "0.15em",
                          color: "#9CA3AF",
                          marginTop: 4,
                        }}
                      >
                        {pub.venue.toUpperCase()} · {pub.year}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={isMobile ? 18 : 22}
                      className="shrink-0 text-gray-400 group-hover:text-black transition-colors"
                    />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer pageContext="about" />
    </div>
  );
}
