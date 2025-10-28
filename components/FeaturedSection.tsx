'use client'

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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-3" />
              <Skeleton className="h-16 w-full mb-3" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!featuredBeats?.length) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Featured Beats</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || Object.values(filters).some(f => f && f !== "All Genres" && f !== "All Keys" && f !== "All BPM")
              ? "No featured beats match your current search criteria." 
              : "No featured beats are available at the moment."}
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later or browse all beats to discover new music.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {featuredBeats.map((beat, index) => (
        <div key={beat.id} className="relative">
          <div className="absolute top-4 left-4 z-10">
            <Badge 
              className={`text-xs font-bold shadow-lg ${
                index === 0 ? 'bg-primary text-primary-foreground' : 
                index === 1 ? 'bg-secondary text-secondary-foreground' : 
                'bg-accent text-accent-foreground'
              }`}
            >
              {index === 0 ? 'FEATURED' : index === 1 ? 'TRENDING' : 'NEW'}
            </Badge>
          </div>
          <BeatCard beat={beat} featured />
        </div>
      ))}
    </div>
  );
}
