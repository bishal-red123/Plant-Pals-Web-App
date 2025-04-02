import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Newsletter = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-16 bg-primary bg-opacity-5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-foreground mb-3">
            Stay Updated with GreenSpace
          </h2>
          <p className="font-lato text-gray-600 mb-6">
            Subscribe to our newsletter for care tips, new plant arrivals, and exclusive deals
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          
          <p className="text-sm text-gray-500 mt-4">
            By subscribing, you agree to receive marketing emails from GreenSpace. You can unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
