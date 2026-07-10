import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Linkedin, Instagram, Twitter, Download, ArrowUpRight, X } from "lucide-react";
import PlanetGlobe from "@/components/planet-globe";
import ProjectPanel from "@/components/project-panel";
import Footer from "@/components/footer";
import { PUBLICATIONS } from "@/lib/publications-data";
import { PROJECTS } from "@/lib/world-data";

type Project = (typeof PROJECTS)[number];

export default function About() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);

  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/in/jase-mwaura/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/raw.script/", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/JaseMwaura", label: "Twitter" },
  ];

  // Handle smooth scroll to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  // Handle orbit click
  const handleOrbitClick = (project: Project) => {
    setActiveProject(project);
    // Scroll to project details section
    setTimeout(() => {
      scrollToSection('project-details');
    }, 100);
  };

  // Handle scroll on mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (contentRef.current && !isScrolling) {
        e.preventDefault();
        contentRef.current.scrollBy({ top: e.deltaY, behavior: 'smooth' });
        setIsScrolling(true);
        setTimeout(() => setIsScrolling(false), 100);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => contentElement.removeEventListener('wheel', handleWheel);
    }
  }, [isScrolling]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#FAF8F4' }}>
      {/* Navigation Back */}
      <nav className="pt-8 px-8 flex items-center justify-between sticky top-0 z-50 bg-[#FAF8F4]/95 backdrop-blur-sm">
        <a
          href="/"
          className="text-sm font-mono tracking-widest text-gray-600 hover:text-black transition-colors"
        >
          ← BACK TO MAP
        </a>
        <div>
          <p className="font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
            JAMES MWAURA
          </p>
          <p className="text-xs text-gray-500 font-mono tracking-widest">FULL-STACK · CLOUD · DATA</p>
        </div>
        
        {/* Scroll Navigation */}
        <div className="flex gap-4">
          <button
            onClick={() => scrollToSection('about-me')}
            className="text-xs font-mono tracking-widest text-gray-600 hover:text-black transition-colors"
          >
            ABOUT
          </button>
          <button
            onClick={() => scrollToSection('projects-globe')}
            className="text-xs font-mono tracking-widest text-gray-600 hover:text-black transition-colors"
          >
            PROJECTS
          </button>
          <button
            onClick={() => scrollToSection('publications')}
            className="text-xs font-mono tracking-widest text-gray-600 hover:text-black transition-colors"
          >
            PUBLICATIONS
          </button>
        </div>
      </nav>

      {/* Main Content with Scroll */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto scroll-smooth" 
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* About Me Section */}
        <section id="about-me" className="container mx-auto px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left: Editorial Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
                    About <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Me</span>
                  </h1>
                  <div className="w-16 h-1 bg-black mb-8"></div>
                </div>

                <div className="space-y-6 text-lg leading-relaxed">
                  <p className="text-gray-700">
                    I'm a passionate <span className="font-semibold">Geo Spatial Data Engineer</span> and <span className="font-semibold">Cloud Systems Architect</span> with a deep fascination for bridging the gap between complex data infrastructure and meaningful user experiences.
                  </p>

                  <p className="text-gray-700">
                    My journey began with a fascination for technology and spatial data systems. Over the years, I've developed expertise in cloud infrastructure, data engineering, and full-stack development. I specialize in building scalable systems that turn raw data into actionable insights.
                  </p>

                  <p className="text-gray-700">
                    I'm driven by the challenge of solving problems that require both technical depth and creative thinking. Whether it's architecting cloud solutions, optimizing data pipelines, or building intuitive interfaces, I approach every project with meticulous attention to detail.
                  </p>

                  <p className="text-gray-700">
                    Outside of work, I'm constantly exploring new technologies, contributing to open-source projects, and sharing knowledge with the developer community. I believe in the power of continuous learning and collaboration.
                  </p>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-6 pt-8">
                  <span className="text-sm font-mono text-gray-500 tracking-widest">CONNECT</span>
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-black transition-colors"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <social.icon size={24} />
                    </motion.a>
                  ))}
                </div>

                {/* Resume Download */}
                <div className="pt-2">
                  <motion.a
                    href="/resume.pdf"
                    download
                    className="inline-flex items-center gap-2 border-2 border-black px-6 py-3 text-sm font-mono tracking-widest hover:bg-black hover:text-white transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download size={16} />
                    DOWNLOAD RESUME
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md">
                <div className="bg-white border-2 border-black p-6" style={{ aspectRatio: '3/4' }}>
                  <img
                    src="https://i.postimg.cc/zfgcwZHv/IMG-20251129-173707.jpg"
                    alt="James Mwaura"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                {/* Decorative corner */}
                <div className="absolute -top-6 -right-6 w-12 h-12 border-2 border-black"></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 border-2 border-black"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Globe Section */}
        <section id="projects-globe" className="relative py-20 bg-gradient-to-b from-[#FAF8F4] to-gray-50">
          <div className="container mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2
                className="text-2xl md:text-3xl font-bold mb-2 text-center"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
              >
                Project Constellation
              </h2>
              <div className="w-16 h-1 bg-black mb-10 mx-auto"></div>
              
              <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
                Explore my projects orbiting the planet. Click on any satellite or its orbit to view detailed information about each project.
              </p>
            </motion.div>

            {/* Interactive Globe Container */}
            <div 
              ref={globeContainerRef}
              className="relative w-full h-[600px] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl"
            >
              <PlanetGlobe
                activeProject={activeProject}
                onSelectProject={handleOrbitClick}
                isContactOpen={false}
              />
              
              {/* Orbit Click Instructions */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                  <p className="text-xs font-mono tracking-widest">
                    CLICK ANY SATELLITE OR ORBIT TO VIEW PROJECT DETAILS
                  </p>
                </div>
              </div>
            </div>

            {/* Project Details Section */}
            {activeProject && (
              <motion.div
                id="project-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-xl font-bold"
                    style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
                  >
                    Project Details
                  </h3>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: activeProject.type === "Cloud Infrastructure" ? "#D4500A" :
                        activeProject.type === "Data Engineering" ? "#1A6B3C" :
                        activeProject.type === "Full-Stack + AI" ? "#1A3F7A" : "#6B21A8"
                      }}
                    />
                    <div>
                      <h4 className="text-lg font-bold">{activeProject.name}</h4>
                      <p className="text-sm text-gray-500 font-mono tracking-widest">
                        {activeProject.region} · {activeProject.year}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{activeProject.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-xs font-mono tracking-widest text-gray-500 mb-2">IMPACT</p>
                    <p className="text-gray-800 font-medium">{activeProject.impact}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-mono tracking-widest text-gray-500 mb-2">TECH STACK</p>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.stack.map((tech) => (
                        <span 
                          key={tech}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono tracking-widest rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {activeProject.link && (
                    <div className="mt-6">
                      <a
                        href={activeProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-mono tracking-widest hover:bg-gray-800 transition-colors rounded-full"
                      >
                        VISIT PROJECT <ArrowUpRight size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Publications */}
        {PUBLICATIONS.length > 0 && (
          <section id="publications" className="container mx-auto px-8 pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
              >
                Publications
              </h2>
              <div className="w-16 h-1 bg-black mb-10"></div>

              <div className="divide-y divide-black/10 border-t border-b border-black/10">
                {PUBLICATIONS.map((pub) => (
                  <a
                    key={pub.id}
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-6 py-6 hover:bg-black/[0.02] transition-colors"
                  >
                    <div>
                      <p
                        className="text-lg font-semibold group-hover:underline"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {pub.title}
                      </p>
                      <p className="text-sm text-gray-500 font-mono tracking-widest mt-1">
                        {pub.venue.toUpperCase()} · {pub.year}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={22}
                      className="shrink-0 text-gray-400 group-hover:text-black transition-colors"
                    />
                  </a>
                ))}
              </div>
            </motion.div>
          </section>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => scrollToSection('about-me')}
            className={`w-2 h-2 rounded-full transition-all ${!activeProject ? 'bg-black scale-125' : 'bg-gray-300'}`}
          />
          <button
            onClick={() => scrollToSection('projects-globe')}
            className={`w-2 h-2 rounded-full transition-all ${activeProject ? 'bg-black scale-125' : 'bg-gray-300'}`}
          />
          <button
            onClick={() => scrollToSection('publications')}
            className={`w-2 h-2 rounded-full transition-all bg-gray-300`}
          />
        </div>
      </div>

      {/* Footer with About-specific message */}
      <Footer pageContext="about" />
    </div>
  );
}
