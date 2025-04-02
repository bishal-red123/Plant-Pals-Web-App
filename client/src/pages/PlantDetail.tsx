import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { 
  Droplet, 
  Sun, 
  Thermometer, 
  CheckCircle, 
  InfoIcon, 
  Star, 
  StarHalf,
  FileText,
  ArrowLeft
} from "lucide-react";
import { Plant, CareGuide, User, Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

type PlantDetailResponse = {
  plant: Plant;
  careGuide: CareGuide;
  categories: string[];
  vendor: User;
  reviews: Review[];
};

const PlantDetail = () => {
  const [, params] = useRoute("/plants/:id");
  const plantId = params?.id;
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<PlantDetailResponse>({
    queryKey: [`/api/plants/${plantId}`],
    enabled: !!plantId,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${data?.plant.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-96 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-100 animate-pulse rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4"></div>
            <div className="h-20 bg-gray-100 animate-pulse rounded w-full mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load plant details. Please try again later.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/plants">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Plants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { plant, careGuide, categories, vendor, reviews } = data;
  
  const avgRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/plants">
          <Button variant="ghost" className="flex items-center gap-2 pl-0 hover:pl-1 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Plants
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Plant Image & Vendor Info */}
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
            <img 
              src={plant.imageUrl} 
              alt={plant.name} 
              className="w-full h-80 object-cover" 
            />
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-montserrat font-semibold text-lg">Sold by</h3>
                <Link href={`/vendors/${vendor.id}`}>
                  <Button variant="link" className="text-primary p-0">View Vendor Profile</Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-primary bg-opacity-10 rounded-full h-12 w-12 flex items-center justify-center font-bold text-primary">
                  {vendor.companyName?.charAt(0) || vendor.username.charAt(0)}
                </div>
                <div>
                  <h4 className="font-montserrat font-medium">{vendor.companyName || vendor.fullName}</h4>
                  <p className="text-sm text-gray-600">{vendor.location || "Location not specified"}</p>
                  <div className="flex items-center mt-1">
                    <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                    <span className="text-sm ml-1">4.8 (250+ reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-montserrat font-semibold text-lg mb-4">Customer Reviews</h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          i < Math.floor(review.rating) ? (
                            <Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                          ) : i + 0.5 <= review.rating ? (
                            <StarHalf key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                          ) : (
                            <Star key={i} className="text-gray-300 h-4 w-4" />
                          )
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">{review.comment || "Great plant!"}</p>
                      <p className="text-xs text-gray-500 mt-1">Posted on {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet for this plant.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Plant Details & Care Info */}
        <div className="w-full md:w-1/2">
          <div className="mb-4">
            <Badge className={`
              ${plant.difficulty === 'beginner' 
                ? 'bg-primary text-white' 
                : plant.difficulty === 'intermediate' 
                  ? 'bg-secondary text-white' 
                  : 'bg-accent text-white'} 
                mb-2
            `}>
              {plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}
            </Badge>
            <h1 className="font-montserrat text-3xl font-bold text-foreground mb-1">{plant.name}</h1>
            <p className="text-gray-500 italic mb-4">{plant.scientificName}</p>
            
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                i < Math.floor(avgRating) ? (
                  <Star key={i} className="fill-yellow-400 text-yellow-400 h-5 w-5" />
                ) : i + 0.5 <= avgRating ? (
                  <StarHalf key={i} className="fill-yellow-400 text-yellow-400 h-5 w-5" />
                ) : (
                  <Star key={i} className="text-gray-300 h-5 w-5" />
                )
              ))}
              <span className="text-sm ml-1">({reviews.length} reviews)</span>
            </div>
            
            <h2 className="font-montserrat text-2xl font-bold text-foreground mb-2">${plant.price.toFixed(2)}</h2>
            <p className="mb-6">{plant.description}</p>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex flex-col items-center">
                <Droplet className="text-blue-400 mb-1 h-6 w-6" />
                <span className="font-montserrat font-medium text-sm">Water</span>
                <span className="text-xs text-gray-600 capitalize">{plant.waterRequirement}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Sun className="text-yellow-400 mb-1 h-6 w-6" />
                <span className="font-montserrat font-medium text-sm">Light</span>
                <span className="text-xs text-gray-600 capitalize">{plant.lightRequirement}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Thermometer className="text-red-400 mb-1 h-6 w-6" />
                <span className="font-montserrat font-medium text-sm">Temperature</span>
                <span className="text-xs text-gray-600">65-85°F</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-montserrat font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="bg-primary bg-opacity-10 text-primary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-x-3 mb-6">
              <Button size="lg" onClick={handleAddToCart} className="bg-primary hover:bg-primary/90 text-white">
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Save for Later
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="care" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="care">Care Information</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="care" className="pt-4">
              {careGuide ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-montserrat font-semibold mb-2">Watering Instructions</h3>
                    <p className="text-sm text-gray-700">{careGuide.wateringInstructions}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-montserrat font-semibold mb-2">Light Requirements</h3>
                    <p className="text-sm text-gray-700">{careGuide.lightInstructions}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-montserrat font-semibold mb-2">Temperature</h3>
                    <p className="text-sm text-gray-700">{careGuide.temperatureRange}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-montserrat font-semibold mb-2">Weekly Care Routine</h3>
                    <ul className="space-y-2">
                      {careGuide.weeklyRoutine.split('.').filter(item => item.trim().length > 0).map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="text-primary mt-1 mr-2 h-4 w-4" />
                          <span className="text-sm">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {careGuide.troubleshooting && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <div className="flex">
                        <InfoIcon className="text-yellow-500 mt-1 mr-3 h-5 w-5" />
                        <div>
                          <h4 className="font-montserrat font-medium text-sm text-yellow-800">Troubleshooting Tips</h4>
                          <p className="text-sm text-yellow-700">{careGuide.troubleshooting}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Link href="/care-guides">
                    <Button variant="link" className="flex items-center p-0 text-primary">
                      <FileText className="mr-2 h-4 w-4" />
                      View Full Care Guide
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">No care guide available for this plant.</p>
              )}
            </TabsContent>
            <TabsContent value="shipping" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-montserrat font-semibold mb-2">Shipping Information</h3>
                  <p className="text-sm text-gray-700">
                    Plants are carefully packaged to ensure they arrive in perfect condition. Most orders ship within 2-3 business days.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-montserrat font-semibold mb-2">Return Policy</h3>
                  <p className="text-sm text-gray-700">
                    If your plant arrives damaged, please contact us within 48 hours with photos of the damage. We'll send a replacement at no additional cost.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-montserrat font-semibold mb-2">Delivery Areas</h3>
                  <p className="text-sm text-gray-700">
                    We deliver to commercial addresses within the continental United States. Additional shipping fees may apply for rush or weekend deliveries.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;
