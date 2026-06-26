import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Cloud, Database, Cpu, TreePine, Home, Zap,
  Mail, Sparkles, Send, RotateCcw, ExternalLink, X,
  ChevronRight, Loader2, CheckCircle, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MapLocation {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  type: "project" | "skill" | "infrastructure";
  icon: React.ElementType;
  color: string;
  glow: string;
  details: { technologies: string[]; impact: string; link?: string };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

type View = "map" | "contact" | "chat";

// ─── Map data ─────────────────────────────────────────────────────────────────
const MAP_LOCATIONS: MapLocation[] = [
  {
    id: "msitubora",
    name: "Msitubora Forest",
    description: "Kakamega Forest monitoring with satellite API integration",
    position: { x: 22, y: 32 },
    type: "project",
    icon: TreePine,
    color: "#10B981",
    glow: "rgba(16,185,129,0.4)",
    details: {
      technologies: ["Blockchain", "IoT", "React", "TypeScript", "Satellite APIs"],
      impact: "Real-time conservation monitoring of Kakamega Forest",
      link: "https://msitubora.onrender.com/",
    },
  },
  {
    id: "aurora",
    name: "Aurora Energy",
    description: "Energy management system for African homes",
    position: { x: 62, y: 42 },
    type: "project",
    icon: Zap,
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.4)",
    details: {
      technologies: ["Node.js", "ES6", "PostgreSQL", "React"],
      impact: "Energy optimisation across African households",
      link: "https://auroraenergy.app/",
    },
  },
  {
    id: "mailforge",
    name: "Mailforge AI",
    description: "AI text-to-presentation tool for businesses",
    position: { x: 42, y: 18 },
    type: "project",
    icon: Cpu,
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.4)",
    details: {
      technologies: ["AI/ML", "GenAI", "PostgreSQL", "React", "TypeScript"],
      impact: "Professional presentations generated in seconds",
      link: "https://mailforge.studio/",
    },
  },
  {
    id: "nestie",
    name: "Nestie Homes",
    description: "Modern real estate platform with M-Pesa payments",
    position: { x: 76, y: 66 },
    type: "project",
    icon: Home,
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.4)",
    details: {
      technologies: ["Node.js", "React", "Next.js", "Stripe", "Daraja"],
      impact: "Simplifies property discovery and rental in Kenya",
      link: "https://nestie.in/",
    },
  },
  {
    id: "geo-spatial",
    name: "Geo Spatial Hub",
    description: "Satellite data processing & spatial analysis",
    position: { x: 18, y: 62 },
    type: "skill",
    icon: MapPin,
    color: "#EC4899",
    glow: "rgba(236,72,153,0.4)",
    details: {
      technologies: ["Satellite APIs", "GIS", "PostGIS", "Python", "GDAL"],
      impact: "Geo spatial data engineering expertise",
      link: "https://github.com/rawscript",
    },
  },
  {
    id: "cloud-infra",
    name: "Cloud Citadel",
    description: "Cloud deployment & server management",
    position: { x: 82, y: 28 },
    type: "infrastructure",
    icon: Cloud,
    color: "#14B8A6",
    glow: "rgba(20,184,166,0.4)",
    details: {
      technologies: ["AWS", "GCP", "Docker", "Kubernetes", "CI/CD"],
      impact: "Scalable cloud infrastructure for all projects",
      link: "https://github.com/rawscript",
    },
  },
  {
    id: "data-pipeline",
    name: "Data Cascade",
    description: "ETL pipelines & data processing systems",
    position: { x: 50, y: 76 },
    type: "skill",
    icon: Database,
    color: "#6366F1",
    glow: "rgba(99,102,241,0.4)",
    details: {
      technologies: ["PostgreSQL", "Node.js", "Python", "Apache Airflow"],
      impact: "Robust data processing at scale",
      link: "https://github.com/rawscript",
    },
  },
];

const TYPE_LABELS: Record<MapLocation["type"], string> = {
  project: "Live Project",
  skill: "Core Skill",
  infrastructure: "Infrastructure",
};

const PRESET_QUESTIONS = [
  "Tell me about Msitubora Forest",
  "What cloud platforms do you use?",
  "Explain the Mailforge AI project",
  "What is geo spatial engineering?",
  "How can I hire James?",
];

// ─── Contact form ─────────────────────────────────────────────────────────────
function ContactPanel() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">Message Sent!</h3>
        <p className="text-slate-400 mb-8 max-w-sm">
          Your message is on its way to James's Gmail inbox. He'll get back to you soon.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto w-full"
    >
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
        <p className="text-slate-400">Forwarded directly to James's Gmail</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Subject</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            placeholder="What's this about?"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Tell me about your project or idea..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all text-sm resize-none"
          />
        </div>

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
          ) : (
            <><Send className="w-4 h-4" /> Send Message</>
          )}
        </button>
      </form>
    </motion.div>
  );
}

// ─── Chat panel ───────────────────────────────────────────────────────────────
function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "Hey! I'm Jase — James's AI assistant. Ask me anything about his projects, skills, or experience as a Geo Spatial Data Engineer and Cloud Engineer.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const history = [...messages, userMsg]
          .filter((m) => m.id !== "init")
          .map(({ role, content }) => ({ role, content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        const data = await res.json();
        const reply = data.reply || data.error || "Sorry, I couldn't respond. Try again.";
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString() + "_a", role: "assistant", content: reply },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "_err",
            role: "assistant",
            content: "Network error — please check your connection and try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full flex flex-col"
      style={{ height: "calc(100vh - 180px)", minHeight: "500px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-base font-bold text-white">
            J
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Jase AI</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>
        <button
          onClick={() =>
            setMessages([{
              id: "init",
              role: "assistant",
              content: "Hey! I'm Jase — James's AI assistant. Ask me anything about his projects, skills, or experience.",
            }])
          }
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
                    : "bg-white/8 border border-white/10 text-slate-200 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Preset questions */}
      <div className="flex flex-wrap gap-2 mt-4 mb-3">
        {PRESET_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white hover:border-indigo-500/40 transition-all disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask about James's work…"
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all text-sm disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Map panel ────────────────────────────────────────────────────────────────
function MapPanel() {
  const [selected, setSelected] = useState<MapLocation | null>(null);

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
          Technologia
        </h1>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <p className="text-slate-400 text-sm tracking-widest uppercase">
            A Fictitious World · Real Projects
          </p>
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
          Explore <span className="text-indigo-400 font-medium">James Mwaura's</span> portfolio
          as a map of an imaginary country — each location represents a real project or skill domain.
        </p>
      </motion.div>

      {/* Map */}
      <div className="relative w-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40"
        style={{ height: "460px", background: "linear-gradient(135deg, #0f1729 0%, #111827 40%, #0d1f2d 100%)" }}
      >
        {/* Terrain SVG background */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 460" preserveAspectRatio="none">
          {/* Ocean/water body */}
          <ellipse cx="400" cy="260" rx="280" ry="120" fill="#1e3a5f" opacity="0.6" />
          <ellipse cx="150" cy="350" rx="100" ry="60" fill="#1a3a5c" opacity="0.5" />
          {/* Land masses */}
          <path d="M50,100 Q200,60 350,120 Q480,80 580,140 Q680,100 750,160 L780,460 L20,460 Z" fill="#1a2e1a" opacity="0.7" />
          {/* Mountains */}
          <path d="M600,160 L640,80 L680,160 Z" fill="#2d3a2d" opacity="0.8" />
          <path d="M650,170 L700,70 L750,170 Z" fill="#2a382a" opacity="0.8" />
          <path d="M560,180 L590,110 L620,180 Z" fill="#2d3a2d" opacity="0.7" />
          {/* Forest area */}
          <circle cx="150" cy="180" r="60" fill="#1a3a1a" opacity="0.6" />
          <circle cx="180" cy="160" r="40" fill="#1f3f1f" opacity="0.5" />
          {/* River */}
          <path d="M300,100 Q320,200 350,280 Q380,350 420,420" stroke="#1e4a7a" strokeWidth="6" fill="none" opacity="0.6" />
          {/* Grid overlay */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="460" fill="url(#grid)" />
        </svg>

        {/* Compass rose */}
        <div className="absolute bottom-5 right-5 opacity-30 text-slate-300 text-xs font-mono leading-tight select-none">
          <div className="text-center">N</div>
          <div className="flex gap-2 items-center"><span>W</span><span className="text-lg">✦</span><span>E</span></div>
          <div className="text-center">S</div>
        </div>

        {/* Location markers */}
        {MAP_LOCATIONS.map((loc) => {
          const Icon = loc.icon;
          const isSelected = selected?.id === loc.id;
          return (
            <motion.button
              key={loc.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
              style={{ left: `${loc.position.x}%`, top: `${loc.position.y}%` }}
              onClick={() => setSelected(isSelected ? null : loc)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: loc.glow }}
                animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Icon */}
              <motion.div
                className="relative z-10 p-2.5 rounded-full shadow-lg border-2 transition-all"
                style={{
                  backgroundColor: loc.color,
                  borderColor: isSelected ? "white" : "transparent",
                  boxShadow: `0 0 20px ${loc.glow}`,
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: MAP_LOCATIONS.indexOf(loc) * 0.3 }}
              >
                <Icon className="w-4 h-4 text-white" />
              </motion.div>

              {/* Hover tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                <div className="bg-slate-900/95 backdrop-blur border border-white/20 px-3 py-2 rounded-xl shadow-xl">
                  <div className="text-xs font-semibold text-white">{loc.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{loc.type}</div>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Map legend */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur border border-white/10 px-3 py-2.5 rounded-xl text-xs space-y-1.5">
          {[
            { color: "#10B981", label: "Projects" },
            { color: "#EC4899", label: "Skills" },
            { color: "#14B8A6", label: "Infrastructure" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-slate-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Click hint */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur border border-white/10 px-3 py-2 rounded-xl text-[10px] text-slate-500">
          Click any marker to explore
        </div>
      </div>

      {/* Selected location detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-4 rounded-2xl border border-white/10 bg-white/4 backdrop-blur p-6 relative"
            style={{ boxShadow: `0 0 40px ${selected.glow}` }}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                style={{ backgroundColor: selected.color, boxShadow: `0 0 20px ${selected.glow}` }}
              >
                {<selected.icon className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full border"
                    style={{ color: selected.color, borderColor: `${selected.color}40`, backgroundColor: `${selected.color}15` }}>
                    {TYPE_LABELS[selected.type]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{selected.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{selected.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selected.details.technologies.map((t) => (
                    <span key={t} className="px-2.5 py-1 text-xs rounded-full bg-white/6 border border-white/10 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-slate-400 text-sm">{selected.details.impact}</p>
                </div>
              </div>
              {selected.details.link && (
                <a
                  href={selected.details.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Visit
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          { value: "7+", label: "Locations" },
          { value: "15+", label: "Technologies" },
          { value: "100%", label: "Cloud Deployed" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center py-4 rounded-xl bg-white/3 border border-white/8">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
const NAV_TABS: { id: View; emoji: string; label: string }[] = [
  { id: "map", emoji: "🗺️", label: "Map" },
  { id: "chat", emoji: "🤖", label: "Ask Jase" },
  { id: "contact", emoji: "✉️", label: "Contact" },
];

const PortfolioMap = () => {
  const [view, setView] = useState<View>("map");

  return (
    <section
      id="portfolio"
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #070d1a 0%, #0b1220 50%, #070d1a 100%)" }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-950 blur-[120px] opacity-60" />
        <div className="absolute -bottom-60 -right-40 w-[600px] h-[600px] rounded-full bg-purple-950 blur-[120px] opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-950 blur-[140px] opacity-30" />
      </div>

      {/* Nav bar */}
      <div className="sticky top-0 z-30 flex justify-center pt-6 pb-2">
        <div className="flex gap-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-xl">
          {NAV_TABS.map(({ id, emoji, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                view === id ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {view === id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">
                {emoji} {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-16 pt-6">
        <AnimatePresence mode="wait">
          {view === "map" && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <MapPanel />
            </motion.div>
          )}
          {view === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <ChatPanel />
            </motion.div>
          )}
          {view === "contact" && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <ContactPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PortfolioMap;