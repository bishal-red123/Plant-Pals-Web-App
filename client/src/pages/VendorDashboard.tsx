import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { insertPlantSchema, insertCareGuideSchema, type Plant } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  AlertCircle, 
  PenSquare, 
  Trash2, 
  Plus, 
  Leaf, 
  ShoppingBag, 
  ClipboardList,
  ArrowUpDown 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

// Plant form schema
const plantFormSchema = insertPlantSchema
  .omit({ vendorId: true })
  .extend({
    price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  });

type PlantFormValues = z.infer<typeof plantFormSchema>;

// Care guide form schema
const careGuideFormSchema = insertCareGuideSchema.omit({ plantId: true });
type CareGuideFormValues = z.infer<typeof careGuideFormSchema>;

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("plants");
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  
  // Get vendor plants
  const { data: plants, isLoading: plantsLoading, error: plantsError } = useQuery<Plant[]>({
    queryKey: ['/api/plants/vendor'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/plants/vendor/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch plants");
      return response.json();
    },
    enabled: !!user && user.userType === 'vendor',
  });

  // Get vendor orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user && user.userType === 'vendor',
  });

  // Form for adding a new plant
  const plantForm = useForm<PlantFormValues>({
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      name: "",
      scientificName: "",
      description: "",
      price: undefined,
      waterRequirement: "medium",
      lightRequirement: "medium",
      difficulty: "beginner",
      inStock: true,
      imageUrl: null,
    },
  });

  // Form for adding care guide
  const careGuideForm = useForm<CareGuideFormValues>({
    resolver: zodResolver(careGuideFormSchema),
    defaultValues: {
      wateringInstructions: "",
      lightInstructions: "",
      temperatureRange: "",
      additionalCare: null,
      weeklyRoutine: null,
      troubleshooting: null,
    },
  });

  // Handle plant form submission
  async function handlePlantSubmit(data: PlantFormValues) {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Add vendorId to the request data
      const plantData = {
        ...data,
        vendorId: user.id
      };
      
      const response = await apiRequest("POST", "/api/plants", plantData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add plant");
      }
      
      // Reset form and refetch plants
      plantForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/plants/vendor'] });
      
      toast({
        title: "Success!",
        description: "Plant added successfully",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add plant",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle care guide form submission
  async function handleCareGuideSubmit(data: CareGuideFormValues) {
    if (!selectedPlantId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a plant first",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", `/api/plants/${selectedPlantId}/care-guide`, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add care guide");
      }
      
      // Reset form and update state
      careGuideForm.reset();
      setSelectedPlantId(null);
      
      toast({
        title: "Success!",
        description: "Care guide added successfully",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add care guide",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle plant status toggle (in stock/out of stock)
  async function togglePlantStatus(plantId: number, currentStatus: boolean) {
    try {
      const response = await apiRequest("PATCH", `/api/plants/${plantId}`, {
        inStock: !currentStatus
      });
      
      if (!response.ok) {
        throw new Error("Failed to update plant status");
      }
      
      // Refetch plants
      queryClient.invalidateQueries({ queryKey: ['/api/plants/vendor'] });
      
      toast({
        title: "Status updated",
        description: `Plant is now ${!currentStatus ? "in stock" : "out of stock"}`,
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update plant status",
      });
    }
  }

  // If user is not a vendor
  if (user && user.userType !== 'vendor') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be a registered vendor to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-foreground mb-2">
            Vendor Dashboard
          </h1>
          <p className="text-gray-600">
            List plants for sale to corporate clients, manage inventory, and track customer orders
          </p>
        </div>
      </div>

      <Tabs 
        defaultValue="plants" 
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full sm:w-fit">
          <TabsTrigger 
            value="plants" 
            className="flex items-center gap-2"
            onClick={() => setLocation("/my-plants")}
          >
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">My Plants</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger 
            value="add" 
            className="flex items-center gap-2"
            onClick={() => setLocation("/add-plant")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Plant</span>
          </TabsTrigger>
        </TabsList>

        {/* Plants Tab */}
        <TabsContent value="plants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Plants</span>
                <Button 
                  onClick={() => setLocation("/add-plant")}
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Plant
                </Button>
              </CardTitle>
              <CardDescription>
                List your plants for sale to corporate clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plantsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load plants. Please try again.
                  </AlertDescription>
                </Alert>
              ) : plantsLoading ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : !plants || plants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't added any plants yet</p>
                  <Button 
                    onClick={() => setLocation("/add-plant")}
                    variant="default"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Plant
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>A list of your plants for sale</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="hidden md:table-cell">Added On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plants.map((plant) => (
                        <TableRow key={plant.id}>
                          <TableCell className="font-medium">
                            <div>
                              {plant.name}
                              <p className="text-sm text-gray-500 italic">{plant.scientificName}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(plant.price)}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(plant.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={plant.inStock}
                                onCheckedChange={() => togglePlantStatus(plant.id, plant.inStock)}
                              />
                              <Badge variant={plant.inStock ? "outline" : "secondary"}>
                                {plant.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedPlantId(plant.id);
                                  setSelectedTab("care-guide");
                                }}
                                title="Add care guide"
                              >
                                <ClipboardList className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Edit plant"
                              >
                                <PenSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Track and manage corporate client orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : !orders || Array.isArray(orders) && orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders received yet</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Order management will be implemented soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Plant Tab */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Plant</CardTitle>
              <CardDescription>
                Add a new plant to your sales catalog for corporate clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...plantForm}>
                <form onSubmit={plantForm.handleSubmit(handlePlantSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={plantForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Money Plant" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={plantForm.control}
                      name="scientificName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scientific Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Epipremnum aureum" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={plantForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the plant's benefits for corporate office environments..." 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={plantForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="299" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : "";
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={plantForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a URL for the plant image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={plantForm.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={plantForm.control}
                      name="waterRequirement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Water Requirement</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select water need" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={plantForm.control}
                      name="lightRequirement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Light Requirement</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select light need" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={plantForm.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Availability</FormLabel>
                          <FormDescription>
                            Set whether this plant is currently in stock
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? "Adding Plant..." : "Add Plant"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Care Guide Tab */}
        <TabsContent value="care-guide">
          <Card>
            <CardHeader>
              <CardTitle>Add Care Guide</CardTitle>
              <CardDescription>
                {selectedPlantId 
                  ? `Add care instructions to help corporate clients maintain their plants`
                  : `Select a plant from your catalog first`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedPlantId ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No plant selected</p>
                  <Button 
                    onClick={() => setSelectedTab("plants")}
                    variant="outline"
                  >
                    Go to Plants List
                  </Button>
                </div>
              ) : (
                <Form {...careGuideForm}>
                  <form onSubmit={careGuideForm.handleSubmit(handleCareGuideSubmit)} className="space-y-6">
                    <FormField
                      control={careGuideForm.control}
                      name="wateringInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Watering Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="How often to water the plant and how much water to use..." 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={careGuideForm.control}
                      name="lightInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Light Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe light requirements and placement recommendations..." 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={careGuideForm.control}
                      name="temperatureRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature Range</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. 18-27°C" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={careGuideForm.control}
                      name="additionalCare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Care</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional care tips like humidity, fertilizing, etc..." 
                              rows={3}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={careGuideForm.control}
                      name="weeklyRoutine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekly Routine</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Suggested weekly care routine..." 
                              rows={3}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={careGuideForm.control}
                      name="troubleshooting"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Troubleshooting</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Common issues and how to resolve them..." 
                              rows={3}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setSelectedPlantId(null);
                          setSelectedTab("plants");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Adding Guide..." : "Add Care Guide"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}