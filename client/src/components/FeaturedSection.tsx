import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BeatCard from "./BeatCard";
import type { Beat } from "@shared/schema";

interface FeaturedSectionProps {
  searchQuery: string;
  filters: {
    genre: string;
    key: string;
    bpmRange: string;
  };
}

export default function FeaturedSection({ searchQuery, filters }: FeaturedSectionProps) {
  // Build query parameters for featured beats with filters
  const queryParams = new URLSearchParams();
  queryParams.append('featured', 'true'); // Only get featured beats
  if (searchQuery) queryParams.append('search', searchQuery);
  if (filters.genre && filters.genre !== "All Genres") queryParams.append('genre', filters.genre);
  if (filters.key && filters.key !== "All Keys") queryParams.append('key', filters.key);
  if (filters.bpmRange && filters.bpmRange !== "All BPM") queryParams.append('bpmRange', filters.bpmRange);
  
  const queryString = queryParams.toString();
  const apiUrl = queryString ? `/api/beats?${queryString}` : "/api/beats?featured=true";
  
  const { data: featuredBeats, isLoading } = useQuery<Beat[]>({
    queryKey: [apiUrl],
  });

  if (isLoading) {
    return (
      <section className="py-8 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Star className="mr-2 text-accent" />
              Featured Beats
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-16 mb-4" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredBeats?.length) {
    return (
      <section className="py-8 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Star className="mr-2 text-accent" />
              Featured Beats
            </h2>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">No featured beats available at the moment.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center">
            <Star className="mr-3 text-accent" />
            <span className="gradient-text">Fresh Out The Trap</span>
          </h2>
          <span className="text-sm text-gray-400">Latest Drops & Fire Beats</span>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBeats.map((beat, index) => (
            <div key={beat.id} className="relative">
              <div className="absolute top-4 left-4 z-10">
                <Badge 
                  className={`text-xs font-bold shadow-lg ${
                    index === 0 ? 'bg-accent text-black' : 
                    index === 1 ? 'bg-secondary text-black' : 
                    'bg-primary text-black'
                  }`}
                >
                  {index === 0 ? 'FRESH' : index === 1 ? 'FIRE' : 'HEAT'}
                </Badge>
              </div>
              <BeatCard beat={beat} featured />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
