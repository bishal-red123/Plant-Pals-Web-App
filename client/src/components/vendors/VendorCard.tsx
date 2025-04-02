import { Link } from "wouter";
import { Star } from "lucide-react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VendorCardProps {
  vendor: User;
}

const VendorCard = ({ vendor }: VendorCardProps) => {
  // Sample data for demonstration
  const rating = 4.8;
  const reviewCount = 250;
  const specialties = ["Office Plants", "Next-day Delivery", "Maintenance"];
  
  // Background images for vendors
  const bgImages = [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555955875-1030ceb777b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1568485248685-019a98426c9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  ];
  
  // Use vendor id to pick a background image
  const bgImage = bgImages[vendor.id % bgImages.length];

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <div className="h-32 bg-primary-light flex items-center justify-center relative">
        <img 
          src={bgImage} 
          alt={vendor.companyName || ""} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center z-10 border-4 border-white">
          {vendor.companyName?.charAt(0) || vendor.username.charAt(0)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-center mb-3">
          <h3 className="font-montserrat font-semibold text-xl">{vendor.companyName || vendor.fullName}</h3>
          <p className="text-sm text-gray-600">{vendor.location || "Location not specified"}</p>
        </div>
        
        <div className="flex items-center justify-center space-x-1 mb-4">
          <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
          <span className="font-medium">{rating}</span>
          <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {specialties.map((specialty, index) => (
            <Badge key={index} variant="outline" className="bg-primary bg-opacity-10 text-primary text-xs px-2 py-1 rounded-full">
              {specialty}
            </Badge>
          ))}
        </div>
        
        <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
          <Link href={`/vendors/${vendor.id}`}>View Vendor</Link>
        </Button>
      </div>
    </div>
  );
};

export default VendorCard;
