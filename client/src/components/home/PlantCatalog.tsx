import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PlantCard from "@/components/plants/PlantCard";
import PlantFilter from "@/components/plants/PlantFilter";
import { Plant } from "@shared/schema";

const PlantCatalog = () => {
  const { data: plants, isLoading, error } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-foreground mb-2">Featured Plants</h2>
            <p className="font-lato text-gray-600">Popular options for office environments</p>
          </div>
          
          <PlantFilter />
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plants?.slice(0, 4).map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Link href="/plants">View All Plants</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PlantCatalog;
