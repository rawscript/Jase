import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Cloud, Database, Cpu, Wind, TreePine, Home, Zap, ExternalLink, X, RotateCcw, Layers } from "lucide-react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom Leaflet Icons using SVGs
const createCustomIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" fill="${color}">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
    <circle cx="16" cy="16" r="3" fill="${color}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-map-icon',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
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
      map.flyTo([500, 500], 0, { duration: 1.5 });
    }
  }, [filter, map]);

  return null;
}

interface PortfolioMapProps {
  isActive: boolean;
}

const legendItems = [
  { type: 'project', label: 'Projects', color: '#10B981' },
  { type: 'skill', label: 'Skills', color: '#EC4899' },
  { type: 'infrastructure', label: 'Infrastructure', color: '#14B8A6' },
];

const PortfolioMap = ({ isActive }: PortfolioMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const filteredLocations = mapLocations.filter(loc => {
    const matchesFilter = filterType ? loc.type === filterType : true;
    return matchesFilter;
  });

  return (
    <div className="relative w-full h-full bg-gray-50 pt-16 flex font-sans text-gray-900">
      {/* Interactive Map Area */}
      <div className="relative flex-1 h-full z-0">
        <MapContainer 
          center={[500, 500]} 
          zoom={0} 
          minZoom={-1}
          maxZoom={3}
          crs={L.CRS.Simple}
          zoomControl={false}
          className="w-full h-full bg-gray-100"
          maxBounds={[[ -200, -200 ], [ 1200, 1200 ]]}
        >
          <ImageOverlay
            url="/imaginary_planet_map.png"
            bounds={MAP_BOUNDS}
            opacity={0.85}
          />
          {/* Custom positioned zoom control */}
          <ZoomControl position="bottomright" />
          <MapController targetLocation={targetCoords} filter={filterType} />

          {filteredLocations.map((location) => {
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
                <Popup className="custom-popup" closeButton={false}>
                  <div className="p-3 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: location.color }} />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{location.type}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{location.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{location.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {location.details.technologies.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend Toggle Button */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="absolute bottom-14 left-4 z-[400] flex items-center gap-2 bg-white border border-gray-200 shadow-md px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Layers className="w-4 h-4" />
          <span className="font-medium">{showLegend ? 'Hide' : 'Show'} Legend</span>
        </button>

        {/* Legend Panel */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 left-4 z-[400] w-52 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden"
            >
              {/* Legend Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest uppercase text-gray-700">Map Index</span>
                <button 
                  onClick={() => { setFilterType(null); setSelectedLocation(null); }}
                  title="Reset filters"
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Legend Items */}
              <div className="p-3 space-y-1">
                {legendItems.map(item => (
                  <button 
                    key={item.type}
                    onClick={() => {
                      setFilterType(filterType === item.type ? null : item.type);
                      setSelectedLocation(null);
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-all ${
                      filterType === item.type 
                        ? 'bg-gray-100 text-gray-900' 
                        : filterType && filterType !== item.type 
                          ? 'opacity-40 hover:opacity-70' 
                          : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full shrink-0 ${filterType === item.type ? 'ring-2 ring-offset-1' : ''}`}
                      style={{ 
                        backgroundColor: item.color, 
                        boxShadow: `0 0 6px ${item.color}80`,
                        ringColor: item.color 
                      }} 
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                    {filterType === item.type && (
                      <span className="ml-auto text-[10px] text-gray-500 font-medium">active</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Instructions */}
              <div className="px-4 pb-3 pt-1 border-t border-gray-100 mt-1">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Click a marker to view details. Use scroll to zoom, drag to pan.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Location Details Panel */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-[400] flex flex-col gap-4"
            >
              <button 
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedLocation.color, boxShadow: `0 0 8px ${selectedLocation.color}80` }}
                />
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                  {selectedLocation.type}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedLocation.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {selectedLocation.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedLocation.details.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <p className="text-gray-600 text-sm border-l-2 pl-4 py-1 bg-gray-50 rounded-r-lg"
                style={{ borderColor: selectedLocation.color }}>
                {selectedLocation.details.impact}
              </p>
              
              {selectedLocation.details.link && (
                <a
                  href={selectedLocation.details.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors self-start"
                >
                  Visit Project <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PortfolioMap;