import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  type: "work" | "education" | "achievement" | "project";
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    year: "2018",
    title: "Data Analyst Beginnings",
    description: "Started career in data analysis & business intelligence in Nairobi",
    type: "work"
  },
  {
    year: "2020",
    title: "Full-Stack Transition",
    description: "Moved to full-stack development with React & Node.js",
    type: "work"
  },
  {
    year: "2022",
    title: "Cloud Architecture",
    description: "Became Cloud Solutions Architect across East & South Africa",
    type: "work"
  },
  {
    year: "2023",
    title: "Msitubora Project",
    description: "Built forest monitoring platform with satellite APIs & blockchain",
    type: "project"
  },
  {
    year: "2023",
    title: "Aurora Energy",
    description: "Developed energy grid optimization system for UK market",
    type: "project"
  },
  {
    year: "2024",
    title: "Mailforge AI",
    description: "Created AI presentation generation tool with GenAI integration",
    type: "project"
  },
  {
    year: "Present",
    title: "Global Engineering",
    description: "Working with international clients on cloud-native applications",
    type: "work"
  }
];

export default function TimelineScroller() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === "left" ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth"
      });
    }
  };

  const getTypeColor = (type: TimelineItem["type"]) => {
    switch (type) {
      case "work": return "#1A3F7A";
      case "education": return "#1A6B3C";
      case "achievement": return "#6B21A8";
      case "project": return "#D4500A";
      default: return "#555";
    }
  };

  const getTypeLabel = (type: TimelineItem["type"]) => {
    switch (type) {
      case "work": return "Work";
      case "education": return "Education";
      case "achievement": return "Achievement";
      case "project": return "Project";
      default: return "Event";
    }
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>

      {/* Scroll indicator dots */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {TIMELINE_DATA.map((_, index) => (
          <div 
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300"
          />
        ))}
      </div>

      {/* Timeline container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide py-8 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Timeline line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10" />

        {TIMELINE_DATA.map((item, index) => (
          <div 
            key={index}
            className="relative flex-shrink-0 w-80"
          >
            {/* Timeline node */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white z-10"
              style={{ backgroundColor: getTypeColor(item.type) }}
            />

            {/* Card */}
            <div className="mt-16 bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Year badge */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full">
                  {item.year}
                </div>
              </div>

              {/* Type indicator */}
              <div 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{ 
                  backgroundColor: `${getTypeColor(item.type)}20`,
                  color: getTypeColor(item.type)
                }}
              >
                {getTypeLabel(item.type)}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-['Syne']">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>

              {/* Connection line to node */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 -top-4 w-0.5 h-12"
                style={{ backgroundColor: getTypeColor(item.type) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}