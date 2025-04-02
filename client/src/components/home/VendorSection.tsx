import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import VendorCard from "@/components/vendors/VendorCard";
import { User } from "@shared/schema";

const VendorSection = () => {
  const { data: vendors, isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/vendors'],
  });

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-foreground mb-2">Trusted Plant Vendors</h2>
          <p className="font-lato text-gray-600 max-w-2xl mx-auto">Connect with the best plant suppliers for your office needs</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-72 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Unable to load vendors</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors?.slice(0, 3).map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Link href="/vendors">Browse All Vendors</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default VendorSection;
