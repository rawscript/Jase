import { Github, Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  ];

  return (
    <footer className="py-16" style={{ backgroundColor: 'var(--portfolio-secondary)' }}>
      <div className="container mx-auto px-8">
        <div className="text-center">
          <div className="text-xl font-light gradient-text mb-8 tracking-wide">James Mwaura</div>
          <p className="body-text mb-12 font-light">
            Full-Stack Developer • AI Engineer • Video Editor • Photographer
          </p>
          <div className="flex justify-center space-x-8 mb-12">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/40 hover:text-black transition-colors duration-300"
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
          <div className="border-t border-black/10 pt-8">
            <p className="text-black/40 text-sm font-light tracking-wide">
              &copy; {new Date().getFullYear()} Alex Chen. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
