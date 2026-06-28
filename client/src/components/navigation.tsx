import { useState } from "react";
import { Menu, X, Terminal, Map, Mail } from "lucide-react";
import type { ViewState } from "@/pages/home";

interface NavigationProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

export default function Navigation({ currentView, setCurrentView }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'map' as ViewState, label: "Home", icon: Map },
    { id: 'terminal' as ViewState, label: "Ask me anything", icon: Terminal },
    { id: 'contact' as ViewState, label: "Reach out", icon: Mail },
  ];

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-8 h-full flex items-center justify-between">
          <div className="text-xl font-bold text-white tracking-widest font-mono uppercase">
            JASE<span className="text-blue-500">_</span>MWAURA
          </div>
          
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 text-sm font-mono tracking-widest uppercase transition-colors duration-300 ${
                  currentView === item.id 
                    ? 'text-blue-400 border-b-2 border-blue-400 h-16' 
                    : 'text-gray-400 hover:text-white h-16 border-b-2 border-transparent hover:border-white/30'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-40 flex flex-col items-center justify-center">
          <div className="space-y-8 text-center w-full max-w-sm px-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-center gap-4 py-4 border text-lg font-mono tracking-widest uppercase transition-colors duration-300 ${
                  currentView === item.id
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
