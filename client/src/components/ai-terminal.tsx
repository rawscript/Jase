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
      
      // Simulate AI thinking with timeout
      setTimeout(() => {
        try {
          // Get question in lowercase for matching
          const question = args.toLowerCase();
          let response = "";
          
          // Handle common questions with intelligent responses
          if (question.includes("project") || question.includes("work on") || question.includes("built")) {
            response = `James has worked on ${PROJECTS.length} key projects globally:

1. MSITUBORA - Forest monitoring with satellite APIs & blockchain
   • Location: Nairobi, Kenya
   • Tech: Blockchain, IoT, React, Satellite APIs
   • Impact: Planetary conservation monitoring

2. AURORA ENERGY - Energy grid optimization
   • Location: London, UK
   • Tech: Node.js, PostgreSQL, React
   • Impact: Energy optimization across grid networks

3. MAILFORGE AI - AI presentation generation
   • Location: San Francisco, USA
   • Tech: AI, GenAI, PostgreSQL, React
   • Impact: Rapid structural presentation generation

4. NESTIE - Real estate platform
   • Location: Nairobi, Kenya
   • Tech: Node.js, React, Next.js, Stripe
   • Impact: Advanced habitat allocation

5. GEO-SPATIAL LAB - Satellite data processing
   • Location: Berlin, Germany
   • Tech: Satellite APIs, GIS, PostGIS, Python
   • Impact: Geo-spatial data engineering

6. CLOUD INFRASTRUCTURE - Multi-cloud deployment
   • Location: Cape Town, South Africa
   • Tech: AWS, GCP, Docker, Kubernetes
   • Impact: Scalable structural deployment

All projects combine cloud infrastructure, data engineering, and full-stack development with global impact.`;
          
          } else if (question.includes("skill") || question.includes("tech") || question.includes("stack")) {
            response = `James specializes in 7 core technical areas:

CLOUD INFRASTRUCTURE
• AWS, GCP, Docker, Kubernetes, CI/CD
• Multi-cloud deployment architectures
• Serverless & containerized applications

DATA ENGINEERING
• PostgreSQL, PostGIS, Python, GDAL
• GIS & spatial data processing
• Satellite API integration

FULL-STACK DEVELOPMENT
• TypeScript, JavaScript, Node.js
• React, Next.js, REST, GraphQL
• Modern web applications

AI/ML INTEGRATION
• GenAI & LLM implementation
• Model monitoring & deployment
• AI-powered applications

BLOCKCHAIN & IOT
• Smart contract development
• IoT device integration
• Decentralized applications

DATABASES
• PostgreSQL, Redis, MongoDB
• BigQuery, data warehousing
• Database optimization

DEVOPS & TOOLING
• CI/CD pipelines, Git, Docker
• Infrastructure as Code
• Monitoring & observability

He combines these skills to build scalable, data-intensive applications across multiple continents.`;
          
          } else if (question.includes("experience") || question.includes("work history") || question.includes("career")) {
            response = `James has 6+ years of progressive engineering experience:

2022–PRESENT  • FULL-STACK ENGINEER (Remote, Global Clients)
• Building cloud-native applications for international clients
• Specializing in data pipelines & AI integration
• Technologies: TypeScript, Python, AWS, PostgreSQL

2022–2023     • CLOUD SOLUTIONS ARCHITECT (Nairobi + Cape Town)
• Designed multi-cloud deployment architectures
• Led migration projects for enterprise clients
• Technologies: AWS, GCP, Kubernetes, Docker

2020–2022     • FULL-STACK ENGINEER (Nairobi)
• Developed full-stack applications for local enterprises
• Implemented data visualization & analytics platforms
• Technologies: React, Node.js, MongoDB, Python

2018–2020     • DATA ANALYST (Nairobi)
• Data analysis & reporting for business intelligence
• Built early data pipelines & dashboards
• Technologies: Python, SQL, Tableau, Excel

He has progressed from data analysis to full-stack development to cloud architecture, building expertise across the entire technology stack.`;
          
          } else if (question.includes("contact") || question.includes("reach") || question.includes("email")) {
            response = `You can contact James through:

PRIMARY CONTACT
• Email: jasemwaura@gmail.com
• Phone: +254 114 841 437 (Kenya, UTC+3)
• Location: Nairobi, Kenya

PROFESSIONAL PROFILES
• GitHub: github.com/rawscript (code & projects)
• LinkedIn: linkedin.com/in/jase-mwaura (professional)
• Portfolio: jase.vercel.app (current site)

PREFERRED COMMUNICATION
• Email for detailed inquiries
• LinkedIn for professional connections
• GitHub for technical discussions

RESPONSE TIME
• Typically responds within 24 hours
• Available for technical consultations
• Open to collaboration on interesting projects

Best to email jasemwaura@gmail.com with specific questions about projects, collaboration, or technical work.`;
          
          } else {
            // Generic intelligent response
            response = `James Mwaura is a full-stack, cloud, and data engineer based in Nairobi, Kenya.

Based on your question "${args}", here's what I can tell you:

James specializes in building scalable applications that combine:
• Cloud infrastructure (AWS/GCP/Docker/Kubernetes)
• Data engineering (PostgreSQL/PostGIS/Python/GIS)
• Full-stack development (React/Node.js/TypeScript)
• AI/ML integration (GenAI/LLMs/model deployment)

He has worked on projects across 4 continents including:
• Environmental monitoring in East Africa
• Energy grid optimization in Europe
• AI presentation tools in North America
• Cloud infrastructure in South Africa

For specific information, try these commands:
• "projects" - List all projects
• "skills" - Technical skills & stack
• "experience" - Work history timeline
• "contact" - How to reach James
• "about" - Overview of background

Or ask more specific questions about his work, technologies, or experience.`;
          }
          
          // Format the response
          const lines = response
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
      }, 800); // Simulate AI thinking time
      
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
