import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Instagram } from "lucide-react";

export default function AboutSection() {
  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  ];

  return (
    <section id="about" className="py-20" style={{ backgroundColor: 'var(--portfolio-secondary)' }}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 gradient-text">About Me</h2>
            <p className="text-lg text-gray-400 mb-6">
              I'm a passionate full-stack developer and creative professional with expertise spanning web development, AI engineering, video production, and photography. With over 5 years of experience, I bring a unique blend of technical skills and creative vision to every project.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              My journey began with a fascination for technology and visual storytelling. Today, I help businesses and individuals bring their digital visions to life through innovative solutions and compelling visual content.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl transition-colors"
                  style={{ color: 'var(--portfolio-accent)' }}
                  whileHover={{ 
                    scale: 1.1,
                    color: 'var(--portfolio-accent-cyan)'
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon size={24} />
                </motion.a>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="glass-effect rounded-2xl p-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=600"
                  alt="Professional portrait of Alex Chen"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-xl opacity-50 bg-gradient-to-br from-[var(--portfolio-accent-purple)] to-[var(--portfolio-accent-cyan)]"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
