import { useState, useEffect } from "react";
import PortfolioMap from "@/components/planet-globe";
import Navigation from "@/components/navigation";
import AITerminal from "@/components/ai-terminal";
import ContactScreen from "@/components/contact-section";
import MapSearch from "@/components/map-search";
import { PROJECTS } from "@/lib/world-data";
import { Sun, Moon } from "lucide-react";

type Project = (typeof PROJECTS)[number];

const THEME_OVERRIDE_KEY = "portfolio-globe-theme-override";
const NAIROBI_LATITUDE = -1.2864;
const NAIROBI_LONGITUDE = 36.8172;

function isSeasonalDaylight(now = new Date()) {
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
  const latitude = (NAIROBI_LATITUDE * Math.PI) / 180;
  const declination = (-23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365) * Math.PI) / 180;
  const hourAngle = Math.acos(-Math.tan(latitude) * Math.tan(declination));
  const daylightMinutes = (2 * hourAngle * 180 * 4) / Math.PI;
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const timezoneOffsetMinutes = -now.getTimezoneOffset();
  const solarNoon = 720 - 4 * NAIROBI_LONGITUDE - equationOfTime + timezoneOffsetMinutes;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const sunrise = solarNoon - daylightMinutes / 2;
  const sunset = solarNoon + daylightMinutes / 2;

  return currentMinutes >= sunrise && currentMinutes < sunset;
}

function getInitialTheme() {
  if (typeof window === "undefined") return true;
  const override = window.localStorage.getItem(THEME_OVERRIDE_KEY);
  if (override === "day") return true;
  if (override === "night") return false;
  return isSeasonalDaylight();
}

export default function Home() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [isDay, setIsDay] = useState(getInitialTheme);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(THEME_OVERRIDE_KEY)) return;

    const updateAutomaticTheme = () => setIsDay(isSeasonalDaylight());
    const timer = window.setInterval(updateAutomaticTheme, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setIsDay((current) => {
      const next = !current;
      window.localStorage.setItem(THEME_OVERRIDE_KEY, next ? "day" : "night");
      return next;
    });
  };

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
        onClick={toggleTheme}
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
