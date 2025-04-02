import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { insertPlantSchema } from "@shared/schema";
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  AlertCircle, 
  ArrowLeft,
  User, 
  Package, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut,
  Truck,
  Leaf,
  Plus
} from "lucide-react";

// Extend the plant schema with validation
const plantFormSchema = insertPlantSchema.extend({});

type PlantFormValues = z.infer<typeof plantFormSchema>;

export default function AddPlant() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  const form = useForm<PlantFormValues>({
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      name: "",
      scientificName: "",
      description: "",
      price: undefined,
      imageUrl: "",
      difficulty: "beginner",
      lightRequirement: "medium",
      waterRequirement: "medium",
      inStock: true,
      vendorId: user?.id
    },
  });

  async function onSubmit(values: PlantFormValues) {
    if (!user || user.userType !== "vendor") {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only vendors can add plants."
      });
      return;
    }

    setIsSubmitting(true);
    
    // Make sure vendorId is included
    const submitData = {
      ...values,
      vendorId: user.id
    };
    
    try {
      const response = await apiRequest("POST", "/api/plants", submitData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add plant");
      }
      
      await queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/vendors', user.id, 'plants'] });
      
      toast({
        title: "Plant added successfully!",
        description: "The plant has been added to your catalog."
      });
      
      form.reset();
      // Navigate back to dashboard
      setLocation("/vendor-dashboard");
      
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error adding plant",
        description: err.message || "An error occurred while adding the plant"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
        <h1 className="font-montserrat text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">Please login to access your dashboard.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setLocation("/login")}>Login</Button>
      </div>
    );
  }

  if (user.userType !== "vendor") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
        <h1 className="font-montserrat text-2xl font-bold mb-4">Vendor Access Only</h1>
        <p className="text-gray-600 mb-6">This page is accessible only to vendor accounts.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setLocation("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-center">
                <div className="flex items-center justify-center">
                  <div className="bg-primary bg-opacity-10 rounded-full h-16 w-16 flex items-center justify-center font-bold text-primary mb-2">
                    {user.fullName.charAt(0)}
                  </div>
                </div>
                <h2 className="font-montserrat text-lg font-semibold">{user.fullName}</h2>
                <p className="text-sm text-gray-500 font-normal">Vendor Account</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/vendor-dashboard")}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Orders
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setLocation("/vendor-dashboard")}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Deliveries
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-primary hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plants
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/vendor-dashboard")}
                >
                  <Leaf className="mr-2 h-4 w-4" />
                  My Plants
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/vendor-dashboard")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/vendor-dashboard")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  onClick={() => setLocation("/vendor-dashboard")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>
              <CardTitle>Add New Plant</CardTitle>
              <CardDescription>
                Add a new plant to your sales catalog for corporate clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                    control={form.control}
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
                      control={form.control}
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
                                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                    control={form.control}
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
        </div>
      </div>
    </div>
  );
}