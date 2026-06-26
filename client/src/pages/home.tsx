import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import PortfolioMap from "@/components/portfolio-map";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      
      {/* Main Feature: Portfolio Map with Contact & Chat */}
      <PortfolioMap />
      
      <Footer />
    </div>
  );
}
