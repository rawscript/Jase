import { useState, useRef, useEffect } from "react";
import { PROJECTS } from "@/lib/world-data";
import { Search, X } from "lucide-react";

type Project = (typeof PROJECTS)[number];

interface MapSearchProps {
  activeProject: Project | null;
  onSelectProject: (p: Project | null) => void;
}

export default function MapSearch({ activeProject, onSelectProject }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter projects based on name, region, or stack
  const results = PROJECTS.filter((proj) => {
    const q = query.toLowerCase().trim();
    if (!q) return false;
    return (
      proj.name.toLowerCase().includes(q) ||
      proj.region.toLowerCase().includes(q) ||
      proj.type.toLowerCase().includes(q) ||
      proj.stack.some((tech) => tech.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        selectProject(results[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectProject = (proj: Project) => {
    onSelectProject(proj);
    setQuery("");
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          border: "1px solid #D1D5DB",
          padding: "6px 12px",
          width: "100%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          transition: "all 0.2s",
        }}
        onFocus={() => setIsOpen(true)}
      >
        <Search size={14} color="#9CA3AF" style={{ marginRight: 8, flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="SEARCH PROJECTS OR STACKS..."
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: 10,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.1em",
            color: "#111",
            background: "transparent",
            padding: 0,
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setFocusedIndex(-1);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9CA3AF",
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            background: "#fff",
            border: "1px solid #E5E7EB",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            zIndex: 50,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {results.map((proj, idx) => {
            const isFocused = idx === focusedIndex;
            return (
              <div
                key={proj.id}
                onClick={() => selectProject(proj)}
                onMouseEnter={() => setFocusedIndex(idx)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  background: isFocused ? "#F9FAFB" : "#fff",
                  borderBottom: "1px solid #F3F4F6",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#111",
                  }}
                >
                  {proj.name}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 8,
                    color: "#9CA3AF",
                    marginTop: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span>{proj.region}</span>
                  <span style={{ color: "#6B7280" }}>{proj.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() !== "" && results.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            background: "#fff",
            border: "1px solid #E5E7EB",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            padding: "12px 14px",
            zIndex: 50,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            color: "#9CA3AF",
            letterSpacing: "0.05em",
            textAlign: "center",
          }}
        >
          NO RESULTS FOUND
        </div>
      )}
    </div>
  );
}
