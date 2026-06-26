import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import SkillsSection from "@/components/skills-section";
import ProjectsSection from "@/components/projects-section";
import GallerySection from "@/components/gallery-section";
import TestimonialsSection from "@/components/testimonials-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import InteractiveMapExplorer from "@/components/interactive-map-explorer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      
      {/* Interactive Portfolio Map - Main Feature */}
      <section id="portfolio-map" className="relative">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Explore My <span className="gradient-text">Technical Landscape</span>
            </h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Interactive map showcasing my expertise as a <span className="font-medium text-blue-600">Geo Spatial Data Engineer</span> 
              and <span className="font-medium text-green-600">Cloud Engineer</span>. Click locations to explore connections between skills and projects.
            </p>
          </div>
          <InteractiveMapExplorer />
        </div>
      </section>

      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
