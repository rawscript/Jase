import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ZoomIn, ZoomOut, Layers, Compass, Filter, Info } from "lucide-react";
import MapLegend from "@/components/map-legend";
import ConversationSearch from "@/components/conversation-search";

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

const mapLocations: MapLocation[] = [
  {
    id: 'geo-spatial',
    name: 'Geo Spatial Engineering',
    description: 'Spatial data analysis, GIS mapping, satellite imagery processing',
    position: { x: 25, y: 35 },
    type: 'specialty',
    color: '#3B82F6',
    details: {
      title: 'Geo Spatial Data Engineer',
      description: 'Specialized in processing and analyzing spatial data with Python, GDAL, PostGIS, and cloud platforms. Experienced in satellite imagery, LiDAR data processing, and geospatial visualization.',
      technologies: ['Python', 'PostGIS', 'QGIS', 'GDAL', 'GeoPandas', 'Mapbox', 'AWS S3', 'Snowflake'],
      timeline: '2020 - Present',
      impact: 'Processed 500+ TB of spatial data, reduced analysis time by 60%'
    }
  },
  {
    id: 'cloud-engineering',
    name: 'Cloud Engineering',
    description: 'AWS, GCP, Azure, infrastructure as code, serverless architecture',
    position: { x: 75, y: 40 },
    type: 'specialty',
    color: '#10B981',
    details: {
      title: 'Cloud Engineer',
      description: 'Designing and implementing scalable cloud infrastructure on AWS and GCP. Focus on serverless architecture, containerization, and cost optimization.',
      technologies: ['AWS', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Serverless Framework', 'CloudFormation'],
      timeline: '2019 - Present',
      impact: 'Reduced cloud costs by 40%, improved system reliability to 99.99%'
    }
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline Architecture',
    description: 'ETL/ELT pipelines, real-time data processing, data warehouse design',
    position: { x: 50, y: 60 },
    type: 'skill',
    color: '#8B5CF6',
    details: {
      title: 'Data Pipeline Expert',
      description: 'Building robust data pipelines for real-time and batch processing. Experience with Apache Airflow, Kafka, and modern data stack tools.',
      technologies: ['Airflow', 'Kafka', 'dbt', 'Snowflake', 'BigQuery', 'Spark', 'Flink'],
      timeline: '2018 - Present',
      impact: 'Built 20+ production pipelines processing 1B+ events daily'
    }
  },
  {
    id: 'ml-ops',
    name: 'ML Ops & AI Engineering',
    description: 'Machine learning deployment, model serving, monitoring, and scaling',
    position: { x: 40, y: 20 },
    type: 'skill',
    color: '#EC4899',
    details: {
      title: 'ML Ops Engineer',
      description: 'Deploying and scaling machine learning models in production. Specialized in model versioning, monitoring, and automated retraining pipelines.',
      technologies: ['TensorFlow', 'PyTorch', 'MLflow', 'Kubeflow', 'Sagemaker', 'Vertex AI'],
      timeline: '2021 - Present',
      impact: 'Deployed 50+ ML models with 99.9% uptime'
    }
  },
  {
    id: 'smart-cities',
    name: 'Smart Cities Platform',
    description: 'IoT sensor network for urban planning and traffic optimization',
    position: { x: 60, y: 70 },
    type: 'project',
    color: '#F59E0B',
    details: {
      title: 'Smart Cities Platform',
      description: 'Developed a platform processing IoT sensor data from 10,000+ devices across major cities. Real-time analytics for traffic optimization and urban planning.',
      technologies: ['Python', 'PostgreSQL', 'React', 'Mapbox', 'AWS IoT Core', 'Kafka'],
      timeline: '2022 - 2023',
      impact: 'Reduced urban congestion by 25% in pilot cities'
    }
  },
  {
    id: 'disaster-response',
    name: 'Disaster Response System',
    description: 'Real-time satellite imagery analysis for disaster assessment',
    position: { x: 20, y: 80 },
    type: 'project',
    color: '#EF4444',
    details: {
      title: 'Disaster Response System',
      description: 'Built a system for analyzing satellite imagery in near-real-time to assess damage from natural disasters. Used computer vision and geospatial analysis.',
      technologies: ['Python', 'TensorFlow', 'GDAL', 'Google Earth Engine', 'FastAPI', 'React'],
      timeline: '2021 - 2022',
      impact: 'Reduced disaster assessment time from 72 to 4 hours'
    }
  },
  {
    id: 'climate-models',
    name: 'Climate Modeling Infrastructure',
    description: 'Cloud infrastructure for running climate prediction models',
    position: { x: 80, y: 20 },
    type: 'project',
    color: '#14B8A6',
    details: {
      title: 'Climate Modeling Infrastructure',
      description: 'Designed and implemented cloud infrastructure for running large-scale climate prediction models. Focus on scalability and cost efficiency.',
      technologies: ['AWS', 'Terraform', 'Kubernetes', 'Slurm', 'Python', 'NetCDF'],
      timeline: '2020 - 2021',
      impact: 'Reduced computation costs by 70% for climate research'
    }
  }
];

const MapExplorer = () => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState<'all' | 'skill' | 'project' | 'specialty'>('all');
  const [showLegend, setShowLegend] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredLocations = filterType === 'all' 
    ? mapLocations 
    : mapLocations.filter(loc => loc.type === filterType);

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setViewOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setViewOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.addEventListener('wheel', handleWheel as any, { passive: false });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.removeEventListener('wheel', handleWheel as any);
      }
    };
  }, []);

  const getConnectionPaths = () => {
    const connections = [
      ['geo-spatial', 'smart-cities'],
      ['cloud-engineering', 'climate-models'],
      ['data-pipeline', 'disaster-response'],
      ['ml-ops', 'geo-spatial'],
      ['cloud-engineering', 'data-pipeline']
    ];

    return connections.map(([fromId, toId]) => {
      const from = mapLocations.find(l => l.id === fromId);
      const to = mapLocations.find(l => l.id === toId);
      if (!from || !to) return null;

      return {
        from: from.position,
        to: to.position,
        color: '#CBD5E1'
      };
    }).filter(Boolean);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Navigation Controls */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
        <button
          onClick={() => setShowSearch(true)}
          className="glass-effect p-3 rounded-lg hover:bg-white/90 transition-all duration-300 group"
        >
          <Search className="w-5 h-5 text-gray-700 group-hover:text-black" />
        </button>
        
        <div className="glass-effect p-3 rounded-lg flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-white/50 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-white/50 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <button
          onClick={handleResetView}
          className="glass-effect p-3 rounded-lg hover:bg-white/90 transition-all duration-300 group"
        >
          <Compass className="w-5 h-5 text-gray-700 group-hover:text-black" />
        </button>
      </div>

      {/* Filter Controls */}
      <div className="absolute top-6 right-6 z-20 glass-effect p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-light text-gray-700">Filter by Type</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'specialty', 'skill', 'project'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-light rounded-full transition-colors ${
                filterType === type 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Map Legend Toggle */}
      <button
        onClick={() => setShowLegend(!showLegend)}
        className="absolute bottom-6 left-6 z-20 glass-effect px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-white/90 transition-all duration-300"
      >
        <Layers className="w-4 h-4 text-gray-700" />
        <span className="text-sm font-light text-gray-700">
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </span>
      </button>

      {/* Main Map */}
      <div
        ref={mapRef}
        className="relative w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Connection Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {getConnectionPaths().map((path, index) => (
            <line
              key={index}
              x1={`${path?.from.x}%`}
              y1={`${path?.from.y}%`}
              x2={`${path?.to.x}%`}
              y2={`${path?.to.y}%`}
              stroke={path?.color}
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.4"
            />
          ))}
        </svg>

        {/* Background Grid */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #E5E7EB 1px, transparent 1px),
              linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)
            `,
            backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        />

        {/* Map Locations */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {filteredLocations.map((location) => (
            <motion.div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${location.position.x}%`,
                top: `${location.position.y}%`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={() => handleLocationClick(location)}
              whileHover={{ scale: 1.2 }}
            >
              {/* Location Marker */}
              <div
                className="relative"
                style={{
                  backgroundColor: location.color,
                  boxShadow: `0 0 0 4px ${location.color}40, 0 4px 12px ${location.color}40`
                }}
              >
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      `0 0 0 0px ${location.color}40`,
                      `0 0 0 12px ${location.color}00`,
                      `0 0 0 0px ${location.color}40`
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-white/90"></div>
                </motion.div>

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                  <div className="glass-effect px-3 py-2 rounded-lg">
                    <div className="text-xs font-medium text-gray-900">{location.name}</div>
                    <div className="text-xs text-gray-600 font-light mt-0.5">{location.description}</div>
                  </div>
                  <div className="w-2 h-2 glass-effect rotate-45 absolute -top-1 left-1/2 -translate-x-1/2"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map Legend */}
      <AnimatePresence>
        {showLegend && <MapLegend locations={mapLocations} />}
      </AnimatePresence>

      {/* Selected Location Details */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 right-6 z-20 w-96"
          >
            <div className="glass-effect p-6 rounded-2xl shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedLocation.color }}
                    />
                    <span className="text-xs font-light text-gray-600 uppercase tracking-wider">
                      {selectedLocation.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-2">{selectedLocation.details.title}</h3>
                  <p className="text-gray-600 font-light text-sm leading-relaxed">
                    {selectedLocation.details.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              {selectedLocation.details.technologies && (
                <div className="mb-4">
                  <div className="text-xs font-light text-gray-600 mb-2">Technologies</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.details.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs bg-white/50 text-gray-700 rounded-md font-light"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {selectedLocation.details.timeline && (
                  <div>
                    <div className="text-xs font-light text-gray-600 mb-1">Timeline</div>
                    <div className="text-sm text-gray-900 font-light">{selectedLocation.details.timeline}</div>
                  </div>
                )}
                {selectedLocation.details.impact && (
                  <div>
                    <div className="text-xs font-light text-gray-600 mb-1">Impact</div>
                    <div className="text-sm text-gray-900 font-light">{selectedLocation.details.impact}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <ConversationSearch 
            isOpen={showSearch}
            onClose={() => setShowSearch(false)}
            locations={mapLocations}
          />
        )}
      </AnimatePresence>

      {/* Zoom Indicator */}
      <div className="absolute bottom-6 right-32 z-20 glass-effect px-3 py-2 rounded-lg">
        <div className="text-xs font-light text-gray-700">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Welcome Overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="text-center">
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Explore My <span className="gradient-text">Portfolio Map</span>
          </h1>
          <p className="text-gray-600 font-light max-w-lg">
            Click locations to explore my expertise as a <span className="font-medium">Geo Spatial Data Engineer</span> and <span className="font-medium">Cloud Engineer</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;