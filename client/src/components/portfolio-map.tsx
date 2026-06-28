import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Cloud, Database, Cpu, Wind, TreePine, Home, Zap, Mail, Search, Compass, ExternalLink, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import AITerminal, { type AICommandResult } from "./ai-terminal";

// Custom Leaflet Icons using SVGs
const createCustomIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-map-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

interface MapLocation {
  id: string;
  name: string;
  description: string;
  position: [number, number]; // Lat, Lng
  type: 'project' | 'skill' | 'infrastructure';
  icon: React.ElementType;
  color: string;
  details: {
    technologies: string[];
    impact: string;
    link?: string;
  };
}

const mapLocations: MapLocation[] = [
  {
    id: 'msitubora',
    name: 'Msitubora Forest',
    description: 'Kakamega Forest Monitoring with satellite API integration',
    position: [0.2827, 34.8533], // Kakamega
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
    position: [-1.2921, 36.8219], // Nairobi
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
    position: [51.5074, -0.1278], // London
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
    position: [-4.0435, 39.6682], // Mombasa
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
    position: [-1.3000, 36.8000], // Near Nairobi
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
    position: [37.7749, -122.4194], // San Francisco
    type: 'infrastructure',
    icon: Cloud,
    color: '#14B8A6',
    details: {
      technologies: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'CI/CD'],
      impact: 'Scalable cloud infrastructure deployment',
      link: 'https://github.com/rawscript'
    }
  },
];

// Helper component to control map from outside
function MapController({ targetLocation, filter }: { targetLocation: [number, number] | null, filter: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, 8, { duration: 1.5 });
    }
  }, [targetLocation, map]);

  useEffect(() => {
    if (filter) {
      // Zoom out to see everything if filtering
      map.flyTo([15, 10], 2, { duration: 1.5 });
    }
  }, [filter, map]);

  return null;
}

const PortfolioMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCommandResult = (result: AICommandResult) => {
    if (result.action === "NAVIGATE" && result.target) {
      const loc = mapLocations.find(l => l.id === result.target || l.name.toLowerCase().includes(result.target!.toLowerCase()));
      if (loc) {
        setTargetCoords(loc.position);
        setSelectedLocation(loc);
        setFilterType(null);
      }
    } else if (result.action === "FILTER" && result.target) {
      setFilterType(result.target);
      setSelectedLocation(null);
      setTargetCoords(null);
    } else if (result.action === "INFO") {
      setFilterType(null);
      setSelectedLocation(null);
    }
  };

  const filteredLocations = mapLocations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType ? loc.type === filterType : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-[#f5f5f5] pt-16 flex flex-col md:flex-row font-serif">
      {/* Interactive Map Area */}
      <div className="relative flex-1 h-full z-0">
        <MapContainer 
          center={[15, 10]} 
          zoom={3} 
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#e5e5e5' }}
        >
          {/* Minimalist CartoDB Positron Map Tiles for Magazine aesthetic */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="topright" />
          <MapController targetLocation={targetCoords} filter={filterType} />

          {filteredLocations.map((location) => {
            const Icon = location.icon;
            return (
              <Marker
                key={location.id}
                position={location.position}
                icon={createCustomIcon(location.color)}
                eventHandlers={{
                  click: () => {
                    setSelectedLocation(location);
                    setTargetCoords(location.position);
                  },
                }}
              >
                <Popup className="font-sans">
                  <div className="p-1">
                    <h3 className="font-serif font-bold text-lg">{location.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {location.details.technologies.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{t}</span>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Selected Location Details Banner (Magazine Style) */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/95 backdrop-blur-md border border-black p-6 md:p-8 z-[400] shadow-2xl flex flex-col items-start gap-4 font-sans"
            >
              <button 
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2" style={{ backgroundColor: selectedLocation.color }} />
                  <span className="text-xs tracking-widest font-bold text-gray-500 uppercase">
                    {selectedLocation.type}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-black mb-3">
                  {selectedLocation.name}
                </h3>
                <p className="text-gray-800 text-base md:text-lg mb-4 max-w-xl font-light leading-relaxed">
                  {selectedLocation.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedLocation.details.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs bg-transparent text-black border border-black font-medium tracking-wide uppercase"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 font-serif italic mb-6 border-l-2 border-black pl-4">
                  "{selectedLocation.details.impact}"
                </p>
                
                {selectedLocation.details.link && (
                  <a
                    href={selectedLocation.details.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                  >
                    View Case Study <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Overlay */}
        <div className="absolute top-6 left-6 z-[400] w-full max-w-xs pointer-events-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-black shadow-sm focus:outline-none focus:ring-1 focus:ring-black font-sans text-sm"
            />
          </div>
        </div>

        {/* Map Legend */}
        <div className="absolute top-20 left-6 bg-white border border-black p-4 z-[400] pointer-events-auto font-sans shadow-sm hidden md:block">
          <div className="text-xs font-bold tracking-widest uppercase mb-3 text-black border-b border-gray-200 pb-2">Legend</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#10B981]" />
              <div className="text-xs text-gray-800">Projects</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#EC4899]" />
              <div className="text-xs text-gray-800">Skills</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#14B8A6]" />
              <div className="text-xs text-gray-800">Infrastructure</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Terminal Sidebar */}
      <div className="w-full md:w-[400px] lg:w-[450px] h-[40vh] md:h-full z-10 shrink-0">
        <AITerminal onCommandResult={handleCommandResult} />
      </div>
    </div>
  );
};

export default PortfolioMap;