import React from 'react';
import { motion } from 'framer-motion';

interface MapLocation {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  type: 'skill' | 'project' | 'experience' | 'specialty';
  color: string;
  details: {
    title: string;
    description: string;
    technologies?: string[];
    timeline?: string;
    impact?: string;
  };
}

interface MapLegendProps {
  locations: MapLocation[];
}

const MapLegend: React.FC<MapLegendProps> = ({ locations }) => {
  const getTypeDescription = (type: MapLocation['type']) => {
    switch(type) {
      case 'specialty':
        return 'Core professional specialties';
      case 'skill':
        return 'Technical skills and expertise';
      case 'project':
        return 'Key projects and accomplishments';
      case 'experience':
        return 'Work experience';
      default:
        return '';
    }
  };

  // Group locations by type
  const groupedLocations = locations.reduce((acc, location) => {
    if (!acc[location.type]) {
      acc[location.type] = [];
    }
    acc[location.type].push(location);
    return acc;
  }, {} as Record<string, MapLocation[]>);

  const typeOrder = ['specialty', 'skill', 'project', 'experience'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute bottom-6 left-32 z-20 w-80"
    >
      <div className="glass-effect p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          <h3 className="text-lg font-light text-gray-900">Portfolio Map Legend</h3>
        </div>
        
        <div className="space-y-4">
          {typeOrder.map((type) => {
            if (!groupedLocations[type]) return null;
            
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {type}s
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
                </div>
                
                <div className="space-y-2 pl-2">
                  {groupedLocations[type].map((location) => (
                    <div key={location.id} className="flex items-center gap-3 group cursor-default">
                      <div 
                        className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                        style={{ backgroundColor: location.color }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-light text-gray-900 group-hover:text-black transition-colors">
                          {location.name}
                        </div>
                        <div className="text-xs text-gray-600 font-light truncate">
                          {getTypeDescription(location.type as MapLocation['type'])}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Instructions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs font-light text-gray-600 mb-2">How to Explore:</div>
          <ul className="space-y-1.5 text-xs text-gray-700 font-light">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1" />
              <span>Click any marker to view detailed information</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1" />
              <span>Use mouse wheel or zoom buttons to zoom in/out</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1" />
              <span>Drag the map to pan around</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1" />
              <span>Filter markers by type using the filter buttons</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1" />
              <span>Use the search button to find specific expertise</span>
            </li>
          </ul>
        </div>

        {/* Connection Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-px bg-gradient-to-r from-gray-400 via-gray-300 to-transparent" />
            <div className="text-xs font-light text-gray-600">Connection Lines</div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-400" />
          </div>
          <p className="text-xs text-gray-700 font-light">
            Dashed lines show how different skills and projects are interconnected,
            representing the holistic nature of my technical expertise.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MapLegend;