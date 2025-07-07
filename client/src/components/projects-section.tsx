import { motion } from "framer-motion";
import { useState } from "react";
import { ExternalLink, Github, Play, Camera, Book } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  technologies: string[];
  links: {
    type: string;
    url: string;
    icon: React.ElementType;
  }[];
}

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("all");

  const projects: Project[] = [
    {
      id: "1",
      title: "E-Commerce Platform",
      description: "A modern, responsive e-commerce platform built with React and Next.js featuring advanced filtering, payment integration, and admin dashboard.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "frontend",
      technologies: ["React", "Next.js", "TypeScript"],
      links: [
        { type: "Code", url: "#", icon: Github },
        { type: "Live Demo", url: "#", icon: ExternalLink },
      ],
    },
    {
      id: "2",
      title: "Microservices API",
      description: "Scalable microservices architecture with Docker, Redis caching, and comprehensive API documentation using OpenAPI standards.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "backend",
      technologies: ["Node.js", "Docker", "PostgreSQL"],
      links: [
        { type: "Code", url: "#", icon: Github },
        { type: "Documentation", url: "#", icon: Book },
      ],
    },
    {
      id: "3",
      title: "AI Content Generator",
      description: "Advanced AI-powered content generation tool using OpenAI's GPT models with custom fine-tuning for specific industries.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "ai",
      technologies: ["Python", "OpenAI", "TensorFlow"],
      links: [
        { type: "Code", url: "#", icon: Github },
        { type: "Demo", url: "#", icon: Play },
      ],
    },
    {
      id: "4",
      title: "Brand Commercial",
      description: "High-impact commercial video for a tech startup featuring motion graphics, professional cinematography, and compelling storytelling.",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "video",
      technologies: ["Premiere Pro", "After Effects", "Motion Graphics"],
      links: [
        { type: "YouTube", url: "#", icon: Play },
        { type: "Portfolio", url: "#", icon: ExternalLink },
      ],
    },
    {
      id: "5",
      title: "Corporate Portraits",
      description: "Professional headshots and corporate photography for C-suite executives and marketing teams across various industries.",
      image: "https://images.unsplash.com/photo-1554844453-7ea2a562a6c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "photography",
      technologies: ["Portrait", "Corporate", "Studio"],
      links: [
        { type: "Instagram", url: "#", icon: ExternalLink },
        { type: "Portfolio", url: "#", icon: Camera },
      ],
    },
    {
      id: "6",
      title: "Computer Vision App",
      description: "Real-time object detection and classification system using advanced computer vision algorithms for inventory management.",
      image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "ai",
      technologies: ["OpenCV", "YOLO", "Python"],
      links: [
        { type: "Code", url: "#", icon: Github },
        { type: "Demo", url: "#", icon: Play },
      ],
    },
  ];

  const filters = [
    { id: "all", label: "All Projects" },
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend" },
    { id: "ai", label: "AI" },
    { id: "video", label: "Video" },
    { id: "photography", label: "Photography" },
  ];

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  return (
    <section id="projects" className="py-20" style={{ backgroundColor: 'var(--portfolio-secondary)' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6 gradient-text"
          >
            Featured Projects
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-8"
          >
            A showcase of my best work across different domains and technologies.
          </motion.p>

          {/* Project Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeFilter === filter.id
                    ? "text-white"
                    : "glass-effect text-white hover:bg-white/10"
                }`}
                style={{
                  backgroundColor: activeFilter === filter.id ? 'var(--portfolio-accent)' : undefined,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="project-card glass-effect rounded-2xl overflow-hidden"
            >
              <div className="relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 image-overlay flex items-center justify-center">
                  <div className="text-center">
                    <ExternalLink size={32} className="mx-auto mb-2" />
                    <p className="font-semibold">View Project</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        color: 'var(--portfolio-accent)'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-4">
                  {project.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      className="flex items-center gap-1 transition-colors"
                      style={{ color: 'var(--portfolio-accent)' }}
                    >
                      <link.icon size={16} />
                      {link.type}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
