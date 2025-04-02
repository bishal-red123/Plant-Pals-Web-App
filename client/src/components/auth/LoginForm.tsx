import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  userType: 'corporate' | 'vendor';
  onSuccess: () => void;
}

const LoginForm = ({ userType, onSuccess }: LoginFormProps) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        username: values.email,
        password: values.password,
      });
      
      const data = await response.json();
      
      if (data.user.userType !== userType) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: `This is a ${userType} login portal. Please use the appropriate login option.`,
        });
        setIsLoading(false);
        return;
      }
      
      login(data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      toast({
        title: "Login Successful",
        description: `Welcome back to GreenSpace!`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your@email.com" 
                  {...field} 
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
              <div className="flex justify-end mt-1">
                <a href="#" className="text-sm text-primary hover:text-primary/80">Forgot password?</a>
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className={`w-full ${userType === 'corporate' ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'}`}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
