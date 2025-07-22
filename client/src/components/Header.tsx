import { useState } from "react";
import { Music, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold gradient-text flex items-center">
              <Music className="mr-3 text-accent" />
              SoundTrap
            </h1>
            <span className="text-xs text-gray-400 hidden md:block">Where Beats Meet The Streets</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="hover:text-primary transition-colors font-medium">Browse</a>
            <a href="#" className="hover:text-secondary transition-colors font-medium">Featured</a>
            <a href="#" className="hover:text-accent transition-colors font-medium">About</a>
          </nav>

          <div className="flex items-center space-x-4">
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
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#" className="hover:text-primary transition-colors">Browse</a>
              <a href="#" className="hover:text-primary transition-colors">Featured</a>
              <a href="#" className="hover:text-primary transition-colors">About</a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
