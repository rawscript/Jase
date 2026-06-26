import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Cloud, Database, Cpu, Wind, TreePine, Home, Zap, Mail } from "lucide-react";

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
  
  // Your REAL projects mapped to imaginary country locations
  const mapLocations: MapLocation[] = [
    {
      id: 'msitubora',
      name: 'Msitubora Forest',
      description: 'Kakamega Forest Monitoring with satellite API integration',
      position: { x: 25, y: 35 },
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
      position: { x: 60, y: 45 },
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
      position: { x: 40, y: 20 },
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
      position: { x: 75, y: 65 },
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
      position: { x: 20, y: 60 },
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
      position: { x: 80, y: 30 },
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
      position: { x: 50, y: 75 },
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
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Navigation */}
      <div className="absolute top-6 left-6 z-20 flex gap-3">
        <button
          onClick={() => setView('map')}
          className={`px-4 py-2 rounded-lg font-light transition-all ${view === 'map' ? 'bg-black text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
        >
          Map
        </button>
        <button
          onClick={() => setView('contact')}
          className={`px-4 py-2 rounded-lg font-light transition-all ${view === 'contact' ? 'bg-black text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
        >
          Contact
        </button>
        <button
          onClick={() => setView('chat')}
          className={`px-4 py-2 rounded-lg font-light transition-all ${view === 'chat' ? 'bg-black text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
        >
          Ask Me
        </button>
      </div>

      {/* Main Content Area */}
      <div className="pt-20 px-6">
        {view === 'map' && (
          <div className="max-w-6xl mx-auto">
            {/* Map Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-light mb-4">
                My Work in <span className="gradient-text">Technologia</span>
              </h1>
              <p className="text-gray-600 font-light max-w-2xl mx-auto">
                An imaginary country showcasing my real projects and expertise as a 
                <span className="font-medium text-blue-600"> Geo Spatial Data Engineer</span> and 
                <span className="font-medium text-green-600"> Cloud Engineer</span>
              </p>
            </div>

            {/* Interactive Map */}
            <div className="relative h-[500px] bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-gray-200 overflow-hidden">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(to right, #E5E7EB 1px, transparent 1px),
                    linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
                }} />
              </div>

              {/* River/Lake */}
              <div className="absolute top-1/2 left-1/4 w-1/3 h-40 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-30" />
              
              {/* Mountain Range */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-300 to-transparent" />

              {/* Map Locations */}
              {mapLocations.map((location) => {
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
                    whileHover={{ scale: 1.2 }}
                  >
                    {/* Location Marker */}
                    <div className="relative">
                      <motion.div
                        className="relative z-10"
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div
                          className="p-3 rounded-full flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: location.color }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>

                      {/* Pulsing Effect */}
                      <div
                        className="absolute inset-0 rounded-full opacity-20 animate-ping"
                        style={{ backgroundColor: location.color }}
                      />

                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl">
                          <div className="text-sm font-medium text-gray-900">{location.name}</div>
                          <div className="text-xs text-gray-600 font-light mt-1">{location.description}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl">
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

              {/* Location Count */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl">
                <div className="text-sm font-medium text-gray-900">
                  {mapLocations.length} Locations
                </div>
                <div className="text-xs text-gray-600 font-light mt-1">
                  Real projects in imaginary country
                </div>
              </div>
            </div>

            {/* Selected Location Details */}
            <AnimatePresence>
              {selectedLocation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedLocation.color }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {selectedLocation.type.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-light text-gray-900 mb-3">
                        {selectedLocation.name}
                      </h3>
                      <p className="text-gray-600 font-light mb-6">
                        {selectedLocation.description}
                      </p>
                      <div className="mb-6">
                        <div className="text-sm font-medium text-gray-700 mb-2">Technologies:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedLocation.details.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-light"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Impact:</div>
                        <p className="text-gray-600 font-light">{selectedLocation.details.impact}</p>
                      </div>
                    </div>
                    {selectedLocation.details.link && (
                      <a
                        href={selectedLocation.details.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-black text-white rounded-lg font-light hover:bg-gray-800 transition-colors"
                      >
                        Visit Project
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-light text-gray-900 mb-2">7+</div>
                <div className="text-gray-600 font-light">Real Projects</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-light text-gray-900 mb-2">15+</div>
                <div className="text-gray-600 font-light">Technologies</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-light text-gray-900 mb-2">100%</div>
                <div className="text-gray-600 font-light">Cloud Deployed</div>
              </div>
            </div>
          </div>
        )}

        {view === 'contact' && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-3xl font-light mb-2">Contact Form</h2>
              <p className="text-gray-600 font-light">Powered by Gmail API</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
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
                <button className="w-full px-6 py-3 bg-black text-white rounded-lg font-light hover:bg-gray-800 transition-colors">
                  Send Message via Gmail
                </button>
                <p className="text-xs text-gray-500 text-center font-light">
                  Your message will be sent directly to my Gmail inbox
                </p>
              </div>
            </div>
          </div>
        )}

        {view === 'chat' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🤖</div>
              </div>
              <h2 className="text-3xl font-light mb-2">Ask Me Anything</h2>
              <p className="text-gray-600 font-light">Powered by NVIDIA DeepSeek V4 Pro</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="text-sm font-light text-gray-700">Ready to answer questions</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-gray-50 rounded-2xl p-4">
                    <p className="font-light text-gray-900">
                      Hi! I can answer questions about my work as a Geo Spatial Data Engineer and Cloud Engineer. 
                      Ask me about my projects, technologies, or experience!
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-light"
                    placeholder="Ask about my work..."
                  />
                  <button className="px-6 py-3 bg-black text-white rounded-lg font-light hover:bg-gray-800 transition-colors">
                    Ask
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full font-light hover:bg-gray-200">
                    Tell me about Msitubora
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full font-light hover:bg-gray-200">
                    What cloud platforms do you use?
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full font-light hover:bg-gray-200">
                    Explain geo spatial engineering
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="text-sm font-light text-gray-900">Geo Spatial</div>
                <div className="text-xs text-gray-600 font-light">Satellite data & GIS</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="text-sm font-light text-gray-900">Cloud</div>
                <div className="text-xs text-gray-600 font-light">AWS, GCP, Docker</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="text-sm font-light text-gray-900">AI/ML</div>
                <div className="text-xs text-gray-600 font-light">GenAI & ML Ops</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="text-sm font-light text-gray-900">Full Stack</div>
                <div className="text-xs text-gray-600 font-light">React, Node.js, PostgreSQL</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioMap;