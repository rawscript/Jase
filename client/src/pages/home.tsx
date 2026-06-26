import Navigation from "@/components/navigation";
import PortfolioMap from "@/components/portfolio-map";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Main Feature: Portfolio Map with Contact & Chat */}
      <PortfolioMap />
      
      <Footer />
    </div>
  );
}
