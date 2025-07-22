import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BeatCard from "./BeatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Beat } from "@shared/schema";

export default function FeaturedSection() {
  const { data: featuredBeats, isLoading } = useQuery<Beat[]>({
    queryKey: ["/api/beats/featured"],
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
    <section className="py-8 bg-gradient-to-r from-primary/20 to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Star className="mr-2 text-accent" />
            Featured Beats
          </h2>
          <span className="text-sm text-gray-300">Recently Added & Top Sellers</span>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBeats.map((beat, index) => (
            <div key={beat.id} className="relative">
              <div className="absolute top-4 left-4 z-10">
                <Badge 
                  className={`text-xs font-semibold ${
                    index === 0 ? 'bg-accent text-black' : 
                    index === 1 ? 'bg-primary text-white' : 
                    'bg-yellow-500 text-black'
                  }`}
                >
                  {index === 0 ? 'NEW' : index === 1 ? 'HOT' : 'TRENDING'}
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
