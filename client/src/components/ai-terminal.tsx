import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export interface AICommandResult {
  action: "NAVIGATE" | "FILTER" | "INFO" | "UNKNOWN";
  target?: string;
  message: string;
}

export default function AITerminal() {
  const [history, setHistory] = useState<{role: 'system' | 'user', text: string}[]>([
    { role: 'system', text: 'JASE TERMINAL [Version 1.0.0]\nType a natural language command (e.g. "show me your forest project" or "what are your cloud skills")' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      // We don't trigger map changes from terminal anymore because they are separate views.
      // We just display the info in the terminal.
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'system', text: "ERROR: Connection lost to command server." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  return (
    <div 
      className="flex flex-col w-full h-full bg-black text-[#0f0] font-mono text-sm pt-20 px-8 pb-8 overflow-hidden z-30 pointer-events-auto"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {history.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex gap-3">
              <span className={`font-bold shrink-0 ${msg.role === 'system' ? 'text-blue-500' : 'text-gray-400'}`}>
                {msg.role === 'system' ? 'root@jase:~#' : 'visitor@jase:~$'}
              </span>
              <span className="whitespace-pre-wrap break-all text-gray-300">{msg.text}</span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 text-blue-500">
            <span className="font-bold shrink-0">root@jase:~#</span>
            <span className="animate-pulse">processing request...</span>
          </div>
        )}
        
        {!isLoading && (
          <form onSubmit={handleSubmit} className="flex items-center gap-3 mt-2">
            <span className="text-gray-400 font-bold shrink-0">visitor@jase:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 p-0 shadow-none caret-white"
              spellCheck={false}
              autoFocus
            />
          </form>
        )}
        
        <div ref={endOfHistoryRef} className="h-4" />
      </div>
    </div>
  );
}
