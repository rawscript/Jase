import { Github, Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  ];

  return (
    <footer className="py-12" style={{ backgroundColor: 'var(--portfolio-secondary)' }}>
      <div className="container mx-auto px-6">
        <div className="text-center">
          <div className="text-2xl font-bold gradient-text mb-4">Alex Chen</div>
          <p className="text-gray-400 mb-6">
            Full-Stack Developer • AI Engineer • Video Editor • Photographer
          </p>
          <div className="flex justify-center space-x-6 mb-8">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[var(--portfolio-accent)] transition-colors"
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
          <div className="border-t border-white/20 pt-8">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Alex Chen. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
