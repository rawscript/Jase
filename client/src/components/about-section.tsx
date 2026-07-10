import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Instagram } from "lucide-react";
import TimelineScroller from "./timeline-scroller";
import VerticalScroller from "./vertical-scroller";

export default function AboutSection() {
  const socialLinks = [
    { icon: Github, href: "https://github.com/rawscript", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/jase-mwaura/", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/JaseMwaura", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/raw.script/", label: "Instagram" },
  ];

  return (
    <section id="about" className="section-spacing" style={{ backgroundColor: 'var(--portfolio-secondary)' }}>
      <div className="container mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl minimal-heading mb-8 gradient-text text-center">Journey Timeline</h2>
          <p className="text-lg body-text mb-12 leading-relaxed text-center max-w-2xl mx-auto">
            Scroll through my professional journey—from data analyst beginnings to global engineering work.
          </p>
          <TimelineScroller />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl minimal-heading mb-8 gradient-text">About</h2>
            <p className="text-lg body-text mb-8 leading-relaxed">
              I'm a passionate Geo spatial Data Engineer with expertise in cloud-native architecture, data pipelines, and scalable application development.
            </p>
            
            {/* Vertical Scroller Integration */}
            <div className="mb-8">
              <VerticalScroller />
            </div>
            
            <p className="text-lg body-text mb-12 leading-relaxed">
              My journey began with a fascination for technology and Spatial Data, evolving into a career focused on building resilient, scalable systems that solve real-world problems.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/60 hover:text-black transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="premium-card rounded-none p-8">
                <img
                  src="https://i.postimg.cc/zfgcwZHv/IMG-20251129-173707.jpg"
                  alt="Professional portrait of James Mwaura"
                  className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 border border-black/20"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
