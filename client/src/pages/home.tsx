import { useState } from "react";
import PortfolioMap from "@/components/portfolio-map";
import Navigation from "@/components/navigation";
import AITerminal from "@/components/ai-terminal";
import ContactScreen from "@/components/contact-section";
import { PROJECTS } from "@/lib/world-data";

type Project = (typeof PROJECTS)[number];

export default function Home() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showContact, setShowContact] = useState(false);

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
      />

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
