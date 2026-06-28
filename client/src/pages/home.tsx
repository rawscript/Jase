import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/navigation";
import PortfolioMap from "@/components/portfolio-map";
import AITerminal from "@/components/ai-terminal";
import ContactSection from "@/components/contact-section";

export type ViewState = 'map' | 'terminal' | 'contact';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>('map');

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-white text-gray-900">
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
              className="absolute inset-0 z-20 bg-white flex flex-col"
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
              className="absolute inset-0 z-20 bg-white text-gray-900 overflow-y-auto"
            >
              <ContactSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
