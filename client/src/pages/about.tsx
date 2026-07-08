import { motion } from "framer-motion";
import { Linkedin, Instagram, Twitter } from "lucide-react";
import Footer from "@/components/footer";

export default function About() {
  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/in/jase-mwaura/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/raw.script/", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/JaseMwaura", label: "Twitter" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF8F4' }}>
      {/* Navigation Back */}
      <nav className="pt-8 px-8 flex items-center justify-between">
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
      </nav>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-8 py-16 md:py-24">
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
      </div>

      {/* Footer with About-specific message */}
      <Footer pageContext="about" />
    </div>
  );
}
