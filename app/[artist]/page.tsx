'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Music, TrendingUp, Radio, Users, Calendar, DollarSign, Library, Album } from "lucide-react"
import Header from "@/components/Header"
import BeatCard from "@/components/BeatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

export default function ArtistPage() {
  const params = useParams()
  const router = useRouter()
  const artist = params.artist as string
  const decodedArtist = decodeURIComponent(artist)
  
  // Check if artist has an active room
  const [hasActiveRoom, setHasActiveRoom] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkActiveRoom = () => {
      const roomKey = `listening-room-${decodedArtist.toLowerCase()}`
      const roomData = localStorage.getItem(roomKey)
      if (roomData) {
        try {
          const room = JSON.parse(roomData)
          setHasActiveRoom(room.isOpen === true)
        } catch (e) {
          setHasActiveRoom(false)
        }
      } else {
        setHasActiveRoom(false)
      }
    }

    checkActiveRoom()
    setIsLoading(false)

    // Check room status periodically
    const interval = setInterval(checkActiveRoom, 2000)

    return () => clearInterval(interval)
  }, [decodedArtist])

  // Fetch all beats by this artist
  const { data: beats, isLoading: beatsLoading } = useQuery({
    queryKey: ['/api/beats'],
    select: (data: any) => data?.filter((beat: any) => beat.producer.toLowerCase() === decodedArtist.toLowerCase()) || []
  })

  // Fetch products (loops, drum kits)
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products']
  }) as { data: any[], isLoading: boolean }

  const artistProducts = (products || []).filter((product: any) => 
    product.fileName?.includes(decodedArtist.toLowerCase()) || 
    product.title?.includes(decodedArtist)
  )

  const featuredBeats = beats?.filter((beat: any) => beat.isFeatured) || []
  const allBeats = beats || []

  // Check if artist exists (has beats or products)
  useEffect(() => {
    if (!beatsLoading && !productsLoading) {
      const hasBeats = allBeats.length > 0
      const hasProducts = artistProducts.length > 0
      
      if (!hasBeats && !hasProducts) {
        // Artist doesn't exist, redirect to 404
        router.push('/not-found')
      }
    }
  }, [beatsLoading, productsLoading, allBeats.length, artistProducts.length, router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Artist Header */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <Music className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 capitalize">{decodedArtist}</h1>
                  <p className="text-muted-foreground text-lg">Producer & Artist</p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary" className="text-sm">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {allBeats.length} beats
                    </Badge>
                    {featuredBeats.length > 0 && (
                      <Badge variant="outline" className="text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {featuredBeats.length} featured
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Room Button */}
              {!isLoading && hasActiveRoom && (
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = `/${encodeURIComponent(decodedArtist)}/listening-room`}
                >
                  <Radio className="mr-2 h-5 w-5 animate-pulse" />
                  Join Live Room
                  <Badge className="ml-2 bg-green-500">
                    <Users className="mr-1 h-3 w-3" />
                    LIVE
                  </Badge>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Tabs */}
        <Tabs defaultValue="beats" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="beats" className="flex items-center">
              <Music className="mr-2 h-4 w-4" />
              Beats ({allBeats.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center">
              <Library className="mr-2 h-4 w-4" />
              Kits ({artistProducts.length})
            </TabsTrigger>
          </TabsList>

          {/* Beats Tab */}
          <TabsContent value="beats" className="space-y-8">
            {featuredBeats.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <TrendingUp className="mr-3 text-primary" />
                    Featured Beats
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {beatsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <Card key={i}>
                        <Skeleton className="h-64 w-full" />
                      </Card>
                    ))
                  ) : (
                    featuredBeats.map((beat: any) => (
                      <BeatCard key={beat.id} beat={beat} featured />
                    ))
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">All Beats</h2>
              </div>
              
              {beatsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="h-64 w-full" />
                    </Card>
                  ))}
                </div>
              ) : allBeats.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allBeats.map((beat: any) => (
                    <BeatCard key={beat.id} beat={beat} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Beats Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      {decodedArtist} hasn't uploaded any beats yet.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Check back later for new releases or browse other artists.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Products/Kits Tab */}
          <TabsContent value="products" className="space-y-6">
            {productsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-64 w-full" />
                  </Card>
                ))}
              </div>
            ) : artistProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artistProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Library className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {decodedArtist} hasn't released any loop packs or drum kits yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stay tuned for upcoming releases and sound kits.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Product Card Component for Loops and Drum Kits
function ProductCard({ product }: { product: any }) {
  const categoryIcons = {
    'loop-pack': Library,
    'drum-kit': Music,
  }

  const categoryLabels = {
    'loop-pack': 'Loop Pack',
    'drum-kit': 'Drum Kit',
  }

  const categoryColors = {
    'loop-pack': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'drum-kit': 'bg-green-500/20 text-green-500 border-green-500/30',
  }

  const Icon = categoryIcons[product.category as keyof typeof categoryIcons]
  const label = categoryLabels[product.category as keyof typeof categoryLabels]
  const colorClass = categoryColors[product.category as keyof typeof categoryColors]

  return (
    <Card className="card-hover overflow-hidden">
      {product.coverImagePath && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={product.coverImagePath} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Badge className={`${colorClass} border`}>
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {label}
          </Badge>
          {product.isFeatured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
        <h3 className="font-bold text-xl mb-2">{product.title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-primary">
            ${parseFloat(product.price).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            {product.fileCount} files
          </div>
        </div>
        
        <Button variant="default" className="w-full">
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}
