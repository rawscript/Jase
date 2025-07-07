import { motion } from "framer-motion";

export default function HeroSection() {
  const scrollToProjects = () => {
    document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center hero-gradient relative overflow-hidden">
      {/* Subtle geometric background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 right-1/4 w-px h-32 bg-white/10"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-32 h-px bg-white/10"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
        />
      </div>

      <div className="container mx-auto px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl minimal-heading mb-8">
            <span className="gradient-text">Alex Chen</span>
          </h1>
          <p className="text-lg md:text-xl mb-12 body-text max-w-2xl mx-auto font-light">
            Full-Stack Developer • AI Engineer • Video Editor • Photographer
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              onClick={scrollToProjects}
              className="accent-button px-8 py-4 rounded-none font-light text-sm tracking-wide"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              VIEW WORK
            </motion.button>
            <motion.button
              onClick={scrollToContact}
              className="minimal-button px-8 py-4 rounded-none font-light text-sm tracking-wide"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              GET IN TOUCH
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Minimal scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white/40"
        animate={{
          y: [0, 6, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-px h-8 bg-white/20 mx-auto mb-2"></div>
        <div className="text-xs font-light tracking-widest">SCROLL</div>
      </motion.div>
    </section>
  );
}
