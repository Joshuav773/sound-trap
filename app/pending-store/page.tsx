'use client'

import Header from "@/components/Header"
import { Music, Book, Library, ShoppingCart } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Product = {
  id: number
  title: string
  description: string
  category: 'loop-pack' | 'drum-kit' | 'course'
  price: string
  fileCount: number
  isFeatured: boolean
  coverImagePath?: string | null
}

export default function PendingStore() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  }) as { data: Product[], isLoading: boolean }

  const courseProducts = products.filter(p => p.category === 'course')
  const loopPacks = products.filter(p => p.category === 'loop-pack')
  const drumKits = products.filter(p => p.category === 'drum-kit')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Pending Store Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
              <Music className="mr-2 w-4 h-4" />
              <span className="font-semibold">prodbypending...</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The <span className="text-primary">Pending Store</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              el de la musa
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Premium loop packs, drum kits, and production courses for the next generation of producers.
              Over 15 years of musical experience. Learn from a guitarist turned producer.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="course">Course</TabsTrigger>
              <TabsTrigger value="loops">Loops</TabsTrigger>
              <TabsTrigger value="drums">Drums</TabsTrigger>
            </TabsList>

            {/* All Products */}
            <TabsContent value="all" className="space-y-8">
              {/* Featured Course */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Book className="mr-3 text-primary" />
                  Production Course
                </h2>
                <div className="grid md:grid-cols-1 gap-6">
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : courseProducts.length > 0 ? (
                    courseProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <Book className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>
                        <p className="text-muted-foreground">
                          Production courses are coming soon! Check back later for educational content.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Loop Packs - Volume Series */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Library className="mr-3 text-secondary" />
                    Melodic Musa Loop Packs
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    Volume Series
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Premium melodic trap loops from el de la musa - A series of collections for your production needs.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {isLoading ? (
                    [...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))
                  ) : loopPacks.length > 0 ? (
                    loopPacks.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <Library className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Loop Packs Yet</h3>
                        <p className="text-muted-foreground">
                          More melodic loop packs are in production. Stay tuned for new releases!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Drum Kits - Volume Series */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Music className="mr-3 text-accent" />
                    Los Musa Drums
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    Volume Series
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Premium drum kits from el de la musa - High-quality trap and drill drums in a series of collections.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {isLoading ? (
                    [...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))
                  ) : drumKits.length > 0 ? (
                    drumKits.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <Music className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Drum Kits Yet</h3>
                        <p className="text-muted-foreground">
                          Premium drum kits are being crafted. More volumes coming soon!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Course Only */}
            <TabsContent value="course">
              <div className="grid md:grid-cols-1 gap-6">
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : courseProducts.length > 0 ? (
                  courseProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                        <Book className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>
                      <p className="text-muted-foreground">
                        Production courses are coming soon! Check back later for educational content.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Loop Packs Only */}
            <TabsContent value="loops">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Melodic Musa Loop Packs</h2>
                  <p className="text-muted-foreground text-sm">
                    Premium melodic trap loops from el de la musa - A series of collections.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {isLoading ? (
                    [...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))
                  ) : loopPacks.length > 0 ? (
                    loopPacks.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <Library className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Loop Packs Yet</h3>
                        <p className="text-muted-foreground">
                          More melodic loop packs are in production. Stay tuned for new releases!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Drum Kits Only */}
            <TabsContent value="drums">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Los Musa Drums</h2>
                  <p className="text-muted-foreground text-sm">
                    Premium drum kits from el de la musa - High-quality trap and drill drums.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {isLoading ? (
                    [...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))
                  ) : drumKits.length > 0 ? (
                    drumKits.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <Card className="bg-card border-border">
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <Music className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Drum Kits Yet</h3>
                        <p className="text-muted-foreground">
                          Premium drum kits are being crafted. More volumes coming soon!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">About prodbypending...</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="mr-2 text-primary" />
                    Music Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    I've been playing the guitar since I was 10 years old and immersed in music for over 15 years.
                    The production course covers melody creation, drum programming, and music theory basics to get you started on your production journey.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="mr-2 text-accent" />
                    Quality Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All loops and drum kits are carefully crafted with years of musical experience.
                    Each product is designed to give you professional-quality sounds for your next project.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 prodbypending... All products by prodbypending... | el de la musa</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const categoryIcons = {
    'course': Book,
    'loop-pack': Library,
    'drum-kit': Music,
  }

  const categoryLabels = {
    'course': 'Course',
    'loop-pack': 'Loop Pack',
    'drum-kit': 'Drum Kit',
  }

  const categoryColors = {
    'course': 'bg-primary/20 text-primary',
    'loop-pack': 'bg-secondary/20 text-secondary',
    'drum-kit': 'bg-accent/20 text-accent',
  }

  const Icon = categoryIcons[product.category]
  const label = categoryLabels[product.category]
  const colorClass = categoryColors[product.category]

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
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge className={colorClass}>
            <Icon className="mr-1 w-3 h-3" />
            {label}
          </Badge>
          {product.isFeatured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
        <CardTitle className="text-xl">{product.title}</CardTitle>
        <CardDescription className="text-base">{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-primary">
              ${parseFloat(product.price).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {product.fileCount} {product.category === 'course' ? 'session' : product.fileCount > 1 ? 'files' : 'file'}
            </div>
          </div>
        </div>
        <Button className="w-full" variant="default">
          <ShoppingCart className="mr-2 w-4 h-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}