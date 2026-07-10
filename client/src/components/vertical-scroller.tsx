import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface VerticalItem {
  id: string;
  title: string;
  content: string;
  category: "expertise" | "philosophy" | "approach" | "vision";
}

const VERTICAL_DATA: VerticalItem[] = [
  {
    id: "expertise",
    title: "Technical Expertise",
    content: "Specializing in cloud-native architecture, data engineering pipelines, and full-stack development. Combining AWS/GCP infrastructure with PostgreSQL/PostGIS for geospatial data processing and React/Node.js for scalable applications.",
    category: "expertise"
  },
  {
    id: "philosophy", 
    title: "Engineering Philosophy",
    content: "Believe in building systems that are not just functional but resilient, scalable, and maintainable. Focus on clean architecture, automated testing, and infrastructure-as-code to ensure long-term project success.",
    category: "philosophy"
  },
  {
    id: "approach",
    title: "Problem-Solving Approach",
    content: "Start with data-driven analysis, followed by iterative prototyping. Use A/B testing and user feedback to refine solutions. Combine technical depth with business understanding to deliver maximum impact.",
    category: "approach"
  },
  {
    id: "vision",
    title: "Future Vision",
    content: "Working towards democratizing geospatial data analysis through open-source tools and AI integration. Focus on climate tech applications using satellite data for environmental monitoring and conservation.",
    category: "vision"
  }
];

export default function VerticalScroller() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToItem = (index: number) => {
    setActiveIndex(index);
    if (itemRefs.current[index] && containerRef.current) {
      itemRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };

  const scrollNext = () => {
    const nextIndex = (activeIndex + 1) % VERTICAL_DATA.length;
    scrollToItem(nextIndex);
  };

  const scrollPrev = () => {
    const prevIndex = activeIndex === 0 ? VERTICAL_DATA.length - 1 : activeIndex - 1;
    scrollToItem(prevIndex);
  };

  const getCategoryColor = (category: VerticalItem["category"]) => {
    switch (category) {
      case "expertise": return "#1A3F7A";
      case "philosophy": return "#1A6B3C";
      case "approach": return "#D4500A";
      case "vision": return "#6B21A8";
      default: return "#555";
    }
  };

  const getCategoryIcon = (category: VerticalItem["category"]) => {
    switch (category) {
      case "expertise": return "⚙️";
      case "philosophy": return "🧠";
      case "approach": return "🎯";
      case "vision": return "🚀";
      default: return "•";
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row gap-8 h-[400px]">
      {/* Navigation controls - Desktop left side */}
      <div className="hidden md:flex flex-col items-center justify-center space-y-6">
        <button
          onClick={scrollPrev}
          className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-all"
          aria-label="Scroll up"
        >
          <ChevronUp size={24} />
        </button>

        {/* Progress indicators */}
        <div className="flex flex-col gap-3">
          {VERTICAL_DATA.map((item, index) => (
            <button
              key={item.id}
              onClick={() => scrollToItem(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === activeIndex 
                  ? "scale-125" 
                  : "opacity-40 hover:opacity-70"
              }`}
              style={{ 
                backgroundColor: index === activeIndex 
                  ? getCategoryColor(item.category) 
                  : "#D1D5DB" 
              }}
              aria-label={`Go to ${item.title}`}
            />
          ))}
        </div>

        <button
          onClick={scrollNext}
          className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-all"
          aria-label="Scroll down"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Mobile navigation controls - top */}
      <div className="md:hidden flex justify-center gap-4 mb-6">
        <button
          onClick={scrollPrev}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600"
          aria-label="Previous"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={scrollNext}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600"
          aria-label="Next"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Content container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
          <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
        </div>

        {/* Content items */}
        <div className="h-full overflow-y-auto scrollbar-hide">
          {VERTICAL_DATA.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => { itemRefs.current[index] = el }}
              className={`min-h-[400px] flex items-center justify-center p-8 transition-all duration-500 ${
                index === activeIndex ? "opacity-100 scale-100" : "opacity-40 scale-95"
              }`}
            >
              <div className="max-w-2xl mx-auto text-center">
                {/* Category indicator */}
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                  style={{ 
                    backgroundColor: `${getCategoryColor(item.category)}20`,
                    color: getCategoryColor(item.category)
                  }}
                >
                  <span>{getCategoryIcon(item.category)}</span>
                  <span className="uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-['Syne']">
                  {item.title}
                </h3>

                {/* Content */}
                <div className="relative">
                  <div 
                    className="absolute -left-8 top-0 bottom-0 w-1 rounded-full"
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  />
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed pl-8 text-left">
                    {item.content}
                  </p>
                </div>

                {/* Page indicator */}
                <div className="mt-8 text-sm text-gray-500 font-medium">
                  {index + 1} / {VERTICAL_DATA.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category labels - Desktop right side */}
      <div className="hidden md:flex flex-col justify-center space-y-6">
        {VERTICAL_DATA.map((item, index) => (
          <button
            key={item.id}
            onClick={() => scrollToItem(index)}
            className={`text-left transition-all transform hover:translate-x-2 ${
              index === activeIndex 
                ? "text-gray-900 font-bold scale-105" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(item.category) }}
              />
              <span className="text-sm uppercase tracking-wider">
                {item.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}