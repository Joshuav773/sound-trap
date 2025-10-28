'use client'

import Header from "@/components/Header"
import SearchFilters from "@/components/SearchFilters"
import FeaturedSection from "@/components/FeaturedSection"
import BeatLibrary from "@/components/BeatLibrary"
import { Music, TrendingUp, Users, Shield, Zap, Award, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { Beat } from "@shared/schema"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    genre: "Hip Hop",
    key: "",
    bpmRange: "",
  })

  // Check if there are featured beats to conditionally show "View All" button
  const { data: featuredBeats } = useQuery<Beat[]>({
    queryKey: ['/api/beats?featured=true'],
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section - Modern Platform */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
                Beat <span className="text-primary">Marketplace</span>
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground font-light">
                Premium production tools from talented creators
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Discover exclusive beats, loop packs, and drum kits from emerging and established producers. 
                Where underground talent meets professional quality.
              </p>
            </div>
            
            {/* Hero Search */}
            <div className="py-8">
              <SearchFilters 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 pt-12 border-t border-border">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">5K+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Premium Beats</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">1K+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Producers</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">10K+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Downloads</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">24/7</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">The Easiest & Most Transparent Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No complicated contracts, no hidden fees, no bullshit. Just straightforward deals that benefit everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card/50 p-8 rounded-lg border border-border/50 hover:border-primary/50 transition-all">
              <div className="w-14 h-14 mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Simplest Upload Process</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your beats in minutes. No lengthy forms or confusing paperwork. Just fill in the basics and start selling.
              </p>
            </div>
            
            <div className="bg-card/50 p-8 rounded-lg border border-border/50 hover:border-secondary/50 transition-all">
              <div className="w-14 h-14 mb-6 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Transparent Pricing</h3>
              <p className="text-muted-foreground leading-relaxed">
                You set your prices. We show our fees upfront. No surprises, no hidden costs. Simple math you can actually understand.
              </p>
            </div>
            
            <div className="bg-card/50 p-8 rounded-lg border border-border/50 hover:border-accent/50 transition-all">
              <div className="w-14 h-14 mb-6 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Direct Payout System</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get paid directly. No waiting periods, no minimum thresholds, no complicated banking. Your money, when you earn it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Beats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Beats</h2>
            {featuredBeats && featuredBeats.length > 0 && (
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All →
              </Button>
            )}
          </div>
          <FeaturedSection searchQuery={searchQuery} filters={filters} />
        </div>
      </section>

      {/* All Beats */}
      <section className="py-16 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">All Beats</h2>
          </div>
          <BeatLibrary searchQuery={searchQuery} filters={filters} />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold gradient-text">
                SoundTrap
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The independent marketplace for premium beats. Trusted by artists and producers worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Browse</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors inline-block">Hip Hop Beats</a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-block">Trap Beats</a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-block">Drill Beats</a></li>
                <li><a href="#" className="hover:text-primary transition-colors inline-block">Featured</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors inline-block">License Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors inline-block">Usage Rights</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors inline-block">Producer Splits</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors inline-block">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.26.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.26-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482c0 .38.048.753.14 1.11-4.09-.195-7.715-2.16-10.14-5.144a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="SoundCloud">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1.175 13.25c-.384 0-.636-.048-.767-.12-.24-.144-.367-.336-.367-.576s.127-.432.367-.576c.131-.072.383-.12.767-.12.288 0 .528.048.72.144-.24-2.16.12-4.2.624-6.216.768-3.12 2.256-5.952 4.32-8.208.096-.096.144-.192.192-.288L12 0l8.208 8.208c.048.096.096.192.096.288 0 .144-.096.24-.192.336-4.128 4.08-6.528 9.576-6.096 14.928.024.24.024.432.024.624 0 .432-.096.768-.336 1.056-.168.192-.384.288-.672.336-.192 0-.384.048-.576.048-.432 0-.768-.144-.912-.384-.048-.096-.048-.192-.048-.336V16.1c0-.24.096-.432.24-.576.48-.432 1.056-.672 1.728-.768 1.872-.24 3.408 1.248 3.648 3.12.12.912.12 1.872 0 2.808-.48 3.024-2.592 5.256-5.52 5.376-.192.024-.384.024-.576.024-.912 0-1.728-.312-2.352-.864-.24-.24-.384-.528-.432-.864-.048-.192-.048-.432-.048-.624 0-.24 0-.576.096-.912.096-.672.36-1.296.792-1.824.432-.528 1.056-.864 1.728-1.056 1.248-.336 2.352.192 2.688 1.392.096.336.12.72.12 1.056 0 .24-.096.528-.24.864-.144.336-.432.576-.72.864-.192.192-.288.336-.384.48-.192.192-.432.336-.72.384-.192.048-.384.048-.576.048-.432 0-.768-.144-.912-.384-.048-.096-.048-.192-.048-.336 0-.336.192-.72.48-1.008.096-.096.192-.192.288-.288 0-1.68.144-3.36-.192-5.04-.384-1.872-1.68-3.552-3.24-4.848-1.44-1.248-3.024-2.112-4.608-2.4.048-.144.048-.288.048-.432 0-.336-.144-.672-.336-.912-.192-.192-.528-.336-.912-.432-.24-.048-.528-.048-.864-.048z"/></svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SoundTrap. All rights reserved. Premium beats for premium artists.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

