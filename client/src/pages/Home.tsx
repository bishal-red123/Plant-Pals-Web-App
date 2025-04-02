import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import PlantCatalog from "@/components/home/PlantCatalog";
import PlantCareSection from "@/components/home/PlantCareSection";
import VendorSection from "@/components/home/VendorSection";
import Testimonials from "@/components/home/Testimonials";
import AuthPortals from "@/components/home/AuthPortals";
import Newsletter from "@/components/home/Newsletter";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PlantCatalog />
      <PlantCareSection />
      <VendorSection />
      <Testimonials />
      <AuthPortals />
      <Newsletter />
    </>
  );
};

export default Home;
