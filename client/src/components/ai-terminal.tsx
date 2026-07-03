import { useState, useRef, useEffect, useCallback } from "react";
import { PROJECTS } from "@/lib/world-data";

// NVIDIA API Configuration - uses environment variables
const NVIDIA_CONFIG = {
  baseUrl: import.meta.env.VITE_NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  model: import.meta.env.VITE_NVIDIA_MODEL || "deepseek-ai/deepseek-v4-pro",
  temperature: 1.0,
  topP: 0.95,
  maxTokens: 2000,
};

// System prompt for context about James Mwaura
const SYSTEM_PROMPT = `You are an AI assistant for James Mwaura's portfolio website. James is a:
- Full-Stack Engineer specializing in cloud infrastructure and data engineering
- Based in Nairobi, Kenya (UTC+3)
- Works on: Cloud (AWS/GCP), Data Engineering (PostGIS/Python), Full-Stack (React/Node.js), AI/ML integration
- Key projects: Msitubora (forest monitoring), Aurora Energy (grid optimization), Mailforge AI (presentation generation)
- Skills: TypeScript, Python, PostgreSQL, Docker, Kubernetes, GIS, Satellite APIs, GenAI
- Experience: 6+ years in software engineering, data engineering, and cloud architecture
- Contact: jasemwaura@gmail.com, GitHub: rawscript, LinkedIn: jase-mwaura

Always be helpful, concise, and professional. If asked about topics outside James's expertise, politely redirect to relevant skills or offer to help with related topics.`;

// ─── STATIC COMMAND DATA ──────────────────────────────────────────────────────
const HELP_TEXT = [
  "Available commands:",
  "  about          — Who is James Mwaura",
  "  skills         — Technical skills & stack",
  "  projects       — List all projects",
  "  project <id>   — Detail on a project  (e.g. project msitubora)",
  "  experience     — Work history",
  "  contact        — How to reach James",
  "  ask <question> — Ask anything via AI (DeepSeek V4 Pro)",
  "  clear          — Clear terminal",
  "  help           — Show this menu",
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

// ─── TYPES ────────────────────────────────────────────────────────────────────
type BlockType = "banner" | "cmd" | "output" | "error" | "loading";

interface HistoryBlock {
  type: BlockType;
  text?: string;
  lines?: string[];
}

// ─── BLINK CURSOR ─────────────────────────────────────────────────────────────
function BlinkCursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color: "#3FB950" }}>{on ? "█" : "\u00A0"}</span>;
}

// ─── TERMINAL ─────────────────────────────────────────────────────────────────
interface TerminalProps {
  onClose: () => void;
}

export default function AITerminal({ onClose }: TerminalProps) {
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

    const parts = raw.toLowerCase().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1).join(" ");

    if (cmd === "clear") {
      setHistory([]);
      return;
    }
    if (cmd === "help") {
      push(raw, HELP_TEXT);
      return;
    }
    if (STATIC_COMMANDS[cmd]) {
      push(raw, STATIC_COMMANDS[cmd]);
      return;
    }

    if (cmd === "project") {
      const proj = PROJECTS.find((p) => p.id === args.trim());
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
      if (!args) {
        push(raw, ["Usage: ask <your question>"], "error");
        return;
      }
      
      // Show loading
      setHistory((h) => [
        ...h,
        { type: "cmd", text: raw },
        { type: "loading", lines: [] },
      ]);
      setLoading(true);
      
      try {
        // Get API key from environment or use fallback
        const nvidiaApiKey = import.meta.env.VITE_NVIDIA_API_KEY || "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";
        
        // Call NVIDIA API directly from browser
        const response = await fetch(`${NVIDIA_CONFIG.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${nvidiaApiKey}`,
          },
          body: JSON.stringify({
            model: NVIDIA_CONFIG.model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: args }
            ],
            temperature: NVIDIA_CONFIG.temperature,
            top_p: NVIDIA_CONFIG.topP,
            max_tokens: NVIDIA_CONFIG.maxTokens,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("NVIDIA API error:", response.status, errorText);
          throw new Error(`API error ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || "No response from AI";
        
        // Format the response
        const lines = aiResponse
          .split("\n")
          .slice(0, 14)
          .map(line => line.trim());
        
        setHistory((h) => [
          ...h.slice(0, -1),
          { type: "output", lines },
        ]);
        
      } catch (error) {
        console.error("AI Error:", error);
        setHistory((h) => [
          ...h.slice(0, -1),
          { 
            type: "error", 
            lines: [
              "AI service temporarily unavailable",
              "Try again in a moment, or use other commands:",
              "  about, skills, projects, experience, contact"
            ]
          },
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    push(
      raw,
      [`${cmd}: command not found. Type 'help' for available commands.`],
      "error"
    );
  }, [input]);

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

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: isMobile ? "#0D1117" : "rgba(0,0,0,0.7)",
        backdropFilter: isMobile ? "none" : "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Window */}
      <div
        style={{
          width: isMobile ? "100%" : "min(820px, 96vw)",
          height: isMobile ? "100%" : "min(540px, 90vh)",
          background: "#0D1117",
          border: isMobile ? "none" : "1px solid #30363D",
          boxShadow: isMobile ? "none" : "0 32px 96px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: isMobile ? 12 : 13,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "#161B22",
            borderBottom: "1px solid #30363D",
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
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#FEBC2E",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#28C840",
              }}
            />
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
            padding: "16px 20px",
            lineHeight: "1.6",
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((block, bi) => {
            if (block.type === "banner") {
              return (
                <div key={bi} style={{ color: "#3FB950", marginBottom: 8 }}>
                  {block.lines!.map((l, li) => (
                    <div key={li}>{l || "\u00A0"}</div>
                  ))}
                </div>
              );
            }
            if (block.type === "cmd") {
              return (
                <div
                  key={bi}
                  style={{ color: "#E6EDF3", marginTop: 6 }}
                >
                  <span style={{ color: "#3FB950" }}>jm</span>
                  <span style={{ color: "#8B949E" }}>@portfolio</span>
                  <span style={{ color: "#E6EDF3" }}>:~$ </span>
                  <span>{block.text}</span>
                </div>
              );
            }
            if (block.type === "loading") {
              return (
                <div
                  key={bi}
                  style={{ color: "#8B949E", marginTop: 2 }}
                >
                  <BlinkCursor />
                </div>
              );
            }
            if (block.type === "error") {
              return (
                <div
                  key={bi}
                  style={{ color: "#F85149", marginTop: 2 }}
                >
                  {block.lines!.map((l, li) => (
                    <div key={li}>{l || "\u00A0"}</div>
                  ))}
                </div>
              );
            }
            // output
            return (
              <div
                key={bi}
                style={{ color: "#C9D1D9", marginTop: 2 }}
              >
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
            borderTop: "1px solid #30363D",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            background: "#0D1117",
          }}
        >
          <span
            style={{
              color: "#3FB950",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            jm
          </span>
          <span
            style={{
              color: "#8B949E",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
            }}
          >
            @portfolio
          </span>
          <span
            style={{
              color: "#E6EDF3",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              marginRight: 6,
            }}
          >
            :~$
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
              background: "none",
              border: "none",
              outline: "none",
              color: "#E6EDF3",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              caretColor: "#3FB950",
            }}
          />
        </div>
      </div>
    </div>
  );
}
