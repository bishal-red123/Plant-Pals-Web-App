import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth.tsx";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/auth/LoginModal";
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

const Header = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<'corporate' | 'vendor'>('corporate');

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
              <Link href="/">
                <h1 className="text-xl md:text-2xl font-montserrat font-bold text-foreground cursor-pointer">
                  <span className="text-primary">Plant</span>Pals
                </h1>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/plants">
                <a className={`font-montserrat text-sm font-medium ${isActive('/plants') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                  Plants
                </a>
              </Link>
              <Link href="/vendors">
                <a className={`font-montserrat text-sm font-medium ${isActive('/vendors') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                  Vendors
                </a>
              </Link>
              <Link href="/care-guides">
                <a className={`font-montserrat text-sm font-medium ${isActive('/care-guides') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                  Care Guides
                </a>
              </Link>
              <Link href="/for-business">
                <a className={`font-montserrat text-sm font-medium ${isActive('/for-business') ? 'text-primary' : 'hover:text-primary'} transition-colors`}>
                  For Business
                </a>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
              </Button>
              
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <ShoppingCart className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
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
                    <DropdownMenuItem>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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
                      <Link href="/plants">
                        <a className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                          Plants
                        </a>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/vendors">
                        <a className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                          Vendors
                        </a>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/care-guides">
                        <a className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                          Care Guides
                        </a>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/for-business">
                        <a className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                          For Business
                        </a>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/dashboard">
                        <a className="font-montserrat px-2 py-1 text-foreground hover:text-primary transition-colors">
                          My Account
                        </a>
                      </Link>
                    </SheetClose>
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
