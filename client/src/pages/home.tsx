import { useState, useEffect } from "react";
import PortfolioMap from "@/components/planet-globe";
import Navigation from "@/components/navigation";
import AITerminal from "@/components/ai-terminal";
import ContactScreen from "@/components/contact-section";
import MapSearch from "@/components/map-search";
import { PROJECTS } from "@/lib/world-data";

type Project = (typeof PROJECTS)[number];

export default function Home() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#FAF8F4",
        position: "relative",
      }}
    >
      {/* Map layer */}
      <PortfolioMap
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        isContactOpen={showContact}
      />

      {/* Floating Search Bar Overlay */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? "80px" : "22px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
          width: "min(360px, calc(100% - 32px))",
          pointerEvents: "auto",
        }}
      >
        <MapSearch activeProject={activeProject} onSelectProject={setActiveProject} />
      </div>

      {/* Floating navigation overlay */}
      <Navigation
        onOpenTerminal={() => setShowTerminal(true)}
        onOpenContact={() => setShowContact(true)}
      />

      {/* Overlays */}
      {showTerminal && (
        <AITerminal onClose={() => setShowTerminal(false)} />
      )}

      {/* Contact screen overlay */}
      {showContact && (
        <ContactScreen onClose={() => setShowContact(false)} />
      )}
    </div>
  );
}
