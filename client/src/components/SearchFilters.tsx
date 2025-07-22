import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    genre: string;
    key: string;
    bpmRange: string;
  };
  setFilters: (filters: any) => void;
}

export default function SearchFilters({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters 
}: SearchFiltersProps) {
  const genres = ["All Genres", "Hip Hop", "Trap", "R&B", "Pop", "Drill", "Jazz", "Reggae", "Rock"];
  const keys = ["All Keys", "C Major", "G Major", "D Minor", "A Minor", "F# Minor", "E Major", "B Minor", "Ab Major"];
  const bpmRanges = ["All BPM", "60-80 BPM", "80-120 BPM", "120-140 BPM", "140+ BPM"];

  return (
    <section className="bg-gray-800 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search beats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 focus:border-primary"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select
              value={filters.genre}
              onValueChange={(value) => setFilters({ ...filters, genre: value })}
            >
              <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.key}
              onValueChange={(value) => setFilters({ ...filters, key: value })}
            >
              <SelectTrigger className="w-[120px] bg-gray-700 border-gray-600">
                <SelectValue placeholder="All Keys" />
              </SelectTrigger>
              <SelectContent>
                {keys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.bpmRange}
              onValueChange={(value) => setFilters({ ...filters, bpmRange: value })}
            >
              <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600">
                <SelectValue placeholder="All BPM" />
              </SelectTrigger>
              <SelectContent>
                {bpmRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
