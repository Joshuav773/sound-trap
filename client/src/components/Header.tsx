import { useState } from "react";
import { Music, Upload, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadModal from "./UploadModal";

export default function Header() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold gradient-text flex items-center">
                <Music className="mr-2" />
                BeatStore
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="hover:text-primary transition-colors">Browse</a>
              <a href="#" className="hover:text-primary transition-colors">Featured</a>
              <a href="#" className="hover:text-primary transition-colors">Upload</a>
              <a href="#" className="hover:text-primary transition-colors">About</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Beat
              </Button>
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
                <a href="#" className="hover:text-primary transition-colors">Upload</a>
                <a href="#" className="hover:text-primary transition-colors">About</a>
              </div>
            </nav>
          )}
        </div>
      </header>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </>
  );
}
