import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Star, ArrowLeft } from "lucide-react";
import { User, Plant, Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PlantCard from "@/components/plants/PlantCard";

type VendorDetailResponse = {
  vendor: User;
  plants: Plant[];
  reviews: Review[];
};

const VendorDetail = () => {
  const [, params] = useRoute("/vendors/:id");
  const vendorId = params?.id;

  const { data, isLoading, error } = useQuery<VendorDetailResponse>({
    queryKey: [`/api/vendors/${vendorId}`],
    enabled: !!vendorId,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg mb-8"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-4">
            <div className="h-8 bg-gray-100 animate-pulse rounded w-3/4"></div>
            <div className="h-32 bg-gray-100 animate-pulse rounded w-full"></div>
          </div>
          <div className="w-full md:w-2/3">
            <div className="h-8 bg-gray-100 animate-pulse rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 animate-pulse rounded"></div>
              ))}
            </div>
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
            Failed to load vendor details. Please try again later.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/vendors">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Vendors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { vendor, plants, reviews } = data;
  
  // Sample specialties for the vendor
  const specialties = ["Office Plants", "Next-day Delivery", "Maintenance", "Premium Plants", "Consultation"];

  // Calculate average rating
  const avgRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Background images for vendors
  const bgImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/vendors">
          <Button variant="ghost" className="flex items-center gap-2 pl-0 hover:pl-1 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Button>
        </Link>
      </div>

      <div className="relative rounded-lg overflow-hidden mb-8">
        <div className="h-64 bg-primary/20">
          <img
            src={bgImage}
            alt={vendor.companyName || vendor.fullName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="font-montserrat text-3xl font-bold mb-2">{vendor.companyName || vendor.fullName}</h1>
            {vendor.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{vendor.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Vendor Info Sidebar */}
        <div className="w-full md:w-1/3">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-full h-12 w-12 flex items-center justify-center font-bold text-primary mr-4">
                  {vendor.companyName?.charAt(0) || vendor.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-montserrat font-semibold">{vendor.companyName || vendor.fullName}</h3>
                  <div className="flex items-center">
                    <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                    <span className="text-sm ml-1">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {vendor.phoneNumber && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-3 text-primary" />
                    <span>{vendor.phoneNumber}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-3 text-primary" />
                    <span>{vendor.email}</span>
                  </div>
                )}
                {vendor.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-primary" />
                    <span>{vendor.location}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-montserrat font-medium mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="bg-primary bg-opacity-10 text-primary text-xs px-2 py-1 rounded-full">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                Contact Vendor
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-montserrat font-semibold mb-4">About {vendor.companyName || "Us"}</h3>
              <p className="text-sm text-gray-700 mb-4">
                {vendor.companyName || vendor.fullName} is a trusted plant vendor specializing in supplying high-quality plants for office environments. With years of experience, we offer expert guidance on plant selection and care.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Response Rate</span>
                  <span className="font-medium">98%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Delivery Time</span>
                  <span className="font-medium">1-3 days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Vendor Since</span>
                  <span className="font-medium">{new Date(vendor.createdAt).getFullYear()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Plants & Reviews */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="plants" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plants">Available Plants</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plants" className="pt-6">
              {plants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {plants.map(plant => (
                    <PlantCard key={plant.id} plant={plant} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No plants available from this vendor at the moment.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-6">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{review.comment || "Great experience with this vendor!"}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Anonymous Customer</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews available for this vendor yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
