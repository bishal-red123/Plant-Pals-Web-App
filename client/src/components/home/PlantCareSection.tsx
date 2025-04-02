import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Droplet, 
  Sun, 
  Thermometer, 
  CheckCircle, 
  InfoIcon,
  CalendarCheck, 
  BarChart4, 
  HelpCircle, 
  ArrowRight
} from "lucide-react";
import { Plant, CareGuide } from "@shared/schema";

const PlantCareSection = () => {
  const { data: plants } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  const plant = plants?.[1]; // Use the Pothos plant for demonstration

  const { data: careData } = useQuery<{plant: Plant, careGuide: CareGuide}>({
    queryKey: ['/api/plants/' + plant?.id],
    enabled: !!plant?.id,
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-foreground mb-2">Plant Care Made Simple</h2>
          <p className="font-lato text-gray-600 max-w-2xl mx-auto">Each plant comes with detailed care information tailored for office environments</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0 pr-0 lg:pr-12">
            <div className="bg-background rounded-lg p-6 md:p-8 shadow-md">
              <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                <img 
                  src={plant?.imageUrl || "https://images.unsplash.com/photo-1602923668104-8ba5cb2b0360?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"}
                  alt={plant?.name || "Pothos Plant"} 
                  className="w-16 h-16 object-cover rounded-lg mr-4" 
                />
                <div>
                  <h3 className="font-montserrat font-semibold text-xl">{plant?.name || "Pothos"} Care Guide</h3>
                  <p className="text-sm text-gray-600">{plant?.scientificName || "Epipremnum aureum"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-3 text-center">
                  <Droplet className="text-blue-400 mx-auto mb-1" />
                  <h4 className="font-montserrat font-medium text-sm">Water</h4>
                  <p className="text-xs text-gray-600">
                    {plant?.waterRequirement === 'low' ? 'Once every 2 weeks' : 
                     plant?.waterRequirement === 'medium' ? 'Once weekly' : 'Twice weekly'}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 text-center">
                  <Sun className="text-yellow-400 mx-auto mb-1" />
                  <h4 className="font-montserrat font-medium text-sm">Light</h4>
                  <p className="text-xs text-gray-600">
                    {plant?.lightRequirement === 'low' ? 'Low to medium' : 
                     plant?.lightRequirement === 'medium' ? 'Bright indirect' : 'Direct sunlight'}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 text-center">
                  <Thermometer className="text-red-400 mx-auto mb-1" />
                  <h4 className="font-montserrat font-medium text-sm">Temperature</h4>
                  <p className="text-xs text-gray-600">65-85°F</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-montserrat font-semibold mb-2">Weekly Care Routine</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="text-primary mt-1 mr-2 h-5 w-5" />
                    <span className="text-sm">Check soil moisture - water when top inch is dry</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-primary mt-1 mr-2 h-5 w-5" />
                    <span className="text-sm">Wipe leaves with damp cloth to remove dust</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-primary mt-1 mr-2 h-5 w-5" />
                    <span className="text-sm">Rotate plant for even growth</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex">
                  <InfoIcon className="text-yellow-500 mt-1 mr-3 h-5 w-5" />
                  <div>
                    <h4 className="font-montserrat font-medium text-sm text-yellow-800">Pro Tip</h4>
                    <p className="text-sm text-yellow-700">Pothos plants thrive in offices as they tolerate inconsistent watering and low light conditions. Perfect for busy professionals!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <h3 className="font-montserrat text-2xl font-semibold text-foreground mb-4">Why Detailed Care Matters</h3>
            
            <p className="font-lato text-gray-600 mb-4">
              Plants in office environments face unique challenges - inconsistent temperatures, artificial lighting, and weekend neglect. Our detailed care guides help your investment thrive.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="bg-primary bg-opacity-10 rounded-full p-2 mt-1 mr-4">
                  <CalendarCheck className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-montserrat font-medium">Maintenance Schedules</h4>
                  <p className="text-sm text-gray-600">Customized weekly, monthly and seasonal care routines.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary bg-opacity-10 rounded-full p-2 mt-1 mr-4">
                  <BarChart4 className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-montserrat font-medium">Environmental Adaptations</h4>
                  <p className="text-sm text-gray-600">Specific advice for thriving in office conditions.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary bg-opacity-10 rounded-full p-2 mt-1 mr-4">
                  <HelpCircle className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-montserrat font-medium">Troubleshooting Guides</h4>
                  <p className="text-sm text-gray-600">Solutions for common issues from yellow leaves to pest control.</p>
                </div>
              </div>
            </div>
            
            <Link href="/care-guides">
              <a className="inline-flex items-center font-montserrat font-medium text-primary hover:text-primary/80">
                <span>View sample care guide</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlantCareSection;
