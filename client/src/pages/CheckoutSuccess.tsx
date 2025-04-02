import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, HomeIcon, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function CheckoutSuccess() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Invalidate cart and orders queries to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  }, [queryClient]);

  return (
    <div className="container mx-auto py-10 flex flex-col items-center">
      <div className="max-w-md w-full">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your order, {user?.fullName}. Your payment has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-800">
                We've sent a confirmation email to {user?.email}. Your order is now being processed.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p>Your plants will be prepared and shipped by the vendor. You can track your order status in your dashboard.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link to="/dashboard">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View Your Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                <HomeIcon className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}