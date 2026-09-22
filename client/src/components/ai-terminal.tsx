import { useState, useRef, useEffect, useCallback } from "react";
import { PROJECTS } from "@/lib/world-data";

// NVIDIA API Configuration
const NVIDIA_CONFIG = {
  baseUrl: import.meta.env.VITE_NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  model: import.meta.env.VITE_NVIDIA_MODEL || "deepseek-ai/deepseek-v4-pro",
  temperature: 1.0,
  topP: 0.95,
  maxTokens: 2000,
};

// Available Themes Palette
const THEMES: Record<string, { bg: string; text: string; primary: string; border: string; header: string }> = {
  default: {
    bg: "#0D1117",
    text: "#FFFFFF",
    primary: "#3FB950",
    border: "#30363D",
    header: "#161B22",
  },
  dracula: {
    bg: "#282a36",
    text: "#f8f8f2",
    primary: "#50fa7b",
    border: "#6272a4",
    header: "#21222c",
  },
  monokai: {
    bg: "#272822",
    text: "#f8f8f2",
    primary: "#a6e22e",
    border: "#49483e",
    header: "#1e1f1c",
  },
  matrix: {
    bg: "#0d0d0d",
    text: "#00ff66",
    primary: "#00ff66",
    border: "#003311",
    header: "#051A05",
  },
};

const HELP_TEXT = [
  "Available commands:",
  "  about         — Who is James Mwaura",
  "  skills        — Technical skills & stack",
  "  projects      — List all projects",
  "  project <id>  — Detail on a project  (e.g. project msitubora)",
  "  experience    — Work history",
  "  contact       — How to reach James",
  "  theme [-g] <name> — Change terminal or global theme",
  "  ask <question> — Ask anything via AI (DeepSeek V4 Pro)",
  "  clear         — Clear terminal",
  "  help          — Show this menu",
];

const STATIC_COMMANDS: Record<string, string[]> = {
  about: [
    "James Mwaura",
    "Full-Stack · Cloud · Data Engineer — Nairobi, Kenya",
    "",
    "Builds high-throughput data pipelines, cloud-native infrastructure,",
    "and full-stack products deployed across multiple continents.",
    "Works at the intersection of data engineering and cloud architecture.",
  ],
  skills: [
    "CLOUD        AWS · GCP · Docker · Kubernetes · CI/CD",
    "DATA         PostgreSQL · PostGIS · Python · GDAL · GIS",
    "LANGUAGES    TypeScript · JavaScript · Node.js · Python · SQL",
    "DATABASES    PostgreSQL · Redis · MongoDB · BigQuery",
    "FULL-STACK   Next.js · React · Node.js · REST · GraphQL",
    "AI/ML        GenAI · LLM integration · Model monitoring",
    "BLOCKCHAIN   Smart contracts · IoT · Satellite API",
  ],
  experience: [
    "Full-Stack Engineer       2022–present   (Remote, global clients)",
    "Cloud Solutions Architect 2022–2023      (Nairobi + Cape Town)",
    "Full-Stack Engineer       2020–2022      (Nairobi)",
    "Data Analyst              2018–2020      (Nairobi)",
  ],
  projects: PROJECTS.map(
    (p) => `  ${p.id.padEnd(14)} ${p.name.padEnd(22)} ${p.region}`
  ),
  contact: [
    "Email     jasemwaura@gmail.com",
    "Phone     +254 114 841 437",
    "GitHub    github.com/rawscript",
    "LinkedIn  linkedin.com/in/jase-mwaura",
    "Location  Nairobi, Kenya (UTC+3)",
  ],
};

type BlockType = "banner" | "cmd" | "output" | "error" | "loading";

interface HistoryBlock {
  type: BlockType;
  text?: string;
  lines?: string[];
}

function BlinkCursor({ color }: { color: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color }}>{on ? "█" : "\u00A0"}</span>;
}

interface TerminalProps {
  onClose: () => void;
}

export default function AITerminal({ onClose }: TerminalProps) {
  const [themeKey, setThemeKey] = useState<string>("default");
  const activeTheme = THEMES[themeKey] || THEMES.default;

  const [history, setHistory] = useState<HistoryBlock[]>([
    {
      type: "banner",
      lines: [
        "╔══════════════════════════════════════════════════════════╗",
        "║      JAMES MWAURA — PORTFOLIO TERMINAL v1.0.0            ║",
        "║      Full-Stack · Cloud · Data Engineer                  ║",
        "╚══════════════════════════════════════════════════════════╝",
        "",
        'Type "help" to see available commands.',
        "",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const push = (cmd: string, lines: string[], type: BlockType = "output") => {
    setHistory((h) => [
      ...h,
      { type: "cmd", text: cmd },
      { type, lines },
    ]);
  };

  const applyGlobalTheme = (selectedTheme: typeof activeTheme) => {
    document.body.style.backgroundColor = selectedTheme.bg;
    document.body.style.color = selectedTheme.text;
    document.documentElement.style.setProperty("--bg-color", selectedTheme.bg);
    document.documentElement.style.setProperty("--text-color", selectedTheme.text);
    document.documentElement.style.setProperty("--primary-color", selectedTheme.primary);
  };

  const run = useCallback(async () => {
    const raw = input.trim();
    if (!raw) return;
    setInput("");
    setCmdHistory((h) => [raw, ...h]);
    setHistIdx(-1);

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (cmd === "clear") {
      setHistory([]);
      return;
    }
    if (cmd === "help") {
      push(raw, HELP_TEXT);
      return;
    }

    // Theme Command Handling
    if (cmd === "theme" || cmd === "themes") {
      const isGlobal = parts.includes("-g");
      const filteredParts = parts.filter((p) => p !== "-g" && p.toLowerCase() !== "theme" && p.toLowerCase() !== "themes");
      const targetTheme = filteredParts[0]?.toLowerCase();

      if (!targetTheme) {
        push(
          raw,
          [
            "Error: Missing theme name.",
            "",
            "Usage:",
            "  theme <theme_name>       — Change terminal theme",
            "  theme -g <theme_name>    — Change theme everywhere (including landing page)",
            "",
            `Available themes: ${Object.keys(THEMES).join(", ")}`,
          ],
          "error"
        );
        return;
      }

      if (!THEMES[targetTheme]) {
        push(
          raw,
          [
            `Error: Unknown theme '${targetTheme}'.`,
            `Available themes: ${Object.keys(THEMES).join(", ")}`,
          ],
          "error"
        );
        return;
      }

      setThemeKey(targetTheme);
      if (isGlobal) {
        applyGlobalTheme(THEMES[targetTheme]);
        push(raw, [`Global theme updated to '${targetTheme}'.`]);
      } else {
        push(raw, [`Terminal theme changed to '${targetTheme}'.`]);
      }
      return;
    }

    if (STATIC_COMMANDS[cmd]) {
      push(raw, STATIC_COMMANDS[cmd]);
      return;
    }

    if (cmd === "project") {
      const args = parts.slice(1).join(" ");
      const proj = PROJECTS.find((p) => p.id === args.trim().toLowerCase());
      if (!proj) {
        push(
          raw,
          [`project: unknown id '${args}'. Run 'projects' to list all.`],
          "error"
        );
        return;
      }
      push(raw, [
        `${proj.name} — ${proj.type}`,
        `Region   ${proj.region}`,
        `Year     ${proj.year}`,
        `Stack    ${proj.stack.join(" · ")}`,
        `Impact   ${proj.impact}`,
        "",
        proj.description,
      ]);
      return;
    }

    if (cmd === "ask") {
      const args = parts.slice(1).join(" ");
      if (!args) {
        push(raw, ["Usage: ask <your question>"], "error");
        return;
      }

      setHistory((h) => [
        ...h,
        { type: "cmd", text: raw },
        { type: "loading", lines: [] },
      ]);
      setLoading(true);

      setTimeout(() => {
        try {
          const question = args.toLowerCase();
          let response = "";

          if (question.includes("project") || question.includes("work on") || question.includes("built")) {
            response = `James has worked on ${PROJECTS.length} key projects globally:\n\n1. MSITUBORA - Forest monitoring\n2. AURORA ENERGY - Energy grid optimization\n3. MAILFORGE AI - AI presentation generation`;
          } else if (question.includes("skill") || question.includes("tech") || question.includes("stack")) {
            response = `James specializes in 7 core technical areas including Cloud Infrastructure, Data Engineering, Full-Stack Dev, and AI/ML Integration.`;
          } else if (question.includes("contact") || question.includes("reach")) {
            response = `Email: jasemwaura@gmail.com\nGitHub: github.com/rawscript\nLinkedIn: linkedin.com/in/jase-mwaura`;
          } else {
            response = `James Mwaura is a full-stack, cloud, and data engineer based in Nairobi, Kenya.\n\nType 'help' to explore specific commands.`;
          }

          const lines = response.split("\n").map((line) => line.trim());

          setHistory((h) => [
            ...h.slice(0, -1),
            { type: "output", lines },
          ]);
        } catch (error) {
          setHistory((h) => [
            ...h.slice(0, -1),
            {
              type: "error",
              lines: ["AI service temporarily unavailable."],
            },
          ]);
        } finally {
          setLoading(false);
        }
      }, 50);

      return;
    }

    push(
      raw,
      [`${cmd}: command not found. Type 'help' for available commands.`],
      "error"
    );
  }, [input, themeKey]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx] || "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : cmdHistory[idx] || "");
    }
  };

  // Syntax highlighting parser for command input
  const renderHighlightedCommand = (fullText: string) => {
    const words = fullText.split(" ");
    return words.map((word, idx) => {
      let color = "#FFFFFF"; // Default white for arguments
      if (idx === 0) {
        color = "#3FB950"; // Green for the command itself
      } else if (word.startsWith("-")) {
        color = "#D29922"; // Yellow for flags
      } else {
        color = "#58A6FF"; // Cyan for values
      }

      return (
        <span key={idx} style={{ color }}>
          {word}{idx < words.length - 1 ? " " : ""}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: isMobile ? "100dvh" : "100vh",
        zIndex: 50,
        background: isMobile ? activeTheme.bg : "rgba(0,0,0,0.75)",
        backdropFilter: isMobile ? "none" : "blur(8px)",
        display: "flex",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: isMobile ? "stretch" : "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Terminal Window with Rounded Corners */}
      <div
        style={{
          width: isMobile ? "100%" : "min(820px, 96vw)",
          height: isMobile ? "100%" : "min(540px, 90vh)",
          maxHeight: "100%",
          background: activeTheme.bg,
          border: isMobile ? "none" : `1px solid ${activeTheme.border}`,
          borderRadius: isMobile ? "0px" : "12px",
          boxShadow: isMobile ? "none" : "0 32px 96px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DejaVu Sans Mono', 'Liberation Mono', 'Ubuntu Mono', 'Courier New', monospace",
          fontSize: isMobile ? 12 : 13,
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: activeTheme.header,
            borderBottom: `1px solid ${activeTheme.border}`,
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onClose}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#FF5F57",
                border: "none",
                cursor: "pointer",
              }}
            />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
          </div>
          <span
            style={{
              flex: 1,
              textAlign: "center",
              color: "#8B949E",
              fontSize: 12,
              letterSpacing: "0.05em",
            }}
          >
            jm — portfolio terminal
          </span>
        </div>

        {/* Output area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: isMobile ? "10px 12px" : "16px 20px",
            lineHeight: "1.6",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((block, bi) => {
            if (block.type === "banner") {
              return (
                <div key={bi} style={{ color: activeTheme.primary, marginBottom: 8, overflowX: "auto", whiteSpace: "pre" }}>
                  {block.lines!.map((l, li) => (
                    <div key={li}>{l || "\u00A0"}</div>
                  ))}
                </div>
              );
            }
            if (block.type === "cmd") {
              return (
                <div key={bi} style={{ marginTop: 6 }}>
                  <span style={{ color: activeTheme.primary }}>jm</span>
                  <span style={{ color: "#8B949E" }}>@portfolio</span>
                  <span style={{ color: activeTheme.text }}>:~$ </span>
                  {renderHighlightedCommand(block.text || "")}
                </div>
              );
            }
            if (block.type === "loading") {
              return (
                <div key={bi} style={{ marginTop: 2 }}>
                  <BlinkCursor color={activeTheme.primary} />
                </div>
              );
            }
            if (block.type === "error") {
              return (
                <div key={bi} style={{ color: "#F85149", marginTop: 2 }}>
                  {block.lines!.map((l, li) => (
                    <div key={li}>{l || "\u00A0"}</div>
                  ))}
                </div>
              );
            }
            // Default output
            return (
              <div key={bi} style={{ color: activeTheme.text, marginTop: 2 }}>
                {block.lines!.map((l, li) => (
                  <div key={li}>{l || "\u00A0"}</div>
                ))}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div
          style={{
            borderTop: `1px solid ${activeTheme.border}`,
            padding: isMobile ? "8px 12px" : "10px 20px",
            display: "flex",
            alignItems: "center",
            background: activeTheme.bg,
          }}
        >
          {!isMobile && (
            <>
              <span style={{ color: activeTheme.primary, fontSize: 13, whiteSpace: "nowrap" }}>
                jm
              </span>
              <span style={{ color: "#8B949E", fontSize: 13 }}>
                @portfolio
              </span>
            </>
          )}
          <span
            style={{
              color: isMobile ? activeTheme.primary : activeTheme.text,
              fontSize: isMobile ? 12 : 13,
              marginRight: 6,
            }}
          >
            {isMobile ? "$ " : ":~$"}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              minWidth: 0,
              background: "none",
              border: "none",
              outline: "none",
              color: "#3FB950", // Entered text turns green
              fontSize: isMobile ? 12 : 13,
              caretColor: activeTheme.primary,
            }}
          />
        </div>
      </div>
    </div>
  );
}
