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
      title: "Fawe Tuseme Club",
      description: "Developed an ultramoden club site for less fortunate students in Kajiado county",
      image: "https://fawe-tuseme.onrender.com/public/images/WhatsApp%20Image%202025-06-28%20at%2010.25.53_e4a68527.jpg",
      category: "frontend",
      technologies: ["HTML5", "CSS3", "es6"],
      links: [
        { type: "Code", url: "https://github.com/rawscript/fawe-contact", icon: Github },
        { type: "Live Demo", url: "https://fawe-tuseme.onrender.com/", icon: ExternalLink },
      ],
    },
    {
      id: "2",
      title: "Energy management system",
      description: "Aurora is an energy management system designed to optimised energy management across African homes",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "backend",
      technologies: ["Node.js", "ES6", "PostgreSQL"],
      links: [
        { type: "Code", url: "https://github.com/rawscript/aurora-energy-flow", icon: Github },
        { type: "Documentation", url: "https://main.d2yx2x5zg4eyf4.amplifyapp.com/", icon: Book },
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
    {
      id: "7",
      title: "Nestie Homes",
      description: "Nestie is a real estate platform that enable users find their homes and any other real estate lsistings",
      image: "https://unsplash.com/photos/green-plant-on-brown-wooden-table-I3S-Oha_5k4",
      category: "backend",
      technologies: ["Node.js", "ES6", "PostgreSQL","React","Next js","Typescript","stripe","Daraja"],
      links: [
        { type: "Code", url: "https://github.com/rawscript/nestie", icon: Github },
        { type: "Documentation", url: "https://nestiein.vercel.app/", icon: Book },
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
    <section id="projects" className="section-spacing" style={{ backgroundColor: 'var(--portfolio-secondary)' }}>
      <div className="container mx-auto px-8">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl minimal-heading mb-8 gradient-text"
          >
            Selected Work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-lg body-text max-w-2xl mx-auto mb-12"
          >
            A showcase of my best work across different domains and technologies.
          </motion.p>

          {/* Project Filter */}
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`font-light text-sm tracking-widest transition-all duration-300 ${
                  activeFilter === filter.id
                    ? "text-black border-b border-black"
                    : "text-black/60 hover:text-black"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter.label.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="project-card premium-card rounded-none overflow-hidden"
            >
              <div className="relative group">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 image-overlay flex items-center justify-center">
                  <div className="text-center">
                    <ExternalLink size={24} className="mx-auto mb-2 text-black" />
                    <p className="font-light text-sm tracking-wide text-black">VIEW PROJECT</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-light mb-4 tracking-wide">{project.title}</h3>
                <p className="body-text mb-6 text-sm leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs font-light tracking-wide border border-black/20 text-black/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-6">
                  {project.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      className="flex items-center gap-2 text-sm font-light text-black/60 hover:text-black transition-colors duration-300"
                    >
                      <link.icon size={14} />
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
