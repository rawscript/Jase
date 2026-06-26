import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Cloud, Database, Cpu, Wind, TreePine, Home, Zap, Mail, Search } from "lucide-react";
import fantasyMapBg from "@/assets/fantasy-map.png";

interface MapLocation {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  type: 'project' | 'skill' | 'infrastructure';
  icon: React.ElementType;
  color: string;
  details: {
    technologies: string[];
    impact: string;
    link?: string;
  };
}

const PortfolioMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [view, setView] = useState<'map' | 'contact' | 'chat'>('map');
  const [searchQuery, setSearchQuery] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<{role: 'user' | 'system', text: string}[]>([
    { role: 'system', text: 'Welcome to the James Mwaura terminal. Type your query...' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  const handleTerminalSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const userText = terminalInput.trim();
      setTerminalHistory(prev => [...prev, { role: 'user', text: userText }]);
      setTerminalInput('');
      
      setTimeout(() => {
        setTerminalHistory(prev => [...prev, { role: 'system', text: `Analyzing query: "${userText}"...\nResponse: I am a highly skilled Geo Spatial Data Engineer and Cloud Engineer. I specialize in building robust data pipelines, scalable cloud infrastructure, and integrating AI to solve complex geographic problems.` }]);
      }, 600);
    }
  };
  
  const mapLocations: MapLocation[] = [
    {
      id: 'msitubora',
      name: 'Msitubora Forest',
      description: 'Kakamega Forest Monitoring with satellite API integration',
      position: { x: 30, y: 40 },
      type: 'project',
      icon: TreePine,
      color: '#10B981',
      details: {
        technologies: ['Blockchain', 'IoT', 'React', 'Typescript', 'SatelliteAPI'],
        impact: 'Forest conservation monitoring system',
        link: 'https://msitubora.onrender.com/'
      }
    },
    {
      id: 'aurora',
      name: 'Aurora Energy',
      description: 'Energy management system for African homes',
      position: { x: 50, y: 45 },
      type: 'project',
      icon: Zap,
      color: '#F59E0B',
      details: {
        technologies: ['Node.js', 'ES6', 'PostgreSQL', 'React'],
        impact: 'Energy optimization across African households',
        link: 'https://auroraenergy.app/'
      }
    },
    {
      id: 'mailforge',
      name: 'Mailforge AI',
      description: 'AI text-to-presentation tool for businesses',
      position: { x: 40, y: 35 },
      type: 'project',
      icon: Cpu,
      color: '#8B5CF6',
      details: {
        technologies: ['AI', 'Machine Learning', 'GenAI', 'Postgres', 'React', 'Typescript'],
        impact: 'Professional presentations in seconds',
        link: 'https://mailforge.studio/'
      }
    },
    {
      id: 'nestie',
      name: 'Nestie Homes',
      description: 'Modern real estate platform',
      position: { x: 70, y: 60 },
      type: 'project',
      icon: Home,
      color: '#3B82F6',
      details: {
        technologies: ['Node.js', 'React', 'Next.js', 'Stripe', 'Daraja'],
        impact: 'Real estate platform with advanced search',
        link: 'https://nestie.in/'
      }
    },
    {
      id: 'geo-spatial',
      name: 'Geo Spatial Hub',
      description: 'Satellite data processing & spatial analysis',
      position: { x: 35, y: 65 },
      type: 'skill',
      icon: MapPin,
      color: '#EC4899',
      details: {
        technologies: ['Satellite APIs', 'GIS', 'PostGIS', 'Python', 'GDAL'],
        impact: 'Geo spatial data engineering expertise',
        link: 'https://github.com/rawscript'
      }
    },
    {
      id: 'cloud-infra',
      name: 'Cloud Infrastructure',
      description: 'Cloud deployment & server management',
      position: { x: 65, y: 40 },
      type: 'infrastructure',
      icon: Cloud,
      color: '#14B8A6',
      details: {
        technologies: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'CI/CD'],
        impact: 'Scalable cloud infrastructure deployment',
        link: 'https://github.com/rawscript'
      }
    },
    {
      id: 'data-pipeline',
      name: 'Data Pipeline',
      description: 'ETL pipelines & data processing',
      position: { x: 55, y: 70 },
      type: 'skill',
      icon: Database,
      color: '#8B5CF6',
      details: {
        technologies: ['PostgreSQL', 'Node.js', 'Python', 'Apache Airflow'],
        impact: 'Robust data processing systems',
        link: 'https://github.com/rawscript'
      }
    }
  ];

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24">
      {/* Navigation */}
      <div className="absolute top-24 left-6 z-20 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setView('map')}
          className={`px-2 py-1 text-sm font-medium tracking-widest uppercase transition-colors border-b-2 ${view === 'map' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
        >
          Map
        </button>
        <button
          onClick={() => setView('contact')}
          className={`px-2 py-1 text-sm font-medium tracking-widest uppercase transition-colors border-b-2 ${view === 'contact' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
        >
          Contact
        </button>
        <button
          onClick={() => setView('chat')}
          className={`px-2 py-1 text-sm font-medium tracking-widest uppercase transition-colors border-b-2 ${view === 'chat' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
        >
          Ask Me
        </button>
      </div>

      {/* Main Content Area */}
      <div className="px-6 pb-12 w-full">
        {view === 'map' && (
          <div className="max-w-7xl mx-auto h-[80vh] min-h-[600px] flex flex-col relative pt-14">
            {/* Interactive Map */}
            <div 
              className="relative flex-1 rounded-none border border-black overflow-hidden shadow-sm bg-gray-100"
              style={{
                backgroundImage: `url(${fantasyMapBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Optional dark overlay if needed */}
              <div className="absolute inset-0 bg-black/10" />
              
              {/* Search Overlay */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/50 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Map Locations */}
              {mapLocations.filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.type.toLowerCase().includes(searchQuery.toLowerCase())).map((location) => {
                const Icon = location.icon;
                return (
                  <motion.div
                    key={location.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${location.position.x}%`,
                      top: `${location.position.y}%`,
                    }}
                    onClick={() => handleLocationClick(location)}
                  >
                    {/* Location Marker */}
                    <div className="relative">
                      <div className="relative z-10">
                        <div
                          className="p-3 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50"
                          style={{ backgroundColor: location.color }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-30">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl border border-gray-100">
                          <div className="text-sm font-medium text-gray-900">{location.name}</div>
                          <div className="text-xs text-gray-600 font-light mt-1">{location.description}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Location Count */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl border border-gray-100 z-10 hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {mapLocations.length} Locations
                </div>
                <div className="text-xs text-gray-600 font-light mt-1">
                  Explore my real projects
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl border border-gray-100 z-10 hidden sm:block">
                <div className="text-sm font-medium text-gray-900 mb-2">Map Legend</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="text-xs text-gray-700 font-light">Projects</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <div className="text-xs text-gray-700 font-light">Skills</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <div className="text-xs text-gray-700 font-light">Infrastructure</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Location Details Banner */}
            <AnimatePresence>
              {selectedLocation && (
                <motion.div
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-black p-8 z-30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
                >
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                  >
                    ×
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedLocation.color }}
                      />
                      <span className="text-xs tracking-widest font-medium text-gray-500 uppercase">
                        {selectedLocation.type}
                      </span>
                    </div>
                    <h3 className="text-3xl font-light text-gray-900 mb-2">
                      {selectedLocation.name}
                    </h3>
                    <p className="text-gray-600 font-light text-lg mb-4 max-w-2xl">
                      {selectedLocation.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedLocation.details.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-none font-medium tracking-wide uppercase border border-gray-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-500 font-light text-sm italic">{selectedLocation.details.impact}</p>
                  </div>
                  
                  {selectedLocation.details.link && (
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <a
                        href={selectedLocation.details.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full md:w-auto px-8 py-4 bg-black text-white text-center font-medium tracking-widest uppercase hover:bg-gray-800 transition-colors text-sm"
                      >
                        View Project
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {view === 'contact' && (
          <div className="max-w-md mx-auto pt-16">
            <div className="text-center mb-12">
              <Mail className="w-8 h-8 text-black mx-auto mb-6" strokeWidth={1} />
              <h2 className="text-4xl font-light mb-2">Contact</h2>
            </div>
            
            <div className="bg-transparent border-t border-black pt-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-light"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-light"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-light"
                    placeholder="Tell me about your project..."
                  />
                </div>
                <button className="w-full px-6 py-4 bg-black text-white font-light tracking-widest uppercase hover:bg-gray-800 transition-colors text-sm">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'chat' && (
          <div className="max-w-4xl mx-auto pt-16 flex flex-col pb-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-light mb-2">Ask Me Anything</h2>
            </div>
            
            <div className="flex-1 bg-[#0a0a0a] rounded-lg p-6 flex flex-col font-mono text-sm min-h-[400px] max-h-[60vh] overflow-y-auto shadow-2xl border border-gray-800">
              <div className="flex-1 flex flex-col space-y-3">
                {terminalHistory.map((msg, idx) => (
                  <div key={idx} className={`${msg.role === 'system' ? 'text-green-400' : 'text-gray-300'}`}>
                    <span className="opacity-50 mr-3">{msg.role === 'system' ? '>' : '$'}</span>
                    <span className="whitespace-pre-wrap leading-relaxed">{msg.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center text-gray-300 pt-2 border-t border-gray-800/50">
                <span className="opacity-50 mr-3">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={handleTerminalSubmit}
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-gray-300"
                  autoFocus
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioMap;