import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Cart item with plant details
interface CartItemWithPlant {
  id: number;
  userId: number;
  plantId: number;
  quantity: number;
  addedAt: string;
  plant: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
    vendorId: number;
  };
}

export default function Cart() {
  const [quantity, setQuantity] = useState<Record<number, number>>({});
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems, isLoading } = useQuery<CartItemWithPlant[]>({
    queryKey: ['/api/cart'],
    enabled: !!user && user.userType === 'corporate',
  });

  // Remove item from cart mutation
  const removeItemMutation = useMutation({
    mutationFn: async (plantId: number) => {
      await apiRequest('DELETE', `/api/cart/${plantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item Removed",
        description: "The item has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  // Update item quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ plantId, quantity }: { plantId: number; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/${plantId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Quantity Updated",
        description: "The item quantity has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (plantId: number, newQuantity: number) => {
    setQuantity(prev => ({ ...prev, [plantId]: newQuantity }));
  };

  const updateQuantity = async (item: CartItemWithPlant) => {
    const newQuantity = quantity[item.plantId] || item.quantity;
    if (newQuantity === item.quantity) return;
    
    if (newQuantity < 1) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity cannot be less than 1",
        variant: "destructive",
      });
      setQuantity(prev => ({ ...prev, [item.plantId]: item.quantity }));
      return;
    }
    
    setIsUpdating(prev => ({ ...prev, [item.plantId]: true }));
    try {
      await updateQuantityMutation.mutateAsync({ 
        plantId: item.plantId, 
        quantity: newQuantity 
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [item.plantId]: false }));
    }
  };

  const handleRemoveItem = async (plantId: number) => {
    await removeItemMutation.mutateAsync(plantId);
  };

  const handleClearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Calculate total price
  const calculateTotal = (items: CartItemWithPlant[] | undefined) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      return total + (item.plant.price * item.quantity);
    }, 0);
  };

  // If not logged in or not a corporate user
  if (!user || user.userType !== 'corporate') {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in as a corporate user to view your cart.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/login">Login Now</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Cart</CardTitle>
            <CardDescription>You don't have any items in your cart yet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-10">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Button asChild>
              <Link to="/plants">Browse Plants</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items in Your Cart</CardTitle>
              <CardDescription>You have {cartItems.length} item(s) in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 overflow-hidden rounded">
                            <img 
                              src={item.plant.imageUrl || 'https://images.unsplash.com/photo-1545239705-1564e58b9e4a?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3'} 
                              alt={item.plant.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1545239705-1564e58b9e4a?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3';
                              }}
                            />
                          </div>
                          <div>
                            <Link href={`/plants/${item.plant.id}`} className="font-medium hover:underline">
                              {item.plant.name}
                            </Link>
                            <div className="text-sm text-gray-500">{formatCurrency(item.plant.price)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => {
                              const newQty = Math.max(1, (quantity[item.plantId] || item.quantity) - 1);
                              handleQuantityChange(item.plantId, newQty);
                              updateQuantity({...item, quantity: newQty});
                            }}
                            disabled={isUpdating[item.plantId]}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input 
                            type="number" 
                            min={1}
                            className="w-14 h-8 text-center"
                            value={quantity[item.plantId] !== undefined ? quantity[item.plantId] : item.quantity}
                            onChange={(e) => handleQuantityChange(item.plantId, parseInt(e.target.value) || 1)}
                            onBlur={() => updateQuantity(item)}
                            disabled={isUpdating[item.plantId]}
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              const newQty = (quantity[item.plantId] || item.quantity) + 1;
                              handleQuantityChange(item.plantId, newQty);
                              updateQuantity({...item, quantity: newQty});
                            }}
                            disabled={isUpdating[item.plantId]}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.plant.price * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveItem(item.plantId)}
                          disabled={removeItemMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={clearCartMutation.isPending}>
                    Clear Cart
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all items from your cart. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearCart}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button asChild>
                <Link to="/plants">
                  Continue Shopping
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(calculateTotal(cartItems))}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal(cartItems))}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={!cartItems || cartItems.length === 0}
              >
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}