import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Plant } from "@shared/schema";

import { 
  User, 
  Package, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut,
  Truck,
  AlertCircle,
  Leaf,
  Plus,
  PenSquare,
  ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MyPlants() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get plants for this vendor
  const { 
    data: plants, 
    isLoading: isLoadingPlants,
    error: plantsError
  } = useQuery<Plant[]>({
    queryKey: ['/api/vendors', user?.id, 'plants'],
    enabled: !!user && user.userType === 'vendor',
  });

  // Mutation to toggle plant status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ plantId, currentStatus }: { plantId: number; currentStatus: boolean }) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/plants/${plantId}`, 
        { inStock: !currentStatus }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update plant status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', user?.id, 'plants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      
      toast({
        title: "Status updated",
        description: "Plant availability has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message || "An error occurred while updating the plant status"
      });
    }
  });

  async function togglePlantStatus(plantId: number, currentStatus: boolean) {
    toggleStatusMutation.mutate({ plantId, currentStatus });
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

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
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/add-plant")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plants
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-primary hover:bg-primary/90"
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
              <div className="flex items-center justify-between mb-2">
                <CardTitle>My Plants</CardTitle>
                <Button 
                  onClick={() => setLocation("/add-plant")}
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Plant
                </Button>
              </div>
              <p className="text-gray-600">
                List your plants for sale to corporate clients
              </p>
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
              ) : isLoadingPlants ? (
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
                                onClick={() => setLocation(`/add-care-guide/${plant.id}`)}
                                title="Add care guide"
                              >
                                <ClipboardList className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setLocation(`/edit-plant/${plant.id}`)}
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
        </div>
      </div>
    </div>
  );
}