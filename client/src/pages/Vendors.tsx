import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import VendorCard from "@/components/vendors/VendorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  
  const { data: vendors, isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/vendors'],
  });

  // Filter vendors based on search term and location
  const filteredVendors = vendors?.filter(vendor => {
    const matchesSearch = 
      vendor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = 
      locationFilter === "all" || 
      (vendor.location && vendor.location.includes(locationFilter));
    
    return matchesSearch && matchesLocation;
  });

  // Extract unique locations for the filter
  const locations = vendors?.map(vendor => vendor.location)
    .filter((location): location is string => !!location)
    .filter((location, index, self) => self.indexOf(location) === index)
    .sort() || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-2">
          Plant Vendors
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Connect with trusted plant suppliers specialized in office environments. Each vendor is verified for quality and reliability.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search vendors..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="text-gray-400 h-5 w-5" />
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px] bg-white border-gray-200 rounded-lg">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location, index) => (
                  <SelectItem key={index} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          {filteredVendors && filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No vendors found matching your search criteria.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setLocationFilter("all");
              }}>Clear Filters</Button>
            </div>
          )}
        </>
      )}

      <div className="mt-12 bg-primary bg-opacity-5 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="font-montserrat text-xl font-bold text-foreground mb-2">Are You a Plant Vendor?</h2>
            <p className="text-gray-600">Join our marketplace and connect with corporate clients looking for quality office plants.</p>
          </div>
          <Button className="bg-secondary hover:bg-secondary/90 text-white">
            Become a Vendor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Vendors;
