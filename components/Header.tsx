'use client'

import { useState, useEffect } from "react";
import { Music, Menu, X, User, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [hasActiveRoom, setHasActiveRoom] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Show admin/upload tab for admin or artist
      if (parsedUser.role === 'admin' || parsedUser.role === 'artist') {
        setShowAdmin(true);
      }
    }

    // Get cart count
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(total);
    };

    updateCartCount();
    // Listen for cart updates
    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Check for active room periodically
  useEffect(() => {
    if (user && (user.role === 'artist' || user.role === 'admin')) {
      const checkActiveRoom = () => {
        const roomKey = `listening-room-${user.name.toLowerCase()}`;
        const roomData = localStorage.getItem(roomKey);
        if (roomData) {
          try {
            const room = JSON.parse(roomData);
            setHasActiveRoom(room.isOpen === true);
          } catch (e) {
            setHasActiveRoom(false);
          }
        } else {
          setHasActiveRoom(false);
        }
      };

      checkActiveRoom();
      const interval = setInterval(checkActiveRoom, 2000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setShowAdmin(false);
    window.location.href = '/';
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-bold gradient-text flex items-center">
                <Music className="mr-3 text-primary" />
                SoundTrap
              </h1>
            </a>
            <span className="text-xs text-muted-foreground hidden md:block font-medium">el de la musa | prodbypending...</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="hover:text-primary transition-colors font-medium text-foreground">Browse</a>
            <a href="/pending-store" className="hover:text-primary transition-colors font-medium text-foreground">Pending Store</a>
            {showAdmin && (
              <>
                <a href="/upload" className="hover:text-primary transition-colors font-medium text-foreground">Upload</a>
                {user && hasActiveRoom && (
                  <a 
                    href={`/${encodeURIComponent(user.name)}/listening-room`} 
                    className="hover:text-primary transition-colors font-medium text-foreground flex items-center"
                  >
                    <Music className="mr-1 h-4 w-4" />
                    My Room
                  </a>
                )}
                {user?.role === 'admin' && (
                  <a href="/admin" className="hover:text-primary transition-colors font-medium text-foreground">Admin</a>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = '/account'}>
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/cart'}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" asChild>
                <a href="/auth">Login</a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <a href="/" className="hover:text-primary transition-colors text-foreground font-medium">Browse</a>
              <a href="/pending-store" className="hover:text-primary transition-colors text-foreground font-medium">Pending Store</a>
              {showAdmin && (
                <>
                  <a href="/upload" className="hover:text-primary transition-colors text-foreground font-medium">Upload</a>
                  {user && hasActiveRoom && (
                    <a href={`/${encodeURIComponent(user.name)}/listening-room`} className="hover:text-primary transition-colors text-foreground font-medium flex items-center">
                      <Music className="mr-1 h-4 w-4" />
                      My Room
                    </a>
                  )}
                </>
              )}
              {user ? (
                <button onClick={handleLogout} className="text-left hover:text-primary transition-colors text-foreground font-medium">
                  Logout
                </button>
              ) : (
                <a href="/auth" className="hover:text-primary transition-colors text-foreground font-medium">Login</a>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
