import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Cloud, Database, Cpu, Wind, TreePine, Home, Zap, Search, ExternalLink, X, RotateCcw } from "lucide-react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom Leaflet Icons using SVGs
const createCustomIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 drop-shadow-[0_0_8px_${color}]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
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
  position: [number, number]; // [y, x] in CRS.Simple bounds
  type: 'project' | 'skill' | 'infrastructure';
  icon: React.ElementType;
  color: string;
  details: {
    technologies: string[];
    impact: string;
    link?: string;
  };
}

// Map dimensions and bounds for CRS.Simple
const MAP_BOUNDS: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

const mapLocations: MapLocation[] = [
  {
    id: 'msitubora',
    name: 'Sector: Msitubora',
    description: 'Forest Monitoring Hub with satellite API integration',
    position: [700, 300], 
    type: 'project',
    icon: TreePine,
    color: '#10B981', // Emerald
    details: {
      technologies: ['Blockchain', 'IoT', 'React', 'Typescript', 'SatelliteAPI'],
      impact: 'Planetary conservation monitoring system',
      link: 'https://msitubora.onrender.com/'
    }
  },
  {
    id: 'aurora',
    name: 'Node: Aurora',
    description: 'Energy management grid for the outer colonies',
    position: [600, 450], 
    type: 'project',
    icon: Zap,
    color: '#F59E0B', // Amber
    details: {
      technologies: ['Node.js', 'ES6', 'PostgreSQL', 'React'],
      impact: 'Energy optimization across the grid',
      link: 'https://auroraenergy.app/'
    }
  },
  {
    id: 'mailforge',
    name: 'Relay: Mailforge AI',
    description: 'Automated synthesis tool for transmissions',
    position: [400, 800], 
    type: 'project',
    icon: Cpu,
    color: '#8B5CF6', // Violet
    details: {
      technologies: ['AI', 'Machine Learning', 'GenAI', 'Postgres', 'React'],
      impact: 'Rapid generation of structural presentations',
      link: 'https://mailforge.studio/'
    }
  },
  {
    id: 'nestie',
    name: 'Habitat: Nestie',
    description: 'Modern colonization real estate platform',
    position: [300, 500],
    type: 'project',
    icon: Home,
    color: '#3B82F6', // Blue
    details: {
      technologies: ['Node.js', 'React', 'Next.js', 'Stripe'],
      impact: 'Habitat allocation with advanced topological search',
      link: 'https://nestie.in/'
    }
  },
  {
    id: 'geo-spatial',
    name: 'Skill Matrix: Geo Spatial',
    description: 'Satellite data processing & spatial analysis',
    position: [800, 700], 
    type: 'skill',
    icon: MapPin,
    color: '#EC4899', // Pink
    details: {
      technologies: ['Satellite APIs', 'GIS', 'PostGIS', 'Python', 'GDAL'],
      impact: 'Geo spatial data engineering expertise',
      link: 'https://github.com/rawscript'
    }
  },
  {
    id: 'cloud-infra',
    name: 'Core: Cloud Infrastructure',
    description: 'Planetary cloud deployment & server management',
    position: [200, 200], 
    type: 'infrastructure',
    icon: Cloud,
    color: '#14B8A6', // Teal
    details: {
      technologies: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'CI/CD'],
      impact: 'Scalable structural deployment',
      link: 'https://github.com/rawscript'
    }
  },
];

function MapController({ targetLocation, filter }: { targetLocation: [number, number] | null, filter: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, 1, { duration: 1.5 });
    }
  }, [targetLocation, map]);

  useEffect(() => {
    if (filter) {
      // Zoom out to see everything if filtering
      map.flyTo([500, 500], 0, { duration: 1.5 });
    }
  }, [filter, map]);

  return null;
}

interface PortfolioMapProps {
  isActive: boolean;
}

const PortfolioMap = ({ isActive }: PortfolioMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Render nothing if not active and map hasn't loaded (we want to preserve map state but not re-render heavy stuff)
  // Actually, we use CSS opacity in parent to hide, so we can just let it render.

  const filteredLocations = mapLocations.filter(loc => {
    const matchesFilter = filterType ? loc.type === filterType : true;
    return matchesFilter;
  });

  const legendItems = [
    { type: 'project', label: 'Projects', color: '#10B981' },
    { type: 'skill', label: 'Skills', color: '#EC4899' },
    { type: 'infrastructure', label: 'Infrastructure', color: '#14B8A6' },
  ];

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] pt-16 flex font-mono text-white">
      {/* Interactive Map Area */}
      <div className="relative flex-1 h-full z-0">
        <MapContainer 
          center={[500, 500]} 
          zoom={0} 
          minZoom={-1}
          maxZoom={2}
          crs={L.CRS.Simple}
          zoomControl={false}
          className="w-full h-full bg-[#050505]"
          maxBounds={[[ -200, -200 ], [ 1200, 1200 ]]}
        >
          <ImageOverlay
            url="/imaginary_planet_map.png"
            bounds={MAP_BOUNDS}
            opacity={0.8}
            className="hue-rotate-15"
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
                <Popup className="custom-popup">
                  <div className="p-2 bg-black/90 border border-white/20 text-white font-mono">
                    <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{location.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {location.details.technologies.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20">{t}</span>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Selected Location Details Banner (Tech Style) */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-black/80 backdrop-blur-md border border-blue-500/30 p-6 md:p-8 z-[400] shadow-[0_0_30px_rgba(59,130,246,0.2)] flex flex-col items-start gap-4"
            >
              <button 
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 animate-pulse" style={{ backgroundColor: selectedLocation.color, boxShadow: `0 0 10px ${selectedLocation.color}` }} />
                  <span className="text-xs tracking-widest font-bold text-gray-400 uppercase">
                    SECTOR // {selectedLocation.type}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-wide">
                  {selectedLocation.name}
                </h3>
                <p className="text-gray-300 text-sm md:text-base mb-4 max-w-xl font-light leading-relaxed">
                  {selectedLocation.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedLocation.details.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs bg-transparent text-blue-400 border border-blue-500/30 tracking-wide uppercase"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm italic mb-6 border-l-2 border-blue-500 pl-4 py-1 bg-white/5">
                  &gt; {selectedLocation.details.impact}
                </p>
                
                {selectedLocation.details.link && (
                  <a
                    href={selectedLocation.details.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors"
                  >
                    ESTABLISH LINK <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Functional Legend */}
        <div className="absolute top-20 left-6 bg-black/80 backdrop-blur-md border border-white/20 p-4 z-[400] pointer-events-auto shadow-lg shadow-black/50 hidden md:block w-48">
          <div className="text-xs font-bold tracking-widest uppercase mb-4 text-white border-b border-white/20 pb-2 flex justify-between items-center">
            <span>INDEX</span>
            <button 
              onClick={() => { setFilterType(null); setSelectedLocation(null); }}
              title="Disengage Selection"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {legendItems.map(item => (
              <button 
                key={item.type}
                onClick={() => {
                  setFilterType(filterType === item.type ? null : item.type);
                  setSelectedLocation(null);
                }}
                className={`w-full flex items-center gap-3 transition-opacity ${filterType && filterType !== item.type ? 'opacity-30' : 'opacity-100 hover:opacity-80'}`}
              >
                <div className={`w-3 h-3 ${filterType === item.type ? 'animate-pulse' : ''}`} style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <div className="text-xs text-gray-200 uppercase tracking-wider">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMap;