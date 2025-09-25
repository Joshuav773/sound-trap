import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import FeaturedSection from "@/components/FeaturedSection";
import BeatLibrary from "@/components/BeatLibrary";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    genre: "Hip Hop",
    key: "",
    bpmRange: "",
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <SearchFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />
      <FeaturedSection searchQuery={searchQuery} filters={filters} />
      <BeatLibrary searchQuery={searchQuery} filters={filters} />
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 gradient-text">
                SoundTrap
              </h3>
              <p className="text-gray-400 text-sm">
                Where beats meet the streets. Premium trap, hip hop, and drill beats straight from the underground.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Browse</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Hip Hop</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Trap</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Drill</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Featured</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">License Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Usage Rights</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Producer Splits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  <i className="fab fa-youtube text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-soundcloud text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2024 SoundTrap. All rights reserved. Straight from the trap to your speakers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
