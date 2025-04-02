import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plant } from "@shared/schema";
import PlantCard from "@/components/plants/PlantCard";
import PlantFilter from "@/components/plants/PlantFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Plants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: plants, isLoading, error } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  // Filter plants based on search term
  const filteredPlants = plants?.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-2">
          Plants for Your Office
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Browse our selection of office-friendly plants, complete with detailed care instructions and delivery options.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search plants..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <PlantFilter />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-96 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Unable to load plants</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : (
        <>
          {filteredPlants && filteredPlants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlants.map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No plants found matching your search criteria.</p>
              <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Plants;
