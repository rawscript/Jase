import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/navigation";
import PortfolioMap from "@/components/portfolio-map";
import AITerminal from "@/components/ai-terminal";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import { X } from "lucide-react";

export type ViewState = 'map' | 'terminal' | 'contact';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>('map');
  const [showNarrative, setShowNarrative] = useState(false);

  useEffect(() => {
    // Show narrative modal on first visit
    const hasVisited = localStorage.getItem('portfolioVisited');
    if (!hasVisited) {
      setShowNarrative(true);
      localStorage.setItem('portfolioVisited', 'true');
    }
  }, []);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-black text-white">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      
      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Map View */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            currentView === 'map' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* We only mount PortfolioMap once so it doesn't re-initialize Leaflet */}
          <PortfolioMap isActive={currentView === 'map'} />
        </div>

        {/* Terminal View */}
        <AnimatePresence>
          {currentView === 'terminal' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 z-20 bg-black flex flex-col"
            >
              <AITerminal />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact View */}
        <AnimatePresence>
          {currentView === 'contact' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 z-20 bg-white text-black overflow-y-auto"
            >
              <ContactSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Narrative Modal */}
      <AnimatePresence>
        {showNarrative && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/20 p-8 max-w-lg w-full relative font-mono text-gray-300"
            >
              <button 
                onClick={() => setShowNarrative(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-4">INITIALIZING SEQUENCE...</h2>
              <div className="space-y-4 text-sm leading-relaxed">
                <p>
                  &gt; Welcome to the network.
                </p>
                <p>
                  &gt; You have accessed an interactive topological map of a digital frontier. 
                  This is not a traditional portfolio; it is a spatial representation of projects, 
                  infrastructure, and skills scattered across a fictional planetary grid.
                </p>
                <p>
                  &gt; Navigation Protocols:
                  <br/>- <span className="text-white font-bold">HOME</span>: Explore the map and discover sectors.
                  <br/>- <span className="text-white font-bold">ASK ME ANYTHING</span>: Access the core terminal interface to query information directly.
                  <br/>- <span className="text-white font-bold">REACH OUT</span>: Establish a secure communication link.
                </p>
                <p className="mt-8 text-blue-400 animate-pulse">
                  &gt; Awaiting user input...
                </p>
              </div>
              <button
                onClick={() => setShowNarrative(false)}
                className="mt-8 w-full py-3 bg-white text-black font-bold tracking-widest hover:bg-gray-200 transition-colors"
              >
                ACKNOWLEDGE & ENTER
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
