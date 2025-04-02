import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface AddToCartButtonProps {
  plantId: number;
  disabled?: boolean;
  showText?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  inStock: boolean;
  className?: string;
}

export default function AddToCartButton({ 
  plantId, 
  disabled = false, 
  showText = true, 
  variant = "default",
  size = "default",
  inStock,
  className = ""
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const isDisabled = disabled || !inStock || !user || user.userType !== 'corporate';

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      console.log("Sending cart data from button:", { plantId, quantity: 1 });
      const response = await apiRequest('POST', '/api/cart', { 
        plantId: plantId,
        quantity: 1 
        // Don't need to send userId - server will set it from the session
      });
      return response;
    },
    onSuccess: () => {
      setAdded(true);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to Cart",
        description: "This plant has been added to your cart.",
      });
      
      // Reset added status after 2 seconds
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login as a corporate user to add items to cart.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (user.userType !== 'corporate') {
      toast({
        title: "Access Denied",
        description: "Only corporate users can add items to cart.",
        variant: "destructive",
      });
      return;
    }
    
    if (!inStock) {
      toast({
        title: "Out of Stock",
        description: "This plant is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled || addToCartMutation.isPending}
      onClick={handleAddToCart}
      className={className}
    >
      {addToCartMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : added ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {added ? "Added" : addToCartMutation.isPending ? "Adding..." : !inStock ? "Out of Stock" : "Add to Cart"}
        </span>
      )}
    </Button>
  );
}