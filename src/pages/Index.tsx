import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ToolsSection } from "@/components/ToolsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ToolsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
