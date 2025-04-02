import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plant } from "@shared/schema";
import { 
  Droplet, 
  Sun, 
  Thermometer, 
  Search, 
  Filter,
  ArrowRight,
  Leaf
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const CareGuides = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  
  const { data: plants, isLoading, error } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  // Filter plants based on search term and difficulty
  const filteredPlants = plants?.filter(plant => {
    const matchesSearch = 
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = 
      difficultyFilter === "all" || plant.difficulty === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-4">
          Plant Care Guides
        </h1>
        <p className="text-gray-600">
          Detailed care instructions for office plants. Our guides are specifically tailored for busy environments to help your plants thrive with minimal maintenance.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search plant care guides..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[160px] bg-white border-gray-200 rounded-lg">
              <SelectValue placeholder="Difficulty Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {/* Care Tips Cards */}
        <Card className="overflow-hidden">
          <div className="h-3 bg-primary"></div>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-full p-2 mr-4">
                <Droplet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-montserrat font-semibold text-lg">Watering Tips</h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="text-sm flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Water most office plants only when the top 1-2 inches of soil is dry.</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Most plants prefer deep, infrequent watering rather than frequent shallow watering.</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Reduce watering in winter months when plant growth slows down.</span>
              </li>
            </ul>
            <Button variant="link" className="text-primary p-0 flex items-center">
              <span>Read More</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-3 bg-yellow-400"></div>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 rounded-full p-2 mr-4">
                <Sun className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="font-montserrat font-semibold text-lg">Light Requirements</h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="text-sm flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Position low-light plants at least 6-10 feet from windows.</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Rotate plants quarter-turn weekly to ensure even growth.</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Most office plants do best with bright, indirect light.</span>
              </li>
            </ul>
            <Button variant="link" className="text-yellow-500 p-0 flex items-center">
              <span>Read More</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-3 bg-secondary"></div>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-secondary bg-opacity-10 rounded-full p-2 mr-4">
                <Leaf className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-montserrat font-semibold text-lg">General Maintenance</h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="text-sm flex items-start">
                <span className="text-secondary mr-2">•</span>
                <span>Dust leaves regularly with a damp cloth to keep them clean and healthy.</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="text-secondary mr-2">•</span>
                <span>Remove yellow or dead leaves promptly to prevent disease spread.</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="text-secondary mr-2">•</span>
                <span>Fertilize most office plants every 3-4 months with diluted fertilizer.</span>
              </li>
            </ul>
            <Button variant="link" className="text-secondary p-0 flex items-center">
              <span>Read More</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="font-montserrat text-2xl font-bold text-foreground mb-6">Plant Care Guides</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Unable to load plant care guides</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : (
        <>
          {filteredPlants && filteredPlants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlants.map(plant => (
                <Card key={plant.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48">
                    <img 
                      src={plant.imageUrl} 
                      alt={plant.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={`
                        ${plant.difficulty === 'beginner' 
                          ? 'bg-primary text-white' 
                          : plant.difficulty === 'intermediate' 
                            ? 'bg-secondary text-white' 
                            : 'bg-accent text-white'} 
                      `}>
                        {plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <Link href={`/plants/${plant.id}`}>
                      <h3 className="font-montserrat font-semibold text-lg mb-2 hover:text-primary transition-colors cursor-pointer">
                        {plant.name} Care Guide
                      </h3>
                    </Link>
                    <p className="text-gray-500 italic text-sm mb-3">{plant.scientificName}</p>
                    
                    <div className="flex items-center justify-between space-x-3 border-t border-gray-100 pt-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <Droplet className="text-blue-400 h-4 w-4" />
                          <span className="text-xs text-gray-500 capitalize">{plant.waterRequirement}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Sun className="text-yellow-400 h-4 w-4" />
                          <span className="text-xs text-gray-500 capitalize">{plant.lightRequirement}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Thermometer className="text-red-400 h-4 w-4" />
                          <span className="text-xs text-gray-500">65-85°F</span>
                        </div>
                      </div>
                      
                      <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary/90">
                        <Link href={`/plants/${plant.id}`}>
                          <span className="flex items-center">
                            View <ArrowRight className="ml-1 h-3 w-3" />
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No care guides found matching your search criteria.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("all");
              }}>Clear Filters</Button>
            </div>
          )}
        </>
      )}

      <div className="bg-primary/5 rounded-lg p-8 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h3 className="font-montserrat text-xl font-bold text-foreground mb-2">Need Custom Plant Care Advice?</h3>
            <p className="text-gray-600 max-w-xl">
              Our plant experts can provide personalized care recommendations based on your specific office environment. Schedule a consultation today.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Get Custom Advice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CareGuides;
