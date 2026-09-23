import { useState, useEffect } from "react";
import PortfolioMap from "@/components/planet-globe";
import Navigation from "@/components/navigation";
import AITerminal from "@/components/ai-terminal";
import ContactScreen from "@/components/contact-section";
import MapSearch from "@/components/map-search";
import { PROJECTS } from "@/lib/world-data";
import { Sun, Moon } from "lucide-react";

type Project = (typeof PROJECTS)[number];

export default function Home() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [isDay, setIsDay] = useState(false);

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
        height: "100dvh",
        overflow: "hidden",
        background: isDay ? "#FAF8F4" : "#050914",
        transition: "background 500ms ease",
        position: "relative",
      }}
    >
      {/* Map layer */}
      <PortfolioMap
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        isContactOpen={showContact}
        isDay={isDay}
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
        isDay={isDay}
      />

      <button
        type="button"
        aria-label={isDay ? "Switch to night" : "Switch to day"}
        title={isDay ? "Switch to night" : "Switch to day"}
        onClick={() => setIsDay((day) => !day)}
        style={{ position: "absolute", zIndex: 31, bottom: isMobile ? 20 : 32, left: isMobile ? 16 : 32, width: 40, height: 40, display: "grid", placeItems: "center", border: `1px solid ${isDay ? "#D1D5DB" : "#334155"}`, background: isDay ? "rgba(255,255,255,.82)" : "rgba(15,23,42,.86)", color: isDay ? "#B7791F" : "#F8FAFC", cursor: "pointer", borderRadius: "50%", transition: "all 300ms ease" }}
      >
        {isDay ? <Moon size={18} /> : <Sun size={18} />}
      </button>

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
