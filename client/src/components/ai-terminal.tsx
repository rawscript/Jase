import { useState, useRef, useEffect, useCallback } from "react";
import { PROJECTS } from "@/lib/world-data";
import { applyGlobalTheme } from "@/lib/site-theme";

// NVIDIA API Configuration
const NVIDIA_CONFIG = {
  baseUrl: import.meta.env.VITE_NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  model: import.meta.env.VITE_NVIDIA_MODEL || "deepseek-ai/deepseek-v4-pro",
  temperature: 1.0,
  topP: 0.95,
  maxTokens: 2000,
};

// name, background, text, accent, border, header
const THEME_PALETTES: Array<[string, string, string, string, string, string]> = [
  ["default", "#0D1117", "#FFFFFF", "#3FB950", "#30363D", "#161B22"],
  ["dracula", "#282A36", "#F8F8F2", "#50FA7B", "#6272A4", "#21222C"],
  ["monokai", "#272822", "#F8F8F2", "#A6E22E", "#49483E", "#1E1F1C"],
  ["matrix", "#080D09", "#B8FFC8", "#00FF66", "#174A27", "#0B1B10"],
  ["nord", "#2E3440", "#ECEFF4", "#88C0D0", "#4C566A", "#3B4252"],
  ["gruvbox", "#282828", "#EBDBB2", "#FABD2F", "#504945", "#3C3836"],
  ["solarized-dark", "#002B36", "#EEE8D5", "#B58900", "#586E75", "#073642"],
  ["solarized-light", "#FDF6E3", "#586E75", "#268BD2", "#D6CEBA", "#EEE8D5"],
  ["tokyo-night", "#1A1B26", "#C0CAF5", "#7AA2F7", "#3B4261", "#16161E"],
  ["catppuccin-mocha", "#1E1E2E", "#CDD6F4", "#CBA6F7", "#45475A", "#181825"],
  ["catppuccin-latte", "#EFF1F5", "#4C4F69", "#8839EF", "#CCD0DA", "#E6E9EF"],
  ["one-dark", "#282C34", "#ABB2BF", "#61AFEF", "#3E4451", "#21252B"],
  ["github-dark", "#0D1117", "#E6EDF3", "#2F81F7", "#30363D", "#161B22"],
  ["github-light", "#FFFFFF", "#1F2328", "#0969DA", "#D1D9E0", "#F6F8FA"],
  ["cyberpunk", "#100B1D", "#F5E9FF", "#FF2BD6", "#56316D", "#211332"],
  ["synthwave", "#241B2F", "#F8E9FF", "#FF7EDB", "#6B4D7A", "#342542"],
  ["ocean", "#071D2B", "#D7F4FF", "#35C9FF", "#16445A", "#0C2B3D"],
  ["midnight", "#090D1A", "#DDE5FF", "#8AA4FF", "#293454", "#121A30"],
  ["forest", "#101B16", "#E1F1E7", "#75C98B", "#335344", "#19291F"],
  ["emerald", "#06251E", "#D8FFF1", "#35D6A2", "#17624D", "#0B382D"],
  ["rose-pine", "#191724", "#E0DEF4", "#EBBCBA", "#403D52", "#1F1D2E"],
  ["rose-pine-moon", "#232136", "#E0DEF4", "#EA9A97", "#44415A", "#2A273F"],
  ["kanagawa", "#1F1F28", "#DCD7BA", "#98BB6C", "#54546D", "#2A2A37"],
  ["everforest", "#2D353B", "#D3C6AA", "#A7C080", "#4F585E", "#343F44"],
  ["cobalt", "#002240", "#FFFFFF", "#0088FF", "#14517D", "#003355"],
  ["night-owl", "#011627", "#D6DEEB", "#82AAFF", "#23415F", "#0B2942"],
  ["palenight", "#292D3E", "#A6ACCD", "#C792EA", "#444A6A", "#202331"],
  ["material", "#263238", "#EEFFFF", "#80CBC4", "#455A64", "#1E272C"],
  ["ayu-dark", "#0B0E14", "#BFBDB6", "#E6B450", "#2D333B", "#11151C"],
  ["ayu-light", "#FAFAFA", "#575F66", "#399EE6", "#D1D5D8", "#F3F4F5"],
  ["paper", "#F5F0E8", "#3A342E", "#B45A3C", "#D8CFC2", "#EAE3D8"],
  ["sepia", "#30261D", "#F2E3C9", "#D29B58", "#65513D", "#3C3024"],
  ["lavender", "#211B2D", "#F0E8FF", "#B99AFF", "#514269", "#2D243D"],
  ["mint", "#E9FFF6", "#25483A", "#15966A", "#B9E5D2", "#D8F5E8"],
  ["sunset", "#271717", "#FFE8D6", "#FF8A5B", "#704238", "#38221F"],
  ["aurora", "#101A25", "#E3F7F4", "#6DE2C2", "#34535A", "#182B38"],
  ["neon", "#090A12", "#F4F7FF", "#00F5FF", "#393B5C", "#14162A"],
  ["terminal-green", "#020B05", "#B5FFB8", "#39FF14", "#1D4A22", "#07160A"],
  ["terminal-amber", "#110B02", "#FFE7AE", "#FFB000", "#594016", "#211504"],
  ["terminal-cyan", "#041014", "#C7FAFF", "#00D9FF", "#15505A", "#082027"],
  ["high-contrast", "#000000", "#FFFFFF", "#FFFF00", "#777777", "#171717"],
  ["slate", "#1E293B", "#E2E8F0", "#38BDF8", "#475569", "#273449"],
  ["sandstone", "#302B24", "#F1E8D8", "#D9A441", "#625747", "#40392F"],
  ["arctic", "#EAF4F8", "#243746", "#168AAD", "#C5D9E2", "#D8EAF0"],
  ["volcanic", "#1C1111", "#F4E7E5", "#FF5733", "#5C302B", "#2A1918"],
  ["desert", "#30261C", "#F6E7C8", "#E4A94F", "#68523A", "#403222"],
  ["coffee", "#211A17", "#EADBC8", "#C08A5B", "#57463B", "#302620"],
];

const THEMES = Object.fromEntries(
  THEME_PALETTES.map(([name, bg, text, primary, border, header]) => [
    name,
    { bg, text, primary, border, header },
  ])
) as Record<string, { bg: string; text: string; primary: string; border: string; header: string }>;

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
      const themeArgs = parts.slice(1).map((part) => part.toLowerCase());
      const isGlobal = themeArgs.includes("-g");
      const targetTheme = themeArgs.find((part) => part !== "-g");

      if (!targetTheme) {
        push(
          raw,
          [
            "Error: Missing theme name.",
            "",
            "Usage:",
            "  theme <theme_name>       — Change terminal theme",
            "  theme -g <theme_name>    — Change theme everywhere (also accepts: theme <name> -g)",
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
      } else {
        color = "#FFFFFF";
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
          <div style={{ position: "relative", flex: 1, minWidth: 0, height: 20, overflow: "hidden" }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                whiteSpace: "pre",
                fontSize: isMobile ? 12 : 13,
                pointerEvents: "none",
              }}
            >
              {renderHighlightedCommand(input)}
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                padding: 0,
                background: "none",
                border: "none",
                outline: "none",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                fontSize: isMobile ? 12 : 13,
                caretColor: activeTheme.primary,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
