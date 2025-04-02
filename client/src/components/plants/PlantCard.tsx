import { useState } from "react";
import { Link } from "wouter";
import { 
  Heart, 
  Droplet, 
  Sun, 
  Leaf, 
  Star,
  StarHalf 
} from "lucide-react";
import { Plant } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlantCardProps {
  plant: Plant;
}

const PlantCard = ({ plant }: PlantCardProps) => {
  const [isWishlist, setIsWishlist] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlist(!isWishlist);
  };

  const difficultyColor = {
    beginner: 'bg-primary',
    intermediate: 'bg-secondary',
    expert: 'bg-accent'
  };

  const renderWaterLevel = (level: string) => {
    return level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High';
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <Link href={`/plants/${plant.id}`}>
          <img 
            src={plant.imageUrl} 
            alt={plant.name} 
            className="w-full h-48 object-cover cursor-pointer" 
          />
        </Link>
        <div className="absolute top-3 left-3">
          <Badge className={`${difficultyColor[plant.difficulty]} text-white text-xs font-montserrat font-medium`}>
            {plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}
          </Badge>
        </div>
        <button 
          className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100 transition-colors"
          onClick={toggleWishlist}
        >
          <Heart className={`h-4 w-4 ${isWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/plants/${plant.id}`}>
            <h3 className="font-montserrat font-semibold text-lg cursor-pointer hover:text-primary transition-colors">
              {plant.name}
            </h3>
          </Link>
          <span className="font-montserrat font-bold text-foreground">${plant.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{plant.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            {[...Array(4)].map((_, i) => (
              <Star key={i} className="text-yellow-400 h-4 w-4 fill-yellow-400" />
            ))}
            <StarHalf className="text-yellow-400 h-4 w-4 fill-yellow-400" />
            <span className="text-xs text-gray-500 ml-1">(128)</span>
          </div>
          <span className="text-xs text-gray-500">Vendor Name</span>
        </div>
        
        <div className="flex items-center justify-between space-x-3 border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center">
              <Droplet className="text-blue-400 h-4 w-4" />
              <span className="text-xs text-gray-500">{renderWaterLevel(plant.waterRequirement)}</span>
            </div>
            <div className="flex flex-col items-center">
              <Sun className="text-yellow-400 h-4 w-4" />
              <span className="text-xs text-gray-500">{renderWaterLevel(plant.lightRequirement)}</span>
            </div>
            <div className="flex flex-col items-center">
              <Leaf className="text-green-400 h-4 w-4" />
              <span className="text-xs text-gray-500">{plant.difficulty === 'beginner' ? 'Easy' : plant.difficulty === 'intermediate' ? 'Medium' : 'Hard'}</span>
            </div>
          </div>
          
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-3 py-1.5 rounded-lg">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
