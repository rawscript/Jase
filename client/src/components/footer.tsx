import { Github, Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: Github, href: "https://github.com/rawscript", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/jase-mwaura/", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/JaseMwaura", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/raw.script/", label: "Instagram" },
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
              &copy; {new Date().getFullYear()} James Mwaura. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
