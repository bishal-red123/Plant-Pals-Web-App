import { useState } from "react";
import { Settings, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PlantFilter = () => {
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  return (
    <div className="flex flex-wrap items-center mt-4 md:mt-0 gap-2">
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[160px] bg-white border-gray-200 rounded-lg">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="low-light">Low Light Plants</SelectItem>
          <SelectItem value="air-purifying">Air Purifying</SelectItem>
          <SelectItem value="pet-friendly">Pet Friendly</SelectItem>
          <SelectItem value="large-plants">Large Plants</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={difficulty} onValueChange={setDifficulty}>
        <SelectTrigger className="w-[160px] bg-white border-gray-200 rounded-lg">
          <SelectValue placeholder="All Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulty</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="expert">Expert</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <span>More Filters</span>
      </Button>
    </div>
  );
};

export default PlantFilter;
