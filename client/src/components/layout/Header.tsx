import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth.tsx";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/auth/LoginModal";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

import { 
  Leaf, 
  Search, 
  ShoppingCart, 
  Menu,
  User,
  LogOut
} from "lucide-react";

interface CartItem {
  id: number;
  userId: number;
  plantId: number;
  quantity: number;
  addedAt: string;
}

const Header = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<'corporate' | 'vendor'>('corporate');
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart items to show count in header
  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: !!user && user.userType === 'corporate',
  });

  // Update cart count when cart items change
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setCartCount(cartItems.length);
    } else {
      setCartCount(0);
    }
  }, [cartItems]);

  const handleLoginClick = (type: 'corporate' | 'vendor') => {
    setLoginType(type);
    setLoginModalOpen(true);
  };

  const isActive = (path: string) => location === path;

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <Leaf className="text-primary text-2xl" />
              <Link href="/" className="cursor-pointer">
                <h1 className="text-xl md:text-2xl font-montserrat font-bold text-foreground">
                  <span className="text-primary">Plant</span>Pals
                </h1>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/plants" className={`font-montserrat text-sm font-medium ${isActive('/plants') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                Plants
              </Link>
              <Link href="/vendors" className={`font-montserrat text-sm font-medium ${isActive('/vendors') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                Vendors
              </Link>
              <Link href="/care-guides" className={`font-montserrat text-sm font-medium ${isActive('/care-guides') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                Care Guides
              </Link>
              <Link href="/for-business" className={`font-montserrat text-sm font-medium ${isActive('/for-business') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                For Business
              </Link>
              <Link href="/become-vendor" className={`font-montserrat text-sm font-medium ${isActive('/become-vendor') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                Become a Vendor
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex relative"
                asChild={!!(user && user.userType === 'corporate')}
              >
                {user && user.userType === 'corporate' ? (
                  <Link href="/cart">
                    <ShoppingCart className={`h-5 w-5 ${isActive('/cart') ? 'text-primary' : 'text-foreground hover:text-primary'} transition-colors`} />
                    {cartCount > 0 && (
                      <Badge 
                        variant="secondary"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Link>
                ) : (
                  <ShoppingCart className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
                )}
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5 text-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={user?.userType === 'vendor' ? "/vendor-dashboard" : "/dashboard"}>
                        {user?.userType === 'vendor' ? "Vendor Dashboard" : "Dashboard"}
                      </Link>
                    </DropdownMenuItem>
                    {user?.userType === 'vendor' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/add-plant">Add Plant</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/my-plants">My Plants</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center">
                  <div className="border-r border-gray-300 pr-3 mr-3">
                    <button 
                      className="font-montserrat text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      onClick={() => handleLoginClick('corporate')}
                    >
                      Corporate
                    </button>
                  </div>
                  <button 
                    className="font-montserrat text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
                    onClick={() => handleLoginClick('vendor')}
                  >
                    Vendor
                  </button>
                </div>
              )}
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5 text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="grid gap-4 py-4">
                    <SheetClose asChild>
                      <Link href="/plants" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                        Plants
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/vendors" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                        Vendors
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/care-guides" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                        Care Guides
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/for-business" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                        For Business
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/become-vendor" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                        Become a Vendor
                      </Link>
                    </SheetClose>
                    {user && user.userType === 'corporate' && (
                      <SheetClose asChild>
                        <Link href="/cart" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors flex items-center">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Cart {cartCount > 0 && <Badge className="ml-2 bg-primary text-white">{cartCount}</Badge>}
                        </Link>
                      </SheetClose>
                    )}
                    {user?.userType === 'vendor' ? (
                      <>
                        <SheetClose asChild>
                          <Link href="/vendor-dashboard" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                            Vendor Dashboard
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/add-plant" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                            Add Plant
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/my-plants" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                            My Plants
                          </Link>
                        </SheetClose>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/dashboard" className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                          My Account
                        </Link>
                      </SheetClose>
                    )}
                    {user && (
                      <Button 
                        variant="ghost" 
                        className="justify-start pl-2" 
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        type={loginType} 
      />
    </>
  );
};

export default Header;
