import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth.tsx";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Plants from "@/pages/Plants";
import PlantDetail from "@/pages/PlantDetail";
import Vendors from "@/pages/Vendors";
import VendorDetail from "@/pages/VendorDetail";
import CareGuides from "@/pages/CareGuides";
import Dashboard from "@/pages/Dashboard";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/plants" component={Plants} />
          <Route path="/plants/:id" component={PlantDetail} />
          <Route path="/vendors" component={Vendors} />
          <Route path="/vendors/:id" component={VendorDetail} />
          <Route path="/care-guides" component={CareGuides} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/checkout-success" component={CheckoutSuccess} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
