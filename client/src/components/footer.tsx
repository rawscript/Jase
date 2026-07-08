import { Linkedin, Twitter, Instagram } from "lucide-react";

interface FooterProps {
  pageContext?: 'home' | 'about' | 'projects' | 'contact';
}

const pageMessages = {
  about: {
    title: "Let's Build Something Great",
    description: "Interested in collaborating? Let's connect and create something meaningful.",
  },
  projects: {
    title: "See My Work",
    description: "Explore my latest projects and innovations in cloud infrastructure and data engineering.",
  },
  contact: {
    title: "Get in Touch",
    description: "Ready to start your next project? I'm here to help bring your ideas to life.",
  },
  home: {
    title: "James Mwaura",
    description: "Geo Spatial Data and Cloud Engineer",
  },
};

export default function Footer({ pageContext = 'home' }: FooterProps) {
  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/in/jase-mwaura/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/raw.script/", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/JaseMwaura", label: "Twitter" },
  ];

  const content = pageMessages[pageContext];

  return (
    <footer className="py-16 border-t border-black/10" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="container mx-auto px-8">
        <div className="text-center">
          <div 
            className="text-xl font-light mb-4 tracking-wide"
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
          >
            {content.title}
          </div>
          <p className="body-text mb-12 font-light text-gray-600">
            {content.description}
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-8 mb-12">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/40 hover:text-black transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
          
          <div className="border-t border-black/10 pt-8">
            <p className="text-black/40 text-sm font-light tracking-wide">
              &copy; {new Date().getFullYear()} James Mwaura. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
