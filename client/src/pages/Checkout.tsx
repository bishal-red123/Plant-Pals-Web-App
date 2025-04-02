import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

const shippingSchema = z.object({
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  pincode: z.string().min(6, { message: "Valid pincode is required" }),
  notes: z.string().optional(),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const CheckoutForm = ({ totalAmount }: { totalAmount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      pincode: "",
      notes: "",
    },
  });

  const onSubmit = async (values: ShippingFormValues) => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create the order first
      const orderResponse = await apiRequest('POST', '/api/orders', {
        ...values,
        totalAmount
      });

      const orderData = await orderResponse.json();

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
          payment_method_data: {
            billing_details: {
              name: user?.fullName || "",
              email: user?.email || "",
              address: {
                line1: values.address,
                city: values.city,
                state: values.state,
                postal_code: values.pincode,
                country: 'IN',
              },
            },
          },
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong during checkout",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Shipping Information</h3>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Plant Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Maharashtra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN Code</FormLabel>
                  <FormControl>
                    <Input placeholder="400001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Special instructions for delivery" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Information</h3>
            <div className="p-4 border rounded-md">
              <PaymentElement />
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/cart')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
          <Button type="submit" disabled={processing || !stripe || !elements}>
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {formatCurrency(totalAmount)}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch cart items to calculate total
  const { data: cartItems, isLoading: cartLoading } = useQuery<CartItemWithPlant[]>({
    queryKey: ['/api/cart'],
    enabled: !!user && user.userType === 'corporate',
  });

  // Calculate total price
  const calculateTotal = (items: CartItemWithPlant[] | undefined) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      return total + (item.plant.price * item.quantity);
    }, 0);
  };

  const totalAmount = calculateTotal(cartItems);

  useEffect(() => {
    // If no cart items or total is 0, redirect back to cart
    if (cartItems && cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some plants before checkout.",
        variant: "destructive",
      });
      navigate('/cart');
      return;
    }

    // Create PaymentIntent as soon as the page loads and we have the total
    if (totalAmount > 0) {
      apiRequest("POST", "/api/create-payment-intent", { amount: totalAmount })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch(err => {
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
          console.error("Payment intent error:", err);
        });
    }
  }, [totalAmount, cartItems, navigate, toast]);

  // If not logged in or not a corporate user
  if (!user || user.userType !== 'corporate') {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in as a corporate user to checkout.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <a href="/login">Login Now</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Loading state
  if (cartLoading || !clientSecret) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Order</CardTitle>
              <CardDescription>Fill in your details to place your order</CardDescription>
            </CardHeader>
            <CardContent>
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm totalAmount={totalAmount} />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {cartItems?.length || 0} item(s) in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems?.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                      {item.plant.imageUrl ? (
                        <img 
                          src={item.plant.imageUrl} 
                          alt={item.plant.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 m-2 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.plant.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.plant.price * item.quantity)}
                  </span>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}