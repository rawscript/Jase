import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Linkedin, Instagram, Twitter, Download, ArrowUpRight, X } from "lucide-react";
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

  // ─── Scroll tracking for nav dots ─────────────────────────────────────────
  const sectionRefs = useRef<Record<Section, HTMLElement | null>>({
    "about-me": null,
    "projects-globe": null,
    "publications": null,
  });

  const setRef = useCallback(
    (id: Section) => (el: HTMLElement | null) => {
      sectionRefs.current[id] = el;
    },
    []
  );

  // Track which section is most visible using IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sections: Section[] = ["about-me", "projects-globe", "publications"];

    sections.forEach((id) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Smooth scroll — use native scrollIntoView with 'center' block to show full section
  const scrollToSection = (id: Section) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
    setMobileNavOpen(false);
  };

  // Handle orbit click
  const handleOrbitClick = (project: Project) => {
    setActiveProject(project);
  };

  return (
    <div className="relative" style={{ backgroundColor: "#FAF8F4" }}>
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
                      borderBottom: activeSection === id ? "2px solid #111" : "2px solid transparent",
                      paddingBottom: 2,
                    }}
                  >
                    {id === "about-me" ? "ABOUT" : id === "projects-globe" ? "PROJECTS" : "PUBLICATIONS"}
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
                  {id === "about-me" ? "ABOUT" : id === "projects-globe" ? "PROJECTS" : "PUBLICATIONS"}
                </button>
              )
            )}
          </div>
        )}
      </nav>

      {/* ─── Scroll indicator dots (desktop only) ─────────────────────── */}
      {!isMobile && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3">
          {(["about-me", "projects-globe", "publications"] as Section[]).map(
            (id) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                title={id === "about-me" ? "About" : id === "projects-globe" ? "Projects" : "Publications"}
                className="transition-all"
                style={{
                  width: activeSection === id ? 10 : 8,
                  height: activeSection === id ? 10 : 8,
                  borderRadius: "50%",
                  backgroundColor: activeSection === id ? "#111" : "#D1D5DB",
                  border: "none",
                  cursor: "pointer",
                  transform: activeSection === id ? "scale(1.2)" : "scale(1)",
                }}
              />
            )
          )}
        </div>
      )}

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
                  bridging the gap between complex data infrastructure and meaningful
                  user experiences.
                </p>
                <p>
                  My journey began with a fascination for technology and spatial data
                  systems. Over the years, I've developed expertise in cloud
                  infrastructure, data engineering, and full-stack development. I
                  specialize in building scalable systems that turn raw data into
                  actionable insights.
                </p>
                {!isMobile && (
                  <>
                    <p>
                      I'm driven by the challenge of solving problems that require both
                      technical depth and creative thinking. Whether it's architecting
                      cloud solutions, optimizing data pipelines, or building intuitive
                      interfaces, I approach every project with meticulous attention to
                      detail.
                    </p>
                    <p>
                      Outside of work, I'm constantly exploring new technologies,
                      contributing to open-source projects, and sharing knowledge with
                      the developer community.
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

      {/* ─── Projects Globe Section ───────────────────────────────────── */}
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
              The planet is drag-to-rotate — interactive elements are the orbiting
              satellites and rocks.
            </p>
          </motion.div>

          {/* Globe */}
          <div
            className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl"
            style={{ height: isMobile ? 360 : 600 }}
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

          {/* Project Details */}
          {activeProject && (
            <motion.div
              id="project-details"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 rounded-xl shadow-lg"
              style={{ marginTop: isMobile ? 16 : 24, padding: isMobile ? 16 : 24 }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: isMobile ? 12 : 16 }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        activeProject.type === "Cloud Infrastructure" ? "#D4500A" :
                        activeProject.type === "Data Engineering" ? "#1A6B3C" :
                        activeProject.type === "Full-Stack + AI" ? "#1A3F7A" : "#6B21A8",
                    }}
                  />
                  <div>
                    <h4 className="font-bold" style={{ fontSize: isMobile ? 16 : 18 }}>
                      {activeProject.name}
                    </h4>
                    <p
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: isMobile ? 9 : 11,
                        letterSpacing: "0.15em",
                        color: "#9CA3AF",
                      }}
                    >
                      {activeProject.region} · {activeProject.year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveProject(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-gray-700" style={{ fontSize: isMobile ? 14 : 15, marginBottom: 12 }}>
                {activeProject.description}
              </p>

              <div style={{ marginBottom: 12 }}>
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.2em",
                    color: "#9CA3AF",
                    marginBottom: 4,
                  }}
                >
                  IMPACT
                </p>
                <p className="text-gray-800 font-medium" style={{ fontSize: isMobile ? 13 : 14 }}>
                  {activeProject.impact}
                </p>
              </div>

              <div style={{ marginBottom: 12 }}>
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
                  {activeProject.stack.map((tech) => (
                    <span
                      key={tech}
                      className="bg-gray-100 text-gray-700 rounded-full"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: isMobile ? 9 : 10,
                        letterSpacing: "0.1em",
                        padding: "4px 10px",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {activeProject.link && (
                <a
                  href={activeProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-full"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: isMobile ? 10 : 11,
                    letterSpacing: "0.15em",
                    padding: "8px 16px",
                    marginTop: 4,
                  }}
                >
                  VISIT PROJECT <ArrowUpRight size={12} />
                </a>
              )}
            </motion.div>
          )}
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
