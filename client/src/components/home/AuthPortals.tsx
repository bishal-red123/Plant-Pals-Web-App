import { Link } from "wouter";
import { Building, Store, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const AuthPortals = () => {
  return (
    <section className="py-12 bg-secondary bg-opacity-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-foreground mb-2">Join Our Community</h2>
          <p className="font-lato text-gray-600 max-w-2xl mx-auto">Whether you're buying or selling, GreenSpace connects you with the perfect partners</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="h-32 bg-primary relative">
              <div className="absolute inset-0 texture-bg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Building className="text-white h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-montserrat font-semibold text-white text-xl">Corporate Buyers</h3>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="font-lato text-gray-700 mb-6">
                Find the perfect plants for your office environment, connect with trusted vendors, and access detailed care guides to keep your investment thriving.
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="text-primary mt-1 mr-2 h-5 w-5" />
                  <span>Browse vetted plant vendors with reviews</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-primary mt-1 mr-2 h-5 w-5" />
                  <span>Get detailed plant care instructions</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-primary mt-1 mr-2 h-5 w-5" />
                  <span>Track orders and deliveries</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-primary mt-1 mr-2 h-5 w-5" />
                  <span>Maintenance reminders and support</span>
                </li>
              </ul>
              
              <Button className="w-full bg-primary hover:bg-primary/90">
                Corporate Sign Up
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="h-32 bg-secondary relative">
              <div className="absolute inset-0 texture-bg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Store className="text-white h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-montserrat font-semibold text-white text-xl">Plant Vendors</h3>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="font-lato text-gray-700 mb-6">
                Expand your business by connecting with corporate clients looking for quality office plants. Our platform makes it easy to showcase your inventory and manage orders.
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="text-secondary mt-1 mr-2 h-5 w-5" />
                  <span>Connect with corporate customers</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-secondary mt-1 mr-2 h-5 w-5" />
                  <span>Showcase your plant inventory</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-secondary mt-1 mr-2 h-5 w-5" />
                  <span>Manage orders in one place</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-secondary mt-1 mr-2 h-5 w-5" />
                  <span>Build your reputation with reviews</span>
                </li>
              </ul>
              
              <Button className="w-full bg-secondary hover:bg-secondary/90">
                Vendor Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPortals;
