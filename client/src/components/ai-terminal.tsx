import { useState, useRef, useEffect } from "react";
import { Terminal, Send, Search } from "lucide-react";
import { motion } from "framer-motion";

export interface AICommandResult {
  action: "NAVIGATE" | "FILTER" | "INFO" | "UNKNOWN";
  target?: string;
  message: string;
}

interface AITerminalProps {
  onCommandResult: (result: AICommandResult) => void;
}

export default function AITerminal({ onCommandResult }: AITerminalProps) {
  const [history, setHistory] = useState<{role: 'system' | 'user', text: string}[]>([
    { role: 'system', text: 'JASE TERMINAL [Version 1.0.0]\nType a natural language command (e.g. "show me your forest project" or "what are your cloud skills")' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setHistory(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: userText })
      });
      
      if (!res.ok) throw new Error("Failed to execute command");
      const data = await res.json() as AICommandResult;
      
      setHistory(prev => [...prev, { role: 'system', text: data.message }]);
      onCommandResult(data);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'system', text: "ERROR: Connection lost to command server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#faf9f6] text-[#111111] font-mono text-sm border-t md:border-t-0 md:border-l border-black overflow-hidden shadow-2xl z-30 pointer-events-auto">
      <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-bold tracking-widest text-xs uppercase">Jase Terminal</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {history.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className="flex flex-col"
          >
            <div className="flex gap-2">
              <span className={`font-bold ${msg.role === 'system' ? 'text-blue-600' : 'text-gray-400'}`}>
                {msg.role === 'system' ? 'root@jase:~#' : 'visitor@jase:~$'}
              </span>
              <span className="whitespace-pre-wrap">{msg.text}</span>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-2 text-blue-600">
            <span className="font-bold">root@jase:~#</span>
            <span className="animate-pulse">processing...</span>
          </div>
        )}
        <div ref={endOfHistoryRef} />
      </div>

      <div className="p-3 bg-[#f0eee9] border-t border-gray-300">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <span className="absolute left-3 text-gray-500 font-bold">$</span>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Enter command..."
            className="w-full bg-transparent border border-gray-400 rounded-none pl-8 pr-10 py-2 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors disabled:opacity-50"
            spellCheck={false}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-1 text-gray-600 hover:text-black disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
