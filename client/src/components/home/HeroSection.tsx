import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-background texture-bg">
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <h2 className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground mb-4">
              Transform Your <span className="text-primary">Workspace</span> With Living Green
            </h2>
            <p className="font-lato text-lg text-gray-600 mb-8">
              Connect with trusted plant vendors and bring nature into your office space. 
              Complete with care instructions tailored for busy professionals.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/plants">Browse Plants</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                <Link href="/become-vendor">For Vendors</Link>
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1524397057410-1e775ed476f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Office with plants" 
                className="rounded-lg shadow-lg w-full h-auto md:h-[400px] object-cover" 
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-md max-w-xs hidden md:block">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 rounded-full p-2">
                    <Award className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-montserrat font-semibold text-foreground">Trusted by 500+ Companies</h4>
                    <p className="text-sm text-gray-600">Pre-verified vendors with quality guarantees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
