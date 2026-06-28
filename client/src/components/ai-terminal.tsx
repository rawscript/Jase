import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Terminal } from "lucide-react";

export interface AICommandResult {
  action: "NAVIGATE" | "FILTER" | "INFO" | "UNKNOWN";
  target?: string;
  message: string;
}

export default function AITerminal() {
  const [history, setHistory] = useState<{role: 'system' | 'user', text: string}[]>([
    { role: 'system', text: 'JASE TERMINAL [Version 1.0.0]\nType a natural language command to query information about James\'s skills, projects, or experience.' }
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
    } catch (err) {
      setHistory(prev => [...prev, { role: 'system', text: "Unable to process command. Please try again." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 pt-16 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Terminal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-mono text-gray-500 tracking-wider">jase@portfolio — terminal</span>
        </div>
      </div>

      {/* History */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'system' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-xl px-4 py-3 rounded-2xl text-sm font-mono leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={endOfHistoryRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400 tracking-wider shrink-0">visitor@jase:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about projects, skills, or experience..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm font-mono focus:ring-0 p-0"
            spellCheck={false}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
