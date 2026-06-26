import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#portfolio", label: "Portfolio" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 floating-nav h-16 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-8 h-full flex items-center justify-between">
          <div className="text-xl font-light text-black tracking-wide">James Mwaura</div>
          <div className="hidden md:flex space-x-12">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-sm font-light text-black/80 hover:text-black transition-colors duration-300 tracking-wide"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              className="md:hidden text-black/80 hover:text-black transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
          <div className="space-y-12 text-center">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="block text-lg font-light text-black/80 hover:text-black transition-colors duration-300 tracking-wide"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
