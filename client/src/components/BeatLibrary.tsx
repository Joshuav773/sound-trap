import { useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BeatCard from "./BeatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Beat } from "@shared/schema";

interface BeatLibraryProps {
  searchQuery: string;
  filters: {
    genre: string;
    key: string;
    bpmRange: string;
  };
}

export default function BeatLibrary({ searchQuery, filters }: BeatLibraryProps) {
  const { data: beats, isLoading } = useQuery<Beat[]>({
    queryKey: ["/api/beats", { search: searchQuery, ...filters }],
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Music className="mr-2" />
              All Beats
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-3" />
                  <Skeleton className="h-12 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!beats?.length) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Music className="mr-2" />
              All Beats
            </h2>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">
                {searchQuery || Object.values(filters).some(f => f) 
                  ? "No beats found matching your criteria." 
                  : "No beats available at the moment."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Music className="mr-2" />
            All Beats
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {beats.length} beats available
            </span>
            <Select defaultValue="latest">
              <SelectTrigger className="w-[200px] bg-gray-800 border-gray-600 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Sort by: Latest</SelectItem>
                <SelectItem value="price-low">Sort by: Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Sort by: Price (High to Low)</SelectItem>
                <SelectItem value="popular">Sort by: Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {beats.map((beat) => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      </div>
    </section>
  );
}
